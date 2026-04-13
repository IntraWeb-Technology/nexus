import { ApprovePhaseButton } from '@/components/portal/ApprovePhaseButton'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Milestone, MilestoneApproval } from '@/lib/supabase/types'

function statusVariant(s: Milestone['status']): 'green' | 'teal' | 'gray' {
  if (s === 'done') return 'green'
  if (s === 'active') return 'teal'
  return 'gray'
}

function StatusDot({ status }: { status: Milestone['status'] }) {
  if (status === 'done') {
    return (
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--iw-green)] bg-[var(--iw-slate-2)]"
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7L5.5 10L11.5 4" stroke="var(--iw-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  if (status === 'active') {
    return (
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--iw-teal)] bg-[var(--iw-slate-2)]"
        aria-hidden="true"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--iw-teal)]" />
      </span>
    )
  }
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--iw-border-2)] bg-[var(--iw-slate-2)]"
      aria-hidden="true"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-[var(--iw-border-2)]" />
    </span>
  )
}

export function MilestoneTimeline({
  milestones,
  approvalsByMilestoneId,
}: {
  milestones: Milestone[]
  approvalsByMilestoneId: Record<string, MilestoneApproval | undefined>
}) {
  if (milestones.length === 0) {
    return (
      <EmptyState
        title="No milestones yet"
        description="Milestones appear here as your project is planned and updated."
      />
    )
  }
  const sorted = [...milestones].sort((a, b) => a.sort_order - b.sort_order)
  return (
    <ul className="iw-enter-stagger relative space-y-0">
      {sorted.map((m, i) => {
        const approval = approvalsByMilestoneId[m.id]
        const isLast = i === sorted.length - 1
        return (
          <li key={m.id} className="relative flex gap-4 pb-5">
            {/* Vertical connector */}
            {!isLast && (
              <span
                className="absolute left-[15px] top-8 h-full w-px bg-[var(--iw-border)]"
                aria-hidden="true"
              />
            )}
            <StatusDot status={m.status} />
            <div className="min-w-0 flex-1 rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4 shadow-[var(--iw-shadow-1)] transition-[box-shadow] duration-300 hover:shadow-[var(--iw-shadow-2)]">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--iw-text)]">{m.title}</p>
                  {m.description ? (
                    <p className="mt-1 text-sm text-[var(--iw-text-2)]">{m.description}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--iw-text-3)]">
                    Phase:{' '}
                    <span className="font-medium text-[var(--iw-text-2)]">{m.phase}</span>
                  </p>
                  {approval ? (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--iw-green)]">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Approved by {approval.approved_by_name} ·{' '}
                      {new Date(approval.approved_at).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
                <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
              </div>
              {(m.completed_at || m.estimated_at) && (
                <p className="mt-2 text-xs text-[var(--iw-text-3)]">
                  {m.completed_at
                    ? `Completed ${new Date(m.completed_at).toLocaleDateString()}`
                    : `Est. ${new Date(m.estimated_at!).toLocaleDateString()}`}
                </p>
              )}
              {!approval ? <ApprovePhaseButton milestone={m} /> : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
