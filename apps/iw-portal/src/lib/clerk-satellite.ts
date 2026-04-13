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
 * **Frontend API host:** Without a DNS record for `clerk.{your-satellite-host}`, the SDK tries
 * that URL and you get `ERR_NAME_NOT_RESOLVED`. Fix by either adding Clerk’s satellite CNAME
 * or enabling a same-origin proxy (`/__clerk`) — see `NEXT_PUBLIC_CLERK_PROXY_URL` and
 * `NEXT_PUBLIC_CLERK_SATELLITE_FAPI_PROXY` below and
 * https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi#proxying-for-satellite-domains
 *
 * @see https://clerk.com/docs/advanced-usage/satellite-domains
 */
export function isClerkSatelliteMode(): boolean {
  return process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true'
}

const CLERK_FAPI_PROXY_PATH = '/__clerk/'

/** `https://dashboard.example.com` from forwarding headers (no trailing slash). */
export function clerkRequestOriginFromHeaders(h: Headers): string {
  const host = h.get('x-forwarded-host')?.split(',')[0]?.trim() || h.get('host') || ''
  if (!host) return ''
  const proto = h.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https'
  return `${proto}://${host}`
}

function clerkSatelliteExplicitProxyUrl(): string {
  const u = normalizeClerkAuthUrl(process.env.NEXT_PUBLIC_CLERK_PROXY_URL)
  if (!u) return ''
  return u.endsWith('/') ? u : `${u}/`
}

/**
 * Same-origin Clerk Frontend API proxy URL. When set, Clerk must not also receive satellite `domain`
 * (see Clerk “proxying for satellite domains”).
 */
export function clerkSatelliteResolveFapiProxyUrl(opts: {
  /** `req.nextUrl.origin` in middleware */
  nextOrigin?: string
  /** `clerkRequestOriginFromHeaders(await headers())` in the root layout path */
  forwardedOrigin?: string
}): string {
  const explicit = clerkSatelliteExplicitProxyUrl()
  if (explicit) return explicit
  if (process.env.NEXT_PUBLIC_CLERK_SATELLITE_FAPI_PROXY !== 'true') return ''
  const origin = (opts.forwardedOrigin || opts.nextOrigin || '').replace(/\/$/, '')
  if (!origin) return ''
  return `${origin}${CLERK_FAPI_PROXY_PATH}`
}

function clerkSatelliteUsesFapiProxy(reqOrOrigin: NextRequest | { forwardedOrigin: string }): boolean {
  const url =
    'forwardedOrigin' in reqOrOrigin
      ? clerkSatelliteResolveFapiProxyUrl({ forwardedOrigin: reqOrOrigin.forwardedOrigin })
      : clerkSatelliteResolveFapiProxyUrl({ nextOrigin: reqOrOrigin.nextUrl.origin })
  return Boolean(url)
}

/**
 * Satellite primary URLs must be absolute (`https://accounts…/sign-in`).
 * If env is `accounts.example.com/sign-in` (no scheme), browsers treat it as a path on the
 * current origin → `https://dashboard…/accounts.example.com/…` and `redirect_url` chains explode.
 */
export function normalizeClerkAuthUrl(raw: string | undefined | null): string {
  const t = (raw ?? '').trim()
  if (!t) return ''
  if (t.startsWith('/')) return t
  if (/^https?:\/\//i.test(t)) return t
  if (t.startsWith('//')) return `https:${t}`
  return `https://${t.replace(/^\/+/, '')}`
}

function clerkSatelliteSignInUrl(): string {
  return normalizeClerkAuthUrl(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL)
}

function clerkSatelliteSignUpUrl(): string {
  return normalizeClerkAuthUrl(process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL)
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
  return Boolean(clerkSatelliteSignInUrl() && clerkSatelliteSignUpUrl())
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
  const signInUrl = clerkSatelliteSignInUrl()
  const signUpUrl = clerkSatelliteSignUpUrl()

  if (clerkSatelliteUsesFapiProxy(req)) {
    return {
      isSatellite: true as const,
      signInUrl,
      signUpUrl,
      frontendApiProxy: { enabled: true as const },
    }
  }

  const requestHost = req.nextUrl.host
  const domain = satelliteDomainFromEnvOrRequestHost(requestHost)
  if (!domain) return {}
  return {
    isSatellite: true as const,
    domain,
    signInUrl,
    signUpUrl,
  }
}

/**
 * Props for `<ClerkProvider>` on the satellite deployment.
 * @param requestHostHeader `Host` or `x-forwarded-host` (first segment), e.g. `dashboard.intrawebtech.com` — should match middleware `req.nextUrl.host` when `NEXT_PUBLIC_CLERK_DOMAIN` is unset.
 * @param forwardedOrigin Full origin from `clerkRequestOriginFromHeaders` (used with `NEXT_PUBLIC_CLERK_SATELLITE_FAPI_PROXY`).
 */
export function clerkProviderSatelliteProps(
  requestHostHeader: string,
  forwardedOrigin?: string,
):
  | { signInUrl: string; signUpUrl: string }
  | {
      isSatellite: true
      signInUrl: string
      signUpUrl: string
      domain: string
    }
  | {
      isSatellite: true
      signInUrl: string
      signUpUrl: string
      proxyUrl: string
    } {
  if (!clerkSatelliteConfigured()) {
    return { signInUrl: '/sign-in', signUpUrl: '/sign-up' }
  }

  const proxyUrl = clerkSatelliteResolveFapiProxyUrl({ forwardedOrigin })
  if (proxyUrl) {
    return {
      isSatellite: true,
      proxyUrl,
      signInUrl: clerkSatelliteSignInUrl(),
      signUpUrl: clerkSatelliteSignUpUrl(),
    }
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
    signInUrl: clerkSatelliteSignInUrl(),
    signUpUrl: clerkSatelliteSignUpUrl(),
  }
}

export function clerkAfterSignOutUrl(): string {
  if (clerkSatelliteConfigured()) return clerkSatelliteSignInUrl()
  return '/sign-in'
}