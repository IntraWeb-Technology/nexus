import {
  clerkSatelliteConfigured,
  clerkSatelliteResolveFapiProxyUrl,
  isClerkSatelliteMode,
} from '@/lib/clerk-satellite'
import { isHubSpotConfigured } from '@/lib/hubspot/config'
import { getSupabaseApiUrl } from '@/lib/supabase/url'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

function keyKind(value: string, livePrefix: string, testPrefix: string): 'live' | 'test' | 'unknown' | 'missing' {
  if (!value) return 'missing'
  if (value.startsWith(livePrefix)) return 'live'
  if (value.startsWith(testPrefix)) return 'test'
  return 'unknown'
}

function present(value: string): boolean {
  return Boolean(value.trim())
}

function supabaseProjectRef(url: string): string | null {
  if (!present(url)) return null
  try {
    return new URL(url).hostname.split('.')[0] ?? null
  } catch {
    return null
  }
}

/**
 * Unauthenticated health probe for production debugging (Clerk keys present + live/test match).
 * Does not expose secret values.
 */
export async function GET() {
  const h = await headers()
  const requestHost =
    h.get('x-forwarded-host')?.split(',')[0]?.trim() || h.get('host') || null

  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''
  const sk = process.env.CLERK_SECRET_KEY ?? ''
  const supabaseUrl = getSupabaseApiUrl() ?? ''
  const supabaseAnon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? ''
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY ?? ''
  const publishable = keyKind(pk, 'pk_live_', 'pk_test_')
  const secret = keyKind(sk, 'sk_live_', 'sk_test_')
  const mismatchedPair =
    (publishable === 'live' && secret !== 'live') ||
    (publishable === 'test' && secret !== 'test') ||
    (secret === 'live' && publishable !== 'live') ||
    (secret === 'test' && publishable !== 'test')

  const ok =
    publishable !== 'missing' &&
    secret !== 'missing' &&
    publishable !== 'unknown' &&
    secret !== 'unknown' &&
    !mismatchedPair &&
    present(supabaseUrl) &&
    present(supabaseAnon)

  const clerkDomainEnv = process.env.NEXT_PUBLIC_CLERK_DOMAIN?.trim() || null
  const clerkFapiProxyFlag = process.env.NEXT_PUBLIC_CLERK_SATELLITE_FAPI_PROXY === 'true'
  const forwardedOrigin = requestHost ? `https://${requestHost}` : ''
  const resolvedFapiProxyUrl = clerkSatelliteResolveFapiProxyUrl({ forwardedOrigin })
  const satelliteConfigured = clerkSatelliteConfigured()
  const clerkSatelliteMisconfig =
    satelliteConfigured &&
    clerkFapiProxyFlag &&
    Boolean(clerkDomainEnv) &&
    !process.env.NEXT_PUBLIC_CLERK_PROXY_URL?.trim()

  return NextResponse.json(
    {
      ok,
      clerk: {
        publishableKey: publishable,
        secretKey: secret,
        mismatchedLiveTestPair: mismatchedPair,
        /** Helps debug Clerk `host_invalid`: this host must exist on the Clerk app for that publishable key. */
        requestHost,
        isSatelliteMode: isClerkSatelliteMode(),
        satelliteConfigured,
        fapiProxyEnabled: Boolean(resolvedFapiProxyUrl),
        /** When set with FAPI proxy (and no explicit proxy URL), Clerk may still load `clerk.{domain}` and DNS fails. */
        domainEnvSet: Boolean(clerkDomainEnv),
        satelliteMisconfigDomainWithFapiProxy: clerkSatelliteMisconfig,
      },
      supabase: {
        projectRef: supabaseProjectRef(supabaseUrl),
        urlConfigured: present(supabaseUrl),
        anonKeyConfigured: present(supabaseAnon),
        prefersServerKey: present(supabaseServiceRole) || present(supabaseSecret),
        serverKeySource: present(supabaseServiceRole)
          ? 'service_role'
          : present(supabaseSecret)
            ? 'secret'
            : 'none',
      },
      hubspot: {
        /** Portal CRM read + optional email→contact sync on load when token is set. */
        serverTokenConfigured: isHubSpotConfigured(),
      },
    },
    { status: ok ? 200 : 503 },
  )
}
