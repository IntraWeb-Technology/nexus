import { getHubSpotPrivateAppToken } from '@/lib/hubspot/config'
import { searchHubSpotContactIdByEmail } from '@/lib/hubspot/contact-deal-lookup'

const HUBSPOT_API = 'https://api.hubapi.com'

export async function setHubSpotEmailOptOut(contactId: string): Promise<void> {
  const token = getHubSpotPrivateAppToken()
  if (!token) throw new Error('HubSpot not configured')

  const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts/${contactId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ properties: { email_opt_out: 'true' } }),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`HubSpot opt-out failed: ${res.status}`)
  }
}

export async function gdprDeleteHubSpotContact(contactId: string): Promise<void> {
  const token = getHubSpotPrivateAppToken()
  if (!token) throw new Error('HubSpot not configured')

  const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts/gdpr-delete`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ objectId: contactId }),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`HubSpot GDPR delete failed: ${res.status}`)
  }
}

export async function resolveHubSpotContactId(
  email: string,
  hubspotContactIdFromDb: string | null,
): Promise<string | null> {
  if (hubspotContactIdFromDb?.trim()) return hubspotContactIdFromDb.trim()
  return searchHubSpotContactIdByEmail(email)
}
