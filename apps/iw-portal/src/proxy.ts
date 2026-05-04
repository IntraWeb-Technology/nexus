import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { clerkSatelliteMiddlewareOptions } from '@/lib/clerk-satellite'
import { NextResponse } from 'next/server'

const LEGACY_PORTAL_HOST = 'portal.intrawebtech.com'
const CANONICAL_PORTAL_HOST = 'dashboard.intrawebtech.com'

const isPublicRoute = createRouteMatcher([
  '/',
  '/post-auth',
  '/post-auth(.*)',
  '/post-auth/continue',
  '/post-auth/continue(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/internal/os(.*)',
  '/api/health',
])

export default clerkMiddleware(
  async (auth, request) => {
    if (request.nextUrl.host === LEGACY_PORTAL_HOST) {
      const url = request.nextUrl.clone()
      url.host = CANONICAL_PORTAL_HOST
      return NextResponse.redirect(url, 308)
    }

    if (!isPublicRoute(request)) {
      await auth.protect()
    }
  },
  (req) => clerkSatelliteMiddlewareOptions(req),
)

export const config = {
  matcher: [
    // Exclude `api/health` so diagnostics run without Clerk (clerkMiddleware asserts keys before public-route checks).
    '/((?!_next|api/health(?:/|$)|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // `__clerk` is Clerk’s Frontend API proxy path when `frontendApiProxy` is enabled (satellite + no `clerk.{host}` DNS).
    '/(api(?!/health)|trpc|__clerk)(.*)',
  ],
}
