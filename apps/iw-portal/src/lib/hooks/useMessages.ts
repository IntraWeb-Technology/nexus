'use client'

import { createBrowserSupabase } from '@/lib/supabase/client'
import type { Message } from '@/lib/supabase/types'
import { useAuth } from '@clerk/nextjs'
import { useCallback, useEffect, useState } from 'react'

export function useMessages(projectId: string | undefined, initial: Message[]) {
  const { getToken } = useAuth()
  const [messages, setMessages] = useState<Message[]>(initial)

  useEffect(() => {
    setMessages(initial)
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
        .channel(`messages:${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `project_id=eq.${projectId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              setMessages((m) => [...m, payload.new as Message])
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

  const appendOptimistic = useCallback((m: Message) => {
    setMessages((prev) => [...prev, m])
  }, [])

  return { messages, appendOptimistic }
}
