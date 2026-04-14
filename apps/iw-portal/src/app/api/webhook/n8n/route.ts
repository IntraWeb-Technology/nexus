import { sendWelcomeEmail } from '@/lib/email/send'
import { linkPlaceholderClientToClerkUser } from '@/lib/data/link-hubspot-provisioned-clerk'
import { invoicesForPlan } from '@/lib/invoice-templates'
import { milestonesForEngagementPhase } from '@/lib/milestones-templates'
import type { AddInvoiceInboundPayload, N8nInboundPayload } from '@/lib/n8n/webhooks'
import { progressFromMilestones } from '@/lib/progress'
import { createServiceSupabase } from '@/lib/supabase/server'
import { validateIntrawebSecret } from '@/lib/webhooks/secret'
import { NextResponse } from 'next/server'

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

        await recalcMilestoneProgress(supabase, proj.id)

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
      case 'add_invoice': {
        const d = payload as AddInvoiceInboundPayload
        const hasSlug = 'project_slug' in d && !!d.project_slug
        const hasDeal = 'hubspot_deal_id' in d && !!d.hubspot_deal_id
        if (!hasSlug && !hasDeal) {
          return NextResponse.json({ error: 'project_slug or hubspot_deal_id required' }, { status: 400 })
        }
        const proj = await resolveProjectForInvoice(supabase, d)
        if (!proj) return NextResponse.json({ error: 'project not found' }, { status: 404 })
        await supabase.from('invoices').insert({
          project_id: proj.id,
          invoice_number: d.data.invoice_number,
          description: d.data.description,
          amount_cents: d.data.amount_cents,
          status: d.data.status,
          sku: d.data.sku ?? null,
          due_date: d.data.due_date ?? null,
        })
        await supabase.from('notifications').insert({
          project_id: proj.id,
          type: 'invoice',
          title: 'New invoice',
          body: d.data.description,
          read: false,
        })
        await supabase.from('activity_log').insert({
          project_id: proj.id,
          type: 'payment',
          label: 'Invoice issued',
          detail: d.data.invoice_number,
        })
        return NextResponse.json({ ok: true })
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
        if (result === 'not_found') {
          return NextResponse.json({ ok: false, result }, { status: 404 })
        }
        if (result === 'conflict') {
          return NextResponse.json({ ok: false, result }, { status: 409 })
        }
        return NextResponse.json({ ok: true, result })
      }
      case 'provision_client': {
        const d = payload as Extract<N8nInboundPayload, { action: 'provision_client' }>
        const slug = projectSlug
        if (!slug) return NextResponse.json({ error: 'project_slug required' }, { status: 400 })
        const data = d.data
        const dealId = data.hubspot_deal_id?.trim()
        if (dealId) {
          const { data: existingByDeal } = await supabase
            .from('projects')
            .select('id, client_id')
            .eq('hubspot_deal_id', dealId)
            .maybeSingle()
          if (existingByDeal) {
            return NextResponse.json({
              client_id: existingByDeal.client_id,
              project_id: existingByDeal.id,
              idempotent: true,
            })
          }
        }

        const clerkUserId =
          data.clerk_user_id ?? `provision:hs:${data.hubspot_contact_id}`

        const { data: existing } = await supabase
          .from('projects')
          .select('id')
          .eq('slug', slug)
          .maybeSingle()
        if (existing) {
          return NextResponse.json({ error: 'project slug already exists' }, { status: 409 })
        }

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

        const { data: project, error: pErr } = await supabase
          .from('projects')
          .insert({
            client_id: client.id,
            slug,
            plan: data.plan,
            status: 'onboarding',
            progress_pct: 5,
            start_date: data.start_date,
            estimated_launch: null,
            hubspot_deal_id: data.hubspot_deal_id,
          })
          .select('id')
          .single()
        if (pErr || !project) {
          return NextResponse.json({ error: pErr?.message ?? 'project insert failed' }, { status: 500 })
        }

        const engagementPhase =
          data.engagement_phase === 'qualified' ? 'qualified' : 'standard'
        const seeds = milestonesForEngagementPhase(engagementPhase, data.plan)
        const milestoneRows = seeds.map((m, i) => ({
          project_id: project.id,
          title: m.title,
          description: null as string | null,
          status: i === 0 ? ('active' as const) : ('pending' as const),
          phase: m.phase,
          completed_at: null as string | null,
          estimated_at: null as string | null,
          sort_order: m.sort_order,
        }))
        await supabase.from('milestones').insert(milestoneRows)

        const invSeeds = invoicesForPlan(data.plan)
        await supabase.from('invoices').insert(
          invSeeds.map((inv) => ({
            project_id: project.id,
            invoice_number: inv.invoice_number,
            description: inv.description,
            amount_cents: inv.amount_cents,
            status: inv.status,
            sku: inv.sku,
            due_date: null,
            paid_at: inv.status === 'paid' ? new Date().toISOString() : null,
          })),
        )

        await supabase.from('notification_preferences').insert({
          client_id: client.id,
          email_notifications: true,
          message_alerts: true,
          invoice_reminders: true,
          document_uploads: false,
        })

        try {
          await sendWelcomeEmail(data.email, data.name)
        } catch (e) {
          console.error('[provision] welcome email', e)
        }

        return NextResponse.json({ client_id: client.id, project_id: project.id })
      }
      default:
        return NextResponse.json({ error: 'unknown action' }, { status: 400 })
    }
  } catch (e) {
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

async function recalcMilestoneProgress(
  supabase: ReturnType<typeof createServiceSupabase>,
  projectId: string,
) {
  const { data: ms } = await supabase.from('milestones').select('status').eq('project_id', projectId)
  const total = ms?.length ?? 0
  const done = ms?.filter((m) => m.status === 'done').length ?? 0
  const pct = progressFromMilestones(done, total)
  await supabase.from('projects').update({ progress_pct: pct }).eq('id', projectId)
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
