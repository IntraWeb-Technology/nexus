/**
 * Script-only Supabase URL + service role resolution (Node / tsx).
 * Reads `process.env` only: no network, no mutation of `process.env`, no Supabase clients.
 */

export type SupabaseScriptEnv = {
  url: string
  serviceRoleKey: string
}

function pick(...values: Array<string | undefined>): string | null {
  for (const value of values) {
    const trimmed = value?.trim()
    if (trimmed) return trimmed
  }
  return null
}

export function resolveSupabaseScriptEnv(): SupabaseScriptEnv {
  const url = pick(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL)
  const serviceRoleKey = pick(process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.SUPABASE_SECRET_KEY)

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase env: require NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or legacy SUPABASE_SECRET_KEY).',
    )
  }

  return { url, serviceRoleKey }
}
