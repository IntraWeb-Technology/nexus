import { getHubSpotPrivateAppToken } from '@/lib/hubspot/config'

const HUBSPOT_API = 'https://api.hubapi.com'

type SearchResponse = { results?: { id: string }[] }

type AssociationsV4Response = { results?: { toObjectId?: number | string }[] }

/**
 * Returns HubSpot contact object id when exactly one contact matches the email (case-insensitive).
 * Returns null if none or ambiguous — never guess between duplicates.
 */
export async function searchHubSpotContactIdByEmail(email: string): Promise<string | null> {
  const token = getHubSpotPrivateAppToken()
  const raw = email.trim()
  if (!token || !raw) return null

  const trySearch = async (value: string): Promise<string | null> => {
    const body = {
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value }] }],
      properties: ['email'],
      limit: 5,
    }
    const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts/search`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    if (!res.ok) {
      console.warn('[hubspot/contact-deal-lookup] contact search failed', res.status, await res.text().catch(() => ''))
      return null
    }
    const json = (await res.json()) as SearchResponse
    const ids = json.results?.map((r) => r.id).filter(Boolean) ?? []
    if (ids.length !== 1) return null
    return ids[0] ?? null
  }

  return (await trySearch(raw)) ?? (await trySearch(raw.toLowerCase()))
}

/** Deal ids associated to a contact (v4 associations). */
export async function listHubSpotDealIdsForContact(contactId: string): Promise<string[]> {
  const token = getHubSpotPrivateAppToken()
  const id = contactId.trim()
  if (!token || !id) return []

  const res = await fetch(`${HUBSPOT_API}/crm/v4/objects/contacts/${id}/associations/deals`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    console.warn('[hubspot/contact-deal-lookup] associations failed', res.status)
    return []
  }
  const json = (await res.json()) as AssociationsV4Response
  const out: string[] = []
  for (const r of json.results ?? []) {
    const raw = r.toObjectId
    if (raw === undefined || raw === null) continue
    out.push(String(raw))
  }
  return out
}
