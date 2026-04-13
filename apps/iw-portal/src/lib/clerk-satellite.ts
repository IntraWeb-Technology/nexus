import type { NextRequest } from 'next/server'

/**
 * Clerk “satellite” mode: sign-in/up complete on the primary host (e.g. accounts.*),
 * while this app runs on another host (e.g. portal.*). Without this, the portal never
 * receives a synced session → redirect loops between portal and the primary sign-in URL.
 *
 * @see https://clerk.com/docs/advanced-usage/satellite-domains
 */
export function isClerkSatelliteMode(): boolean {
  return process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true'
}

function normalizeSatelliteDomain(raw: string): string {
  const t = raw.trim()
  if (!t) return t
  try {
    if (t.includes('://')) return new URL(t).host
  } catch {
    /* use as-is */
  }
  return t.replace(/^\/+/, '')
}

export function clerkSatelliteConfigured(): boolean {
  if (!isClerkSatelliteMode()) return false
  const d = process.env.NEXT_PUBLIC_CLERK_DOMAIN?.trim()
  const si = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL?.trim()
  const su = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL?.trim()
  return Boolean(d && si && su)
}

/** Second argument to `clerkMiddleware` when running as a satellite app. */
export function clerkSatelliteMiddlewareOptions(req: NextRequest) {
  if (!clerkSatelliteConfigured()) return {}
  const domain = normalizeSatelliteDomain(process.env.NEXT_PUBLIC_CLERK_DOMAIN!)
  return {
    isSatellite: true as const,
    domain: domain || req.nextUrl.host,
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL!,
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL!,
  }
}

/** Props for `<ClerkProvider>` on the satellite deployment. */
export function clerkProviderSatelliteProps():
  | { signInUrl: string; signUpUrl: string }
  | {
      isSatellite: true
      domain: string
      signInUrl: string
      signUpUrl: string
    } {
  if (!clerkSatelliteConfigured()) {
    return { signInUrl: '/sign-in', signUpUrl: '/sign-up' }
  }
  const rawDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN!.trim()
  return {
    isSatellite: true,
    domain: normalizeSatelliteDomain(rawDomain) || rawDomain,
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL!,
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL!,
  }
}

export function clerkAfterSignOutUrl(): string {
  if (clerkSatelliteConfigured()) return process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL!
  return '/sign-in'
}
