import type { Invoice, InvoiceStatus } from '@/lib/supabase/types'

/** One row in the billing table: Supabase (portal/Stripe) or HubSpot CRM invoice. */
export type BillingInvoiceRow =
  | { source: 'supabase'; invoice: Invoice }
  | {
      source: 'hubspot'
      hubspotId: string
      invoice_number: string
      description: string
      amount_cents: number
      status: InvoiceStatus
      created_at: string
      due_date: string | null
      payUrl: string | null
    }

export type HubSpotBillingInvoice = Omit<
  Extract<BillingInvoiceRow, { source: 'hubspot' }>,
  'source'
>

export function mergeBillingRows(
  supabaseInvoices: Invoice[],
  hubspotRows: HubSpotBillingInvoice[],
): BillingInvoiceRow[] {
  const linked = new Set(
    supabaseInvoices.map((i) => i.hubspot_invoice_id).filter(Boolean) as string[],
  )
  const hubspotFiltered = hubspotRows.filter((h) => !linked.has(h.hubspotId))
  const rows: BillingInvoiceRow[] = [
    ...supabaseInvoices.map((invoice) => ({ source: 'supabase' as const, invoice })),
    ...hubspotFiltered.map((h) => ({ source: 'hubspot' as const, ...h })),
  ]
  rows.sort((a, b) => {
    const ta = a.source === 'supabase' ? a.invoice.created_at : a.created_at
    const tb = b.source === 'supabase' ? b.invoice.created_at : b.created_at
    return new Date(tb).getTime() - new Date(ta).getTime()
  })
  return rows
}

export function billingTotals(rows: BillingInvoiceRow[]) {
  let paid = 0
  let balance = 0
  let total = 0
  for (const r of rows) {
    const cents = r.source === 'supabase' ? r.invoice.amount_cents : r.amount_cents
    const status = r.source === 'supabase' ? r.invoice.status : r.status
    total += cents
    if (status === 'paid') paid += cents
    if (status === 'pending' || status === 'overdue') balance += cents
  }
  return { paid, balance, total }
}
