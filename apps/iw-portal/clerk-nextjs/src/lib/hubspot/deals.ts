import type { HubSpotCrmObject } from '@/lib/hubspot/client'
import { isHubSpotConfigured, requireHubSpotToken } from '@/lib/hubspot/config'
import { cache } from 'react'

const HUBSPOT_API = 'https://api.hubapi.com'

const DEAL_READ_PROPERTIES = [
  'dealname',
  'dealstage',
  'amount',
  'closedate',
  'pipeline',
  'hs_object_id',
  'createdate',
  'description',
] as const

function token(): string | null {
  if (!isHubSpotConfigured()) return null
  return requireHubSpotToken()
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
            : ''
    if (id) ids.push(id)
  }
  return [...new Set(ids)]
}

async function fetchDealIdsForContact(contactId: string): Promise<string[]> {
  const t = token()
  if (!t || !contactId.trim()) return []

  const encoded = encodeURIComponent(contactId)
  const builders = [
    (after: string | undefined) => {
      const url = new URL(`${HUBSPOT_API}/crm/v4/objects/contacts/${encoded}/associations/deals`)
      url.searchParams.set('limit', '500')
      if (after) url.searchParams.set('after', after)
      return url.toString()
    },
    (after: string | undefined) => {
      const url = new URL(`${HUBSPOT_API}/crm/v3/objects/contacts/${encoded}/associations/deals`)
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

async function batchReadDeals(ids: string[]): Promise<HubSpotCrmObject[]> {
  const t = token()
  if (!t || ids.length === 0) return []

  const out: HubSpotCrmObject[] = []
  const chunkSize = 100
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize)
    const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/deals/batch/read`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${t}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: chunk.map((id) => ({ id })),
        properties: [...DEAL_READ_PROPERTIES],
      }),
      cache: 'no-store',
    })
    if (!res.ok) {
      console.warn('[hubspot/deals] batch/read', res.status)
      continue
    }
    const data = (await res.json()) as { results?: HubSpotCrmObject[] }
    out.push(...(data.results ?? []))
  }
  return out
}

async function loadDealPipelineLabelMaps(): Promise<{
  stageById: Map<string, string>
  pipelineById: Map<string, string>
}> {
  const t = token()
  if (!t) {
    return { stageById: new Map(), pipelineById: new Map() }
  }
  const res = await fetch(`${HUBSPOT_API}/crm/v3/pipelines/deals`, {
    headers: { Authorization: `Bearer ${t}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    console.warn('[hubspot/deals] pipelines', res.status)
    return { stageById: new Map(), pipelineById: new Map() }
  }
  const data = (await res.json()) as {
    results?: Array<{ id: string; label: string; stages?: Array<{ id: string; label: string }> }>
  }
  const stageById = new Map<string, string>()
  const pipelineById = new Map<string, string>()
  for (const p of data.results ?? []) {
    pipelineById.set(String(p.id), p.label)
    for (const s of p.stages ?? []) {
      stageById.set(String(s.id), s.label)
    }
  }
  return { stageById, pipelineById }
}

/** Cached per request — resolves deal stage / pipeline IDs to labels for client-facing UI. */
export const getDealPipelineLabelMaps = cache(loadDealPipelineLabelMaps)

export type HubSpotDealSummary = {
  id: string
  dealname: string
  dealstage: string | null
  /** Resolved label when pipelines API returned a match */
  stageLabel: string | null
  pipeline: string | null
  pipelineLabel: string | null
  amount: string | null
  closedate: string | null
  createdate: string | null
  description: string | null
}

/**
 * All deals associated with the CRM contact (for the portal — clients do not use the CRM UI).
 */
export async function fetchHubSpotDealsForContact(contactId: string | null): Promise<HubSpotDealSummary[]> {
  if (!token() || !contactId?.trim()) return []

  const [{ stageById, pipelineById }, ids] = await Promise.all([
    getDealPipelineLabelMaps(),
    fetchDealIdsForContact(contactId),
  ])
  if (ids.length === 0) return []

  const objects = await batchReadDeals(ids)
  const rows: HubSpotDealSummary[] = []
  for (const o of objects) {
    const p = o.properties ?? {}
    const stageId = p.dealstage != null ? String(p.dealstage) : null
    const pipelineId = p.pipeline != null ? String(p.pipeline) : null
    rows.push({
      id: String(o.id),
      dealname: (p.dealname && String(p.dealname).trim()) || `Engagement ${o.id}`,
      dealstage: stageId,
      stageLabel: stageId ? stageById.get(stageId) ?? null : null,
      pipeline: pipelineId,
      pipelineLabel: pipelineId ? pipelineById.get(pipelineId) ?? null : null,
      amount: p.amount != null ? String(p.amount) : null,
      closedate: p.closedate != null ? String(p.closedate) : null,
      createdate: p.createdate != null ? String(p.createdate) : null,
      description: p.description != null ? String(p.description).trim() || null : null,
    })
  }
  rows.sort((a, b) => a.dealname.localeCompare(b.dealname))
  return rows
}
