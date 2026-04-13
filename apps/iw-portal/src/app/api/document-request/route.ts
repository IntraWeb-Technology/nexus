import { auth } from '@clerk/nextjs/server'
import { triggerDocumentRequest } from '@/lib/n8n/client'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json()) as { document_name?: string }
  const name = body.document_name?.trim()
  if (!name) return NextResponse.json({ error: 'document_name required' }, { status: 400 })

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { data: client } = await supabase
    .from('clients')
    .select('id, email')
    .eq('clerk_user_id', userId)
    .maybeSingle()
  if (!client?.email) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: project } = await supabase
    .from('projects')
    .select('slug')
    .eq('client_id', client.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (!project?.slug) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  triggerDocumentRequest({
    project_slug: project.slug,
    document_name: name,
    client_email: client.email,
  })

  return NextResponse.json({ ok: true })
}
