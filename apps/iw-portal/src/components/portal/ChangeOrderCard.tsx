'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { changeOrderPayloadSchema, type ChangeOrderPayloadInput } from '@/lib/change-order/schema'
import type { ChangeOrderRow, ChangeOrderStatus } from '@/lib/supabase/types'

function statusBadge(s: ChangeOrderStatus): 'amber' | 'teal' | 'green' | 'red' | 'gray' {
  if (s === 'pending') return 'amber'
  if (s === 'reviewed') return 'teal'
  if (s === 'approved') return 'green'
  if (s === 'cancelled') return 'gray'
  return 'red'
}

function clientStatusLabel(s: ChangeOrderStatus): string {
  const m: Record<ChangeOrderStatus, string> = {
    pending: 'Awaiting review',
    reviewed: 'In review',
    approved: 'Approved',
    declined: 'Not approved',
    cancelled: 'Cancelled',
  }
  return m[s]
}

/** Client-facing line about delivery to our systems (no vendor names). */
function submissionDeliveryLabel(sync: string | null | undefined): string | null {
  if (!sync) return null
  if (sync === 'synced') return 'Submitted to our team'
  if (sync === 'pending') return 'Finishing submission…'
  if (sync === 'skipped') return null
  if (sync === 'error') {
    return 'We could not finish sending this automatically. Your request is still saved here — contact us if you need help.'
  }
  return null
}

function costImpactLabel(t: string): string {
  const m: Record<string, string> = {
    none: 'No cost change',
    increase: 'Cost increase',
    decrease: 'Cost decrease',
    tbd: 'TBD',
  }
  return m[t] ?? t
}

function FieldBlock({
  label,
  children,
  fullWidth,
}: {
  label: string
  children: ReactNode
  fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : undefined}>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--iw-text-3)]">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-[var(--iw-text)] whitespace-pre-wrap break-words">
        {children}
      </dd>
    </div>
  )
}

function collapsedSummary(p: ChangeOrderPayloadInput | null, description: string): string {
  if (p) {
    return `${p.proposedEffectiveDate} · ${costImpactLabel(p.costImpactType)}`
  }
  const oneLine = description.replace(/\s+/g, ' ').trim()
  return oneLine.length > 120 ? `${oneLine.slice(0, 117)}…` : oneLine || 'View full request'
}

export function ChangeOrderCard({
  row,
  onCancelled,
}: {
  row: ChangeOrderRow
  onCancelled?: (r: ChangeOrderRow) => void
}) {
  const [open, setOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const parsed = changeOrderPayloadSchema.safeParse(row.payload ?? {})
  const p = parsed.success ? parsed.data : null
  const deliveryLine = submissionDeliveryLabel(row.hubspot_sync_status)
  const panelId = `change-order-${row.id}-panel`
  const triggerId = `change-order-${row.id}-trigger`

  async function withdraw() {
    if (
      !confirm(
        'Cancel this request? It will show as cancelled here. You can submit a new request anytime if your needs change.',
      )
    ) {
      return
    }
    setCancelling(true)
    try {
      const res = await fetch(`/api/change-orders/${row.id}/cancel`, { method: 'POST' })
      const data = (await res.json()) as { change_order?: ChangeOrderRow; error?: string }
      if (!res.ok) {
        alert(data.error ?? 'We could not cancel that request. Please try again or contact support.')
        return
      }
      if (data.change_order) onCancelled?.(data.change_order)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <article
      className={`rounded-[14px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] shadow-[0_1px_0_rgba(0,0,0,0.04)] ${row.status === 'cancelled' ? 'opacity-[0.92]' : ''}`}
    >
      <div className="flex flex-wrap items-stretch gap-0 sm:flex-nowrap">
        <button
          type="button"
          id={triggerId}
          className="flex min-w-0 flex-1 items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--iw-slate-2)]/40"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
        >
          <span
            className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-[var(--iw-border)] bg-[var(--iw-slate-2)] text-xs text-[var(--iw-text-2)]"
            aria-hidden
          >
            {open ? '−' : '+'}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold tracking-tight text-[var(--iw-text)]">{row.title}</h2>
            {row.co_number ? (
              <p className="mt-1 font-mono text-xs text-[var(--iw-teal-light)]">
                Reference: {row.co_number}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-[var(--iw-text-3)]">
              <time dateTime={row.requested_at}>{new Date(row.requested_at).toLocaleString()}</time>
              <span className="mx-1.5 opacity-50" aria-hidden>
                ·
              </span>
              <span className="text-[var(--iw-text-2)]">{collapsedSummary(p, row.description)}</span>
            </p>
          </div>
        </button>
        <div className="flex flex-shrink-0 flex-col items-end gap-2 border-t border-[var(--iw-border)] px-5 py-4 sm:border-l sm:border-t-0 sm:pl-4">
          <Badge variant={statusBadge(row.status)}>{clientStatusLabel(row.status)}</Badge>
          {row.status === 'pending' ? (
            <Button
              type="button"
              variant="ghost"
              className="px-3 py-1.5 text-xs text-[var(--iw-text-3)]"
              disabled={cancelling}
              onClick={withdraw}
            >
              {cancelling ? 'Cancelling…' : 'Cancel request'}
            </Button>
          ) : null}
        </div>
      </div>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className="border-t border-[var(--iw-border)] px-5 py-4"
        >
          {p ? (
            <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <FieldBlock label="Agreement or SOW reference">{p.masterAgreementReference}</FieldBlock>
              <FieldBlock label="When you would like this to take effect">{p.proposedEffectiveDate}</FieldBlock>
              <FieldBlock label="What is in scope today" fullWidth>
                {p.currentScopeSummary}
              </FieldBlock>
              <FieldBlock label="What you’re asking us to change" fullWidth>
                {p.requestedScopeDetail}
              </FieldBlock>
              <FieldBlock label="Why this matters for your business" fullWidth>
                {p.businessRationale}
              </FieldBlock>
              <FieldBlock label="Timeline / schedule impact" fullWidth>
                {p.scheduleImpact}
              </FieldBlock>
              <FieldBlock label="Budget or fee impact" fullWidth>
                <span className="text-[var(--iw-text-2)]">{costImpactLabel(p.costImpactType)}</span>
                <span className="mt-2 block text-[var(--iw-text)]">{p.costImpactDescription}</span>
              </FieldBlock>
              <FieldBlock label="Authorized by">
                {p.authorizedSignerName}
                <span className="mt-1 block text-[var(--iw-text-2)]">{p.authorizedSignerTitle}</span>
              </FieldBlock>
            </dl>
          ) : (
            <p className="text-sm leading-relaxed text-[var(--iw-text-2)] whitespace-pre-wrap">{row.description}</p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--iw-border)] pt-4 text-xs text-[var(--iw-text-3)]">
            {deliveryLine ? (
              <span className={row.hubspot_sync_status === 'error' ? 'text-[var(--iw-amber)]' : undefined}>
                {deliveryLine}
              </span>
            ) : null}
          </div>

          {row.pdf_storage_path ? (
            <p className="mt-3">
              <a
                href={`/api/change-orders/${row.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--iw-border-2)] bg-[var(--iw-slate-2)] px-3 py-2 text-sm font-medium text-[var(--iw-teal-light)] transition hover:border-[var(--iw-teal-dim)] hover:bg-[var(--iw-slate-1)]"
              >
                Download a copy (PDF)
              </a>
            </p>
          ) : null}

          {row.staff_notes ? (
            <div className="mt-4 rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)]/80 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--iw-text-3)]">
                Message from your project team
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--iw-text-2)] whitespace-pre-wrap">
                {row.staff_notes}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
