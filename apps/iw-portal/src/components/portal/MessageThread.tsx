'use client'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { useMessages } from '@/lib/hooks/useMessages'
import type { Message } from '@/lib/supabase/types'
import { useState } from 'react'

export function MessageThread({
  projectId,
  initialMessages,
}: {
  projectId: string
  initialMessages: Message[]
}) {
  const { messages } = useMessages(projectId, initialMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send() {
    if (!body.trim()) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ body: body.trim() }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error((j as { error?: string }).error || 'Send failed')
      }
      setBody('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-[min(70vh,520px)] space-y-3 overflow-y-auto rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4">
        {messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Send a note to the IntraWeb team — we respond on this thread."
          />
        ) : (
          messages.map((m) => (
            <div key={m.id} className="border-b border-[var(--iw-border)] pb-3 last:border-0">
              <p
                className={
                  m.sender_type === 'staff'
                    ? 'text-sm font-medium text-[var(--iw-teal-light)]'
                    : 'text-sm font-medium text-[var(--iw-text-2)]'
                }
              >
                {m.sender_name}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--iw-text)]">{m.body}</p>
              <p className="mt-1 text-xs text-[var(--iw-text-3)]">
                {new Date(m.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
      {error ? <p className="text-sm text-[var(--iw-red)]">{error}</p> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Write a reply…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void send()
            }
          }}
        />
        <Button variant="primary" disabled={sending} onClick={() => void send()}>
          Send
        </Button>
      </div>
    </div>
  )
}
