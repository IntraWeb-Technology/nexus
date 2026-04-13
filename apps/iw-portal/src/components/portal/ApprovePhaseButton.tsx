'use client'

import { Button } from '@/components/ui/Button'
import type { Milestone } from '@/lib/supabase/types'
import { useCallback, useState } from 'react'

export function ApprovePhaseButton({ milestone }: { milestone: Milestone }) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/milestones/approve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          milestone_id: milestone.id,
          notes: notes.trim() || undefined,
        }),
      })
      if (!res.ok) {
        setError('Could not submit approval.')
        return
      }
      setDone(true)
      setExpanded(false)
      setNotes('')
    } catch {
      setError('Could not submit approval.')
    } finally {
      setBusy(false)
    }
  }, [milestone.id, notes])

  if (done) {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[var(--iw-green)]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 7l3 3 7-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Approved
      </p>
    )
  }

  if (milestone.status !== 'active') return null

  return (
    <div className="mt-3 border-t border-[var(--iw-border)] pt-3">
      {!expanded ? (
        <Button type="button" variant="primary" className="text-sm" onClick={() => setExpanded(true)}>
          Approve this phase
        </Button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-[var(--iw-text-2)]">Add a note for your team? (optional)</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)] px-3 py-2 text-sm text-[var(--iw-text)]"
            disabled={busy}
          />
          {error ? <p className="text-sm text-[var(--iw-red)]">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="button" variant="primary" disabled={busy} onClick={() => void submit()}>
              Confirm approval
            </Button>
            <Button type="button" variant="ghost" disabled={busy} onClick={() => setExpanded(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
