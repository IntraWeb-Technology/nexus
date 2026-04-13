import { triggerLoginEvent } from '@/lib/n8n/client'
import { createServiceSupabase } from '@/lib/supabase/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

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

  if (evt.type === 'session.created') {
    const userId = String(evt.data.user_id ?? '')
    if (userId) {
      try {
        const supabase = createServiceSupabase()
        const { data: client } = await supabase
          .from('clients')
          .select('id, name, email')
          .eq('clerk_user_id', userId)
          .maybeSingle()
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
