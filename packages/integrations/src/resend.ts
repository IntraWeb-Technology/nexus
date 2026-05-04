/**
 * Placeholder for a future Resend wrapper.
 * Current usage: `resend` package in iw-portal and iw-site-q2.
 */
export type ResendIntegrationConfig = {
  apiKey: string
}

export function createResendClientPlaceholder(_config: ResendIntegrationConfig): never {
  throw new Error(
    '@repo/integrations Resend client is not implemented yet. This package is scaffolded for a future migration.',
  )
}
