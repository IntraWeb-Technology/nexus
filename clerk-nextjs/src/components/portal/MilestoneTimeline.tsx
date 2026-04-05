import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Milestone } from '@/lib/supabase/types'

function statusVariant(s: Milestone['status']): 'green' | 'teal' | 'gray' {
  if (s === 'done') return 'green'
  if (s === 'active') return 'teal'
  return 'gray'
}

export function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
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
      {sorted.map((m) => (
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
            </div>
            <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
          </div>
          <div className="mt-2 text-xs text-[var(--iw-text-3)]">
            {m.completed_at ? `Completed ${m.completed_at}` : null}
            {m.estimated_at && !m.completed_at ? `Est. ${m.estimated_at}` : null}
          </div>
        </li>
      ))}
    </ul>
  )
}
