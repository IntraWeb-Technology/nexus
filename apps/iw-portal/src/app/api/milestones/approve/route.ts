import { getPortalBundle } from '@/lib/data/portal'
import { triggerMilestoneApproved } from '@/lib/n8n/client'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import { auth, currentUser } from '@clerk/nextjs/server'
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
  const o = body as { milestone_id?: string; notes?: string }
  const milestoneId = o.milestone_id?.trim()
  if (!milestoneId) return NextResponse.json({ error: 'milestone_id required' }, { status: 400 })

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { data: ms, error: msErr } = await supabase
    .from('milestones')
    .select('id, title, project_id')
    .eq('id', milestoneId)
    .eq('project_id', bundle.project.id)
    .maybeSingle()
  if (msErr || !ms) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await currentUser()
  const approvedByName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.emailAddresses?.[0]?.emailAddress ?? bundle.client.name

  const notes = o.notes?.trim() || null

  const { data: approval, error: insErr } = await supabase
    .from('milestone_approvals')
    .insert({
      milestone_id: ms.id,
      project_id: bundle.project.id,
      approved_by_name: approvedByName,
      notes,
    })
    .select('*')
    .single()

  if (insErr || !approval) return NextResponse.json({ error: 'Could not record approval' }, { status: 500 })

  await supabase.from('activity_log').insert({
    project_id: bundle.project.id,
    type: 'milestone',
    label: 'Phase approved by client',
    detail: ms.title,
  })

  await supabase.from('notifications').insert({
    project_id: bundle.project.id,
    type: 'milestone',
    title: 'Phase approved',
    body: ms.title,
    read: false,
  })

  triggerMilestoneApproved({
    project_slug: bundle.project.slug,
    milestone_title: ms.title,
    approved_by_name: approvedByName,
    notes,
  })

  return NextResponse.json({ approval })
}
