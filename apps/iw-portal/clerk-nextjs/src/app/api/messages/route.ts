import { auth, currentUser } from '@clerk/nextjs/server'
import { sendStaffNewMessageAlert } from '@/lib/email/send'
import { triggerStaffAlert } from '@/lib/n8n/client'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json()) as { body?: string }
  const text = body.body?.trim()
  if (!text) return NextResponse.json({ error: 'body required' }, { status: 400 })

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { data: client, error: cErr } = await supabase
    .from('clients')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle()
  if (cErr || !client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const { data: project, error: pErr } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (pErr || !project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const user = await currentUser()
  const senderName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.emailAddresses?.[0]?.emailAddress || client.name

  const { data: msg, error: mErr } = await supabase
    .from('messages')
    .insert({
      project_id: project.id,
      sender_type: 'client',
      sender_name: senderName,
      body: text,
      read: false,
    })
    .select('*')
    .single()
  if (mErr || !msg) return NextResponse.json({ error: mErr?.message ?? 'insert failed' }, { status: 500 })

  await supabase.from('notifications').insert({
    project_id: project.id,
    type: 'message',
    title: `New message from ${senderName}`,
    body: text.slice(0, 280),
    read: false,
  })

  await supabase.from('activity_log').insert({
    project_id: project.id,
    type: 'message',
    label: 'Client message sent',
    detail: text.slice(0, 500),
  })

  triggerStaffAlert({
    project_slug: project.slug,
    client_name: client.name,
    message_body: text,
    sender_name: senderName,
  })

  try {
    await sendStaffNewMessageAlert({
      clientName: client.name,
      projectSlug: project.slug,
      messageBody: text,
    })
  } catch (e) {
    console.error('[email] staff alert', e)
  }

  return NextResponse.json(msg, { status: 201 })
}
