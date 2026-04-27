'use client'

import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/billing/format'
import type { MaintenancePackagePublic } from '@/lib/stripe/maintenance-packages'

function CheckIcon() {
  return (
    <span
      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(20,184,166,0.12)] text-[#14b8a6]"
      aria-hidden
    >
      <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 6l2.5 2.5L10 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function priceBlock(pkg: MaintenancePackagePublic) {
  if (pkg.price_cents != null && pkg.price_cents > 0) {
    return (
      <p className="text-[var(--iw-text-primary)]">
        <span className="text-2xl font-semibold tabular-nums tracking-tight">
          {formatCurrency(pkg.price_cents, pkg.currency ?? 'usd')}
        </span>
        {pkg.billing_note ? (
          <span className="text-sm font-normal text-[var(--iw-text-muted)]"> {pkg.billing_note}</span>
        ) : null}
      </p>
    )
  }
  if (pkg.price_label?.trim()) {
    return <p className="text-lg font-semibold text-[var(--iw-text-primary)]">{pkg.price_label}</p>
  }
  return (
    <p className="text-sm font-medium text-[var(--iw-text-secondary)]">Billed monthly — amount confirmed at checkout</p>
  )
}

export function MaintenancePackageCards({
  packages,
  checkoutStartingId,
  onSubscribe,
  error,
  leadText = "Choose a plan. You're entitled to what's listed on each card; billing runs monthly in Stripe and you can update payment details anytime.",
}: {
  packages: MaintenancePackagePublic[]
  checkoutStartingId: string | null
  onSubscribe: (packageId: string) => void
  error: string | null
  leadText?: string
}) {
  return (
    <div>
      <p className="mb-3 text-xs text-[var(--iw-text-muted)]">{leadText}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="flex flex-col rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-surface)] p-4 shadow-[var(--iw-shadow-1)]"
          >
            <h4 className="text-base font-semibold text-[var(--iw-text-primary)]">{pkg.name}</h4>
            {pkg.description ? <p className="mt-1 text-xs text-[var(--iw-text-secondary)]">{pkg.description}</p> : null}
            <div className="mt-3 min-h-[2.75rem] border-b border-[var(--iw-border)] pb-3">{priceBlock(pkg)}</div>
            {pkg.features.length > 0 ? (
              <div className="mt-3 flex-1">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--iw-text-muted)]">
                  You&apos;re entitled to
                </p>
                <ul className="space-y-2" aria-label={`${pkg.name} entitlements`}>
                  {pkg.features.map((line) => (
                    <li key={line} className="flex gap-2 text-xs leading-snug text-[var(--iw-text-secondary)]">
                      <CheckIcon />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-4 pt-1">
              <Button
                type="button"
                variant="primary"
                className="w-full"
                loading={checkoutStartingId === pkg.id}
                disabled={checkoutStartingId !== null && checkoutStartingId !== pkg.id}
                onClick={() => onSubscribe(pkg.id)}
              >
                Subscribe
              </Button>
            </div>
          </div>
        ))}
      </div>
      {error ? (
        <p className="mt-2 text-xs text-[var(--iw-red)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
