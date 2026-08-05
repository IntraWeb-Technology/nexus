import { getPortalBundle } from '@/lib/data/portal'
import { createServiceSupabase } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Fallback when os_contracts_queue has pdf_storage_path but no proposal_document_id yet.
 * Prefer /api/documents/download?id=... when proposal_document_id is set.
 */
export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bundle = await getPortalBundle()
  if (!bundle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const queueId = new URL(request.url).searchParams.get('id')?.trim()
  if (!queueId) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const dealId = bundle.project.hubspot_deal_id?.trim()
  if (!dealId) return NextResponse.json({ error: 'Project has no HubSpot deal' }, { status: 404 })

  const supabase = createServiceSupabase()

  const { data: row, error } = await supabase
    .from('os_contracts_queue')
    .select('id, hubspot_deal_id, proposal_document_id, pdf_storage_path')
    .eq('id', queueId)
    .eq('hubspot_deal_id', dealId)
    .maybeSingle()

  if (error || !row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (row.proposal_document_id) {
    const origin = new URL(request.url).origin
    return NextResponse.redirect(
      `${origin}/api/documents/download?id=${encodeURIComponent(row.proposal_document_id)}`,
      302,
    )
  }

  const path = row.pdf_storage_path?.trim()
  if (!path) return NextResponse.json({ error: 'No PDF on file' }, { status: 404 })

  const pid = bundle.project.id
  if (!path.startsWith(`${pid}/`)) {
    return NextResponse.json({ error: 'Invalid storage path for project' }, { status: 403 })
  }

  const signed = await supabase.storage.from('client-uploads').createSignedUrl(path, 300)
  if (signed.error || !signed.data?.signedUrl) {
    return NextResponse.json({ error: 'Could not prepare download' }, { status: 502 })
  }

  return NextResponse.redirect(signed.data.signedUrl)
}
