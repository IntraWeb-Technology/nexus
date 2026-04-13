import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { clerkSatelliteMiddlewareOptions } from '@/lib/clerk-satellite'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/health',
])

export default clerkMiddleware(
  async (auth, request) => {
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
