import type { SupabaseClient } from '@supabase/supabase-js'

export type HubSpotCrmObjectType = 'contact' | 'deal' | 'company'

function isHubSpotCrmMirrorEnabled(): boolean {
  const v = process.env.HUBSPOT_CRM_MIRROR?.trim().toLowerCase()
  if (v === '0' || v === 'false' || v === 'off' || v === 'no') return false
  return true
}

function subscriptionTypeToObjectType(subscriptionType: string | undefined): HubSpotCrmObjectType | null {
  if (!subscriptionType) return null
  const prefix = subscriptionType.split('.')[0]?.toLowerCase()
  if (prefix === 'deal') return 'deal'
  if (prefix === 'contact') return 'contact'
  if (prefix === 'company') return 'company'
  return null
}

function normalizedActionToObjectType(action: string): HubSpotCrmObjectType | null {
  const a = action.toLowerCase()
  if (a.includes('deal')) return 'deal'
  if (a.includes('contact')) return 'contact'
  if (a.includes('company')) return 'company'
  return null
}

function buildPropertiesPatch(ev: Record<string, unknown>): Record<string, unknown> {
  const name = ev.propertyName
  const val = ev.propertyValue
  if (typeof name === 'string' && name.trim()) {
    return { [name]: val }
  }
  return {}
}

function safeLastEvent(ev: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const k of [
    'eventId',
    'subscriptionType',
    'objectId',
    'propertyName',
    'propertyValue',
    'action',
    'dealId',
    'stage',
    'dealstage',
  ]) {
    if (k in ev) out[k] = ev[k]
  }
  return out
}

/**
 * Upserts a merged property snapshot for one HubSpot object (HubSpot → Supabase only).
 * No-op when HUBSPOT_CRM_MIRROR is disabled or the event cannot be mapped.
 */
export async function mergeHubSpotWebhookIntoCrmMirror(
  supabase: SupabaseClient,
  input: {
    subscriptionType?: string
    objectId?: number | string | null
    propertyName?: string
    propertyValue?: string
    /** Full event for debugging (only whitelisted keys stored). */
    raw?: Record<string, unknown>
  },
): Promise<void> {
  if (!isHubSpotCrmMirrorEnabled()) return

  const oid = input.objectId
  if (oid == null) return
  const hubspotId = String(oid).trim()
  if (!hubspotId) return

  const sub = input.subscriptionType ?? ''
  const objectType = subscriptionTypeToObjectType(sub)
  if (!objectType) return

  const ev: Record<string, unknown> = {
    subscriptionType: sub || undefined,
    objectId: oid,
    propertyName: input.propertyName,
    propertyValue: input.propertyValue,
    ...input.raw,
  }

  const patch = buildPropertiesPatch(ev)
  const lastEvent = safeLastEvent(ev)

  const { error } = await supabase.rpc('merge_hubspot_crm_entity', {
    p_object_type: objectType,
    p_hubspot_id: hubspotId,
    p_properties_patch: patch,
    p_last_event: lastEvent,
    p_subscription_type: sub || null,
  })

  if (error) {
    console.error('[hubspot-crm-mirror] merge_hubspot_crm_entity failed', error)
  }
}

/** n8n / router normalized payloads (single object, not HubSpot batch array). */
export async function mergeNormalizedHubSpotPayloadIntoCrmMirror(
  supabase: SupabaseClient,
  o: Record<string, unknown>,
): Promise<void> {
  if (!isHubSpotCrmMirrorEnabled()) return

  const action = String(o.action ?? '')
  const objectType = normalizedActionToObjectType(action)
  if (!objectType) return

  const objectId = o.objectId ?? o.dealId ?? o.contactId ?? o.companyId
  if (objectId == null) return

  const propertyName =
    (typeof o.propertyName === 'string' && o.propertyName) ||
    (action.toLowerCase().includes('stage') ? 'dealstage' : undefined)
  const propertyValue = o.propertyValue ?? o.stage ?? o.dealstage

  const ev: Record<string, unknown> = {
    action,
    objectId,
    propertyName,
    propertyValue,
  }

  const patch =
    propertyName && propertyValue != null ? { [propertyName]: propertyValue } : buildPropertiesPatch(ev)

  const { error } = await supabase.rpc('merge_hubspot_crm_entity', {
    p_object_type: objectType,
    p_hubspot_id: String(objectId).trim(),
    p_properties_patch: patch,
    p_last_event: safeLastEvent(ev),
    p_subscription_type: action || null,
  })

  if (error) {
    console.error('[hubspot-crm-mirror] merge_hubspot_crm_entity (normalized) failed', error)
  }
}
