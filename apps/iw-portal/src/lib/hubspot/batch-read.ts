/**
 * Minimal HubSpot CRM batch reads for internal OS routes (deal/contact properties only).
 */

const DEAL_BATCH = 'https://api.hubapi.com/crm/v3/objects/deals/batch/read'
const CONTACT_BATCH = 'https://api.hubapi.com/crm/v3/objects/contacts/batch/read'

const DEFAULT_DEAL_PROPS = [
  'dealname',
  'amount',
  'dealstage',
  'pipeline',
  'closedate',
  'hubspot_owner_id',
  'hs_lastmodifieddate',
]

const DEFAULT_CONTACT_PROPS = ['firstname', 'lastname', 'email', 'phone', 'company', 'hs_lastmodifieddate']

export type HubSpotPropsMap = Record<string, string | null>

async function postBatchRead(
  token: string,
  url: string,
  ids: string[],
  properties: string[],
): Promise<Map<string, HubSpotPropsMap>> {
  const out = new Map<string, HubSpotPropsMap>()
  if (ids.length === 0) return out

  const chunkSize = 100
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize)
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties,
        inputs: chunk.map((id) => ({ id })),
      }),
    })
    const text = await res.text()
    if (!res.ok) {
      throw new Error(`HubSpot batch read ${res.status}: ${text.slice(0, 500)}`)
    }
    const body = JSON.parse(text) as {
      results?: Array<{ id: string; properties?: HubSpotPropsMap }>
    }
    for (const r of body.results ?? []) {
      out.set(String(r.id), r.properties ?? {})
    }
  }
  return out
}

export function batchReadDeals(
  token: string,
  dealIds: string[],
  properties: string[] = DEFAULT_DEAL_PROPS,
): Promise<Map<string, HubSpotPropsMap>> {
  return postBatchRead(token, DEAL_BATCH, dealIds, properties)
}

export function batchReadContacts(
  token: string,
  contactIds: string[],
  properties: string[] = DEFAULT_CONTACT_PROPS,
): Promise<Map<string, HubSpotPropsMap>> {
  return postBatchRead(token, CONTACT_BATCH, contactIds, properties)
}
