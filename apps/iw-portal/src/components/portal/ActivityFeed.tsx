import type { ReactElement } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import type { ActivityFeedItem } from '@/lib/activity/types'

type IconKey =
  | 'payment'
  | 'milestone'
  | 'message'
  | 'document'
  | 'task'
  | 'hubspot_note'
  | 'hubspot_task'
  | 'hubspot_call'
  | 'hubspot_meeting'
  | 'hubspot_email'

function ActivityIcon({ type }: { type: string }) {
  const iconMap: Record<IconKey, ReactElement> = {
    payment: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 6h12" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    milestone: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 1.5l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9.5 4 11l.5-3.5L2 5l3.5-.5L7 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    message: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M12 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2l2 2 2-2h4a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    document: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M4 1.5h4.5L11 4v8a.5.5 0 0 1-.5.5h-7A.5.5 0 0 1 3 12V2a.5.5 0 0 1 1-.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M8.5 1.5V4H11" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      </svg>
    ),
    task: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 7l2.5 2.5L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    hubspot_note: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2 2h10v10H2zM4.5 5h5M4.5 7.5h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
    hubspot_task: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 7l2.5 2.5L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    hubspot_call: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M4 2c.5 1.5.5 2.5 0 3.5L3 6.5C3.5 8.5 5.5 10.5 7.5 11l1-.5c1-.5 2-.5 3.5 0v1.5c-5 1-10-4-8-10Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      </svg>
    ),
    hubspot_meeting: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 1.5v3M10 1.5v3M1 6h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    hubspot_email: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M12 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2l2 2 2-2h4a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  }

  const icon = iconMap[type as IconKey] ?? (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--iw-border-2)] bg-[var(--iw-slate-2)] text-[var(--iw-teal)]">
      {icon}
    </span>
  )
}

function formatRelative(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const minute = 60_000
  const hour = 3_600_000
  const day = 86_400_000

  if (diff < minute) return 'Just now'
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  if (diff < 2 * day) return 'Yesterday'
  if (diff < 14 * day) return `${Math.floor(diff / day)}d ago`
  return d.toLocaleDateString()
}

export function ActivityFeed({ items }: { items: ActivityFeedItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Updates from your project and our team will appear here."
      />
    )
  }
  return (
    <ul className="iw-enter-stagger relative space-y-0">
      {items.map((a, i) => {
        const isLast = i === items.length - 1
        return (
          <li key={a.id} className="relative flex gap-4 pb-4">
            {/* Vertical connector */}
            {!isLast && (
              <span
                className="absolute left-[15px] top-8 h-full w-px bg-[var(--iw-border)]"
                aria-hidden="true"
              />
            )}
            <ActivityIcon type={a.type} />
            <div className="min-w-0 flex-1 rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4 shadow-[var(--iw-shadow-1)] transition-[box-shadow] duration-300 hover:shadow-[var(--iw-shadow-2)]">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-medium text-[var(--iw-text)]">{a.label}</p>
                <time
                  dateTime={a.created_at}
                  className="shrink-0 text-xs text-[var(--iw-text-3)]"
                >
                  {formatRelative(a.created_at)}
                </time>
              </div>
              {a.detail ? <p className="mt-1 text-sm text-[var(--iw-text-2)]">{a.detail}</p> : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
