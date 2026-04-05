'use client'

import { EmptyState } from '@/components/ui/EmptyState'
import { createBrowserSupabase } from '@/lib/supabase/client'
import { useNotifications } from '@/lib/hooks/useNotifications'
import type { NotificationRow } from '@/lib/supabase/types'
import { useAuth } from '@clerk/nextjs'

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
        description="You’re all caught up. We’ll notify you when something needs attention."
      />
    )
  }

  return (
    <ul className="space-y-2">
      {notifications.map((n) => (
        <li key={n.id}>
          <button
            type="button"
            onClick={() => void markRead(n.id)}
            className={`w-full rounded-[12px] border border-[var(--iw-border)] p-4 text-left ${
              n.read ? 'bg-[var(--iw-slate-2)]' : 'bg-[var(--iw-slate-3)]'
            }`}
          >
            <p className="font-medium text-[var(--iw-text)]">{n.title}</p>
            <p className="mt-1 text-sm text-[var(--iw-text-2)]">{n.body}</p>
            <p className="mt-2 text-xs text-[var(--iw-text-3)]">
              {new Date(n.created_at).toLocaleString()}
            </p>
          </button>
        </li>
      ))}
    </ul>
  )
}
