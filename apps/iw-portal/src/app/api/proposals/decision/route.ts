import { getPortalBundle } from '@/lib/data/portal'
import { createHubSpotProposalApprovalNote } from '@/lib/hubspot/activity'
import { recordIntegrationEvent } from '@/lib/integrations/events'
import {
  proposalLifecycleWebhooksEnabled,
  triggerProposalLifecycle,
} from '@/lib/n8n/client'
import {
  assertValidProposalTransition,
  proposalDisplayName,
  proposalEventDetail,
  proposalEventLabel,
  proposalStatusForEvent,
  type ProposalLifecycleEventType,
} from '@/lib/proposals/lifecycle'
import { createServiceSupabase } from '@/lib/supabase/server'
import type { OsContractsQueueRow } from '@/lib/supabase/types'
import { auth, currentUser } from '@clerk/nextjs/server'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

const VALID_EVENTS = new Set<ProposalLifecycleEventType>(['viewed', 'approved', 'rejected'])

function parseEventType(raw: unknown): ProposalLifecycleEventType | null {
  if (typeof raw !== 'string') return null
  const value = raw.trim()
  return VALID_EVENTS.has(value as ProposalLifecycleEventType)
    ? (value as ProposalLifecycleEventType)
    : null
}

function truncateNote(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const note = raw.trim()
  return note ? note.slice(0, 2000) : null
}

