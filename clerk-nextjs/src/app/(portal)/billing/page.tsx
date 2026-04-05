import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { InvoiceTable } from '@/components/portal/InvoiceTable'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { billingTotals, mergeBillingRows } from '@/lib/billing/types'
import { getPortalBundle } from '@/lib/data/portal'
import { fetchHubSpotBillingInvoices } from '@/lib/hubspot/invoices'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Invoice } from '@/lib/supabase/types'

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

type BillingPageProps = {
  searchParams?: Promise<{ paid?: string; canceled?: string }>
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const q = searchParams ? await searchParams : {}
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('project_id', bundle.project.id)
    .order('created_at', { ascending: true })
  const supabaseInvoices = (data ?? []) as Invoice[]

  const hubspotInvoices = await fetchHubSpotBillingInvoices({
    hubspotDealId: bundle.project.hubspot_deal_id,
    hubspotContactId: bundle.client.hubspot_contact_id,
  })
  const invoiceRows = mergeBillingRows(supabaseInvoices, hubspotInvoices)
  const { paid, balance, total } = billingTotals(invoiceRows)

  const retainer = supabaseInvoices.find((i) => i.sku?.includes('MRR'))

  return (
    <div className="space-y-6">
      <h1>Billing</h1>
      {q.paid === '1' ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Payment submitted. If the invoice still shows unpaid, wait a few seconds for Stripe to finish
          processing, then refresh.
        </p>
      ) : null}
      {q.canceled === '1' ? (
        <p className="rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-3)] px-4 py-3 text-sm text-[var(--iw-text-2)]">
          Checkout was canceled. You can pay anytime from the Pay button on a pending invoice.
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
            SKU <span className="iw-mono">{retainer.sku}</span> — {money(retainer.amount_cents)} / month
            (shown on your first retainer invoice).
          </p>
        </Card>
      ) : null}
    </div>
  )
}
