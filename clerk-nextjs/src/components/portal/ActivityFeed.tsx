import { EmptyState } from '@/components/ui/EmptyState'
import type { ActivityFeedItem } from '@/lib/activity/types'

function sym(type: string) {
  switch (type) {
    case 'payment':
      return '$'
    case 'milestone':
      return '◆'
    case 'message':
      return '✉'
    case 'document':
      return '▤'
    case 'task':
      return '☑'
    case 'hubspot_note':
      return '◇'
    case 'hubspot_task':
      return '☑'
    case 'hubspot_call':
      return '☎'
    case 'hubspot_meeting':
      return '◷'
    case 'hubspot_email':
      return '✉'
    default:
      if (type.startsWith('hubspot_')) return '☆'
      return '•'
  }
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
    <ul className="space-y-3">
      {items.map((a) => (
        <li
          key={a.id}
          className="rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4"
        >
          <div className="flex gap-3">
            <span className="text-[var(--iw-teal)]">{sym(a.type)}</span>
            <div>
              <p className="font-medium text-[var(--iw-text)]">{a.label}</p>
              {a.detail ? <p className="mt-1 text-sm text-[var(--iw-text-2)]">{a.detail}</p> : null}
              <p className="mt-2 text-xs text-[var(--iw-text-3)]">{formatRelative(a.created_at)}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function formatRelative(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const day = 86400000
  if (diff < day) return d.toLocaleString()
  const days = Math.floor(diff / day)
  if (days === 1) return '1 day ago'
  if (days < 14) return `${days} days ago`
  return d.toLocaleDateString()
}
