'use client'

import { EmptyState } from '@/components/ui/EmptyState'
import { createBrowserSupabase } from '@/lib/supabase/client'
import { useNotifications } from '@/lib/hooks/useNotifications'
import type { NotificationRow } from '@/lib/supabase/types'
import { useAuth } from '@clerk/nextjs'

function BellIcon({ unread }: { unread: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
        unread
          ? 'border-[var(--iw-teal)] bg-[var(--iw-teal-dim)]/20 text-[var(--iw-teal)]'
          : 'border-[var(--iw-border)] bg-[var(--iw-slate-2)] text-[var(--iw-text-3)]'
      }`}
      aria-hidden="true"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1.5a5 5 0 0 1 5 5v2.5l1 2H2l1-2V6.5a5 5 0 0 1 5-5Z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export function NotificationList({
  projectId,
  initial,
}: {
  projectId: string
  initial: NotificationRow[]
}) {
  const { getToken } = useAuth()
  const { notifications, setNotifications } = useNotifications(projectId, initial)

  async function markRead(id: string) {
    const token = await getToken({ template: 'supabase' })
    const sb = createBrowserSupabase(token)
    if (!sb) return
    await sb.from('notifications').update({ read: true }).eq('id', id)
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)))
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="You're all caught up. We'll notify you when something needs attention."
      />
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <p className="iw-label text-[var(--iw-teal)]">
          {unreadCount} unread
        </p>
      )}
      <ul className="iw-enter-stagger space-y-2">
        {notifications.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => !n.read && void markRead(n.id)}
              className={`group w-full rounded-[var(--iw-radius-card)] border p-4 text-left shadow-[var(--iw-shadow-1)] transition-[box-shadow,border-color,background-color] duration-200 ${
                n.read
                  ? 'cursor-default border-[var(--iw-border)] bg-[var(--iw-slate-2)]'
                  : 'border-[var(--iw-border-2)] bg-[var(--iw-slate-3)] hover:shadow-[var(--iw-shadow-2)]'
              }`}
              aria-pressed={n.read}
              aria-label={n.read ? n.title : `Mark as read: ${n.title}`}
            >
              <div className="flex items-start gap-3">
                <BellIcon unread={!n.read} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`font-medium ${
                        n.read ? 'text-[var(--iw-text-2)]' : 'text-[var(--iw-text)]'
                      }`}
                    >
                      {n.title}
                    </p>
                    {!n.read && (
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--iw-teal)]"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[var(--iw-text-2)]">{n.body}</p>
                  <time
                    dateTime={n.created_at}
                    className="mt-1.5 block text-xs text-[var(--iw-text-3)]"
                  >
                    {new Date(n.created_at).toLocaleString()}
                  </time>
                </div>
              </div>
              {!n.read && (
                <p className="mt-2 text-right text-xs text-[var(--iw-text-3)] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  Click to mark as read
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
