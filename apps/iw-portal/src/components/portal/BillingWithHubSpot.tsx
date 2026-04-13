import { InvoiceTable } from '@/components/portal/InvoiceTable'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import {
  billingTotals,
  mergeBillingRows,
  type HubSpotBillingInvoice,
} from '@/lib/billing/types'
import { fetchHubSpotBillingInvoices } from '@/lib/hubspot/invoices'
import type { Invoice } from '@/lib/supabase/types'

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export async function BillingWithHubSpot({
  supabaseInvoices,
  hubspotDealId,
  hubspotContactId,
  paidQuery,
  canceledQuery,
}: {
  supabaseInvoices: Invoice[]
  hubspotDealId: string | null
  hubspotContactId: string | null
  paidQuery: boolean
  canceledQuery: boolean
}) {
  const hubspotInvoices = await fetchHubSpotBillingInvoices({
    hubspotDealId,
    hubspotContactId,
  })
  return (
    <BillingBody
      supabaseInvoices={supabaseInvoices}
      hubspotInvoices={hubspotInvoices}
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
    <>
      {paidQuery ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Payment submitted. If the invoice still shows unpaid, wait a few seconds for Stripe to finish
          processing, then refresh.
        </p>
      ) : null}
      {canceledQuery ? (
        <p className="rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-3)] px-4 py-3 text-sm text-[var(--iw-text-2)]">
          Checkout was canceled. You can retry any time from the Make a payment button on a pending invoice.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total project cost (invoiced)" value={money(total)} />
        <StatCard label="Paid to date" value={money(paid)} />
        <StatCard label="Balance due" value={money(balance)} />
      </div>
      <InvoiceTable rows={invoiceRows} />
      {retainer ? (
        <Card>
          <p className="iw-label mb-2">Recurring retainer</p>
          <p className="text-sm text-[var(--iw-text)]">
            SKU <span className="iw-mono">{retainer.sku}</span> — {money(retainer.amount_cents)} / month (shown on
            your first retainer invoice).
          </p>
        </Card>
      ) : null}
    </>
  )
}
