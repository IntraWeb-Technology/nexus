import { getPortalBundle } from '@/lib/data/portal'
import { triggerDocumentSigned } from '@/lib/n8n/client'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export const maxDuration = 60

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
  const o = body as { document_id?: string; typed_name?: string }
  const documentId = o.document_id?.trim()
  const typedName = o.typed_name?.trim()
  if (!documentId || !typedName) return NextResponse.json({ error: 'document_id and typed_name required' }, { status: 400 })

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { data: doc, error: fetchErr } = await supabase
    .from('documents')
    .select('id, name, requires_signature, signed')
    .eq('id', documentId)
    .eq('project_id', bundle.project.id)
    .maybeSingle()
  if (fetchErr || !doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!doc.requires_signature) return NextResponse.json({ error: 'Document does not require a signature' }, { status: 400 })
  if (doc.signed) return NextResponse.json({ error: 'Already signed' }, { status: 409 })

  const signedAt = new Date().toISOString()
  const { data: updated, error: updErr } = await supabase
    .from('documents')
    .update({
      signed: true,
      signed_at: signedAt,
      signed_by: typedName,
    })
    .eq('id', documentId)
    .select('*')
    .single()

  if (updErr || !updated) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  await supabase.from('activity_log').insert({
    project_id: bundle.project.id,
    type: 'document',
    label: 'Document signed',
    detail: doc.name,
  })

  await supabase.from('notifications').insert({
    project_id: bundle.project.id,
    type: 'document',
    title: 'Document signed',
    body: doc.name,
    read: false,
  })

  triggerDocumentSigned({
    project_slug: bundle.project.slug,
    document_name: doc.name,
    signed_by: typedName,
    signed_at: signedAt,
  })

  return NextResponse.json({ document: updated })
}
