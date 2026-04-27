import Link from 'next/link'

export type BillingDetailsCardProps = {
  companyName: string
  email: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  taxId?: string | null
  currency: string
}

export function BillingDetailsCard(props: BillingDetailsCardProps) {
  const {
    companyName,
    email,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    taxId,
    currency,
  } = props

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight text-[var(--iw-text-primary)]">Billing details</h2>
        <Link
          href="/settings"
          className="text-sm font-medium text-[#14b8a6] transition-colors hover:text-[var(--accent-bright)]"
        >
          Edit →
        </Link>
      </div>
      <div className="rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-surface-elevated)] p-4 shadow-[var(--iw-shadow-1)] sm:p-5">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--iw-text-muted)]">Bill to</p>
            <p className="mt-2 text-sm font-medium text-[var(--iw-text-primary)]">{companyName}</p>
            <p className="mt-1 text-sm text-[var(--iw-text-secondary)]">{email}</p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--iw-text-secondary)]">
              {addressLine1}
              {addressLine2 ? (
                <>
                  <br />
                  {addressLine2}
                </>
              ) : null}
              {city || state || postalCode || country ? (
                <>
                  <br />
                  {[city, state, postalCode].filter(Boolean).join(', ')}
                  {country ? (
                    <>
                      <br />
                      {country}
                    </>
                  ) : null}
                </>
              ) : null}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--iw-text-muted)]">Tax ID</p>
              <p className="mt-2 text-sm text-[var(--iw-text-primary)]">{taxId?.trim() ? taxId : '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--iw-text-muted)]">Currency</p>
              <p className="mt-2 text-sm font-medium uppercase tracking-wide text-[var(--iw-text-primary)]">
                {currency}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
