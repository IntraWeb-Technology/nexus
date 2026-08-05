import type {
  BillingKind,
  BillingPhase,
  ExternalInvoiceSource,
  Invoice,
  InvoiceStatus,
} from '@/lib/supabase/types'

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
      /** When present (e.g. from HubSpot `hs_currency`), used for display and CSV. */
      currency?: string
      billing_phase?: BillingPhase | null
      billing_kind?: BillingKind
      milestone_order?: 1 | 2 | 3 | null
      external_source?: ExternalInvoiceSource | null
      external_object_id?: string | null
      service_period_start?: string | null
      service_period_end?: string | null
      maintenance_group_key?: string | null
    }

export type HubSpotBillingInvoice = Omit<
  Extract<BillingInvoiceRow, { source: 'hubspot' }>,
  'source'
>

export function mergeBillingRows(
  supabaseInvoices: Invoice[],
  hubspotRows: HubSpotBillingInvoice[],
): BillingInvoiceRow[] {
  const hubspotById = new Map(hubspotRows.map((row) => [row.hubspotId, row]))
  const linked = new Set(supabaseInvoices.map((i) => i.hubspot_invoice_id).filter(Boolean) as string[])
  const supabaseHydrated = supabaseInvoices.map((invoice) => {
    const hsId = invoice.hubspot_invoice_id ?? null
    if (!hsId) return invoice
    const hs = hubspotById.get(hsId)
    if (!hs) return invoice
    return {
      ...invoice,
      // Prefer canonical DB values, but hydrate blanks from live HubSpot rows.
      billing_phase: invoice.billing_phase ?? hs.billing_phase ?? null,
      billing_kind: invoice.billing_kind ?? hs.billing_kind ?? 'project_milestone',
      milestone_order: invoice.milestone_order ?? hs.milestone_order ?? null,
      external_source: invoice.external_source ?? hs.external_source ?? null,
      external_object_id: invoice.external_object_id ?? hs.external_object_id ?? hs.hubspotId,
      service_period_start: invoice.service_period_start ?? hs.service_period_start ?? null,
      service_period_end: invoice.service_period_end ?? hs.service_period_end ?? null,
      maintenance_group_key: invoice.maintenance_group_key ?? hs.maintenance_group_key ?? null,
      // Keep display copy fresh until DB is fully backfilled.
      description: invoice.description || hs.description,
      due_date: invoice.due_date ?? hs.due_date ?? null,
      currency: invoice.currency ?? hs.currency ?? 'usd',
    } satisfies Invoice
  })
  const hubspotFiltered = hubspotRows.filter((h) => !linked.has(h.hubspotId))
  const rows: BillingInvoiceRow[] = [
    ...supabaseHydrated.map((invoice) => ({ source: 'supabase' as const, invoice })),
    ...hubspotFiltered.map((h) => ({ source: 'hubspot' as const, ...h })),
  ]
  const invoiceTail = (num: string) => {
    const m = num.match(/(\d+)\s*$/i)
    return m ? parseInt(m[1], 10) : 0
  }
  const rowNum = (r: BillingInvoiceRow) =>
    r.source === 'supabase' ? r.invoice.invoice_number : r.invoice_number

  rows.sort((a, b) => {
    const ta = a.source === 'supabase' ? a.invoice.created_at : a.created_at
    const tb = b.source === 'supabase' ? b.invoice.created_at : b.created_at
    const tDiff = new Date(tb).getTime() - new Date(ta).getTime()
    if (tDiff !== 0) return tDiff
    return invoiceTail(rowNum(b)) - invoiceTail(rowNum(a))
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
