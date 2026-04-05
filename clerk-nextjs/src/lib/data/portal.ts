import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Client, Project } from '@/lib/supabase/types'
import { cache } from 'react'

export interface PortalBundle {
  client: Client
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

  // Newest project first — clients with multiple engagements see their current one.
  const { data: project, error: pErr } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (pErr || !project) return null

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
    project: project as Project,
    unreadMessages: mc ?? 0,
    unreadNotifications: nc ?? 0,
  }
})
