type BillingQueryAlertsProps = {
  paidQuery: boolean
  canceledQuery: boolean
  subscribedQuery: boolean
}

export function BillingQueryAlerts({
  paidQuery,
  canceledQuery,
  subscribedQuery,
}: BillingQueryAlertsProps) {
  return (
    <div className="space-y-3">
      {subscribedQuery ? (
        <div
          className="rounded-[var(--iw-radius-card)] border border-[var(--iw-green)]/35 bg-[var(--iw-surface-elevated)] px-4 py-3 text-sm shadow-[var(--iw-shadow-1)]"
          role="status"
        >
          <p className="font-medium text-[var(--iw-text-primary)]">Maintenance subscription started</p>
          <p className="mt-1 text-[var(--iw-text-secondary)]">
            Stripe is finalizing your subscription. Refresh in a few seconds if the billing summary has not updated.
          </p>
        </div>
      ) : null}
      {paidQuery ? (
        <div
          className="rounded-[var(--iw-radius-card)] border border-[var(--iw-green)]/35 bg-[var(--iw-surface-elevated)] px-4 py-3 text-sm shadow-[var(--iw-shadow-1)]"
          role="status"
        >
          <p className="font-medium text-[var(--iw-text-primary)]">Payment submitted</p>
          <p className="mt-1 text-[var(--iw-text-secondary)]">
            If amounts still look open, wait a few seconds for Stripe to finish, then refresh.
          </p>
        </div>
      ) : null}
      {canceledQuery ? (
        <div className="rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-surface-elevated)] px-4 py-3 text-sm text-[var(--iw-text-secondary)] shadow-[var(--iw-shadow-1)]">
          Checkout was canceled. Use Pay in the header or row actions when you are ready.
        </div>
      ) : null}
    </div>
  )
}
