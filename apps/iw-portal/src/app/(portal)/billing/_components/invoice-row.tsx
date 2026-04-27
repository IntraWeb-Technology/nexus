'use client'

import { Badge } from '@/components/ui/Badge'
import type { BillingUiInvoice } from '@/lib/billing/billing-ui-serialize'
import { formatCurrency, formatInvoiceDate, formatRelativeDate } from '@/lib/billing/format'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

function statusBadgeVariant(s: BillingUiInvoice['status']): 'green' | 'amber' | 'red' | 'gray' {
  if (s === 'paid') return 'green'
  if (s === 'pending') return 'amber'
  if (s === 'overdue') return 'red'
  if (s === 'void') return 'gray'
  return 'gray'
}

function statusLabel(s: BillingUiInvoice['status']) {
  return s
}

function phaseLabel(row: BillingUiInvoice): string | null {
  if (row.billingKind === 'recurring_maintenance') return 'Maintenance'
  if (row.billingPhase === 'deposit') return 'Phase 1'
  if (row.billingPhase === 'build_qa') return 'Phase 2'
  if (row.billingPhase === 'handoff') return 'Phase 3'
  return null
}

export function InvoiceRow({ row, projectSlug }: { row: BillingUiInvoice; projectSlug: string }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const issued = new Date(row.issuedAt)
  const due = row.dueAt ? new Date(row.dueAt) : null
  const relDue = due ? formatRelativeDate(due) : null

  const detailHref = row.supabaseInvoiceId ? `/billing/invoices/${row.supabaseInvoiceId}` : null

  const onRowActivate = useCallback(() => {
    if (detailHref) router.push(detailHref)
    else if (row.payUrl) window.open(row.payUrl, '_blank', 'noopener,noreferrer')
  }, [detailHref, row.payUrl, router])

  const copyId = () => {
    void navigator.clipboard.writeText(row.invoiceNumber)
    setMenuOpen(false)
  }

  const mailto = `mailto:?subject=${encodeURIComponent(`Invoice ${row.invoiceNumber}`)}&body=${encodeURIComponent(`Project: ${projectSlug}\nInvoice: ${row.invoiceNumber}`)}`
  const phase = phaseLabel(row)

  return (
    <tr
      className="cursor-pointer border-b border-[var(--iw-border)] transition-colors hover:bg-[rgba(20,184,166,0.03)]"
      onClick={onRowActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onRowActivate()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Invoice ${row.invoiceNumber}, ${row.status}`}
    >
      <td className="px-3 py-3 align-top sm:px-4">
        <p className="iw-mono text-sm font-medium text-[var(--iw-text-primary)]">{row.invoiceNumber}</p>
        {phase ? <p className="mt-0.5 text-[11px] font-medium text-[#14b8a6]">{phase}</p> : null}
        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--iw-text-muted)]">{row.description}</p>
      </td>
      <td className="px-3 py-3 align-top sm:px-4">
        <Badge variant={statusBadgeVariant(row.status)}>
          <span aria-label={`Status ${row.status}`}>{statusLabel(row.status)}</span>
        </Badge>
      </td>
      <td className="hidden px-3 py-3 align-top text-sm text-[var(--iw-text-secondary)] sm:table-cell sm:px-4">
        {formatInvoiceDate(issued)}
      </td>
      <td className="hidden px-3 py-3 align-top sm:table-cell sm:px-4">
        {due ? (
          <>
            <p className="text-sm text-[var(--iw-text-secondary)]">{formatInvoiceDate(due)}</p>
            {relDue ? (
              <p className={`text-xs ${relDue.isWarn ? 'text-[#fbbf24]' : 'text-[var(--iw-text-muted)]'}`}>
                {relDue.text}
              </p>
            ) : null}
          </>
        ) : (
          <span className="text-sm text-[var(--iw-text-muted)]">—</span>
        )}
      </td>
      <td className="px-3 py-3 text-right align-top text-sm font-medium tabular-nums text-[var(--iw-text-primary)] sm:px-4">
        {formatCurrency(row.amountCents, row.currency)}
      </td>
      <td className="px-2 py-2 text-right align-top" onClick={(e) => e.stopPropagation()}>
        <div className="inline-flex items-center justify-end gap-1">
          {row.supabaseInvoiceId ? (
            <a
              href={`/api/billing/invoices/${row.supabaseInvoiceId}/pdf`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--iw-radius-control)] text-[var(--iw-text-secondary)] hover:bg-[var(--iw-surface)] hover:text-[#14b8a6]"
              aria-label={`Download PDF for invoice ${row.invoiceNumber}`}
              title="Download PDF"
              onClick={(e) => e.stopPropagation()}
            >
              ↓
            </a>
          ) : (
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--iw-radius-control)] text-[var(--iw-text-muted)] opacity-40"
              aria-label="PDF not available for this invoice"
              title="PDF not available"
            >
              ↓
            </span>
          )}
          <div
            className="relative"
            onMouseLeave={() => {
              closeTimer.current = setTimeout(() => setMenuOpen(false), 120)
            }}
            onMouseEnter={() => {
              if (closeTimer.current) clearTimeout(closeTimer.current)
            }}
          >
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--iw-radius-control)] text-[var(--iw-text-secondary)] hover:bg-[var(--iw-surface)] hover:text-[var(--iw-text-primary)]"
              aria-label={`More actions for invoice ${row.invoiceNumber}`}
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((o) => !o)
              }}
            >
              ⋯
            </button>
            {menuOpen ? (
              <ul
                className="absolute right-0 z-20 mt-1 min-w-[11rem] rounded-[var(--iw-radius-control)] border border-[var(--iw-border)] bg-[var(--iw-surface-elevated)] py-1 text-left text-sm shadow-[var(--iw-shadow-2)]"
                role="menu"
              >
                {detailHref ? (
                  <li role="none">
                    <Link
                      href={detailHref}
                      className="block px-3 py-2 text-[var(--iw-text-primary)] hover:bg-[var(--iw-surface)]"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      View invoice
                    </Link>
                  </li>
                ) : null}
                {row.supabaseInvoiceId ? (
                  <li role="none">
                    <a
                      href={`/api/billing/invoices/${row.supabaseInvoiceId}/pdf`}
                      className="block px-3 py-2 text-[var(--iw-text-primary)] hover:bg-[var(--iw-surface)]"
                      role="menuitem"
                    >
                      Download PDF
                    </a>
                  </li>
                ) : null}
                <li role="none">
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-[var(--iw-text-primary)] hover:bg-[var(--iw-surface)]"
                    role="menuitem"
                    onClick={copyId}
                  >
                    Copy invoice ID
                  </button>
                </li>
                <li role="none">
                  <a
                    href={mailto}
                    className="block px-3 py-2 text-[var(--iw-text-primary)] hover:bg-[var(--iw-surface)]"
                    role="menuitem"
                  >
                    Email to...
                  </a>
                </li>
              </ul>
            ) : null}
          </div>
        </div>
      </td>
    </tr>
  )
}
