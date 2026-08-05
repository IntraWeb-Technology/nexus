import type { MaintenanceTier } from '@/config/maintenance-features'

const PORTAL_PLAN_TO_TIER: Record<string, MaintenanceTier> = {
  essential: 'essential',
  starter: 'essential',
  standard: 'standard',
  growth: 'standard',
  premium: 'premium',
  custom: 'premium',
}

export function getMaintenanceTierForDeal(
  dealId: string | null | undefined,
  portalPlanSlug: string | null | undefined,
): MaintenanceTier | null {
  const normalizedDealId = dealId?.trim()
  if (!normalizedDealId) {
    return null
  }

  const normalizedPlan = portalPlanSlug?.trim().toLowerCase()
  if (!normalizedPlan) {
    return null
  }

  return PORTAL_PLAN_TO_TIER[normalizedPlan] ?? null
}