function proposalNotification(eventType: ProposalLifecycleEventType, label: string) {
  if (eventType === 'approved') {
    return {
      title: 'Proposal approved',
      body: `${label} has been approved. Your project team has been notified.`,
    }
  }
  if (eventType === 'rejected') {
    return {
      title: 'Proposal rejected',
      body: `${label} was rejected. Your project team will review the feedback.`,
    }
  }
  return null
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bundle = await getPortalBundle()
  if (!bundle) return NextResponse.json({ error: 'Portal project not found' }, { status: 404 })
  if (!bundle.project.hubspot_deal_id?.trim()) {
    return NextResponse.json({ error: 'No HubSpot deal is linked to this project' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = body as { proposalId?: unknown; eventType?: unknown; note?: unknown }
  const proposalId = typeof payload.proposalId === 'string' ? payload.proposalId.trim() : ''
  const eventType = parseEventType(payload.eventType)
  const note = truncateNote(payload.note)
  if (!proposalId || !eventType) {
    return NextResponse.json({ error: 'proposalId and valid eventType are required' }, { status: 400 })
  }

  const supabase = createServiceSupabase()
  const { data: proposal, error: proposalErr } = await supabase
    .from('os_contracts_queue')
    .select('*')
    .eq('id', proposalId)
    .eq('queue_type', 'proposal')
    .eq('hubspot_deal_id', bundle.project.hubspot_deal_id)
    .maybeSingle()

  if (proposalErr) {
    console.error('[proposal-decision] fetch proposal', proposalErr)
    return NextResponse.json({ error: 'Could not load proposal' }, { status: 500 })
  }
  if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })

  const transition = assertValidProposalTransition(proposal, eventType)
  if (!transition.ok) {
    return NextResponse.json({ error: transition.error }, { status: transition.status })
  }

  const user = await currentUser()
  const actorName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.emailAddresses?.[0]?.emailAddress ||
    bundle.client.name
  const now = new Date().toISOString()
  const label = proposalDisplayName(proposal)
  const eventLabel = proposalEventLabel(eventType)
  const eventId = randomUUID()
  const detail = proposalEventDetail({ proposal, actorName, note })

  let updatedProposal = proposal as OsContractsQueueRow
  const nextStatus = proposalStatusForEvent(eventType)
  if (nextStatus) {
    const statusDetail =
      eventType === 'approved'
        ? `Approved by ${actorName} at ${now}${note ? ` — ${note}` : ''}`
        : `Rejected by ${actorName} at ${now}${note ? ` — ${note}` : ''}`
    const { data: updated, error: updateErr } = await supabase
      .from('os_contracts_queue')
      .update({
        status: nextStatus,
        proposal_status_detail: statusDetail,
        updated_at: now,
      })
      .eq('id', proposal.id)
      .eq('status', proposal.status)
      .select('*')
      .single()
    if (updateErr || !updated) {
      console.error('[proposal-decision] update proposal', updateErr)
      return NextResponse.json({ error: 'Could not update proposal' }, { status: 500 })
    }
    updatedProposal = updated as OsContractsQueueRow
  } else {
    const { data: existingView } = await supabase
      .from('activity_log')
      .select('id')
      .eq('project_id', bundle.project.id)
      .eq('type', 'proposal')
      .eq('label', eventLabel)
      .ilike('detail', `proposal:${proposal.id}%`)
      .limit(1)
      .maybeSingle()

    if (existingView) {
      return NextResponse.json({ proposal: updatedProposal, duplicate: true })
    }

    const { data: viewedUpdate } = await supabase
      .from('os_contracts_queue')
      .update({
        proposal_status_detail: `Viewed by ${actorName} at ${now}`,
        updated_at: now,
      })
      .eq('id', proposal.id)
      .select('*')
      .single()
    if (viewedUpdate) updatedProposal = viewedUpdate as OsContractsQueueRow
  }

  await supabase.from('activity_log').insert({
    project_id: bundle.project.id,
    type: 'proposal',
    label: eventLabel,
    detail,
  })

  const notification = proposalNotification(eventType, label)
  if (notification) {
    await supabase.from('notifications').insert({
      project_id: bundle.project.id,
      type: 'action_required',
      title: notification.title,
      body: notification.body,
      read: false,
    })
  }

  const lifecyclePayload = {
    event_id: eventId,
    event_type: eventType,
    proposal_id: proposal.id,
    project_id: bundle.project.id,
    project_slug: bundle.project.slug,
    client_name: bundle.client.name,
    client_email: bundle.client.email,
    actor_clerk_user_id: userId,
    actor_name: actorName,
    hubspot_deal_id: bundle.project.hubspot_deal_id,
    hubspot_contact_id: bundle.client.hubspot_contact_id,
    occurred_at: now,
    decision_version: nextStatus ? 1 : 0,
    metadata: {
      status: updatedProposal.status,
      proposal_status_detail: updatedProposal.proposal_status_detail,
      queue_type: 'proposal' as const,
      drive_link: updatedProposal.drive_link,
      deal_value: updatedProposal.deal_value,
      note,
    },
  }

  const webhooksEnabled = proposalLifecycleWebhooksEnabled()
  await recordIntegrationEvent({
    provider: 'n8n',
    eventType: `proposal_lifecycle.${eventType}`,
    externalEventId: eventId,
    status: webhooksEnabled ? 'processed' : 'ignored',
    payload: lifecyclePayload,
    lastError: webhooksEnabled ? null : 'PORTAL_PROPOSAL_LIFECYCLE_WEBHOOKS_ENABLED disabled',
  })

  if (eventType === 'approved' || eventType === 'rejected') {
    const isApproved = eventType === 'approved'
    const noteBody = [
      `<p><strong>Portal proposal ${isApproved ? 'approved' : 'rejected'}</strong></p>`,
      `<p>${label} was ${isApproved ? 'approved' : 'rejected'} by ${actorName} at ${now}.</p>`,
      note ? `<p><strong>Client feedback:</strong> ${note}</p>` : '',
      updatedProposal.deal_value ? `<p><strong>Deal value:</strong> ${updatedProposal.deal_value}</p>` : '',
      `<p><strong>Source:</strong> IntraWeb Client Portal</p>`,
    ]
      .filter(Boolean)
      .join('')

    const hsResult = await createHubSpotProposalApprovalNote({
      hubspotDealId: bundle.project.hubspot_deal_id,
      hubspotContactId: bundle.client.hubspot_contact_id,
      body: noteBody,
      occurredAtIso: now,
    })

    await recordIntegrationEvent({
      provider: 'hubspot',
      eventType: isApproved ? 'proposal_approval.note' : 'proposal_rejection.note',
      externalEventId: eventId,
      status: hsResult.ok ? 'processed' : 'failed',
      payload: {
        event_type: eventType,
        proposal_id: proposal.id,
        hubspot_deal_id: bundle.project.hubspot_deal_id,
        hubspot_contact_id: bundle.client.hubspot_contact_id,
        note_id: hsResult.ok ? hsResult.noteId : null,
      },
      lastError: hsResult.ok ? null : hsResult.error,
    })
  }

  triggerProposalLifecycle(lifecyclePayload)

  return NextResponse.json({ proposal: updatedProposal, event_id: eventId })
}
