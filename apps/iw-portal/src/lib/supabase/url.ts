/**
 * PostgREST URL for this deployment.
 * - Browser code must use `NEXT_PUBLIC_SUPABASE_URL` only (bundled into the client).
 * - Server routes and scripts may fall back to `SUPABASE_URL` when hosts inject that name alone.
 */
export function getSupabaseApiUrl(): string | undefined {
  const pub = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (pub) return pub
  return process.env.SUPABASE_URL?.trim() || undefined
}
