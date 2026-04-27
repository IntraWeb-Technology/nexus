import { hubspotDealPortalPlanPropertyName } from '@/lib/hubspot/portal-plan-slug'
import { syncPortalPlanSlugFromHubSpotDeal } from '@/lib/hubspot/sync-portal-plan-slug'
import { mapDealStageToPortal } from '@/lib/hubspot/stageMap'
import {
  mergeHubSpotWebhookIntoCrmMirror,
  mergeNormalizedHubSpotPayloadIntoCrmMirror,
} from '@/lib/integrations/hubspot-crm-mirror'
import { recordIntegrationEvent } from '@/lib/integrations/events'
import { createServiceSupabase } from '@/lib/supabase/server'
import { validateIntrawebSecret } from '@/lib/webhooks/secret'
import { NextResponse } from 'next/server'

export const maxDuration = 60

type HubSpotEvent = {
  eventId?: number
  subscriptionType?: string
  objectId?: number | string
  propertyName?: string
  propertyValue?: string
}

export async function POST(request: Request) {
  if (!validateIntrawebSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  await recordIntegrationEvent({
    provider: 'hubspot',
    eventType: Array.isArray(raw) ? 'batch' : String((raw as { action?: unknown })?.action ?? 'normalized'),
    status: 'received',
    payload: raw,
  })

  try {
    const supabase = createServiceSupabase()

    if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'action' in raw) {
      const o = raw as Record<string, unknown>
      const action = String(o.action ?? '')
      await mergeNormalizedHubSpotPayloadIntoCrmMirror(supabase, o)

      if (action === 'deal_property_change' || action === 'hubspot_deal_stage') {
        const objectId = o.objectId ?? o.dealId
        const propertyValue = o.propertyValue ?? o.stage ?? o.dealstage
        const propertyName = (o.propertyName as string) ?? 'dealstage'
        if (objectId != null && propertyValue != null) {
          await handleDealStageChange(supabase, {
            subscriptionType: 'deal.propertyChange',
            objectId: objectId as number | string,
            propertyName,
            propertyValue: String(propertyValue),
          })
        }
      }

      const planProp = hubspotDealPortalPlanPropertyName()
      if (
        typeof o.propertyName === 'string' &&
        o.propertyName.toLowerCase() === planProp.toLowerCase()
      ) {
        const dealId = o.dealId ?? o.objectId
        if (dealId != null) {
          await syncPortalPlanSlugFromHubSpotDeal(supabase, String(dealId), o.propertyValue as string | undefined)
        }
      }
      return NextResponse.json({ ok: true })
    }

    const events = raw as HubSpotEvent[]
    if (!Array.isArray(events)) {
      return NextResponse.json({ error: 'Expected array or normalized object' }, { status: 400 })
    }

    for (const ev of events) {
      const evRecord = ev as unknown as Record<string, unknown>
      await mergeHubSpotWebhookIntoCrmMirror(supabase, {
        subscriptionType: ev.subscriptionType,
        objectId: ev.objectId,
        propertyName: ev.propertyName,
        propertyValue: ev.propertyValue,
        raw: evRecord,
      })

      if (ev.subscriptionType === 'contact.creation') {
        console.log('[hubspot] contact.creation', ev)
        continue
      }
      if (ev.subscriptionType === 'deal.propertyChange' && ev.propertyName === 'dealstage') {
        await handleDealStageChange(supabase, ev)
      }

      const planProp = hubspotDealPortalPlanPropertyName()
      if (
        ev.subscriptionType === 'deal.propertyChange' &&
        typeof ev.propertyName === 'string' &&
        ev.propertyName.toLowerCase() === planProp.toLowerCase() &&
        ev.objectId != null
      ) {
        await syncPortalPlanSlugFromHubSpotDeal(supabase, String(ev.objectId), ev.propertyValue)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    await recordIntegrationEvent({
      provider: 'hubspot',
      eventType: Array.isArray(raw) ? 'batch' : String((raw as { action?: unknown })?.action ?? 'normalized'),
      status: 'failed',
      payload: raw,
      lastError: e instanceof Error ? e.message : 'HubSpot webhook failed',
    })
    console.error('[webhook/hubspot]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function handleDealStageChange(
  supabase: ReturnType<typeof createServiceSupabase>,
  ev: HubSpotEvent,
) {
  if (ev.objectId == null) return
  const dealId = String(ev.objectId)
  const stageVal = ev.propertyValue ?? ''
  const mapped = mapDealStageToPortal(stageVal)
  if (!mapped) return

  const { data: project } = await supabase
    .from('projects')
    .select('id, slug')
    .eq('hubspot_deal_id', dealId)
    .maybeSingle()
  if (!project) return

  await supabase
    .from('projects')
    .update({
      status: mapped.portalStatus,
      progress_pct: mapped.progressPct,
    })
    .eq('id', project.id)

  await supabase.from('activity_log').insert({
    project_id: project.id,
    type: 'system',
    label: 'Deal stage updated',
    detail: `Engagement stage synced — status ${mapped.portalStatus} (${mapped.progressPct}%)`,
  })

  await supabase.from('notifications').insert({
    project_id: project.id,
    type: 'milestone',
    title: 'Project status updated',
    body: `Your project status is now ${mapped.portalStatus.replace(/_/g, ' ')}.`,
    read: false,
  })
}
