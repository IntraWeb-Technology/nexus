import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { ChangeOrderRow } from '@/lib/supabase/types'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/** Client cancels a pending scope-change request (portal row only). */
export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bundle = await getPortalBundle()
  if (!bundle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { data: updated, error: upErr } = await supabase
    .from('change_orders')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('project_id', bundle.project.id)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle()

  if (upErr) {
    console.error('[change-orders/cancel]', upErr)
    return NextResponse.json({ error: 'We could not cancel that request. Please try again.' }, { status: 500 })
  }
  if (!updated) {
    return NextResponse.json(
      {
        error:
          'This request was not found or is no longer pending, so it cannot be cancelled from here.',
      },
      { status: 409 },
    )
  }

  const row = updated as ChangeOrderRow
  const ref = row.co_number ?? id.slice(0, 8)
  await supabase.from('activity_log').insert({
    project_id: bundle.project.id,
    type: 'task',
    label: 'Scope change request cancelled',
    detail: ref,
  })

  return NextResponse.json({ change_order: row })
}
