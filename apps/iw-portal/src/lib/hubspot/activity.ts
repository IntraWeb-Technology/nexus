import type { HubSpotCrmObject } from '@/lib/hubspot/client'
import { isHubSpotConfigured, requireHubSpotToken } from '@/lib/hubspot/config'
import type { ActivityFeedItem } from '@/lib/activity/types'

const HUBSPOT_API = 'https://api.hubapi.com'

const ASSOCIATION_OBJECT_TYPES = ['notes', 'tasks', 'calls', 'meetings', 'emails'] as const

type AssociationObjectType = (typeof ASSOCIATION_OBJECT_TYPES)[number]

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

async function fetchAssociationIdsPaged(
  fromType: 'deals' | 'contacts',
  fromId: string,
  toType: AssociationObjectType,
): Promise<string[]> {
  const t = token()
  if (!t || !fromId.trim()) return []

  const encoded = encodeURIComponent(fromId)
  const builders = [
    (after: string | undefined) => {
      const url = new URL(`${HUBSPOT_API}/crm/v4/objects/${fromType}/${encoded}/associations/${toType}`)
      url.searchParams.set('limit', '500')
      if (after) url.searchParams.set('after', after)
      return url.toString()
    },
    (after: string | undefined) => {
      const url = new URL(`${HUBSPOT_API}/crm/v3/objects/${fromType}/${encoded}/associations/${toType}`)
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

async function batchReadObjects(
  objectType: AssociationObjectType,
  ids: string[],
  properties: readonly string[],
): Promise<HubSpotCrmObject[]> {
  const t = token()
  if (!t || ids.length === 0) return []

  const out: HubSpotCrmObject[] = []
  const chunkSize = 100
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize)
    const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/${objectType}/batch/read`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${t}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: chunk.map((id) => ({ id })),
        properties: [...properties],
      }),
      cache: 'no-store',
    })
    if (!res.ok) {
      console.warn('[hubspot/activity] batch/read', objectType, res.status)
      continue
    }
    const data = (await res.json()) as { results?: HubSpotCrmObject[] }
    out.push(...(data.results ?? []))
  }
  return out
}

function stripHtml(s: string, max: number): string {
  const t = s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max)}…` : t
}

function excerpt(raw: string | null | undefined, max: number): string | null {
  if (raw == null || raw === '') return null
  const s = stripHtml(String(raw), max)
  return s || null
}

function parseHubSpotTimeMs(p: Record<string, string | null | undefined>): number {
  const raw =
    p.hs_timestamp ?? p.hs_meeting_start_time ?? p.hs_createdate ?? p.hs_lastmodifieddate ?? null
  if (raw == null || raw === '') return NaN
  const s = String(raw).trim()
  if (/^\d{10,13}$/.test(s)) {
    const n = Number(s)
    return n < 1e12 ? n * 1000 : n
  }
  return Date.parse(s)
}

function isoFromProps(p: Record<string, string | null | undefined>): string {
  const ms = parseHubSpotTimeMs(p)
  if (!Number.isNaN(ms)) return new Date(ms).toISOString()
  return new Date().toISOString()
}

const NOTE_PROPS = ['hs_note_body', 'hs_timestamp', 'hs_createdate'] as const
const TASK_PROPS = ['hs_task_subject', 'hs_task_body', 'hs_timestamp', 'hs_createdate'] as const
const CALL_PROPS = [
  'hs_call_title',
  'hs_call_body',
  'hs_call_summary',
  'hs_timestamp',
  'hs_createdate',
] as const
const MEETING_PROPS = [
  'hs_meeting_title',
  'hs_meeting_body',
  'hs_meeting_start_time',
  'hs_createdate',
] as const
const EMAIL_PROPS = [
  'hs_email_subject',
  'hs_email_text',
  'hs_email_html',
  'hs_timestamp',
  'hs_createdate',
] as const

function mapNote(o: HubSpotCrmObject, projectId: string): ActivityFeedItem {
  const p = o.properties ?? {}
  const body = excerpt(p.hs_note_body, 400)
  return {
    id: `hubspot:note:${o.id}`,
    project_id: projectId,
    type: 'hubspot_note',
    label: 'Note',
    detail: body,
    created_at: isoFromProps(p),
    source: 'hubspot',
  }
}

function mapTask(o: HubSpotCrmObject, projectId: string): ActivityFeedItem {
  const p = o.properties ?? {}
  const title = (p.hs_task_subject && String(p.hs_task_subject).trim()) || 'Task'
  const body = excerpt(p.hs_task_body, 400)
  return {
    id: `hubspot:task:${o.id}`,
    project_id: projectId,
    type: 'hubspot_task',
    label: title,
    detail: body,
    created_at: isoFromProps(p),
    source: 'hubspot',
  }
}

function mapCall(o: HubSpotCrmObject, projectId: string): ActivityFeedItem {
  const p = o.properties ?? {}
  const title =
    (p.hs_call_title && String(p.hs_call_title).trim()) ||
    (p.hs_call_summary && String(p.hs_call_summary).trim()) ||
    'Call'
  const body = excerpt(p.hs_call_body ?? p.hs_call_summary, 400)
  return {
    id: `hubspot:call:${o.id}`,
    project_id: projectId,
    type: 'hubspot_call',
    label: title,
    detail: body,
    created_at: isoFromProps(p),
    source: 'hubspot',
  }
}

function mapMeeting(o: HubSpotCrmObject, projectId: string): ActivityFeedItem {
  const p = o.properties ?? {}
  const title = (p.hs_meeting_title && String(p.hs_meeting_title).trim()) || 'Meeting'
  const body = excerpt(p.hs_meeting_body, 400)
  return {
    id: `hubspot:meeting:${o.id}`,
    project_id: projectId,
    type: 'hubspot_meeting',
    label: title,
    detail: body,
    created_at: isoFromProps(p),
    source: 'hubspot',
  }
}

function mapEmail(o: HubSpotCrmObject, projectId: string): ActivityFeedItem {
  const p = o.properties ?? {}
  const subj = (p.hs_email_subject && String(p.hs_email_subject).trim()) || 'Email'
  const body = excerpt(p.hs_email_text ?? p.hs_email_html, 400)
  return {
    id: `hubspot:email:${o.id}`,
    project_id: projectId,
    type: 'hubspot_email',
    label: subj,
    detail: body,
    created_at: isoFromProps(p),
    source: 'hubspot',
  }
}

/**
 * Loads recent CRM activity (notes, tasks, calls, meetings, emails) associated with the deal and/or contact.
 * Requires `HUBSPOT_PRIVATE_APP_TOKEN` with read access to those objects and associations.
 */
export async function fetchHubSpotActivityFeed(opts: {
  hubspotDealId: string | null
  hubspotContactId: string | null
  projectId: string
}): Promise<ActivityFeedItem[]> {
  if (!token()) return []

  const { hubspotDealId, hubspotContactId, projectId } = opts
  if (!hubspotDealId && !hubspotContactId) return []

  const collected: ActivityFeedItem[] = []

  for (const objectType of ASSOCIATION_OBJECT_TYPES) {
    const idSets: string[][] = []
    if (hubspotDealId) idSets.push(await fetchAssociationIdsPaged('deals', hubspotDealId, objectType))
    if (hubspotContactId) {
      idSets.push(await fetchAssociationIdsPaged('contacts', hubspotContactId, objectType))
    }
    const uniqueIds = [...new Set(idSets.flat())]
    if (uniqueIds.length === 0) continue

    let objects: HubSpotCrmObject[] = []
    switch (objectType) {
      case 'notes':
        objects = await batchReadObjects('notes', uniqueIds, NOTE_PROPS)
        for (const o of objects) collected.push(mapNote(o, projectId))
        break
      case 'tasks':
        objects = await batchReadObjects('tasks', uniqueIds, TASK_PROPS)
        for (const o of objects) collected.push(mapTask(o, projectId))
        break
      case 'calls':
        objects = await batchReadObjects('calls', uniqueIds, CALL_PROPS)
        for (const o of objects) collected.push(mapCall(o, projectId))
        break
      case 'meetings':
        objects = await batchReadObjects('meetings', uniqueIds, MEETING_PROPS)
        for (const o of objects) collected.push(mapMeeting(o, projectId))
        break
      case 'emails':
        objects = await batchReadObjects('emails', uniqueIds, EMAIL_PROPS)
        for (const o of objects) collected.push(mapEmail(o, projectId))
        break
      default:
        break
    }
  }

  const byId = new Map<string, ActivityFeedItem>()
  for (const item of collected) {
    if (!byId.has(item.id)) byId.set(item.id, item)
  }
  return [...byId.values()]
}

export type CreateHubSpotProposalApprovalNoteResult =
  | { ok: true; noteId: string; associatedToDeal: boolean; associatedToContact: boolean }
  | { ok: false; error: string }

async function associateNoteDefault(
  noteId: string,
  toType: 'deals' | 'contacts',
  toId: string,
): Promise<boolean> {
  const t = token()
  if (!t || !noteId || !toId.trim()) return false
  const encodedNote = encodeURIComponent(noteId)
  const encodedTo = encodeURIComponent(toId.trim())
  const res = await fetch(
    `${HUBSPOT_API}/crm/v4/objects/notes/${encodedNote}/associations/default/${toType}/${encodedTo}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${t}` },
      cache: 'no-store',
    },
  )
  return res.ok
}

