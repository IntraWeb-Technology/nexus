import { HS_CO, HS_EMAIL } from '@/lib/change-order/hubspot-fields'
import type { ChangeOrderPayloadInput } from '@/lib/change-order/schema'
import { getHubSpotChangeOrderFormGuid, getHubSpotPortalId, getHubSpotPrivateAppToken } from '@/lib/hubspot/config'

const HS_FORMS_BASE = 'https://api.hsforms.com'

const CONTACT_OBJECT_TYPE_ID = '0-1'

function field(
  name: string,
  value: string | undefined | null,
): { objectTypeId: string; name: string; value: string } | null {
  if (value === undefined || value === null) return null
  return { objectTypeId: CONTACT_OBJECT_TYPE_ID, name, value: String(value) }
}

/** Map portal payload to HubSpot form field names (contact properties). */
export function changeOrderPayloadToHubSpotFields(
  email: string,
  portalReference: string,
  payload: ChangeOrderPayloadInput,
) {
  const rows = [
    field(HS_EMAIL, email),
    field(HS_CO.title, payload.title),
    field(HS_CO.masterAgreementReference, payload.masterAgreementReference),
    field(HS_CO.currentScopeSummary, payload.currentScopeSummary),
    field(HS_CO.requestedScopeDetail, payload.requestedScopeDetail),
    field(HS_CO.businessRationale, payload.businessRationale),
    field(HS_CO.scheduleImpact, payload.scheduleImpact),
    field(HS_CO.costImpactType, payload.costImpactType),
    field(HS_CO.costImpactDescription, payload.costImpactDescription),
    field(HS_CO.proposedEffectiveDate, payload.proposedEffectiveDate),
    field(HS_CO.authorizedSignerName, payload.authorizedSignerName),
    field(HS_CO.authorizedSignerTitle, payload.authorizedSignerTitle),
    field(HS_CO.ackAccuracy, payload.ackAccuracy ? 'true' : 'false'),
    field(HS_CO.ackAuthority, payload.ackAuthority ? 'true' : 'false'),
    field(HS_CO.ackWrittenSupersedesVerbal, payload.ackWrittenSupersedesVerbal ? 'true' : 'false'),
    field(HS_CO.ackElectronicRecords, payload.ackElectronicRecords ? 'true' : 'false'),
    field(HS_CO.portalReference, portalReference),
  ].filter((x): x is { objectTypeId: string; name: string; value: string } => x !== null)
  return rows
}

export type HubSpotFormSubmitResult =
  | { ok: true; status: number; body: unknown }
  | { ok: false; error: string; status?: number; body?: unknown }

/**
 * Submits to HubSpot Forms API. Requires Marketing form GUID and portal id.
 * @see https://developers.hubspot.com/docs/api/methods/forms/forms_submissions
 */
export async function submitChangeOrderHubSpotForm(params: {
  email: string
  portalReference: string
  payload: ChangeOrderPayloadInput
}): Promise<HubSpotFormSubmitResult> {
  const pid = getHubSpotPortalId()
  const guid = getHubSpotChangeOrderFormGuid()
  if (!pid || !guid) {
    return {
      ok: false,
      error:
        'HubSpot form not configured: set HUBSPOT_PORTAL_ID (or NEXT_PUBLIC_HUBSPOT_ID) and HUBSPOT_CHANGE_ORDER_FORM_GUID (or HUBSPOT_FORM_GUID)',
    }
  }

  const fields = changeOrderPayloadToHubSpotFields(
    params.email,
    params.portalReference,
    params.payload,
  )

  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://localhost'
  const body = {
    submittedAt: new Date().toISOString(),
    fields,
    context: {
      pageUri: `${base}/change-orders`,
      pageName: 'Scope change request',
    },
  }

  const url = `${HS_FORMS_BASE}/submissions/v3/integration/submit/${encodeURIComponent(pid)}/${encodeURIComponent(guid)}`
  const headers: HeadersInit = { 'content-type': 'application/json' }
  const pat = getHubSpotPrivateAppToken()
  if (pat) headers.Authorization = `Bearer ${pat}`

  let res: Response
  try {
    res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'HubSpot request failed' }
  }

  let parsed: unknown
  try {
    parsed = await res.json()
  } catch {
    parsed = null
  }

  if (!res.ok) {
    return {
      ok: false,
      error: `HubSpot forms submit failed (${res.status})`,
      status: res.status,
      body: parsed,
    }
  }

  return { ok: true, status: res.status, body: parsed }
}
