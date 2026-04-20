import { invoicesForPlan } from '@/lib/invoice-templates'
import { milestonesForEngagementPhase, type EngagementPhase } from '@/lib/milestones-templates'
import type { Plan } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'

/** Milestones, catalog invoices, and notification prefs (if missing) after a `projects` row exists. */
export async function insertProvisionedEngagementContent(
  supabase: SupabaseClient,
  opts: {
    projectId: string
    clientId: string
    plan: Plan
    engagementPhase: EngagementPhase
  },
): Promise<void> {
  const seeds = milestonesForEngagementPhase(opts.engagementPhase, opts.plan)
  const milestoneRows = seeds.map((m, i) => ({
    project_id: opts.projectId,
    title: m.title,
    description: null as string | null,
    status: i === 0 ? ('active' as const) : ('pending' as const),
    phase: m.phase,
    completed_at: null as string | null,
    estimated_at: null as string | null,
    sort_order: m.sort_order,
  }))
  const { error: mErr } = await supabase.from('milestones').insert(milestoneRows)
  if (mErr) throw mErr

  const invSeeds = invoicesForPlan(opts.plan)
  const { error: invErr } = await supabase.from('invoices').insert(
    invSeeds.map((inv) => ({
      project_id: opts.projectId,
      invoice_number: inv.invoice_number,
      description: inv.description,
      amount_cents: inv.amount_cents,
      status: inv.status,
      sku: inv.sku,
      due_date: null,
      paid_at: inv.status === 'paid' ? new Date().toISOString() : null,
    })),
  )
  if (invErr) throw invErr

  const { data: pref } = await supabase
    .from('notification_preferences')
    .select('client_id')
    .eq('client_id', opts.clientId)
    .maybeSingle()
  if (!pref) {
    const { error: prefErr } = await supabase.from('notification_preferences').insert({
      client_id: opts.clientId,
      email_notifications: true,
      message_alerts: true,
      invoice_reminders: true,
      document_uploads: false,
    })
    if (prefErr) throw prefErr
  }
}
