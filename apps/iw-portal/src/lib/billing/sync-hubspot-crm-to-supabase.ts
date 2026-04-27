import type { HubSpotBillingInvoice } from '@/lib/billing/types'
import { applyAddInvoice } from '@/lib/n8n/apply-add-invoice'
import type { AddInvoiceData } from '@/lib/n8n/webhooks'
import { createServiceSupabase } from '@/lib/supabase/server'

function crmRowToAddInvoiceData(row: HubSpotBillingInvoice): AddInvoiceData {
  return {
    invoice_number: row.invoice_number,
    description: row.description,
    amount_cents: row.amount_cents,
    status: row.status,
    due_date: row.due_date ? row.due_date.slice(0, 10) : undefined,
    hubspot_invoice_id: row.hubspotId,
    ...(row.currency ? { currency: row.currency } : {}),
    ...(row.billing_phase ? { billing_phase: row.billing_phase } : {}),
    ...(row.billing_kind ? { billing_kind: row.billing_kind } : {}),
    ...(row.milestone_order ? { milestone_order: row.milestone_order } : {}),
    ...(row.external_source ? { external_source: row.external_source } : {}),
    ...(row.external_object_id ? { external_object_id: row.external_object_id } : {}),
    ...(row.service_period_start ? { service_period_start: row.service_period_start } : {}),
    ...(row.service_period_end ? { service_period_end: row.service_period_end } : {}),
    ...(row.maintenance_group_key ? { maintenance_group_key: row.maintenance_group_key } : {}),
  }
}

/**
 * Upsert HubSpot CRM invoice objects into `public.invoices` so the portal has rows for Stripe
 * and a single source of truth, even when n8n did not run. Uses service role (RLS does not
 * allow client inserts on invoices). Idempotent per `hubspot_invoice_id` via `applyAddInvoice`.
 */
export async function syncHubspotCrmInvoicesToProject(
  projectId: string,
  crmInvoices: HubSpotBillingInvoice[],
): Promise<{ processed: number; errors: number; removed: number }> {
  const supabase = createServiceSupabase()
  let processed = 0
  let errors = 0
  let removed = 0
  for (const row of crmInvoices) {
    const payload = crmRowToAddInvoiceData(row)
    const outcome = await applyAddInvoice(supabase, projectId, payload)
    if (outcome.ok) {
      processed += 1
    } else {
      errors += 1
      console.error(
        '[syncHubspotCrmInvoicesToProject]',
        projectId,
        row.hubspotId,
        outcome.error.message,
      )
    }
  }

  // Reconcile HubSpot deletions for this project:
  // if an invoice used to be mirrored from HubSpot but no longer appears in the
  // latest HubSpot fetch, remove its Supabase mirror row.
  //
  // Safety guard: only run deletion reconciliation when HubSpot returned at least
  // one invoice this cycle. This avoids deleting everything on transient fetch
  // failures that might return an empty list.
  if (crmInvoices.length > 0) {
    const currentHubspotIds = new Set(crmInvoices.map((i) => i.hubspotId))
    const { data: mirroredRows, error: mirroredErr } = await supabase
      .from('invoices')
      .select('id, hubspot_invoice_id')
      .eq('project_id', projectId)
      .not('hubspot_invoice_id', 'is', null)

    if (mirroredErr) {
      errors += 1
      console.error('[syncHubspotCrmInvoicesToProject/reconcile/list]', projectId, mirroredErr.message)
    } else {
      const staleIds = (mirroredRows ?? [])
        .filter((r) => r.hubspot_invoice_id && !currentHubspotIds.has(String(r.hubspot_invoice_id)))
        .map((r) => r.id)
      if (staleIds.length > 0) {
        const { error: delErr } = await supabase.from('invoices').delete().in('id', staleIds)
        if (delErr) {
          errors += 1
          console.error('[syncHubspotCrmInvoicesToProject/reconcile/delete]', projectId, delErr.message)
        } else {
          removed = staleIds.length
        }
      }
    }
  }

  return { processed, errors, removed }
}
