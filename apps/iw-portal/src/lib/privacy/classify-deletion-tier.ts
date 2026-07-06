import type { DataSubjectRequestType, Project, ProjectStatus } from '@/lib/supabase/types'

export type DeletionTier = 'marketing_only' | 'marketing_opt_out' | 'portal_inactive' | 'blocked_active'

const ACTIVE_PROJECT_STATUSES: ReadonlySet<ProjectStatus> = new Set(['onboarding', 'build', 'qa'])

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due'])

export function classifyDeletionTier(input: {
  requestType: DataSubjectRequestType
  hasClient: boolean
  projects: Pick<Project, 'status'>[]
  openInvoiceCount: number
  activeSubscriptionCount: number
}): DeletionTier {
  if (input.requestType === 'marketing_opt_out') {
    return 'marketing_opt_out'
  }

  if (!input.hasClient) {
    return 'marketing_only'
  }

  const hasActiveProject = input.projects.some((p) => ACTIVE_PROJECT_STATUSES.has(p.status))
  if (hasActiveProject || input.openInvoiceCount > 0 || input.activeSubscriptionCount > 0) {
    return 'blocked_active'
  }

  return 'portal_inactive'
}

export function isActiveSubscriptionStatus(status: string): boolean {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(status)
}
