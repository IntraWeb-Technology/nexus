/**
 * Central HubSpot env access for server-side code. Do not read the token from client components.
 *
 * Token resolution order (first non-empty wins):
 * 1. `HUBSPOT_PRIVATE_APP_TOKEN` — preferred for the portal (CRM + invoices scopes).
 * 2. `HUBSPOT_ACCESS_TOKEN` — often already set for the marketing site in the same monorepo.
 * 3. `HUBSPOT_TOKEN` — used by some scripts / legacy env files.
 *
 * The private app must include CRM read scopes for deals, contacts, associations, and **invoices**
 * if you want HubSpot Billing invoices in the portal.
 */
function firstNonEmpty(...keys: (string | undefined)[]): string | null {
  for (const k of keys) {
    const v = k?.trim()
    if (v) return v
  }
  return null
}

/** Bearer token for HubSpot CRM APIs (server-only). */
export function getHubSpotPrivateAppToken(): string | null {
  return firstNonEmpty(
    process.env.HUBSPOT_PRIVATE_APP_TOKEN,
    process.env.HUBSPOT_ACCESS_TOKEN,
    process.env.HUBSPOT_TOKEN,
  )
}

/** Marketing portal (Hub ID) — `HUBSPOT_PORTAL_ID` preferred; `NEXT_PUBLIC_HUBSPOT_ID` for shared Vercel / legacy. */
export function getHubSpotPortalId(): string | null {
  return firstNonEmpty(
    process.env.HUBSPOT_PORTAL_ID,
    process.env.NEXT_PUBLIC_HUBSPOT_ID,
  )
}

/**
 * Change order form — `HUBSPOT_CHANGE_ORDER_FORM_GUID` preferred; `HUBSPOT_FORM_GUID` matches older Vercel name.
 */
export function getHubSpotChangeOrderFormGuid(): string | null {
  return firstNonEmpty(
    process.env.HUBSPOT_CHANGE_ORDER_FORM_GUID,
    process.env.HUBSPOT_FORM_GUID,
  )
}

export function isHubSpotConfigured(): boolean {
  return getHubSpotPrivateAppToken() != null
}

export function requireHubSpotToken(): string {
  const t = getHubSpotPrivateAppToken()
  if (!t) {
    throw new Error(
      'No HubSpot server token: set HUBSPOT_PRIVATE_APP_TOKEN (or HUBSPOT_ACCESS_TOKEN / HUBSPOT_TOKEN) on this deployment.',
    )
  }
  return t
}
