import { ClerkProvider } from '@clerk/nextjs'
import { headers } from 'next/headers'
import {
  clerkAfterSignOutUrl,
  clerkProviderSatelliteProps,
  clerkRequestOriginFromHeaders,
  clerkSatelliteHostFallback,
} from '@/lib/clerk-satellite'
import type { ReactNode } from 'react'

/**
 * Satellite Clerk needs the request hostname. That requires `headers()`, which opts this
 * subtree into dynamic rendering — keep it isolated so non-satellite deployments stay fast.
 */
export default async function ClerkProviderFromRequest({ children }: { children: ReactNode }) {
  const h = await headers()
  const requestHost =
    h.get('x-forwarded-host')?.split(',')[0]?.trim() || h.get('host') || clerkSatelliteHostFallback()
  const forwardedOrigin = clerkRequestOriginFromHeaders(h)

  return (
    <ClerkProvider
      {...clerkProviderSatelliteProps(requestHost, forwardedOrigin)}
      afterSignOutUrl={clerkAfterSignOutUrl()}
    >
      {children}
    </ClerkProvider>
  )
}
