import { BillingPortalButton } from '@/components/portal/BillingPortalButton'
import type { PortalCardSummary } from '@/lib/stripe/default-payment-method'
import { BillingPortalTextLink } from './billing-portal-text-link'

function brandBadge(brand: string) {
  const b = brand.toUpperCase()
  return (
    <div
      className="flex h-[26px] w-[38px] shrink-0 items-center justify-center rounded border border-[var(--iw-border)] bg-[var(--iw-surface)] text-[9px] font-semibold tracking-tight text-[var(--iw-text-primary)]"
      aria-hidden
    >
      {b.slice(0, 4)}
    </div>
  )
}

export function PaymentMethodCard({
  paymentMethod,
  hasStripeCustomer,
}: {
  paymentMethod: PortalCardSummary | null
  hasStripeCustomer: boolean
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight text-[var(--iw-text-primary)]">Payment method</h2>
        {hasStripeCustomer ? <BillingPortalTextLink>Update →</BillingPortalTextLink> : null}
      </div>

      <div className="rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-surface-elevated)] p-4 shadow-[var(--iw-shadow-1)] sm:p-5">
        {paymentMethod ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              {brandBadge(paymentMethod.brand)}
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--iw-text-primary)]">
                  {paymentMethod.brand} ·••• {paymentMethod.last4}
                </p>
                <p className="text-xs text-[var(--iw-text-muted)]">
                  Expires {String(paymentMethod.expiryMonth).padStart(2, '0')}/{paymentMethod.expiryYear} ·{' '}
                  {paymentMethod.isDefault ? 'Default payment method' : 'Card on file'}
                </p>
              </div>
            </div>
            {hasStripeCustomer ? (
              <BillingPortalButton
                className="sm:max-w-[12rem]"
                label="Manage"
                buttonVariant="outline"
              />
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--iw-text-secondary)]">
              {hasStripeCustomer
                ? 'No default card on file. Add a payment method for faster checkout.'
                : 'Open Manage below (or start a maintenance subscription) to create your billing profile in Stripe, then add a card.'}
            </p>
            {hasStripeCustomer ? (
              <BillingPortalButton
                className="sm:max-w-[14rem]"
                label="Add payment method"
                buttonVariant="outline"
              />
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
