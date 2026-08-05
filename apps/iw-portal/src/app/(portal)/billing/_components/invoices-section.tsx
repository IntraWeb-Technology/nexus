'use client'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  buildBillingTimelineModel,
  type BillingTimelineCard,
  type BillingUiInvoice,
} from '@/lib/billing/billing-ui-serialize'
import { buildInvoicesCsv, downloadCsvText } from '@/lib/billing/csv'
import { formatCurrency, formatInvoiceDate, formatRelativeDate } from '@/lib/billing/format'
import type { SubscriptionRow } from '@/lib/supabase/types'
import { useMemo, useState } from 'react'
import { InvoicesTable } from './invoices-table'

type TabId = 'all' | 'open' | 'paid' | 'drafts'

function filterRows(rows: BillingUiInvoice[], tab: TabId): BillingUiInvoice[] {
  if (tab === 'all') return rows
  if (tab === 'open') return rows.filter((r) => r.status === 'pending' || r.status === 'overdue')
  if (tab === 'paid') return rows.filter((r) => r.status === 'paid')
  return rows.filter((r) => r.status === 'void')
}

function timelineStatusBadge(card: BillingTimelineCard): 'green' | 'amber' | 'gray' {
  if (card.status === 'paid') return 'green'
  if (card.status === 'open') return 'amber'
  return 'gray'
}

function timelineStatusText(card: BillingTimelineCard): string {
  if (card.status === 'paid') return 'Paid'
  if (card.status === 'open') return 'Due'
  return 'Upcoming'
}

export function InvoicesSection({
  invoices,
  projectSlug,
  subscription,
}: {
  invoices: BillingUiInvoice[]
  projectSlug: string
  subscription: SubscriptionRow | null
}) {
  const [tab, setTab] = useState<TabId>('all')

  const counts = useMemo(() => {
    const open = invoices.filter((r) => r.status === 'pending' || r.status === 'overdue').length
    const paid = invoices.filter((r) => r.status === 'paid').length
    const drafts = invoices.filter((r) => r.status === 'void').length
    return { all: invoices.length, open, paid, drafts }
  }, [invoices])

  const filtered = useMemo(() => filterRows(invoices, tab), [invoices, tab])
  const timeline = useMemo(() => buildBillingTimelineModel(invoices, subscription), [invoices, subscription])

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'open', label: 'Open', count: counts.open },
    { id: 'paid', label: 'Paid', count: counts.paid },
    { id: 'drafts', label: 'Drafts', count: counts.drafts },
  ]

  return (
    <section id="invoice-history" className="space-y-4">
      <div className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-[var(--iw-text-primary)]">Project Billing Timeline</h2>
        <div className="space-y-2.5">
          {timeline.phaseCards.map((card) => {
            const issued = card.invoice?.issuedAt ? new Date(card.invoice.issuedAt) : null
            const due = card.invoice?.dueAt ? new Date(card.invoice.dueAt) : null
            const dueRelative = due ? formatRelativeDate(due) : null
            return (
              <article
                key={card.phase}
                className="rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-surface-elevated)] px-4 py-3 shadow-[var(--iw-shadow-1)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--iw-text-primary)]">{card.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--iw-text-muted)]">{card.subtitle}</p>
                  </div>
                  <Badge variant={timelineStatusBadge(card)}>{timelineStatusText(card)}</Badge>
                </div>
                {card.invoice ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--iw-text-secondary)]">
                    <p>
                      <span className="text-[var(--iw-text-muted)]">Invoice:</span> {card.invoice.invoiceNumber}
                    </p>
                    <p className="text-right font-medium text-[var(--iw-text-primary)]">
                      {formatCurrency(card.invoice.amountCents, card.invoice.currency)}
                    </p>
                    <p>
                      <span className="text-[var(--iw-text-muted)]">Issued:</span>{' '}
                      {issued ? formatInvoiceDate(issued) : '—'}
                    </p>
                    <p className="text-right">
                      <span className="text-[var(--iw-text-muted)]">Due:</span>{' '}
                      {due ? formatInvoiceDate(due) : '—'}
                      {dueRelative ? <span className="ml-1 text-[var(--iw-text-muted)]">({dueRelative.text})</span> : null}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-[var(--iw-text-muted)]">Invoice not issued yet for this phase.</p>
                )}
              </article>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold tracking-tight text-[var(--iw-text-primary)]">Invoice History</h2>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() =>
            downloadCsvText(buildInvoicesCsv(filtered), `invoices-${projectSlug}-${tab}.csv`)
          }
        >
          Export CSV
        </Button>
      </div>

      <div role="tablist" aria-label="Invoice filters" className="flex flex-wrap gap-1 border-b border-[var(--iw-border)]">
        {tabs.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`relative -mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-[#14b8a6] text-[#14b8a6]'
                  : 'border-transparent text-[var(--iw-text-secondary)] hover:text-[var(--iw-text-primary)]'
              }`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                  active ? 'bg-[rgba(20,184,166,0.12)] text-[#14b8a6]' : 'bg-[var(--iw-surface)] text-[var(--iw-text-muted)]'
                }`}
              >
                {t.count}
              </span>
            </button>
          )
        })}
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-surface-elevated)] px-4 py-8 text-center text-sm text-[var(--iw-text-secondary)]">
          {tab === 'all'
            ? 'No matching invoices in this view.'
            : `No ${tab === 'drafts' ? 'draft' : tab} invoices in this view.`}
        </p>
      ) : (
        <InvoicesTable rows={filtered} projectSlug={projectSlug} />
      )}
    </section>
  )
}
