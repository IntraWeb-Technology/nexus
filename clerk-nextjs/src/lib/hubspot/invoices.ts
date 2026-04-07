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
    'Invoice'

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

function pagingAfter(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined
  const after = (data as { paging?: { next?: { after?: string } } }).paging?.next?.after
  return typeof after === 'string' && after.length > 0 ? after : undefined
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
        : o.to_object_id != null
          ? String(o.to_object_id)
          : o.id != null
            ? String(o.id)
            : o.to && typeof o.to === 'object' && (o.to as { id?: unknown }).id != null
              ? String((o.to as { id: unknown }).id)
              : ''
    if (id) ids.push(id)
  }
  return [...new Set(ids)]
}

/** Invoice IDs embedded on a CRM object read (`?associations=invoices`). */
function parseInvoiceIdsFromAssociationsPayload(associations: unknown): string[] {
  if (!associations || typeof associations !== 'object') return []
  const a = associations as Record<string, unknown>
  for (const key of ['invoices', 'invoice']) {
    const bucket = a[key]
    if (!bucket || typeof bucket !== 'object') continue
    const results = (bucket as { results?: unknown[] }).results
    if (!Array.isArray(results)) continue
    const ids: string[] = []
    for (const r of results) {
      if (!r || typeof r !== 'object') continue
      const o = r as Record<string, unknown>
      if (o.id != null) ids.push(String(o.id))
    }
    if (ids.length > 0) return [...new Set(ids)]
  }
  return []
}

async function fetchInvoiceIdsFromObjectRead(
  objectType: 'contacts' | 'deals',
  objectId: string,
): Promise<string[]> {
  const t = token()
  if (!t || !objectId.trim()) return []
  const encoded = encodeURIComponent(objectId)
  const params = new URLSearchParams()
  params.set('associations', 'invoices')
  const res = await fetch(
    `${HUBSPOT_API}/crm/v3/objects/${objectType}/${encoded}?${params.toString()}`,
    { headers: { Authorization: `Bearer ${t}` }, cache: 'no-store' },
  )
  if (!res.ok) return []
  const data = (await res.json()) as { associations?: unknown }
  return parseInvoiceIdsFromAssociationsPayload(data.associations)
}

/**
 * Lists invoice IDs via association APIs (v4 then v3), following paging.
 * HubSpot paginates when there are many associations; a single invoice can be missed without paging.
 */
async function fetchAssociationInvoiceIdsPaged(
  objectType: 'deals' | 'contacts',
  objectId: string,
): Promise<string[]> {
  const t = token()
  if (!t || !objectId.trim()) return []

  const encoded = encodeURIComponent(objectId)
  const builders = [
    (after: string | undefined) => {
      const url = new URL(
        `${HUBSPOT_API}/crm/v4/objects/${objectType}/${encoded}/associations/invoices`,
      )
      url.searchParams.set('limit', '500')
      if (after) url.searchParams.set('after', after)
      return url.toString()
    },
    (after: string | undefined) => {
      const url = new URL(
        `${HUBSPOT_API}/crm/v3/objects/${objectType}/${encoded}/associations/invoices`,
      )
      url.searchParams.set('limit', '100')
      if (after) url.searchParams.set('after', after)
      return url.toString()
    },
  ]

  for (const buildUrl of builders) {
    const ids = new Set<string>()
    let after: string | undefined
    do {
      const res = await fetch(buildUrl(after), {
        headers: { Authorization: `Bearer ${t}` },
        cache: 'no-store',
      })
      if (!res.ok) break
      const data = await res.json()
      for (const id of parseAssociationResults(data)) ids.add(id)
      after = pagingAfter(data)
    } while (after)
    if (ids.size > 0) return [...ids]
  }

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

  const [dealAssoc, dealRead, contactAssoc, contactRead] = await Promise.all([
    opts.hubspotDealId
      ? fetchAssociationInvoiceIdsPaged('deals', opts.hubspotDealId)
      : Promise.resolve([] as string[]),
    opts.hubspotDealId ? fetchInvoiceIdsFromObjectRead('deals', opts.hubspotDealId) : Promise.resolve([] as string[]),
    opts.hubspotContactId
      ? fetchAssociationInvoiceIdsPaged('contacts', opts.hubspotContactId)
      : Promise.resolve([] as string[]),
    opts.hubspotContactId
      ? fetchInvoiceIdsFromObjectRead('contacts', opts.hubspotContactId)
      : Promise.resolve([] as string[]),
  ])

  const unique = [...new Set([...dealAssoc, ...dealRead, ...contactAssoc, ...contactRead])]
  if (unique.length === 0) return []

  const objects = await batchReadInvoices(unique)
  const rows: HubSpotBillingInvoice[] = []
  for (const o of objects) {
    const row = mapInvoiceObject(o)
    if (row) rows.push(row)
  }
  return rows
}
