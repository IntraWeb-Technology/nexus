import type { NextRequest } from 'next/server'

/**
 * Clerk “satellite” mode: sign-in/up complete on the primary host (e.g. accounts.*),
 * while this app runs on another host (e.g. portal.*). Without this, the portal never
 * receives a synced session → redirect loops between portal and the primary sign-in URL.
 *
 * **Domain:** If `NEXT_PUBLIC_CLERK_DOMAIN` is unset, the actual request host is used
 * (`Host` / `x-forwarded-host`). Use that when one deployment answers **multiple**
 * hostnames (e.g. `portal.*` and `dashboard.*`). If you set `NEXT_PUBLIC_CLERK_DOMAIN`
 * to a single host but users open another, Clerk will not sync and you get a loop.
 *
 * @see https://clerk.com/docs/advanced-usage/satellite-domains
 */
export function isClerkSatelliteMode(): boolean {
  return process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true'
}

/**
 * Clerk `domain` must be a hostname (and optional port for localhost), never a URL or `https//…` typo.
 * Otherwise the SDK builds bad script URLs like `https://clerk.https//dashboard.example/...`.
 */
function normalizeSatelliteDomain(raw: string): string {
  let t = raw.trim()
  if (!t) return t

  // Missing colon after scheme: "https//host" → "https://host"
  if (/^https\/\//i.test(t)) {
    t = `https://${t.slice('https//'.length)}`
  } else if (/^http\/\//i.test(t)) {
    t = `http://${t.slice('http//'.length)}`
  }

  try {
    if (t.includes('://')) {
      return new URL(t).host
    }
  } catch {
    /* fall through */
  }

  t = t.replace(/^https?:\/\//i, '')
  // "host/path" or stray slashes → host only
  const hostOnly = t.split('/')[0]?.trim() ?? t
  return hostOnly.replace(/^\/+/, '')
}

/** Satellite auth is active (middleware + provider). Domain comes from env or request host. */
export function clerkSatelliteConfigured(): boolean {
  if (!isClerkSatelliteMode()) return false
  const si = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL?.trim()
  const su = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL?.trim()
  return Boolean(si && su)
}

/** Fallback host when `headers()` has no host (edge cases during prerender). */
export function clerkSatelliteHostFallback(): string {
  const app = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (app) {
    try {
      return new URL(app).host
    } catch {
      /* continue */
    }
  }
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return normalizeSatelliteDomain(vercel)
  return ''
}

function satelliteDomainFromEnvOrRequestHost(requestHost: string): string {
  const env = process.env.NEXT_PUBLIC_CLERK_DOMAIN?.trim()
  if (env) return normalizeSatelliteDomain(env)
  return normalizeSatelliteDomain(requestHost)
}

/** Second argument to `clerkMiddleware` when running as a satellite app. */
export function clerkSatelliteMiddlewareOptions(req: NextRequest) {
  if (!clerkSatelliteConfigured()) return {}
  const requestHost = req.nextUrl.host
  const domain = satelliteDomainFromEnvOrRequestHost(requestHost)
  if (!domain) return {}
  return {
    isSatellite: true as const,
    domain,
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL!,
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL!,
  }
}

/**
 * Props for `<ClerkProvider>` on the satellite deployment.
 * @param requestHostHeader `Host` or `x-forwarded-host` (first segment), e.g. `dashboard.intrawebtech.com` — should match middleware `req.nextUrl.host` when `NEXT_PUBLIC_CLERK_DOMAIN` is unset.
 */
export function clerkProviderSatelliteProps(requestHostHeader: string):
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
  const rawForwarded = requestHostHeader.trim()
  const domain =
    satelliteDomainFromEnvOrRequestHost(rawForwarded) || clerkSatelliteHostFallback()
  if (!domain) {
    return { signInUrl: '/sign-in', signUpUrl: '/sign-up' }
  }
  return {
    isSatellite: true,
    domain,
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL!,
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL!,
  }
}

export function clerkAfterSignOutUrl(): string {
  if (clerkSatelliteConfigured()) return process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL!
  return '/sign-in'
}