import type { SupabaseClient } from '@supabase/supabase-js'

import { normalizeMaintenancePlanSlug } from '@/lib/stripe/maintenance-packages'

/**
 * Writes HubSpot deal portal plan value onto the linked project row (service role).
 */
export async function syncPortalPlanSlugFromHubSpotDeal(
  supabase: SupabaseClient,
  dealId: string,
  propertyValue: string | null | undefined,
): Promise<void> {
  const did = String(dealId).trim()
  if (!did) return

  const portal_plan_slug =
    propertyValue == null || propertyValue === ''
      ? null
      : normalizeMaintenancePlanSlug(String(propertyValue))

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('hubspot_deal_id', did)
    .maybeSingle()

  if (!project) return

  const { error } = await supabase
    .from('projects')
    .update({ portal_plan_slug })
    .eq('id', project.id)

  if (error) {
    console.error('[sync-portal-plan-slug] projects.update failed', error)
  }
}
