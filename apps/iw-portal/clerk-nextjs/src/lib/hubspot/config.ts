/**
 * Central HubSpot env access for server-side code. Do not read the token from client components.
 */
export function isHubSpotConfigured(): boolean {
  const t = process.env.HUBSPOT_PRIVATE_APP_TOKEN
  return typeof t === 'string' && t.trim().length > 0
}

export function requireHubSpotToken(): string {
  const t = process.env.HUBSPOT_PRIVATE_APP_TOKEN
  if (!t?.trim()) {
    throw new Error('HUBSPOT_PRIVATE_APP_TOKEN is not set')
  }
  return t
}
