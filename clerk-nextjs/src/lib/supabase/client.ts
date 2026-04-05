import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createBrowserSupabase(accessToken: string | null): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
  if (!url || !anon) return null
  return createClient(url, anon, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
