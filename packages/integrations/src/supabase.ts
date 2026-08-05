/**
 * Placeholder for a future Supabase helper module.
 * Current usage: `@supabase/ssr`, `@supabase/supabase-js` in iw-portal.
 */
export type SupabaseIntegrationConfig = {
  url: string
  anonKey: string
}

export function createSupabaseClientPlaceholder(_config: SupabaseIntegrationConfig): never {
  throw new Error(
    '@repo/integrations Supabase client is not implemented yet. This package is scaffolded for a future migration.',
  )
}
