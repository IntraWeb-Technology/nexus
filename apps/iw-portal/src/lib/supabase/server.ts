import { auth } from '@clerk/nextjs/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cache } from 'react'

const supabaseJwtTemplate = process.env.CLERK_SUPABASE_JWT_TEMPLATE ?? 'supabase'

function isClerkJwtTemplateMissing(e: unknown): boolean {
  if (typeof e !== 'object' || e === null || !('errors' in e)) return false
  const errors = (e as { errors?: unknown }).errors
  if (!Array.isArray(errors)) return false
  return errors.some(
    (err) =>
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'resource_not_found',
  )
}

function getUrlKey() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
  const service =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  return { url, anon, service }
}

/**
 * Server-only: Supabase for the signed-in Clerk user.
 * Prefers a server-side admin key when available so queries work without Clerk JWT ↔ Supabase
 * RLS configuration. Supports both the legacy `SUPABASE_SERVICE_ROLE_KEY` and newer
 * `SUPABASE_SECRET_KEY`; callers must still scope by `userId` from `auth()` or by `project_id`
 * derived from that user’s data.
 * Falls back to anon + Clerk bearer token when no service key (e.g. local dev): first a
 * named JWT template (`CLERK_SUPABASE_JWT_TEMPLATE`, default `supabase`), then the default
 * session JWT (Clerk’s “Supabase” integration adds `role` there for third-party auth).
 *
 * Wrapped in `cache()` so layout + page share one client per request (avoids inconsistent nulls).
 */
async function createServerSupabaseForUserImpl(): Promise<SupabaseClient | null> {
  const { userId } = await auth()
  if (!userId) return null

  try {
    return createServiceSupabase()
  } catch {
    return createServerSupabaseWithClerkJwt()
  }
}

export const createServerSupabaseForUser = cache(createServerSupabaseForUserImpl)

async function createServerSupabaseWithClerkJwt(): Promise<SupabaseClient | null> {
  const { url, anon } = getUrlKey()
  if (!url || !anon) return null
  const { getToken } = await auth()
  let token: string | null = null
  try {
    token = await getToken({ template: supabaseJwtTemplate })
  } catch (e: unknown) {
    if (!isClerkJwtTemplateMissing(e)) throw e
  }
  if (!token) {
    token = await getToken()
  }
  if (!token) return null
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Service role — webhooks and server-only provisioning only. */
export function createServiceSupabase(): SupabaseClient {
  const { url, service } = getUrlKey()
  if (!url || !service) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL and a server key (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY)',
    )
  }
  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
