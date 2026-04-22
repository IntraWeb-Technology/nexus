import { ensureSelfSignupProvisionForClerkUser } from '@/lib/data/provision-self-signup'
import { syncPortalMissingHubSpotIdsFromCrm } from '@/lib/data/sync-portal-hubspot-from-crm'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Client, Project } from '@/lib/supabase/types'
import { cookies } from 'next/headers'
import { cache } from 'react'

const PROJECT_COOKIE = 'iw_portal_project_slug'

/** Auto-provision uses `cl-<clerkIdWithoutPrefix>`; prefer CRM-backed projects when picking a default. */
function isAutoProvisionSlug(slug: string): boolean {
  return slug.startsWith('cl-')
}

function compareEngagement(a: Project, b: Project): number {
  const aHs = Boolean(a.hubspot_deal_id?.trim()) ? 1 : 0
  const bHs = Boolean(b.hubspot_deal_id?.trim()) ? 1 : 0
  if (aHs !== bHs) return bHs - aHs
  const aAuto = isAutoProvisionSlug(a.slug) ? 1 : 0
  const bAuto = isAutoProvisionSlug(b.slug) ? 1 : 0
  if (aAuto !== bAuto) return aAuto - bAuto
  return Date.parse(b.created_at) - Date.parse(a.created_at)
}

/**
 * Cookie wins unless it pins the auto `cl-…` starter while a HubSpot-linked project exists
 * (fixes stale cookies after CRM provision + merge).
 */
export function pickActiveProjectForPortal(projects: Project[], preferredSlug: string | undefined): Project {
  if (preferredSlug) {
    const match = projects.find((p) => p.slug === preferredSlug)
    if (match) {
      const hasHubspotElsewhere = projects.some(
        (p) => p.id !== match.id && Boolean(p.hubspot_deal_id?.trim()),
      )
      if (!(isAutoProvisionSlug(match.slug) && hasHubspotElsewhere)) {
        return match
      }
    }
  }
  return [...projects].sort(compareEngagement)[0]!
}

function orderProjectsForDisplay(projects: Project[], active: Project): Project[] {
  const rest = projects.filter((p) => p.id !== active.id)
  const sortedRest = [...rest].sort(compareEngagement)
  return [active, ...sortedRest]
}

export interface PortalBundle {
  client: Client
  /** Projects for this client; active engagement first, then by CRM / slug heuristics. */
  projects: Project[]
  /** Active project (cookie when valid; else HubSpot-backed or non–auto-provision slug over `cl-…`). */
  project: Project
  unreadMessages: number
  unreadNotifications: number
}

export const getPortalBundle = cache(async (): Promise<PortalBundle | null> => {
  const { userId } = await auth()
  if (!userId) return null
  const supabase = await createServerSupabaseForUser()
  if (!supabase) return null

  let { data: client, error: cErr } = await supabase
    .from('clients')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle()
  if (!client && !cErr) {
    await ensureSelfSignupProvisionForClerkUser(userId)
    const again = await supabase.from('clients').select('*').eq('clerk_user_id', userId).maybeSingle()
    client = again.data
    cErr = again.error
  }
  if (cErr || !client) return null

  const { data: projectRows, error: pErr } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
  if (pErr || !projectRows?.length) return null

  const synced = await syncPortalMissingHubSpotIdsFromCrm(supabase, client as Client, projectRows as Project[])
  client = synced.client as typeof client
  const projects = synced.projects
  const cookieStore = await cookies()
  const preferredSlug = cookieStore.get(PROJECT_COOKIE)?.value
  const project = pickActiveProjectForPortal(projects, preferredSlug)
  const orderedProjects = orderProjectsForDisplay(projects, project)

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
    projects: orderedProjects,
    project,
    unreadMessages: mc ?? 0,
    unreadNotifications: nc ?? 0,
  }
})
