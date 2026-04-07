'use client'

import { ChangeOrderCard } from '@/components/portal/ChangeOrderCard'
import { ChangeOrderForm } from '@/components/portal/ChangeOrderForm'
import { Button } from '@/components/ui/Button'
import type { ChangeOrderRow } from '@/lib/supabase/types'
import { useState } from 'react'

export function ChangeOrdersSection({ initialRows }: { initialRows: ChangeOrderRow[] }) {
  const [rows, setRows] = useState(initialRows)
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--iw-text)]">
              Scope change requests
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--iw-text-2)]">
              Request updates to what we&apos;re building or supporting for you. We&apos;ll review each request
              and you&apos;ll see the status here. If you change your mind before we&apos;ve responded, you can
              cancel a pending request from this page.
            </p>
          </div>
          <Button type="button" variant="primary" onClick={() => setFormOpen(true)}>
            New request
          </Button>
        </div>
      </header>

      {formOpen ? (
        <ChangeOrderForm
          onCreated={(r) => setRows((prev) => [r, ...prev])}
          onClose={() => setFormOpen(false)}
        />
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[var(--iw-border)] bg-[var(--iw-slate-3)]/50 px-6 py-12 text-center">
          <p className="text-sm text-[var(--iw-text-2)]">You haven&apos;t submitted a scope change request yet.</p>
          <p className="mt-2 text-xs text-[var(--iw-text-3)]">
            When you&apos;re ready, tap <span className="font-medium text-[var(--iw-text-2)]">New request</span>{' '}
            above.
          </p>
        </div>
      ) : (
        <ul className="space-y-6">
          {rows.map((r) => (
            <li key={r.id}>
              <ChangeOrderCard
                row={r}
                onCancelled={(u) => setRows((prev) => prev.map((x) => (x.id === u.id ? u : x)))}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
