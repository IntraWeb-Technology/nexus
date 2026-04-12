import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Exit with a clear message if PostgREST cannot see portal tables (migrations missing / wrong project).
 */
export async function exitIfPortalSchemaMissing(
  sb: SupabaseClient,
  apiUrl: string,
): Promise<void> {
  const { error } = await sb.from('clients').select('id').limit(1)
  if (!error) return

  const code = (error as { code?: string }).code
  const msg = error.message ?? ''
  if (code === 'PGRST205' || msg.includes('schema cache') || msg.includes("does not exist")) {
    console.error(`
Supabase API cannot see public.clients (${code ?? 'error'}).

Fix one of:
  • Apply migrations: Supabase Dashboard → SQL → paste and run supabase/migrations/001_initial.sql from this repository’s root
  • Or from repo root (with Supabase CLI): supabase link --project-ref <your-ref> && supabase db push

Also verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are from the SAME project.

API URL in use: ${apiUrl}
`)
    process.exit(1)
  }
  throw error
}
