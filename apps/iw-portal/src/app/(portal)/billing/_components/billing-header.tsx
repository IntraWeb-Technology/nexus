import type { BillingUiInvoice } from '@/lib/billing/billing-ui-serialize'
import type { BillingMetrics } from '@/lib/billing/billing-ui-serialize'
import { BillingHeaderActions } from './billing-header-actions'

export function BillingHeader({
  projectSlug,
  projectId,
  currency,
  metrics,
  invoices,
}: {
  projectSlug: string
  projectId: string
  currency: string
  metrics: BillingMetrics
  invoices: BillingUiInvoice[]
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--iw-border)] pb-6 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--iw-text-primary)] md:text-[1.75rem]">
          Billing
        </h1>
        <p className="mt-2 text-sm text-[var(--iw-text-secondary)]">
          Project{' '}
          <span className="iw-mono rounded-md bg-[var(--iw-surface)] px-2 py-0.5 text-[var(--iw-text-primary)]">
            {projectSlug}
          </span>
        </p>
      </div>
      <BillingHeaderActions
        projectId={projectId}
        projectSlug={projectSlug}
        currency={currency}
        balanceDueCents={metrics.balanceDueCents}
        payableViaStripeCents={metrics.payableViaStripeCents}
        invoices={invoices}
      />
    </header>
  )
}
