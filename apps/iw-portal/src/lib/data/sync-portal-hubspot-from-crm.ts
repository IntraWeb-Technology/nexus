import { listHubSpotDealIdsForContact, searchHubSpotContactIdByEmail } from '@/lib/hubspot/contact-deal-lookup'
import { isHubSpotConfigured } from '@/lib/hubspot/config'
import type { Client, Project } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * When the portal client has no HubSpot ids yet, resolve them from CRM by primary email
 * (exactly one contact +, for deal id, exactly one associated deal when a single project row lacks a deal).
 * Safe to call on each request: no-ops when already linked, HubSpot off, or CRM data is ambiguous.
 */
export async function syncPortalMissingHubSpotIdsFromCrm(
  supabase: SupabaseClient,
  client: Client,
  projects: Project[],
): Promise<{ client: Client; projects: Project[] }> {
  if (!isHubSpotConfigured()) return { client, projects }

  let nextClient: Client = { ...client }
  let nextProjects = projects

  if (!nextClient.hubspot_contact_id?.trim()) {
    const hsId = await searchHubSpotContactIdByEmail(nextClient.email)
    if (!hsId) return { client, projects }

    const { error } = await supabase
      .from('clients')
      .update({ hubspot_contact_id: hsId })
      .eq('id', nextClient.id)
    if (error) {
      console.error('[sync-portal-hubspot-from-crm] client hubspot_contact_id', error)
      return { client, projects }
    }
    nextClient = { ...nextClient, hubspot_contact_id: hsId }
  }

  const cid = nextClient.hubspot_contact_id?.trim()
  if (!cid) return { client: nextClient, projects: nextProjects }

  const projectsMissingDeal = nextProjects.filter((p) => !p.hubspot_deal_id?.trim())
  if (projectsMissingDeal.length !== 1) return { client: nextClient, projects: nextProjects }

  const dealIds = await listHubSpotDealIdsForContact(cid)
  if (dealIds.length !== 1) return { client: nextClient, projects: nextProjects }

  const dealId = dealIds[0]
  const only = projectsMissingDeal[0]
  const { error: pErr } = await supabase
    .from('projects')
    .update({ hubspot_deal_id: dealId })
    .eq('id', only.id)
  if (pErr) {
    console.error('[sync-portal-hubspot-from-crm] project hubspot_deal_id', pErr)
    return { client: nextClient, projects: nextProjects }
  }

  nextProjects = nextProjects.map((p) => (p.id === only.id ? { ...p, hubspot_deal_id: dealId } : p))
  return { client: nextClient, projects: nextProjects }
}
