import type { Plan } from '@/lib/supabase/types'

/** Pre-contract (qualified) vs standard post-sale milestone tracks from `provision_client`. */
export type EngagementPhase = 'standard' | 'qualified'

export interface MilestoneSeed {
  title: string
  phase: string
  sort_order: number
}

/** Milestones for deals in “qualified to buy” before full project kickoff. */
export function milestonesForEngagementPhase(phase: EngagementPhase, plan: Plan): MilestoneSeed[] {
  if (phase === 'qualified') {
    return [
      { title: 'Portal access & welcome', phase: 'qualification', sort_order: 1 },
      { title: 'Discovery & requirements', phase: 'qualification', sort_order: 2 },
      { title: 'Proposal & scope alignment', phase: 'qualification', sort_order: 3 },
      { title: 'Contract & kickoff prep', phase: 'qualification', sort_order: 4 },
    ]
  }
  return milestonesForPlan(plan)
}

export function milestonesForPlan(plan: Plan): MilestoneSeed[] {
  if (plan === 'growth') {
    return [
      { title: 'Discovery & scoping', phase: 'discovery', sort_order: 1 },
      { title: 'Onboarding & setup', phase: 'onboarding', sort_order: 2 },
      { title: 'Automation architecture', phase: 'build', sort_order: 3 },
      { title: 'Integration build', phase: 'build', sort_order: 4 },
      { title: 'Advanced integrations', phase: 'build', sort_order: 5 },
      { title: 'AI feature configuration', phase: 'build', sort_order: 6 },
      { title: 'Client portal live', phase: 'build', sort_order: 7 },
      { title: 'QA & testing', phase: 'qa', sort_order: 8 },
      { title: 'Launch', phase: 'launch', sort_order: 9 },
      { title: 'Retainer begins', phase: 'retainer', sort_order: 10 },
    ]
  }
  return [
    { title: 'Discovery & scoping', phase: 'discovery', sort_order: 1 },
    { title: 'Onboarding & setup', phase: 'onboarding', sort_order: 2 },
    { title: 'Automation architecture', phase: 'build', sort_order: 3 },
    { title: 'Integration build', phase: 'build', sort_order: 4 },
    { title: 'Client portal live', phase: 'build', sort_order: 5 },
    { title: 'QA & testing', phase: 'qa', sort_order: 6 },
    { title: 'Launch', phase: 'launch', sort_order: 7 },
    { title: 'Retainer begins', phase: 'retainer', sort_order: 8 },
  ]
}
