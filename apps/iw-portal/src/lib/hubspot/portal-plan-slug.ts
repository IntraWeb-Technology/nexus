/**
 * HubSpot deal property internal name that stores the closed-set slug used for
 * maintenance package eligibility (mirrored to projects.portal_plan_slug).
 */
export function hubspotDealPortalPlanPropertyName(): string {
  const v = process.env.HUBSPOT_DEAL_PORTAL_PLAN_PROPERTY?.trim()
  return v || 'portal_plan_slug'
}
