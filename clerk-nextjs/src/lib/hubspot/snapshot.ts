import { unstable_cache } from 'next/cache'
import {
  CONTACT_SUMMARY_PROPERTIES,
  DEAL_SUMMARY_PROPERTIES,
  fetchContact,
  fetchDeal,
} from '@/lib/hubspot/client'

export type HubSpotPortalSnapshot =
  | { ok: false; reason: 'not_configured' | 'no_ids' }
  | {
      ok: true
      deal: { id: string; label: string; properties: Record<string, string | null | undefined> } | null
      contact: { id: string; label: string; properties: Record<string, string | null | undefined> } | null
    }
  | { ok: false; reason: 'error'; message: string }

async function loadSnapshot(dealId: string | null, contactId: string | null): Promise<HubSpotPortalSnapshot> {
  if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
    return { ok: false, reason: 'not_configured' }
  }
  if (!dealId && !contactId) {
    return { ok: false, reason: 'no_ids' }
  }

  try {
    const [dealRes, contactRes] = await Promise.all([
      dealId ? fetchDeal(dealId, DEAL_SUMMARY_PROPERTIES) : Promise.resolve(null),
      contactId ? fetchContact(contactId, CONTACT_SUMMARY_PROPERTIES) : Promise.resolve(null),
    ])

    const deal = dealRes
      ? {
          id: dealRes.id,
          label: 'Deal',
          properties: dealRes.properties ?? {},
        }
      : null

    const contact = contactRes
      ? {
          id: contactRes.id,
          label: 'Contact',
          properties: contactRes.properties ?? {},
        }
      : null

    return { ok: true, deal, contact }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'HubSpot request failed'
    return { ok: false, reason: 'error', message }
  }
}

/** Short TTL to respect HubSpot rate limits while keeping the dashboard fresh. */
export function getHubSpotPortalSnapshot(
  dealId: string | null,
  contactId: string | null,
): Promise<HubSpotPortalSnapshot> {
  return unstable_cache(
    async () => loadSnapshot(dealId, contactId),
    ['hubspot-portal-snapshot', dealId ?? 'none', contactId ?? 'none'],
    { revalidate: 300 },
  )()
}
