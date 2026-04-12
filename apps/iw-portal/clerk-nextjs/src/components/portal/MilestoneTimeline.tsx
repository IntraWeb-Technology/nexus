import { ApprovePhaseButton } from '@/components/portal/ApprovePhaseButton'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Milestone, MilestoneApproval } from '@/lib/supabase/types'

function statusVariant(s: Milestone['status']): 'green' | 'teal' | 'gray' {
  if (s === 'done') return 'green'
  if (s === 'active') return 'teal'
  return 'gray'
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
    <ul className="space-y-3">
      {sorted.map((m) => {
        const approval = approvalsByMilestoneId[m.id]
        return (
          <li
            key={m.id}
            className="rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-[var(--iw-text)]">{m.title}</p>
                {m.description ? (
                  <p className="mt-1 text-sm text-[var(--iw-text-2)]">{m.description}</p>
                ) : null}
                <p className="mt-2 text-xs text-[var(--iw-text-3)]">
                  Phase: <span className="text-[var(--iw-text-2)]">{m.phase}</span>
                </p>
                {approval ? (
                  <p className="mt-2 text-xs text-emerald-200">
                    Approved ✓ — {approval.approved_by_name},{' '}
                    {new Date(approval.approved_at).toLocaleString()}
                  </p>
                ) : null}
              </div>
              <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
            </div>
            <div className="mt-2 text-xs text-[var(--iw-text-3)]">
              {m.completed_at ? `Completed ${m.completed_at}` : null}
              {m.estimated_at && !m.completed_at ? `Est. ${m.estimated_at}` : null}
            </div>
            {!approval ? <ApprovePhaseButton milestone={m} /> : null}
          </li>
        )
      })}
    </ul>
  )
}
