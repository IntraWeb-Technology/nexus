import type { BillingMetrics } from '@/lib/billing/billing-ui-serialize'
import { formatCurrency } from '@/lib/billing/format'

export type BillingAlertBannerProps = {
  variant: 'amber' | 'red'
  message: string
}

export function BillingAlertBanner({ variant, message }: BillingAlertBannerProps) {
  const isRed = variant === 'red'
  const bg = isRed ? 'rgba(248, 113, 113, 0.06)' : 'rgba(245, 158, 11, 0.06)'
  const border = isRed ? 'rgba(248, 113, 113, 0.28)' : 'rgba(245, 158, 11, 0.28)'
  const dot = isRed ? '#f87171' : '#fbbf24'

  return (
    <div
      className="flex flex-col gap-3 rounded-[var(--iw-radius-card)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      style={{ backgroundColor: bg, borderWidth: 1, borderStyle: 'solid', borderColor: border }}
      role="status"
    >
      <div className="flex min-w-0 items-start gap-2">
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: dot }} aria-hidden />
        <p className="text-sm text-[var(--iw-text-primary)]">{message}</p>
      </div>
      <a
        href="#invoice-history"
        className="inline-flex shrink-0 items-center justify-center rounded-[var(--iw-radius-control)] border border-[var(--iw-border)] bg-[var(--iw-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[#14b8a6] transition-colors hover:border-[#14b8a6]/40 hover:bg-[var(--iw-surface)]"
      >
        Review →
      </a>
    </div>
  )
}

export function buildBillingAlertMessage(
  metrics: BillingMetrics,
  currency: string,
): BillingAlertBannerProps | null {
  if (!metrics.hasOverdue && metrics.dueSoonCount === 0) return null
  const total = formatCurrency(metrics.alertTotalCents, currency)
  if (metrics.hasOverdue) {
    return {
      variant: 'red',
      message: `${metrics.overdueCount} overdue · ${total}`,
    }
  }
  return {
    variant: 'amber',
    message: `${metrics.openCount} open · due within 7 days · ${total}`,
  }
}
