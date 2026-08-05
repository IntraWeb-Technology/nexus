import type { MaintenanceSummaryCard } from '@/lib/billing/billing-ui-serialize'
import { getMaintenanceTierForDeal } from '@/lib/hubspot/deal-tier'
import { getMaintenancePrices } from '@/lib/stripe/maintenance'
import { Suspense } from 'react'
import { MaintenanceCard } from './maintenance-card.client'

function MaintenanceCardSkeleton() {
  return (
    <div className="rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-surface-elevated)] p-4">
      <div className="h-5 w-44 animate-pulse rounded bg-[var(--iw-surface)]" />
      <div className="mt-3 h-12 animate-pulse rounded bg-[var(--iw-surface)]" />
      <div className="mt-3 h-8 w-52 animate-pulse rounded bg-[var(--iw-surface)]" />
      <div className="mt-4 h-64 animate-pulse rounded bg-[var(--iw-surface)]" />
    </div>
  )
}

async function MaintenanceSectionBody({
  dealId,
  portalPlanSlug,
  summary,
}: {
  dealId: string | null | undefined
  portalPlanSlug: string | null | undefined
  summary: MaintenanceSummaryCard
}) {
  const tier = getMaintenanceTierForDeal(dealId, portalPlanSlug)
  const normalizedDealId = dealId?.trim() ?? ''

  if (!tier || !normalizedDealId) {
    return (
      <div className="rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-surface-elevated)] p-4">
        <h3 className="text-base font-semibold text-[var(--iw-text-primary)]">Monthly maintenance</h3>
        <p className="mt-2 text-sm text-[var(--iw-text-secondary)]">
          Maintenance plan setup pending. Contact your project manager to enable recurring support.
        </p>
      </div>
    )
  }

  const pricesResult = await getMaintenancePrices(tier)
  const priceView = pricesResult.ok
    ? {
        monthlyUnitAmount: pricesResult.prices.monthly.unit_amount ?? 0,
        annualUnitAmount: pricesResult.prices.annual.unit_amount ?? 0,
        currency: pricesResult.prices.monthly.currency,
      }
    : null

  return (
    <MaintenanceCard
      dealId={normalizedDealId}
      tier={tier}
      summary={summary}
      priceView={priceView}
      priceFetchError={pricesResult.ok ? null : 'Pricing temporarily unavailable, try refreshing.'}
    />
  )
}

export function MaintenanceSection({
  dealId,
  portalPlanSlug,
  summary,
}: {
  dealId: string | null | undefined
  portalPlanSlug: string | null | undefined
  summary: MaintenanceSummaryCard
}) {
  return (
    <Suspense fallback={<MaintenanceCardSkeleton />}>
      <MaintenanceSectionBody dealId={dealId} portalPlanSlug={portalPlanSlug} summary={summary} />
    </Suspense>
  )
}
