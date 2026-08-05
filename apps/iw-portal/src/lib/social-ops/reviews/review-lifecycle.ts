import type { ReviewActionType, ReviewItemStatus } from '@/lib/social-ops/types'

const TERMINAL_STATUSES: ReviewItemStatus[] = [
  'approved',
  'rewrite_requested',
  'skipped',
  'failed',
]

export function isTerminalReviewStatus(status: ReviewItemStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

export function projectedStatusForAction(action: ReviewActionType): ReviewItemStatus {
  switch (action) {
    case 'approve':
      return 'approved'
    case 'request_rewrite':
      return 'rewrite_requested'
    case 'skip':
      return 'skipped'
  }
}

export function canApplyReviewAction(currentStatus: ReviewItemStatus): boolean {
  return currentStatus === 'pending'
}

export function reviewActionLabel(action: ReviewActionType): string {
  switch (action) {
    case 'approve':
      return 'Approve'
    case 'request_rewrite':
      return 'Request rewrite'
    case 'skip':
      return 'Skip'
  }
}
