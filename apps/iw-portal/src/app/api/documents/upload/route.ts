import { getPortalBundle } from '@/lib/data/portal'
import {
  isAllowedDocumentUpload,
  MAX_UPLOAD_BYTES,
  normalizeContentType,
  sanitizeUploadFileName,
} from '@/lib/documents/upload'
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
  const o = body as { filename?: string; contentType?: string }
  const rawName = o.filename?.trim()
  if (!rawName) return NextResponse.json({ error: 'filename required' }, { status: 400 })
  if (!isAllowedDocumentUpload(rawName)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
  }

  const safeName = sanitizeUploadFileName(rawName)
  const contentType = normalizeContentType(o.contentType ?? '', safeName)
  if (!contentType) return NextResponse.json({ error: 'contentType required' }, { status: 400 })

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const path = `${bundle.project.id}/${Date.now()}-${safeName}`

  const bucket = supabase.storage.from('client-uploads')
  type SignedUploadResult = {
    data: { signedUrl: string; token: string; path: string } | null
    error: { message: string } | null
  }
  const signed: SignedUploadResult = await (
    bucket as unknown as {
      createSignedUploadUrl: (p: string, expiresIn: number) => Promise<SignedUploadResult>
    }
  ).createSignedUploadUrl(path, 3600)

  if (signed.error || !signed.data?.signedUrl) {
    return NextResponse.json({ error: 'Could not create upload URL' }, { status: 502 })
  }

  return NextResponse.json({
    uploadUrl: signed.data.signedUrl,
    path: signed.data.path ?? path,
    token: signed.data.token,
    contentType,
    maxBytes: MAX_UPLOAD_BYTES,
  })
}
