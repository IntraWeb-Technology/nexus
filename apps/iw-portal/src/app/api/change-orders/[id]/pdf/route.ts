import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bundle = await getPortalBundle()
  if (!bundle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { data: row, error } = await supabase
    .from('change_orders')
    .select('id,project_id,pdf_storage_path,co_number')
    .eq('id', id)
    .maybeSingle()

  if (error || !row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (row.project_id !== bundle.project.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!row.pdf_storage_path) return NextResponse.json({ error: 'PDF not available' }, { status: 404 })

  const { data: signed, error: signErr } = await supabase.storage
    .from('change-order-packets')
    .createSignedUrl(row.pdf_storage_path, 120)

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json({ error: 'Could not create download link' }, { status: 500 })
  }

  return NextResponse.redirect(signed.signedUrl)
}
