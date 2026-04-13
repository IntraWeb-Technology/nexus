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
    <div className="iw-animate-slide-up mx-auto max-w-3xl space-y-8">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1>Scope change requests</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--iw-text-2)]">
              Request updates to what we&apos;re building or supporting for you. We&apos;ll review each
              request and you&apos;ll see the status here. If you change your mind before we&apos;ve
              responded, you can cancel a pending request from this page.
            </p>
          </div>
          {!formOpen && (
            <Button type="button" variant="primary" onClick={() => setFormOpen(true)}>
              New request
            </Button>
          )}
        </div>
      </header>

      {formOpen ? (
        <ChangeOrderForm
          onCreated={(r) => {
            setRows((prev) => [r, ...prev])
            setFormOpen(false)
          }}
          onClose={() => setFormOpen(false)}
        />
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-[var(--iw-radius-card)] border border-dashed border-[var(--iw-border)] bg-[var(--iw-slate-3)]/60 px-6 py-14 text-center">
          <svg
            className="mx-auto mb-4 text-[var(--iw-text-3)]"
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
          >
            <rect x="6" y="4" width="28" height="32" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13 14h14M13 20h14M13 26h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="30" cy="30" r="6" fill="var(--iw-slate-3)" stroke="currentColor" strokeWidth="1.5" />
            <path d="M30 27v3l2 2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm font-medium text-[var(--iw-text-2)]">
            No scope change requests yet
          </p>
          <p className="mt-1.5 text-xs text-[var(--iw-text-3)]">
            When you&apos;re ready, use{' '}
            <span className="font-medium text-[var(--iw-text-2)]">New request</span> above.
          </p>
        </div>
      ) : (
        <ul className="iw-enter-stagger space-y-4">
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
