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
): Promise<{ processed: number; errors: number }> {
  if (crmInvoices.length === 0) {
    return { processed: 0, errors: 0 }
  }
  const supabase = createServiceSupabase()
  let processed = 0
  let errors = 0
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
  return { processed, errors }
}
