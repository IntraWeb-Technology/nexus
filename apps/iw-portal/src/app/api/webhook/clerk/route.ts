import {
  linkPlaceholderClientToClerkUser,
  mergeProvisionedClientsByEmailIntoClerkUser,
} from '@/lib/data/link-hubspot-provisioned-clerk'
import {
  ensureSelfSignupProvisionForClerkUser,
  parseClerkWebhookUser,
  provisionSelfSignupCustomer,
} from '@/lib/data/provision-self-signup'
import { recordIntegrationEvent } from '@/lib/integrations/events'
import { triggerLoginEvent } from '@/lib/n8n/client'
import { createServiceSupabase } from '@/lib/supabase/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CLERK_WEBHOOK_SECRET not set' }, { status: 500 })
  }

  const h = await headers()
  const svixId = h.get('svix-id')
  const svixTs = h.get('svix-timestamp')
  const svixSig = h.get('svix-signature')
  if (!svixId || !svixTs || !svixSig) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload = await request.text()
  let evt: { type: string; data: Record<string, unknown> }
  try {
    evt = new Webhook(secret).verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTs,
      'svix-signature': svixSig,
    }) as { type: string; data: Record<string, unknown> }
  } catch {
    await recordIntegrationEvent({
      provider: 'clerk',
      eventType: 'signature.invalid',
      status: 'failed',
      payload: { svixId },
      lastError: 'Invalid signature',
    })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  await recordIntegrationEvent({
    provider: 'clerk',
    eventType: evt.type,
    externalEventId: svixId,
    status: 'received',
    payload: evt.data,
  })

  if (evt.type === 'user.created') {
    const parsed = parseClerkWebhookUser(evt.data as Record<string, unknown>)
    if (parsed) {
      try {
        const supabase = createServiceSupabase()
        const linkResult = await linkPlaceholderClientToClerkUser(supabase, {
          clerkUserId: parsed.userId,
          email: parsed.email,
        })
        if (linkResult === 'linked') {
          console.log('[clerk webhook] linked HubSpot-provisioned client', parsed.userId, parsed.email)
        } else if (linkResult === 'conflict') {
          console.warn('[clerk webhook] link HubSpot client conflict', parsed.userId)
        }
        if (linkResult !== 'conflict') {
          const merged = await mergeProvisionedClientsByEmailIntoClerkUser(supabase, {
            clerkUserId: parsed.userId,
            email: parsed.email,
          })
          if (merged === 'merged') {
            console.log('[clerk webhook] merged HubSpot placeholder into existing client', parsed.userId)
          }
        }
        const result = await provisionSelfSignupCustomer(supabase, parsed)
        if (result === 'created') {
          console.log('[clerk webhook] self-signup provisioned', parsed.userId)
        }
      } catch (e) {
        await recordIntegrationEvent({
          provider: 'clerk',
          eventType: evt.type,
          externalEventId: svixId,
          status: 'failed',
          payload: evt.data,
          lastError: e instanceof Error ? e.message : 'user.created provision failed',
        })
        console.error('[clerk webhook] user.created provision', e)
      }
    }
  }

  if (evt.type === 'session.created') {
    const userId = String(evt.data.user_id ?? '')
    if (userId) {
      try {
        const supabase = createServiceSupabase()
        let { data: client } = await supabase
          .from('clients')
          .select('id, name, email')
          .eq('clerk_user_id', userId)
          .maybeSingle()
        if (!client) {
          await ensureSelfSignupProvisionForClerkUser(userId)
          const again = await supabase
            .from('clients')
            .select('id, name, email')
            .eq('clerk_user_id', userId)
            .maybeSingle()
          client = again.data
        }
        if (client?.email) {
          const merged = await mergeProvisionedClientsByEmailIntoClerkUser(supabase, {
            clerkUserId: userId,
            email: client.email,
          })
          if (merged === 'merged') {
            console.log('[clerk webhook] merged HubSpot placeholder on session.created', userId)
          }
        }
        if (client) {
          const { data: project } = await supabase
            .from('projects')
            .select('slug')
            .eq('client_id', client.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle()
          triggerLoginEvent({
            project_slug: project?.slug ?? 'unknown',
            client_name: client.name,
            client_email: client.email,
            occurred_at: new Date().toISOString(),
          })
        }
      } catch (e) {
        await recordIntegrationEvent({
          provider: 'clerk',
          eventType: evt.type,
          externalEventId: svixId,
          status: 'failed',
          payload: evt.data,
          lastError: e instanceof Error ? e.message : 'session.created handling failed',
        })
        console.error('[clerk webhook] session.created', e)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
