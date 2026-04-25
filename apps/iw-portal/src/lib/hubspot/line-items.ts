import { isHubSpotConfigured, requireHubSpotToken } from '@/lib/hubspot/config'

const HUBSPOT_API = 'https://api.hubapi.com'

const LINE_ITEM_PROPERTIES = [
  'name',
  'quantity',
  'price',
  'amount',
  'description',
  'hs_recurring_billing_period',
] as const

export type HubSpotDealLineItem = {
  id: string
  name: string
  quantity: number
  totalAmountCents: number
}

function token(): string | null {
  if (!isHubSpotConfigured()) return null
  return requireHubSpotToken()
}

function parseAmountToCents(raw: string | null | undefined): number {
  if (raw == null || raw === '') return 0
  const n = Number.parseFloat(String(raw).replace(/,/g, ''))
  if (Number.isNaN(n)) return 0
  return Math.round(n * 100)
}

function parseAssociationIds(data: unknown): string[] {
  if (!data || typeof data !== 'object') return []
  const results = (data as { results?: unknown[] }).results
  if (!Array.isArray(results)) return []
  const ids: string[] = []
  for (const row of results) {
    if (!row || typeof row !== 'object') continue
    const obj = row as Record<string, unknown>
    const id =
      obj.toObjectId != null
        ? String(obj.toObjectId)
        : obj.to_object_id != null
          ? String(obj.to_object_id)
          : obj.id != null
            ? String(obj.id)
            : obj.to && typeof obj.to === 'object' && (obj.to as { id?: unknown }).id != null
              ? String((obj.to as { id: unknown }).id)
              : ''
    if (id) ids.push(id)
  }
  return [...new Set(ids)]
}

function pagingAfter(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined
  const after = (data as { paging?: { next?: { after?: string } } }).paging?.next?.after
  return typeof after === 'string' && after.length > 0 ? after : undefined
}

async function fetchDealLineItemIds(dealId: string): Promise<string[]> {
  const t = token()
  if (!t) return []
  const encoded = encodeURIComponent(dealId)

  const builders = [
    (after: string | undefined) => {
      const url = new URL(`${HUBSPOT_API}/crm/v4/objects/deals/${encoded}/associations/line_items`)
      url.searchParams.set('limit', '500')
      if (after) url.searchParams.set('after', after)
      return url.toString()
    },
    (after: string | undefined) => {
      const url = new URL(`${HUBSPOT_API}/crm/v3/objects/deals/${encoded}/associations/line_items`)
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
      for (const id of parseAssociationIds(data)) ids.add(id)
      after = pagingAfter(data)
    } while (after)
    if (ids.size > 0) return [...ids]
  }

  return []
}

async function batchReadLineItems(ids: string[]): Promise<HubSpotDealLineItem[]> {
  const t = token()
  if (!t || ids.length === 0) return []

  const rows: HubSpotDealLineItem[] = []
  const chunkSize = 100
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize)
    const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/line_items/batch/read`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${t}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: chunk.map((id) => ({ id })),
        properties: [...LINE_ITEM_PROPERTIES],
      }),
      cache: 'no-store',
    })
    if (!res.ok) continue
    const data = (await res.json()) as {
      results?: Array<{ id: string; properties?: Record<string, string | null | undefined> }>
    }
    for (const item of data.results ?? []) {
      const p = item.properties ?? {}
      const quantity = Number.parseFloat(String(p.quantity ?? '1'))
      const safeQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1
      const amount = parseAmountToCents(p.amount)
      const unit = parseAmountToCents(p.price)
      rows.push({
        id: String(item.id),
        name: (p.name && String(p.name).trim()) || 'Line item',
        quantity: safeQty,
        totalAmountCents: amount || Math.round(unit * safeQty),
      })
    }
  }

  rows.sort((a, b) => a.name.localeCompare(b.name))
  return rows
}

/** Deal-scoped line items for “what's included in your plan” and pricing context. */
export async function fetchHubSpotDealLineItems(dealId: string | null): Promise<HubSpotDealLineItem[]> {
  if (!dealId?.trim()) return []
  const ids = await fetchDealLineItemIds(dealId)
  if (ids.length === 0) return []
  return batchReadLineItems(ids)
}
