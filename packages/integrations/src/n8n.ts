/**
 * Placeholder for a future n8n HTTP client wrapper.
 * Current usage: `@/lib/n8n/*` in iw-portal; fetch to webhook URLs in iw-site-q2.
 */
export type N8nIntegrationConfig = {
  baseUrl: string
  webhookSecret: string
}

export function createN8nClientPlaceholder(_config: N8nIntegrationConfig): never {
  throw new Error(
    '@repo/integrations n8n client is not implemented yet. This package is scaffolded for a future migration.',
  )
}
