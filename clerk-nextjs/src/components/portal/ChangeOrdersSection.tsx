'use client'

import { ChangeOrderForm } from '@/components/portal/ChangeOrderForm'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { ChangeOrderRow, ChangeOrderStatus } from '@/lib/supabase/types'
import { useState } from 'react'

function statusBadge(s: ChangeOrderStatus): 'amber' | 'teal' | 'green' | 'red' {
  if (s === 'pending') return 'amber'
  if (s === 'reviewed') return 'teal'
  if (s === 'approved') return 'green'
  return 'red'
}

export function ChangeOrdersSection({ initialRows }: { initialRows: ChangeOrderRow[] }) {
  const [rows, setRows] = useState(initialRows)
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Change orders</h1>
        <Button type="button" variant="primary" onClick={() => setFormOpen(true)}>
          Request a change
        </Button>
      </div>
      <p className="text-sm text-[var(--iw-text-2)]">
        Submit formal scope change requests. Your team reviews each request and updates the status here.
      </p>
      {formOpen ? (
        <ChangeOrderForm
          onCreated={(r) => setRows((prev) => [r, ...prev])}
          onClose={() => setFormOpen(false)}
        />
      ) : null}
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--iw-text-3)]">No change orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-[var(--iw-text)]">{r.title}</p>
                  <p className="mt-2 text-sm text-[var(--iw-text-2)]">{r.description}</p>
                  <p className="mt-2 text-xs text-[var(--iw-text-3)]">
                    Requested {new Date(r.requested_at).toLocaleString()}
                  </p>
                  {r.status !== 'pending' && r.staff_notes ? (
                    <p className="mt-2 text-sm text-[var(--iw-text-2)]">
                      <span className="font-medium text-[var(--iw-text-3)]">Team notes: </span>
                      {r.staff_notes}
                    </p>
                  ) : null}
                </div>
                <Badge variant={statusBadge(r.status)}>{r.status}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
