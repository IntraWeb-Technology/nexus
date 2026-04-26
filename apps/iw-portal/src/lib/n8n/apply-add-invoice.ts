import type { AddInvoiceData } from '@/lib/n8n/webhooks'
import type { Invoice, InvoiceStatus } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ApplyAddInvoiceOutcome =
  | { ok: true; result: 'inserted' }
  | { ok: true; result: 'updated'; id: string }
  | { ok: false; error: Error }

/**
 * Create or update a single `invoices` row. When `hubspot_invoice_id` is set, match on that id
 * (global unique) and update; otherwise insert a new row.
 */
export async function applyAddInvoice(
  supabase: SupabaseClient,
  projectId: string,
  data: AddInvoiceData,
): Promise<ApplyAddInvoiceOutcome> {
  const hsId = data.hubspot_invoice_id?.trim() || null

  if (hsId) {
    const { data: existing, error: findErr } = await supabase
      .from('invoices')
      .select('id')
      .eq('hubspot_invoice_id', hsId)
      .maybeSingle()

    if (findErr) {
      return { ok: false, error: new Error(findErr.message) }
    }

    if (existing?.id) {
      const { data: current } = await supabase
        .from('invoices')
        .select('status')
        .eq('id', existing.id)
        .maybeSingle()
      const currentRow = current as Pick<Invoice, 'status'> | null
      const status: InvoiceStatus =
        currentRow?.status === 'paid' && data.status !== 'void' ? 'paid' : data.status
      const { error: upErr } = await supabase
        .from('invoices')
        .update({
          project_id: projectId,
          invoice_number: data.invoice_number,
          description: data.description,
          amount_cents: data.amount_cents,
          status,
          sku: data.sku ?? null,
          due_date: data.due_date ?? null,
        })
        .eq('id', existing.id)

      if (upErr) {
        return { ok: false, error: new Error(upErr.message) }
      }
      return { ok: true, result: 'updated', id: existing.id }
    }
  }

  const { error: insErr } = await supabase.from('invoices').insert({
    project_id: projectId,
    invoice_number: data.invoice_number,
    description: data.description,
    amount_cents: data.amount_cents,
    status: data.status,
    sku: data.sku ?? null,
    due_date: data.due_date ?? null,
    hubspot_invoice_id: hsId,
  })

  if (insErr) {
    return { ok: false, error: new Error(insErr.message) }
  }
  return { ok: true, result: 'inserted' }
}
