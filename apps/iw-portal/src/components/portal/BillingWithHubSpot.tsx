import { InvoiceTable } from '@/components/portal/InvoiceTable'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import {
  billingTotals,
  mergeBillingRows,
  type HubSpotBillingInvoice,
} from '@/lib/billing/types'
import type { Invoice } from '@/lib/supabase/types'

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export async function BillingWithHubSpot({
  supabaseInvoices,
  hubspotCrmInvoices,
  paidQuery,
  canceledQuery,
}: {
  supabaseInvoices: Invoice[]
  /** CRM invoice rows (page already fetched + synced to Supabase). */
  hubspotCrmInvoices: HubSpotBillingInvoice[]
  paidQuery: boolean
  canceledQuery: boolean
}) {
  return (
    <BillingBody
      supabaseInvoices={supabaseInvoices}
      hubspotInvoices={hubspotCrmInvoices}
      paidQuery={paidQuery}
      canceledQuery={canceledQuery}
    />
  )
}

export function BillingBody({
  supabaseInvoices,
  hubspotInvoices,
  paidQuery,
  canceledQuery,
}: {
  supabaseInvoices: Invoice[]
  hubspotInvoices: HubSpotBillingInvoice[]
  paidQuery: boolean
  canceledQuery: boolean
}) {
  const invoiceRows = mergeBillingRows(supabaseInvoices, hubspotInvoices)
  const { paid, balance, total } = billingTotals(invoiceRows)
  const retainer = supabaseInvoices.find((i) => i.sku?.includes('MRR'))

  return (
    <div className="space-y-6">
      {paidQuery ? (
        <div
          className="rounded-[var(--iw-radius-card)] border border-[var(--iw-green)]/35 bg-[var(--iw-slate-3)] px-4 py-3 text-sm shadow-[var(--iw-shadow-1)] transition-[box-shadow] duration-300"
          role="status"
        >
          <p className="font-medium text-[var(--iw-text)]">Payment submitted</p>
          <p className="mt-1 text-[var(--iw-text-2)]">
            If an invoice still shows unpaid, wait a few seconds for Stripe to finish processing, then refresh.
          </p>
        </div>
      ) : null}
      {canceledQuery ? (
        <div className="rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] px-4 py-3 text-sm text-[var(--iw-text-2)] shadow-[var(--iw-shadow-1)]">
          Checkout was canceled. You can retry any time from the <span className="font-medium text-[var(--iw-text)]">Make a payment</span> button on a pending invoice.
        </div>
      ) : null}
      <div className="iw-enter-stagger grid gap-4 sm:grid-cols-3">
        <StatCard label="Total project cost (invoiced)" value={money(total)} />
        <StatCard label="Paid to date" value={money(paid)} />
        <StatCard label="Balance due" value={money(balance)} />
      </div>
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--iw-text)]">Invoices</h2>
          <p className="mt-1 text-sm text-[var(--iw-text-2)]">
            Line items from the portal and your billing profile, in one list.
          </p>
        </div>
        <InvoiceTable rows={invoiceRows} />
      </div>
      {retainer ? (
        <Card>
          <p className="iw-label mb-2">Recurring retainer</p>
          <p className="text-sm text-[var(--iw-text)]">
            SKU <span className="iw-mono">{retainer.sku}</span> — {money(retainer.amount_cents)} / month (shown on
            your first retainer invoice).
          </p>
        </Card>
      ) : null}
    </div>
  )
}
