import { sendWelcomeEmail } from '@/lib/email/send'
import {
  linkPlaceholderClientToClerkUser,
  mergeProvisionedClientsByEmailIntoClerkUser,
  normalizePortalClientEmail,
  type MergeProvisionedClientsResult,
} from '@/lib/data/link-hubspot-provisioned-clerk'
import { insertProvisionedEngagementContent } from '@/lib/data/provision-client-engagement'
import { applyAddInvoice } from '@/lib/n8n/apply-add-invoice'
import { normalizeMaintenancePlanSlug } from '@/lib/stripe/maintenance-packages'
import { attachProjectDocument } from '@/lib/n8n/attach-project-document'
import type {
  AddInvoiceInboundPayload,
  AttachProjectDocumentInboundPayload,
  N8nInboundPayload,
} from '@/lib/n8n/webhooks'
import { recordIntegrationEvent } from '@/lib/integrations/events'
import { recalculateProjectProgressPct } from '@/lib/progress'
import { createServiceSupabase } from '@/lib/supabase/server'
import { validateIntrawebSecret } from '@/lib/webhooks/secret'
import { findProjectByHubSpotDealId } from '@/lib/webhooks/provision-client-idempotency'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  if (!validateIntrawebSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: N8nInboundPayload
  try {
    payload = (await request.json()) as N8nInboundPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  await recordIntegrationEvent({
    provider: 'n8n',
    eventType: String((payload as { action?: string }).action ?? 'unknown'),
    status: 'received',
    payload,
  })

  try {
    const supabase = createServiceSupabase()
    const envelope = payload as { action?: string; project_slug?: string }
    const action = envelope.action
    const projectSlug = envelope.project_slug ?? ''

    switch (action) {
      case 'update_milestone': {
        const d = payload as Extract<N8nInboundPayload, { action: 'update_milestone' }>
        const proj = await getProjectBySlug(supabase, d.project_slug)
        if (!proj) return NextResponse.json({ error: 'project not found' }, { status: 404 })
        const completedAt = d.data.completed_at ?? null
        await supabase
          .from('milestones')
          .update({
            status: d.data.status,
            completed_at: d.data.status === 'done' ? completedAt ?? new Date().toISOString() : null,
          })
          .eq('id', d.data.milestone_id)
          .eq('project_id', proj.id)

        await recalculateProjectProgressPct(supabase, proj.id)

        await supabase.from('activity_log').insert({
          project_id: proj.id,
          type: 'milestone',
          label: 'Milestone updated',
          detail: d.data.milestone_id,
        })
        await supabase.from('notifications').insert({
          project_id: proj.id,
          type: 'milestone',
          title: 'Milestone update',
          body: 'A milestone status was updated on your project.',
          read: false,
        })
        return NextResponse.json({ ok: true })
      }
      case 'update_progress': {
        const d = payload as Extract<N8nInboundPayload, { action: 'update_progress' }>
        const proj = await getProjectBySlug(supabase, d.project_slug)
        if (!proj) return NextResponse.json({ error: 'project not found' }, { status: 404 })
        await supabase.from('projects').update({ progress_pct: d.data.progress_pct }).eq('id', proj.id)
        return NextResponse.json({ ok: true })
      }
      case 'add_message': {
        const d = payload as Extract<N8nInboundPayload, { action: 'add_message' }>
        const proj = await getProjectBySlug(supabase, d.project_slug)
        if (!proj) return NextResponse.json({ error: 'project not found' }, { status: 404 })
        await supabase.from('messages').insert({
          project_id: proj.id,
          sender_type: d.data.sender_type,
          sender_name: d.data.sender_name,
          body: d.data.body,
          read: false,
        })
        return NextResponse.json({ ok: true })
      }
      case 'add_document': {
        const d = payload as Extract<N8nInboundPayload, { action: 'add_document' }>
        const proj = await getProjectBySlug(supabase, d.project_slug)
        if (!proj) return NextResponse.json({ error: 'project not found' }, { status: 404 })
        await supabase.from('documents').insert({
          project_id: proj.id,
          name: d.data.name,
          file_url: d.data.file_url,
          file_size_kb: d.data.file_size_kb ?? null,
          requires_signature: d.data.requires_signature ?? false,
          signed: false,
        })
        await supabase.from('notifications').insert({
          project_id: proj.id,
          type: 'document',
          title: 'New document',
          body: d.data.name,
          read: false,
        })
        await supabase.from('activity_log').insert({
          project_id: proj.id,
          type: 'document',
          label: 'Document added',
          detail: d.data.name,
        })
        return NextResponse.json({ ok: true })
      }
      case 'add_notification': {
        const d = payload as Extract<N8nInboundPayload, { action: 'add_notification' }>
        const proj = await getProjectBySlug(supabase, d.project_slug)
        if (!proj) return NextResponse.json({ error: 'project not found' }, { status: 404 })
        await supabase.from('notifications').insert({
          project_id: proj.id,
          type: d.data.type,
          title: d.data.title,
          body: d.data.body,
          read: false,
        })
        return NextResponse.json({ ok: true })
      }
      case 'attach_project_document': {
        const d = payload as AttachProjectDocumentInboundPayload
        const hasSlug = 'project_slug' in d && !!d.project_slug
        const hasDeal = 'hubspot_deal_id' in d && !!d.hubspot_deal_id
        if (!hasSlug && !hasDeal) {
          return NextResponse.json({ error: 'project_slug or hubspot_deal_id required' }, { status: 400 })
        }
        const projRow = await resolveProjectForAttach(supabase, d)
        if (!projRow) return NextResponse.json({ error: 'project not found' }, { status: 404 })

        const { data: projectMeta } = await supabase
          .from('projects')
          .select('hubspot_deal_id')
          .eq('id', projRow.id)
          .maybeSingle()
        const linkedDeal = projectMeta?.hubspot_deal_id?.trim() ?? ''
        const payloadDeal = d.data.hubspot_deal_id?.trim() ?? ''
        if (!payloadDeal || linkedDeal !== payloadDeal) {
          return NextResponse.json(
            { error: 'data.hubspot_deal_id must match the portal project Linked HubSpot deal' },
            { status: 400 },
          )
        }

        const outcome = await attachProjectDocument(supabase, projRow.id, payloadDeal, d.data)
        if (!outcome.ok) {
          return NextResponse.json({ error: outcome.message }, { status: outcome.status })
        }

        await supabase.from('notifications').insert({
          project_id: projRow.id,
          type: 'document',
          title: 'New document',
          body: d.data.name,
          read: false,
        })
        await supabase.from('activity_log').insert({
          project_id: projRow.id,
          type: 'document',
          label: 'Document added',
          detail: d.data.name,
        })

        return NextResponse.json({
          ok: true,
          document_id: outcome.document_id,
          storage_path: outcome.storage_path,
        })
      }
      case 'add_invoice': {
        const d = payload as AddInvoiceInboundPayload
        const hasSlug = 'project_slug' in d && !!d.project_slug
        const hasDeal = 'hubspot_deal_id' in d && !!d.hubspot_deal_id
        if (!hasSlug && !hasDeal) {
          return NextResponse.json({ error: 'project_slug or hubspot_deal_id required' }, { status: 400 })
        }
        const proj = await resolveProjectForInvoice(supabase, d)
        if (!proj) return NextResponse.json({ error: 'project not found' }, { status: 404 })
        const outcome = await applyAddInvoice(supabase, proj.id, d.data)
        if (!outcome.ok) {
          return NextResponse.json({ error: outcome.error.message }, { status: 500 })
        }
        if (outcome.result === 'inserted') {
          await supabase.from('notifications').insert({
            project_id: proj.id,
            type: 'invoice',
            title: 'New invoice',
            body: d.data.description,
            read: false,
          })
        }
        await supabase.from('activity_log').insert({
          project_id: proj.id,
          type: 'payment',
          label: outcome.result === 'inserted' ? 'Invoice issued' : 'Invoice updated (sync)',
          detail: d.data.invoice_number,
        })
        return NextResponse.json({ ok: true, result: outcome.result })
      }
      case 'log_activity': {
        const d = payload as Extract<N8nInboundPayload, { action: 'log_activity' }>
        const proj = await getProjectBySlug(supabase, d.project_slug)
        if (!proj) return NextResponse.json({ error: 'project not found' }, { status: 404 })
        await supabase.from('activity_log').insert({
          project_id: proj.id,
          type: d.data.type,
          label: d.data.label,
          detail: d.data.detail ?? null,
        })
        return NextResponse.json({ ok: true })
      }
      case 'update_change_order': {
        const d = payload as Extract<N8nInboundPayload, { action: 'update_change_order' }>
        const slug = d.project_slug?.trim()
        if (!slug) {
          return NextResponse.json({ error: 'project_slug required' }, { status: 400 })
        }
        const allowed = new Set(['pending', 'reviewed', 'approved', 'declined', 'cancelled'])
        if (!allowed.has(d.data.status)) {
          return NextResponse.json({ error: 'invalid status' }, { status: 400 })
        }
        const coId = d.data.change_order_id?.trim()
        if (!coId) {
          return NextResponse.json({ error: 'change_order_id required' }, { status: 400 })
        }

        const { data: co } = await supabase
          .from('change_orders')
          .select('id, project_id, title, co_number')
          .eq('id', coId)
          .maybeSingle()
        if (!co) return NextResponse.json({ error: 'change order not found' }, { status: 404 })

        const { data: proj } = await supabase
          .from('projects')
          .select('id, slug')
          .eq('id', co.project_id)
          .maybeSingle()
        if (!proj || proj.slug !== slug) {
          return NextResponse.json({ error: 'change order not found' }, { status: 404 })
        }

        const rawNotes = d.data.staff_notes
        const notes =
          rawNotes === undefined || rawNotes === null || String(rawNotes).trim() === ''
            ? null
            : String(rawNotes).slice(0, 8000)

        const { error: upErr } = await supabase
          .from('change_orders')
          .update({ status: d.data.status, staff_notes: notes })
          .eq('id', coId)
          .eq('project_id', proj.id)
        if (upErr) {
          console.error('[webhook/n8n] update_change_order', upErr)
          return NextResponse.json({ error: 'update failed' }, { status: 500 })
        }

        const ref = co.co_number ?? coId.slice(0, 8)
        const statusLabel = d.data.status
        await supabase.from('activity_log').insert({
          project_id: proj.id,
          type: 'task',
          label: 'Scope change request updated',
          detail: `${ref} → ${statusLabel}`,
        })

        const { title: nTitle, body: nBody } = changeOrderStatusNotification(ref, co.title, d.data.status)
        await supabase.from('notifications').insert({
          project_id: proj.id,
          type: 'milestone',
          title: nTitle,
          body: nBody,
          read: false,
        })

        return NextResponse.json({ ok: true })
      }
      case 'link_portal_clerk_user': {
        const d = payload as Extract<N8nInboundPayload, { action: 'link_portal_clerk_user' }>
        const clerkUserId = d.data.clerk_user_id?.trim()
        if (!clerkUserId) {
          return NextResponse.json({ error: 'clerk_user_id required' }, { status: 400 })
        }
        const hs = d.data.hubspot_contact_id?.trim()
        const em = d.data.email?.trim()
        if (!hs && !em) {
          return NextResponse.json({ error: 'hubspot_contact_id or email required' }, { status: 400 })
        }
        const result = await linkPlaceholderClientToClerkUser(supabase, {
          clerkUserId: clerkUserId,
          email: em,
          hubspotContactId: hs,
        })
        let merged: MergeProvisionedClientsResult = 'noop'
        if (em && clerkUserId.startsWith('user_') && result !== 'conflict') {
          merged = await mergeProvisionedClientsByEmailIntoClerkUser(supabase, {
            clerkUserId,
            email: em,
          })
        }
        if (result === 'not_found' && merged !== 'merged') {
          return NextResponse.json({ ok: false, result }, { status: 404 })
        }
        if (result === 'conflict') {
          return NextResponse.json({ ok: false, result }, { status: 409 })
        }
        return NextResponse.json({ ok: true, result, merged })
      }
      case 'provision_client': {
        const d = payload as Extract<N8nInboundPayload, { action: 'provision_client' }>
        const slug = projectSlug
        if (!slug) return NextResponse.json({ error: 'project_slug required' }, { status: 400 })
        const data = d.data
        const existingByDeal = await findProjectByHubSpotDealId(supabase, data.hubspot_deal_id)
        if (existingByDeal) {
          return NextResponse.json({
            client_id: existingByDeal.client_id,
            project_id: existingByDeal.id,
            idempotent: true,
          })
        }

        const { data: slugRow, error: slugErr } = await supabase
          .from('projects')
          .select('id, client_id, hubspot_deal_id')
          .eq('slug', slug)
          .maybeSingle()
        if (slugErr) {
          console.error('[webhook/n8n] provision_client slug lookup', slugErr)
          return NextResponse.json({ error: 'project lookup failed' }, { status: 500 })
        }
        if (slugRow) {
          const incomingDealId = data.hubspot_deal_id?.trim()
          const existingDealId = slugRow.hubspot_deal_id?.trim()
          if (existingDealId && incomingDealId && existingDealId !== incomingDealId) {
            return NextResponse.json({ error: 'project slug already exists' }, { status: 409 })
          }
          if (!existingDealId && incomingDealId) {
            const { error: backfillErr } = await supabase
              .from('projects')
              .update({ hubspot_deal_id: incomingDealId })
              .eq('id', slugRow.id)
            if (backfillErr) {
              console.error('[webhook/n8n] provision_client deal id backfill', backfillErr)
              return NextResponse.json({ error: 'project update failed' }, { status: 500 })
            }
          }
          return NextResponse.json({
            client_id: slugRow.client_id,
            project_id: slugRow.id,
            idempotent: true,
          })
        }

        const clerkFromPayload = data.clerk_user_id?.trim()
        const clerkUserId = clerkFromPayload || `provision:hs:${data.hubspot_contact_id}`
        const engagementPhase =
          data.engagement_phase === 'qualified' ? 'qualified' : 'standard'

        let clientId: string
        let insertedNewClientForRollback = false

        if (clerkUserId.startsWith('user_')) {
          const { data: existingClient, error: exErr } = await supabase
            .from('clients')
            .select('id, hubspot_contact_id')
            .eq('clerk_user_id', clerkUserId)
            .maybeSingle()
          if (exErr) {
            console.error('[webhook/n8n] provision_client client lookup', exErr)
            return NextResponse.json({ error: 'client lookup failed' }, { status: 500 })
          }
          if (existingClient) {
            clientId = existingClient.id
            const patch: { hubspot_contact_id?: string; name?: string; phone?: string | null } = {}
            if (!existingClient.hubspot_contact_id?.trim()) {
              patch.hubspot_contact_id = data.hubspot_contact_id
            }
            if (data.name?.trim()) patch.name = data.name.trim()
            if (data.phone !== undefined) patch.phone = data.phone ?? null
            if (Object.keys(patch).length) {
              await supabase.from('clients').update(patch).eq('id', clientId)
            }
          } else {
            insertedNewClientForRollback = true
            const { data: client, error: cErr } = await supabase
              .from('clients')
              .insert({
                clerk_user_id: clerkUserId,
                name: data.name,
                email: data.email,
                phone: data.phone ?? null,
                company: null,
                hubspot_contact_id: data.hubspot_contact_id,
              })
              .select('id')
              .single()
            if (cErr || !client) {
              return NextResponse.json({ error: cErr?.message ?? 'client insert failed' }, { status: 500 })
            }
            clientId = client.id
          }
        } else {
          const { data: existingClient, error: exErr } = await supabase
            .from('clients')
            .select('id, hubspot_contact_id')
            .eq('clerk_user_id', clerkUserId)
            .maybeSingle()
          if (exErr) {
            console.error('[webhook/n8n] provision_client placeholder client lookup', exErr)
            return NextResponse.json({ error: 'client lookup failed' }, { status: 500 })
          }
          if (existingClient) {
            clientId = existingClient.id
            const patch: { hubspot_contact_id?: string; name?: string; phone?: string | null } = {}
            if (!existingClient.hubspot_contact_id?.trim()) {
              patch.hubspot_contact_id = data.hubspot_contact_id
            }
            if (data.name?.trim()) patch.name = data.name.trim()
            if (data.phone !== undefined) patch.phone = data.phone ?? null
            if (Object.keys(patch).length) {
              await supabase.from('clients').update(patch).eq('id', clientId)
            }
          } else {
            insertedNewClientForRollback = true
            const { data: client, error: cErr } = await supabase
              .from('clients')
              .insert({
                clerk_user_id: clerkUserId,
                name: data.name,
                email: data.email,
                phone: data.phone ?? null,
                company: null,
                hubspot_contact_id: data.hubspot_contact_id,
              })
              .select('id')
              .single()
            if (cErr || !client) {
              return NextResponse.json({ error: cErr?.message ?? 'client insert failed' }, { status: 500 })
            }
            clientId = client.id
          }
        }

        const { data: project, error: pErr } = await supabase
          .from('projects')
          .insert({
            client_id: clientId,
            slug,
            plan: data.plan,
            status: 'onboarding',
            progress_pct: 5,
            start_date: data.start_date,
            estimated_launch: null,
            hubspot_deal_id: data.hubspot_deal_id,
            portal_plan_slug: normalizeMaintenancePlanSlug(data.portal_plan_slug ?? null),
          })
          .select('id')
          .single()
        if (pErr || !project) {
          return NextResponse.json({ error: pErr?.message ?? 'project insert failed' }, { status: 500 })
        }

        try {
          await insertProvisionedEngagementContent(supabase, {
            projectId: project.id,
            clientId,
            plan: data.plan,
            engagementPhase,
            seedTemplateInvoices: data.seed_template_invoices !== false,
          })
        } catch (e) {
          console.error('[webhook/n8n] provision_client engagement content', e)
          await supabase.from('projects').delete().eq('id', project.id)
          if (insertedNewClientForRollback) {
            await supabase.from('clients').delete().eq('id', clientId)
          }
          return NextResponse.json({ error: 'provision engagement insert failed' }, { status: 500 })
        }

        const emailKey = normalizePortalClientEmail(data.email)
        const { data: sameEmail } = await supabase
          .from('clients')
          .select('clerk_user_id')
          .ilike('email', emailKey)
        const realClerk = sameEmail?.find((r) => r.clerk_user_id?.startsWith('user_'))?.clerk_user_id
        if (realClerk) {
          await mergeProvisionedClientsByEmailIntoClerkUser(supabase, {
            clerkUserId: realClerk,
            email: data.email,
          })
        }

        try {
          await sendWelcomeEmail(data.email, data.name)
        } catch (e) {
          console.error('[provision] welcome email', e)
        }

        return NextResponse.json({ client_id: clientId, project_id: project.id })
      }
      default:
        return NextResponse.json({ error: 'unknown action' }, { status: 400 })
    }
  } catch (e) {
    await recordIntegrationEvent({
      provider: 'n8n',
      eventType: String((payload as { action?: string }).action ?? 'unknown'),
      status: 'failed',
      payload,
      lastError: e instanceof Error ? e.message : 'n8n webhook failed',
    })
    console.error('[webhook/n8n]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function getProjectBySlug(
  supabase: ReturnType<typeof createServiceSupabase>,
  slug: string,
) {
  const { data } = await supabase.from('projects').select('id').eq('slug', slug).maybeSingle()
  return data
}

async function getProjectByHubspotDealId(
  supabase: ReturnType<typeof createServiceSupabase>,
  hubspotDealId: string,
) {
  const { data } = await supabase
    .from('projects')
    .select('id')
    .eq('hubspot_deal_id', hubspotDealId)
    .maybeSingle()
  return data
}

async function resolveProjectForInvoice(
  supabase: ReturnType<typeof createServiceSupabase>,
  d: AddInvoiceInboundPayload,
) {
  if ('project_slug' in d && d.project_slug) {
    return getProjectBySlug(supabase, d.project_slug)
  }
  if ('hubspot_deal_id' in d && d.hubspot_deal_id) {
    return getProjectByHubspotDealId(supabase, d.hubspot_deal_id)
  }
  return null
}

async function resolveProjectForAttach(
  supabase: ReturnType<typeof createServiceSupabase>,
  d: AttachProjectDocumentInboundPayload,
) {
  if ('project_slug' in d && d.project_slug) {
    return getProjectBySlug(supabase, d.project_slug)
  }
  if ('hubspot_deal_id' in d && d.hubspot_deal_id) {
    return getProjectByHubspotDealId(supabase, d.hubspot_deal_id)
  }
  return null
}

function changeOrderStatusNotification(
  ref: string,
  title: string,
  status: string,
): { title: string; body: string } {
  const short = title.length > 80 ? `${title.slice(0, 77)}…` : title
  if (status === 'approved') {
    return { title: 'Your scope change was approved', body: `${ref} — ${short}` }
  }
  if (status === 'declined') {
    return { title: 'Your scope change request was not approved', body: `${ref} — ${short}` }
  }
  if (status === 'reviewed') {
    return { title: 'We are reviewing your scope change', body: `${ref} — ${short}` }
  }
  if (status === 'cancelled') {
    return { title: 'Scope change request cancelled', body: `${ref} — ${short}` }
  }
  return { title: 'Update on your scope change request', body: `${ref} — status: ${status}` }
}
