import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Client, Project } from '@/lib/supabase/types'
import { cookies } from 'next/headers'
import { cache } from 'react'

const PROJECT_COOKIE = 'iw_portal_project_slug'

export interface PortalBundle {
  client: Client
  /** All projects for this client (newest first). Each may map to a distinct engagement. */
  projects: Project[]
  /** Active project (from cookie when valid, else newest). */
  project: Project
  unreadMessages: number
  unreadNotifications: number
}

export const getPortalBundle = cache(async (): Promise<PortalBundle | null> => {
  const { userId } = await auth()
  if (!userId) return null
  const supabase = await createServerSupabaseForUser()
  if (!supabase) return null

  const { data: client, error: cErr } = await supabase
    .from('clients')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle()
  if (cErr || !client) return null

  const { data: projectRows, error: pErr } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
  if (pErr || !projectRows?.length) return null

  const projects = projectRows as Project[]
  const cookieStore = await cookies()
  const preferredSlug = cookieStore.get(PROJECT_COOKIE)?.value
  const project =
    preferredSlug && projects.some((p) => p.slug === preferredSlug)
      ? projects.find((p) => p.slug === preferredSlug)!
      : projects[0]

  const [{ count: mc }, { count: nc }] = await Promise.all([
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id)
      .eq('read', false)
      .eq('sender_type', 'staff'),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id)
      .eq('read', false),
  ])

  return {
    client: client as Client,
    projects,
    project,
    unreadMessages: mc ?? 0,
    unreadNotifications: nc ?? 0,
  }
})
