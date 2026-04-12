import { getPortalBundle } from '@/lib/data/portal'
import { isPortalStorageObjectPath, MAX_UPLOAD_BYTES } from '@/lib/documents/upload'
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
  const o = body as { path?: string; name?: string; fileSizeKb?: number }
  const path = o.path?.trim()
  const name = o.name?.trim()
  const fileSizeKb = typeof o.fileSizeKb === 'number' && Number.isFinite(o.fileSizeKb) ? o.fileSizeKb : null
  if (!path || !name) return NextResponse.json({ error: 'path and name required' }, { status: 400 })
  if (!isPortalStorageObjectPath(path, bundle.project.id)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }
  const bytes = fileSizeKb != null ? Math.round(fileSizeKb * 1024) : null
  if (bytes != null && (bytes < 1 || bytes > MAX_UPLOAD_BYTES)) {
    return NextResponse.json({ error: 'Invalid file size' }, { status: 400 })
  }

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { data: doc, error: dErr } = await supabase
    .from('documents')
    .insert({
      project_id: bundle.project.id,
      name,
      file_url: path,
      file_size_kb: fileSizeKb,
      requires_signature: false,
      signed: false,
    })
    .select('*')
    .single()

  if (dErr || !doc) {
    return NextResponse.json({ error: 'Could not save document' }, { status: 500 })
  }

  await supabase.from('activity_log').insert({
    project_id: bundle.project.id,
    type: 'document',
    label: 'Document uploaded',
    detail: name,
  })

  await supabase.from('notifications').insert({
    project_id: bundle.project.id,
    type: 'document',
    title: 'New document',
    body: name,
    read: false,
  })

  return NextResponse.json({ document: doc }, { status: 201 })
}
