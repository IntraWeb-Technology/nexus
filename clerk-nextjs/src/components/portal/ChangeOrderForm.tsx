'use client'

import { Button } from '@/components/ui/Button'
import type { ChangeOrderRow } from '@/lib/supabase/types'
import { useCallback, useState } from 'react'

export function ChangeOrderForm({
  onCreated,
  onClose,
}: {
  onCreated: (row: ChangeOrderRow) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async () => {
    const t = title.trim()
    const d = description.trim()
    if (!t || !d) {
      setError('Title and description are required.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/change-orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: t, description: d }),
      })
      if (!res.ok) {
        setError('Could not submit. Try again later.')
        return
      }
      const data = (await res.json()) as { change_order: ChangeOrderRow }
      onCreated(data.change_order)
      onClose()
    } catch {
      setError('Could not submit. Try again later.')
    } finally {
      setBusy(false)
    }
  }, [description, onClose, onCreated, title])

  return (
    <div className="rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4">
      <p className="iw-label mb-3">New change order request</p>
      <label className="block text-sm text-[var(--iw-text-2)]">
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)] px-3 py-2 text-[var(--iw-text)]"
          disabled={busy}
        />
      </label>
      <label className="mt-3 block text-sm text-[var(--iw-text-2)]">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)] px-3 py-2 text-[var(--iw-text)]"
          disabled={busy}
        />
      </label>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
      <div className="mt-4 flex gap-2">
        <Button type="button" variant="primary" disabled={busy} onClick={() => void submit()}>
          Submit request
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
