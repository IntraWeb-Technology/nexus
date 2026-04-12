'use client'

import { createBrowserSupabase } from '@/lib/supabase/client'
import type { NotificationRow } from '@/lib/supabase/types'
import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export function useNotifications(projectId: string | undefined, initial: NotificationRow[]) {
  const { getToken } = useAuth()
  const [items, setItems] = useState<NotificationRow[]>(initial)

  useEffect(() => {
    setItems(initial)
  }, [initial])

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    let channel: ReturnType<NonNullable<ReturnType<typeof createBrowserSupabase>>['channel']> | null =
      null

    ;(async () => {
      const token = await getToken({ template: 'supabase' })
      const sb = createBrowserSupabase(token)
      if (!sb || cancelled) return
      channel = sb
        .channel(`notifications:${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `project_id=eq.${projectId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              setItems((n) => [payload.new as NotificationRow, ...n])
            }
            if (payload.eventType === 'UPDATE' && payload.new) {
              setItems((n) =>
                n.map((x) => (x.id === (payload.new as NotificationRow).id ? (payload.new as NotificationRow) : x)),
              )
            }
          },
        )
        .subscribe()
    })()

    return () => {
      cancelled = true
      if (channel) channel.unsubscribe()
    }
  }, [projectId, getToken])

  return { notifications: items, setNotifications: setItems }
}
