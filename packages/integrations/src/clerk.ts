/**
 * Placeholder for a future Clerk server helper module.
 * Current usage: `@clerk/nextjs`, `@clerk/backend` in iw-portal.
 */
export type ClerkIntegrationConfig = {
  secretKey: string
}

export function createClerkClientPlaceholder(_config: ClerkIntegrationConfig): never {
  throw new Error(
    '@repo/integrations Clerk client is not implemented yet. This package is scaffolded for a future migration.',
  )
}
