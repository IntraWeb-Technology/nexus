'use client'

import { MAINTENANCE_FEATURES, TIER_META, type MaintenanceCadence, type MaintenanceTier } from '@/config/maintenance-features'
import { BillingPortalButton } from '@/components/portal/BillingPortalButton'
import { Button } from '@/components/ui/Button'
import type { MaintenanceSummaryCard } from '@/lib/billing/billing-ui-serialize'
import { formatCurrency } from '@/lib/billing/format'
import { useMemo, useState } from 'react'
import { MaintenanceFeatureRow } from './maintenance-feature-row'

type PriceView = {
  monthlyUnitAmount: number
  annualUnitAmount: number
  currency: string
}

function toCurrencyCode(input: string | null | undefined): string {
  const c = input?.toLowerCase().trim()
  return c || 'usd'
}

export function MaintenanceCard({
  dealId,
  tier,
  summary,
  priceView,
  priceFetchError,
}: {
  dealId: string
  tier: MaintenanceTier
  summary: MaintenanceSummaryCard
  priceView: PriceView | null
  priceFetchError: string | null
}) {
  const [cadence, setCadence] = useState<MaintenanceCadence>('monthly')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const tierMeta = TIER_META[tier]

  const computed = useMemo(() => {
    if (!priceView) return null

    const annualMonthlyEquivalent = Math.round(priceView.annualUnitAmount / 12)
    const savingsPercent = Math.round((1 - annualMonthlyEquivalent / priceView.monthlyUnitAmount) * 100)
    const annualSavingsAbsolute = priceView.monthlyUnitAmount * 12 - priceView.annualUnitAmount
    return { annualMonthlyEquivalent, savingsPercent, annualSavingsAbsolute }
  }, [priceView])

  const displayCurrency = toCurrencyCode(priceView?.currency)
  const activeAmount =
    cadence === 'monthly' ? priceView?.monthlyUnitAmount ?? null : priceView?.annualUnitAmount ?? null
  const hasActiveSubscription = summary.subscriptionStatus === 'active' || summary.subscriptionStatus === 'trialing'
  const disableSubscribe = isSubmitting || !priceView || hasActiveSubscription

  async function subscribe() {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/maintenance/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ dealId, tier, cadence }),
      })
      const body = (await response.json()) as { url?: string; error?: string }
      if (!response.ok || !body.url) {
        setSubmitError(body.error ?? 'Unable to start checkout right now.')
        return
      }
      window.location.href = body.url
    } catch {
      setSubmitError('Unable to start checkout right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function onToggleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const next = cadence === 'monthly' ? 'annual' : 'monthly'
    setCadence(next)
  }

  return (
    <div className="space-y-4 rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-surface-elevated)] p-4 shadow-[var(--iw-shadow-1)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--iw-text-primary)]">Monthly maintenance</h3>
          <p className="mt-1 text-xs text-[var(--iw-text-muted)]">Recurring support and optimization for your project.</p>
        </div>
        <span className="rounded px-2 py-1 text-[11px] font-medium text-[#0c6d57] bg-[#dff4ed]">
          Recommended for your tier
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 border-y border-[var(--iw-border)] py-3 text-xs">
        <div className="flex flex-wrap items-center gap-6 text-[var(--iw-text-secondary)]">
          <p>
            Latest invoice: <span className="text-[var(--iw-text-primary)]">{summary.latest?.invoiceNumber ?? '—'}</span>
          </p>
          <p>
            Open invoices: <span className="text-[var(--iw-text-primary)]">{summary.openCount}</span>
          </p>
          <p>
            Open balance:{' '}
            <span className="text-[var(--iw-text-primary)]">
              {formatCurrency(summary.totalOpenCents, summary.latest?.currency ?? displayCurrency)}
            </span>
          </p>
        </div>
        <a href="#invoice-history" className="text-[#14b8a6] no-underline">
          View history →
        </a>
      </div>

      <div className="flex justify-center">
        <div role="tablist" aria-label="Maintenance billing cadence" className="inline-flex rounded-md border border-[var(--iw-border)] bg-[var(--iw-surface)] p-[3px]">
          <button
            type="button"
            role="tab"
            aria-selected={cadence === 'monthly'}
            className={`rounded px-3 py-1.5 text-sm ${cadence === 'monthly' ? 'bg-[var(--iw-surface-elevated)] text-[var(--iw-text-primary)] font-medium' : 'text-[var(--iw-text-secondary)]'}`}
            onClick={() => setCadence('monthly')}
            onKeyDown={onToggleKeyDown}
          >
            Monthly
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={cadence === 'annual'}
            className={`rounded px-3 py-1.5 text-sm ${cadence === 'annual' ? 'bg-[var(--iw-surface-elevated)] text-[var(--iw-text-primary)] font-medium' : 'text-[var(--iw-text-secondary)]'}`}
            onClick={() => setCadence('annual')}
            onKeyDown={onToggleKeyDown}
          >
            Annual{' '}
            {computed && computed.savingsPercent > 0 ? (
              <span className="ml-1 rounded bg-[#E1F5EE] px-1.5 py-0.5 text-[11px] text-[#085041]" aria-label={`Save ${computed.savingsPercent} percent annually`}>
                Save {computed.savingsPercent}%
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div className="rounded-[var(--iw-radius-card)] border-2 border-[#6cc8af] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--iw-text-muted)]">Your plan</p>
            <h4 className="text-xl font-semibold text-[var(--iw-text-primary)]">{tierMeta.name}</h4>
            <p className="mt-1 text-[13px] text-[var(--iw-text-secondary)]">{tierMeta.tagline}</p>
          </div>
          <div className="text-right">
            <p className="text-[28px] font-medium leading-none text-[var(--iw-text-primary)]">
              {activeAmount != null ? formatCurrency(activeAmount, displayCurrency) : '—'}
              <span className="ml-1 text-[13px] font-normal text-[var(--iw-text-secondary)]">
                /{cadence === 'monthly' ? 'month' : 'year'}
              </span>
            </p>
            <p className="mt-2 text-xs text-[var(--iw-text-secondary)]">
              {priceView
                ? cadence === 'monthly'
                  ? 'Billed monthly'
                  : `${formatCurrency(computed?.annualMonthlyEquivalent ?? 0, displayCurrency)}/month · save ${formatCurrency(Math.max(computed?.annualSavingsAbsolute ?? 0, 0), displayCurrency)} vs monthly`
                : 'Pricing unavailable'}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-[var(--iw-border)] pt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--iw-text-muted)]">What&apos;s included</p>
          <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            {MAINTENANCE_FEATURES.map((feature) => (
              <MaintenanceFeatureRow key={feature.id} feature={feature} currentTier={tier} />
            ))}
          </div>
        </div>

        <div className="mt-5">
          {hasActiveSubscription ? (
            <div className="space-y-2">
              <p className="text-center text-xs font-medium text-[#1D9E75]">
                Subscription active{summary.subscriptionPeriodEnd ? ` · renews ${new Date(summary.subscriptionPeriodEnd).toLocaleDateString()}` : ''}
              </p>
              <BillingPortalButton
                label="Manage subscription & payment method"
                buttonVariant="outline"
                className="w-full"
              />
            </div>
          ) : (
            <>
              <Button
                type="button"
                className="w-full border-none bg-[#1D9E75] py-3 text-white hover:bg-[#1a8d68]"
                loading={isSubmitting}
                disabled={disableSubscribe}
                onClick={subscribe}
              >
                Subscribe to {tierMeta.name}
              </Button>
              <p className="mt-2 text-center text-xs text-[var(--iw-text-muted)]">
                Cancel anytime · Update payment method in Stripe portal
              </p>
            </>
          )}
          {priceFetchError ? <p className="mt-2 text-center text-xs text-[var(--iw-text-muted)]">{priceFetchError}</p> : null}
          {submitError ? <p className="mt-2 text-center text-xs text-[var(--iw-red)]">{submitError}</p> : null}
        </div>
      </div>
    </div>
  )
}
