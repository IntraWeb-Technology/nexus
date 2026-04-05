import type { HubSpotBillingInvoice } from '@/lib/billing/types'
import type { InvoiceStatus } from '@/lib/supabase/types'
import type { HubSpotCrmObject } from '@/lib/hubspot/client'

const HUBSPOT_API = 'https://api.hubapi.com'

const INVOICE_READ_PROPERTIES = [
  'hs_invoice_status',
  'hs_invoice_date',
  'hs_due_date',
  'hs_comments',
  'hs_invoice_link',
  'hs_currency',
  'hs_title',
  'hs_number',
  'hs_invoice_number',
  'hs_balance_due',
  'hs_total',
  'hs_subtotal',
  'hs_amount_billed',
  'hs_createdate',
] as const

function token(): string | null {
  return process.env.HUBSPOT_PRIVATE_APP_TOKEN ?? null
}

function parseAmountToCents(raw: string | null | undefined): number {
  if (raw == null || raw === '') return 0
  const n = Number.parseFloat(String(raw).replace(/,/g, ''))
  if (Number.isNaN(n)) return 0
  return Math.round(n * 100)
}

function mapHsStatus(hs: string | null | undefined): InvoiceStatus {
  const s = (hs ?? '').toLowerCase()
  if (s === 'paid') return 'paid'
  if (s === 'voided') return 'void'
  if (s === 'open') return 'pending'
  if (s === 'draft') return 'pending'
  return 'pending'
}

function pickAmountCents(p: Record<string, string | null | undefined>, status: InvoiceStatus): number {
  if (status === 'paid') {
    return (
      parseAmountToCents(p.hs_total) ||
      parseAmountToCents(p.hs_subtotal) ||
      parseAmountToCents(p.hs_amount_billed) ||
      parseAmountToCents(p.hs_balance_due)
    )
  }
  return (
    parseAmountToCents(p.hs_balance_due) ||
    parseAmountToCents(p.hs_total) ||
    parseAmountToCents(p.hs_subtotal) ||
    parseAmountToCents(p.hs_amount_billed)
  )
}

function parseIsoDate(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback
  const t = Date.parse(raw)
  if (Number.isNaN(t)) return fallback
  return new Date(t).toISOString()
}

function mapInvoiceObject(o: HubSpotCrmObject): HubSpotBillingInvoice | null {
  const p = o.properties ?? {}
  const hsStatus = (p.hs_invoice_status ?? '').toLowerCase()
  if (hsStatus === 'draft') return null

  const status = mapHsStatus(p.hs_invoice_status)
  const amount_cents = pickAmountCents(p, status)
  const created = parseIsoDate(
    p.hs_invoice_date ?? p.hs_createdate ?? null,
    new Date().toISOString(),
  )
  const dueRaw = p.hs_due_date
  const due_date =
    dueRaw && !Number.isNaN(Date.parse(dueRaw)) ? new Date(dueRaw).toISOString().slice(0, 10) : null

  const num =
    (p.hs_invoice_number && String(p.hs_invoice_number)) ||
    (p.hs_number && String(p.hs_number)) ||
    `HS-${o.id}`

  const description =
    (p.hs_title && String(p.hs_title).trim()) ||
    (p.hs_comments && String(p.hs_comments).trim()) ||
    'HubSpot invoice'

  return {
    hubspotId: String(o.id),
    invoice_number: num,
    description,
    amount_cents,
    status,
    created_at: created,
    due_date,
    payUrl: p.hs_invoice_link ? String(p.hs_invoice_link) : null,
  }
}

function parseAssociationResults(data: unknown): string[] {
  if (!data || typeof data !== 'object') return []
  const results = (data as { results?: unknown[] }).results
  if (!Array.isArray(results)) return []
  const ids: string[] = []
  for (const r of results) {
    if (!r || typeof r !== 'object') continue
    const o = r as Record<string, unknown>
    const id =
      o.toObjectId != null
        ? String(o.toObjectId)
        : o.id != null
          ? String(o.id)
          : o.to && typeof o.to === 'object' && (o.to as { id?: unknown }).id != null
            ? String((o.to as { id: unknown }).id)
            : ''
    if (id) ids.push(id)
  }
  return [...new Set(ids)]
}

async function fetchAssociationInvoiceIds(
  objectType: 'deals' | 'contacts',
  objectId: string,
): Promise<string[]> {
  const t = token()
  if (!t || !objectId.trim()) return []

  const encoded = encodeURIComponent(objectId)
  const urls = [
    `${HUBSPOT_API}/crm/v4/objects/${objectType}/${encoded}/associations/invoices`,
    `${HUBSPOT_API}/crm/v3/objects/${objectType}/${encoded}/associations/invoices`,
  ]

  for (const url of urls) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${t}` },
      cache: 'no-store',
    })
    if (!res.ok) continue
    const data = await res.json()
    const ids = parseAssociationResults(data)
    if (ids.length > 0) return ids
  }

  console.warn('[hubspot/invoices] no invoice associations for', objectType, objectId)
  return []
}

async function batchReadInvoices(ids: string[]): Promise<HubSpotCrmObject[]> {
  const t = token()
  if (!t || ids.length === 0) return []

  const out: HubSpotCrmObject[] = []
  const chunkSize = 100
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize)
    const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/invoices/batch/read`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${t}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: chunk.map((id) => ({ id })),
        properties: [...INVOICE_READ_PROPERTIES],
      }),
      cache: 'no-store',
    })
    if (!res.ok) {
      console.warn('[hubspot/invoices] batch/read', res.status)
      continue
    }
    const data = (await res.json()) as { results?: HubSpotCrmObject[]; status?: string }
    const rows = data.results ?? []
    out.push(...rows)
  }
  return out
}

/**
 * Loads HubSpot CRM invoices associated with the project deal and/or client contact.
 * Requires `HUBSPOT_PRIVATE_APP_TOKEN` with invoices + associations read scopes.
 */
export async function fetchHubSpotBillingInvoices(opts: {
  hubspotDealId: string | null
  hubspotContactId: string | null
}): Promise<HubSpotBillingInvoice[]> {
  if (!token()) return []

  const dealIds = opts.hubspotDealId
    ? await fetchAssociationInvoiceIds('deals', opts.hubspotDealId)
    : []
  const contactIds = opts.hubspotContactId
    ? await fetchAssociationInvoiceIds('contacts', opts.hubspotContactId)
    : []

  const unique = [...new Set([...dealIds, ...contactIds])]
  if (unique.length === 0) return []

  const objects = await batchReadInvoices(unique)
  const rows: HubSpotBillingInvoice[] = []
  for (const o of objects) {
    const row = mapInvoiceObject(o)
    if (row) rows.push(row)
  }
  return rows
}
