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
    <div className="flex flex-col gap-6">
      <div className="flex max-h-[min(70vh,560px)] flex-col overflow-hidden rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] shadow-[var(--iw-shadow-1)]">
        <div className="border-b border-[var(--iw-border)] bg-[var(--iw-slate-2)]/50 px-4 py-2.5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--iw-text-3)]">Conversation</p>
        </div>
        <div className="space-y-4 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <EmptyState
              title="No messages yet"
              description="Send a note to the IntraWeb team — we respond on this thread."
            />
          ) : (
            messages.map((m, i) => {
              const isStaff = m.sender_type === 'staff'
              const delayMs = Math.min(i, 12) * 35
              return (
                <div
                  key={m.id}
                  className={`flex ${isStaff ? 'justify-start' : 'justify-end'} iw-animate-slide-up`}
                  style={{ animationDelay: `${delayMs}ms` }}
                >
                  <div
                    className={`max-w-[min(100%,28rem)] rounded-2xl border px-4 py-3 ${
                      isStaff
                        ? 'rounded-bl-md border-[var(--iw-border)] bg-[var(--iw-slate-2)]'
                        : 'rounded-br-md border-[var(--iw-teal)]/25 bg-[var(--iw-teal-dim)]/15'
                    }`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p
                        className={`text-xs font-semibold uppercase tracking-wide ${
                          isStaff ? 'text-[var(--iw-teal-light)]' : 'text-[var(--iw-text-2)]'
                        }`}
                      >
                        {isStaff ? 'Team' : 'You'} · {m.sender_name}
                      </p>
                      <time
                        className="text-[11px] tabular-nums text-[var(--iw-text-3)]"
                        dateTime={m.created_at}
                      >
                        {new Date(m.created_at).toLocaleString()}
                      </time>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--iw-text)]">
                      {m.body}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      {error ? <p className="text-sm text-[var(--iw-red)]">{error}</p> : null}
      <div className="rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-3 shadow-[var(--iw-shadow-1)] sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <Input
            className="sm:flex-1"
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
          <Button
            variant="primary"
            className="w-full shrink-0 sm:w-auto sm:self-center"
            loading={sending}
            onClick={() => void send()}
          >
            {sending ? 'Sending…' : 'Send'}
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-[var(--iw-text-3)]">Enter to send · Shift+Enter for a new line</p>
      </div>
    </div>
  )
}
