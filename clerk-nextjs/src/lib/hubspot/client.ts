const HUBSPOT_API = 'https://api.hubapi.com'

/** Requested on deal read-through for the portal summary. */
export const DEAL_SUMMARY_PROPERTIES = [
  'dealname',
  'dealstage',
  'amount',
  'closedate',
  'pipeline',
  'hs_object_id',
  'createdate',
  'description',
] as const

/** Requested on contact read-through for the portal summary. */
export const CONTACT_SUMMARY_PROPERTIES = [
  'firstname',
  'lastname',
  'email',
  'phone',
  'company',
  'lifecyclestage',
  'hs_object_id',
  'jobtitle',
  'website',
] as const

export interface HubSpotCrmObject {
  id: string
  properties: Record<string, string | null | undefined>
}

function token(): string {
  const t = process.env.HUBSPOT_PRIVATE_APP_TOKEN
  if (!t) throw new Error('HUBSPOT_PRIVATE_APP_TOKEN is not set')
  return t
}

function propertiesQuery(properties?: readonly string[]): string {
  if (!properties?.length) return ''
  const params = new URLSearchParams()
  for (const p of properties) params.append('properties', p)
  const q = params.toString()
  return q ? `?${q}` : ''
}

export async function fetchDeal(
  dealId: string,
  properties?: readonly string[],
): Promise<HubSpotCrmObject> {
  const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/deals/${dealId}${propertiesQuery(properties)}`, {
    headers: { Authorization: `Bearer ${token()}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`HubSpot fetchDeal failed: ${res.status}`)
  return res.json() as Promise<HubSpotCrmObject>
}

export async function fetchContact(
  contactId: string,
  properties?: readonly string[],
): Promise<HubSpotCrmObject> {
  const res = await fetch(
    `${HUBSPOT_API}/crm/v3/objects/contacts/${contactId}${propertiesQuery(properties)}`,
    {
      headers: { Authorization: `Bearer ${token()}` },
      cache: 'no-store',
    },
  )
  if (!res.ok) throw new Error(`HubSpot fetchContact failed: ${res.status}`)
  return res.json() as Promise<HubSpotCrmObject>
}
