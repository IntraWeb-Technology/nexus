import type { BillingMetrics } from '@/lib/billing/billing-ui-serialize'
import { formatCurrency, formatInvoiceDate, formatRelativeDate } from '@/lib/billing/format'

export function BillingStats({ metrics, currency }: { metrics: BillingMetrics; currency: string }) {
  const next = metrics.nextPaymentDueAt ? new Date(metrics.nextPaymentDueAt) : null
  const rel = next ? formatRelativeDate(next) : null
  const nextValueClass =
    rel?.isWarn && next ? 'text-[#fbbf24]' : 'text-[var(--iw-text-primary)]'

  const cells: Array<{
    label: string
    value: string
    sub: string
    valueClass: string
    subClass?: string
  }> = [
    {
      label: 'Balance due',
      value: formatCurrency(metrics.balanceDueCents, currency),
      sub: `${metrics.openCount} open`,
      valueClass: 'text-[#fbbf24]',
    },
    {
      label: 'Paid this year',
      value: formatCurrency(metrics.paidThisYearCents, currency),
      sub: `${metrics.paidThisYearInvoiceCount} paid`,
      valueClass: 'text-[#14b8a6]',
    },
    {
      label: 'Total invoiced',
      value: formatCurrency(metrics.totalInvoicedCents, currency),
      sub: 'Lifetime',
      valueClass: 'text-[var(--iw-text-primary)]',
    },
    {
      label: 'Next payment',
      value: next ? formatInvoiceDate(next) : '—',
      sub: rel ? rel.text : 'No open due dates',
      valueClass: nextValueClass,
      subClass: rel?.isWarn ? 'text-[#fbbf24]' : 'text-[var(--iw-text-muted)]',
    },
  ]

  return (
    <div className="overflow-hidden rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-border)] shadow-[var(--iw-shadow-1)]">
      <div className="grid grid-cols-2 gap-px md:grid-cols-4">
        {cells.map((c) => (
          <div key={c.label} className="bg-[var(--iw-surface-elevated)] px-[18px] py-[14px]">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--iw-text-muted)]">{c.label}</p>
            <p className={`mt-1 text-lg font-medium tabular-nums tracking-tight ${c.valueClass}`}>{c.value}</p>
            <p className={`mt-0.5 text-[11px] ${c.subClass ?? 'text-[var(--iw-text-muted)]'}`}>{c.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
