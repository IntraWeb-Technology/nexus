/**
 * Placeholder for a future HubSpot client wrapper.
 * Current usage: `@/lib/hubspot/*` in iw-portal, `lib/hubspot*.ts` in iw-site-q2.
 */
export type HubSpotIntegrationConfig = {
  accessToken: string
}

export function createHubSpotClientPlaceholder(_config: HubSpotIntegrationConfig): never {
  throw new Error(
    '@repo/integrations HubSpot client is not implemented yet. This package is scaffolded for a future migration.',
  )
}
