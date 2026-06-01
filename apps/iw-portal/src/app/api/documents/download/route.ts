import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bundle = await getPortalBundle()
  if (!bundle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { data: doc, error } = await supabase
    .from('documents')
    .select('id, project_id, name, file_url')
    .eq('id', id)
    .eq('project_id', bundle.project.id)
    .maybeSingle()

  if (error || !doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const url = doc.file_url
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Security: Allowlist external URLs to prevent open redirect attacks
    const allowedDomains = [
      'supabase.co',
      'storage.googleapis.com',
      's3.amazonaws.com',
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, '').split('/')[0]
    ].filter(Boolean)
    
    try {
      const urlObj = new URL(url)
      const isAllowed = allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      )
      if (!isAllowed) {
        return NextResponse.json({ error: 'Invalid file URL' }, { status: 400 })
      }
      return NextResponse.redirect(url)
    } catch {
      return NextResponse.json({ error: 'Invalid file URL' }, { status: 400 })
    }
  }

  const bucket = supabase.storage.from('client-uploads')
  const signed = await bucket.createSignedUrl(url, 300)
  if (signed.error || !signed.data?.signedUrl) {
    return NextResponse.json({ error: 'Could not prepare download' }, { status: 502 })
  }

  return NextResponse.redirect(signed.data.signedUrl)
}