/** Creates a HubSpot note and links it to the approved deal (and contact when available). */
export async function createHubSpotProposalApprovalNote(input: {
  hubspotDealId: string
  hubspotContactId?: string | null
  body: string
  occurredAtIso: string
}): Promise<CreateHubSpotProposalApprovalNoteResult> {
  const t = token()
  const dealId = input.hubspotDealId.trim()
  if (!t) return { ok: false, error: 'HubSpot token unavailable' }
  if (!dealId) return { ok: false, error: 'Missing hubspotDealId' }

  const timestampMs = Date.parse(input.occurredAtIso)
  const hsTimestamp = Number.isNaN(timestampMs) ? Date.now() : timestampMs
  const createRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/notes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${t}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        hs_note_body: input.body,
        hs_timestamp: String(hsTimestamp),
      },
    }),
    cache: 'no-store',
  })

  if (!createRes.ok) {
    return { ok: false, error: `HubSpot note create failed: ${createRes.status}` }
  }

  const created = (await createRes.json()) as { id?: string }
  const noteId = created.id ? String(created.id) : ''
  if (!noteId) return { ok: false, error: 'HubSpot note created without id' }

  const associatedToDeal = await associateNoteDefault(noteId, 'deals', dealId)
  const contactId = input.hubspotContactId?.trim()
  const associatedToContact = contactId
    ? await associateNoteDefault(noteId, 'contacts', contactId)
    : false

  if (!associatedToDeal) {
    return { ok: false, error: 'HubSpot note created but failed deal association' }
  }

  return { ok: true, noteId, associatedToDeal, associatedToContact }
}
