import { createClerkClient } from '@clerk/backend'
import {
  isPortalAutoProvisionEnabled,
  parseClerkWebhookUser,
  provisionSelfSignupCustomer,
} from '@/lib/data/provision-self-signup'
import { triggerLoginEvent } from '@/lib/n8n/client'
import { createServiceSupabase } from '@/lib/supabase/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

async function tryProvisionFromClerkUserId(
  supabase: ReturnType<typeof createServiceSupabase>,
  userId: string,
) {
  if (!isPortalAutoProvisionEnabled() || !userId.startsWith('user_')) return
  const sk = process.env.CLERK_SECRET_KEY
  if (!sk) return
  try {
    const clerk = createClerkClient({ secretKey: sk })
    const user = await clerk.users.getUser(userId)
    const primaryId = user.primaryEmailAddressId
    const email =
      user.emailAddresses.find((e) => e.id === primaryId)?.emailAddress ??
      user.emailAddresses[0]?.emailAddress
    if (!email) return
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      email.split('@')[0] ||
      'Client'
    await provisionSelfSignupCustomer(supabase, { userId, email, name })
  } catch (e) {
    console.error('[clerk webhook] tryProvisionFromClerkUserId', e)
  }
}

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
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (evt.type === 'user.created') {
    const parsed = parseClerkWebhookUser(evt.data as Record<string, unknown>)
    if (parsed) {
      try {
        const supabase = createServiceSupabase()
        const result = await provisionSelfSignupCustomer(supabase, parsed)
        if (result === 'created') {
          console.log('[clerk webhook] self-signup provisioned', parsed.userId)
        }
      } catch (e) {
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
          await tryProvisionFromClerkUserId(supabase, userId)
          const again = await supabase
            .from('clients')
            .select('id, name, email')
            .eq('clerk_user_id', userId)
            .maybeSingle()
          client = again.data
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
        console.error('[clerk webhook] session.created', e)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
