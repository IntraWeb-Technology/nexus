/**
 * Placeholder for a future Stripe wrapper.
 * Current usage: `stripe` package in iw-portal (`@/lib/stripe/*`).
 */
export type StripeIntegrationConfig = {
  secretKey: string
}

export function createStripeClientPlaceholder(_config: StripeIntegrationConfig): never {
  throw new Error(
    '@repo/integrations Stripe client is not implemented yet. This package is scaffolded for a future migration.',
  )
}
