import type { SupabaseClient } from '@supabase/supabase-js'

export type ProjectClientIds = { id: string; client_id: string }

/**
 * If a project already exists for this HubSpot deal id, `provision_client` must short-circuit
 * so n8n / Clerk retries do not duplicate rows.
 */
export async function findProjectByHubSpotDealId(
  supabase: Pick<SupabaseClient, 'from'>,
  hubspotDealId: string | null | undefined,
): Promise<ProjectClientIds | null> {
  const dealId = hubspotDealId?.trim()
  if (!dealId) return null

  const { data, error } = await supabase
    .from('projects')
    .select('id, client_id')
    .eq('hubspot_deal_id', dealId)
    .maybeSingle()

  if (error || !data) return null
  return { id: data.id, client_id: data.client_id }
}
