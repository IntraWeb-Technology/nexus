import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bundle = await getPortalBundle()
  if (!bundle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('project_id', bundle.project.id)
    .eq('read', false)

  if (error) {
    console.error('[notifications/mark-all-read]', error)
    return NextResponse.json({ error: 'Could not update notifications' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
