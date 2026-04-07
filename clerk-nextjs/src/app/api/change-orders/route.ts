import { getPortalBundle } from '@/lib/data/portal'
import { triggerChangeOrderRequested } from '@/lib/n8n/client'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bundle = await getPortalBundle()
  if (!bundle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const o = body as { title?: string; description?: string }
  const title = o.title?.trim()
  const description = o.description?.trim()
  if (!title || !description) return NextResponse.json({ error: 'title and description required' }, { status: 400 })

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { data: row, error } = await supabase
    .from('change_orders')
    .insert({
      project_id: bundle.project.id,
      title,
      description,
    })
    .select('*')
    .single()

  if (error || !row) return NextResponse.json({ error: 'Could not submit request' }, { status: 500 })

  await supabase.from('activity_log').insert({
    project_id: bundle.project.id,
    type: 'task',
    label: 'Change order requested',
    detail: title,
  })

  await supabase.from('notifications').insert({
    project_id: bundle.project.id,
    type: 'action_required',
    title: 'Change order submitted',
    body: title,
    read: false,
  })

  triggerChangeOrderRequested({
    project_slug: bundle.project.slug,
    title,
    description,
    client_name: bundle.client.name,
  })

  return NextResponse.json({ change_order: row }, { status: 201 })
}
