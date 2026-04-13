import type { ProjectStatus } from '@/lib/supabase/types'

export interface StageMapping {
  portalStatus: ProjectStatus
  progressPct: number
}

/** HubSpot deal stage id (string) → portal status + progress % */
const STAGE_MAP: Record<string, StageMapping> = {
  appointmentscheduled: { portalStatus: 'onboarding', progressPct: 5 },
  '3382756082': { portalStatus: 'onboarding', progressPct: 10 },
  '3382756083': { portalStatus: 'onboarding', progressPct: 15 },
  '3382756084': { portalStatus: 'build', progressPct: 20 },
  '3382756085': { portalStatus: 'build', progressPct: 30 },
  '3382756086': { portalStatus: 'build', progressPct: 35 },
  '3382756087': { portalStatus: 'build', progressPct: 40 },
  closedwon: { portalStatus: 'launch', progressPct: 90 },
  '3382756088': { portalStatus: 'retainer', progressPct: 100 },
  closedlost: { portalStatus: 'paused', progressPct: 0 },
}

export function mapDealStageToPortal(propertyValue: string | undefined | null): StageMapping | null {
  if (propertyValue == null || propertyValue === '') return null
  const key = String(propertyValue).trim()
  return STAGE_MAP[key] ?? null
}
