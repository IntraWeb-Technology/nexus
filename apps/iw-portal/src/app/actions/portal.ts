'use server'

import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const COOKIE = 'iw_portal_project_slug'

export async function selectPortalProject(slug: string): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth()
  if (!userId) return { ok: false, error: 'Unauthorized' }

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return { ok: false, error: 'Database unavailable' }

  const { data: client } = await supabase.from('clients').select('id').eq('clerk_user_id', userId).maybeSingle()
  if (!client) return { ok: false, error: 'No client' }

  const { data: row } = await supabase
    .from('projects')
    .select('id')
    .eq('client_id', client.id)
    .eq('slug', slug)
    .maybeSingle()
  if (!row) return { ok: false, error: 'Project not found' }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE, slug, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 400,
  })

  return { ok: true }
}
