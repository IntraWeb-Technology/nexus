import { normalizeHubSpotDealStage } from "@/lib/normalizeHubSpotDealStage";

/**
 * Default HubSpot **default pipeline** first stage (`appointmentscheduled` = "Appointment scheduled").
 * For custom pipelines, set `N8N_CONTACT_DEAL_STAGE` to your pipeline’s numeric stage id.
 */
export const LEAD_INTAKE_HUBSPOT_DEAL_STAGE_DEFAULT = "appointmentscheduled";

/**
 * Resolves the deal stage sent to SYS 01 / lead webhooks so new web leads do not start in
 * `qualifiedtobuy` (strict funnel: Qualified → SYS 03 provisions the portal).
 *
 * Precedence: optional client override (website intake only) → `N8N_CONTACT_DEAL_STAGE` → default.
 * `qualifiedtobuy` is never returned (coerced to default) so intake cannot skip the sales gate.
 */
export function resolveLeadIntakeDealStageForHubSpot(clientOverride?: string | null): string {
  const envRaw = process.env.N8N_CONTACT_DEAL_STAGE?.trim() ?? "";
  const candidates = [clientOverride?.trim(), envRaw].filter((s): s is string => Boolean(s));

  for (const raw of candidates) {
    const normalized = normalizeHubSpotDealStage(raw);
    const stage = normalized ?? (/^\d+$/.test(raw) ? raw : null);
    if (!stage) continue;
    if (stage === "qualifiedtobuy") continue;
    return stage;
  }
  return LEAD_INTAKE_HUBSPOT_DEAL_STAGE_DEFAULT;
}

export function buildN8nContactLeadWebhookPayload(input: {
  contactId: string;
  tier: "starter" | "growth";
}): Record<string, unknown> {
  return {
    contactId: input.contactId,
    createDeal: true,
    dealStage: resolveLeadIntakeDealStageForHubSpot(),
    tier: input.tier,
    painOverride: "",
  };
}
