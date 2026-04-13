import { isHubSpotConfigured } from '@/lib/hubspot/config'
import { HubSpotErrorBoundary } from '@/components/portal/HubSpotErrorBoundary'
import type { ReactNode } from 'react'

type HubSpotGateProps = {
  children: ReactNode
  fallback: ReactNode
}

/**
 * Skips HubSpot-backed children when CRM is not configured; otherwise wraps in a client error boundary.
 */
export function HubSpotGate({ children, fallback }: HubSpotGateProps) {
  if (!isHubSpotConfigured()) {
    return fallback
  }
  return <HubSpotErrorBoundary fallback={fallback}>{children}</HubSpotErrorBoundary>
}
