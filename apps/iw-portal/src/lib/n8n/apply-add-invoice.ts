import type { AddInvoiceData } from '@/lib/n8n/webhooks'
import type { Invoice, InvoiceStatus } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ApplyAddInvoiceOutcome =
  | { ok: true; result: 'inserted' }
  | { ok: true; result: 'updated'; id: string }
  | { ok: false; error: Error }

const CANONICAL_TIMELINE_COLUMNS = [
  'billing_kind',
  'billing_phase',
  'milestone_order',
  'external_source',
  'external_object_id',
  'service_period_start',
  'service_period_end',
  'maintenance_group_key',
] as const

function isMissingColumnError(message: string, column: string): boolean {
  const m = message.toLowerCase()
  const c = column.toLowerCase()
  return (
    m.includes(`column invoices.${c} does not exist`) ||
    (m.includes(`could not find the '${c}' column`) && m.includes(`'invoices'`))
  )
}

function stripCanonicalTimelineColumns(payload: Record<string, unknown>): Record<string, unknown> {
  const cloned = { ...payload }
  for (const key of CANONICAL_TIMELINE_COLUMNS) {
    delete cloned[key]
  }
  return cloned
}

function isMissingAnyCanonicalTimelineColumnError(message: string): boolean {
  return CANONICAL_TIMELINE_COLUMNS.some((col) => isMissingColumnError(message, col))
}

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
  const externalSource = data.external_source?.trim() || null
  const externalObjectId = data.external_object_id?.trim() || hsId
  const currencyNorm = data.currency?.trim().toLowerCase().replace(/[^a-z]/g, '').slice(0, 3) || null
  const paidAtIso =
    data.paid_at?.trim() && !Number.isNaN(Date.parse(data.paid_at)) ? new Date(data.paid_at).toISOString() : null
  const billingKind = data.billing_kind ?? 'project_milestone'
  const billingPhase = data.billing_phase ?? null
  const milestoneOrder = data.milestone_order ?? null
  const servicePeriodStart = data.service_period_start ?? null
  const servicePeriodEnd = data.service_period_end ?? null
  const maintenanceGroupKey = data.maintenance_group_key?.trim() || null

  const basePayload: Record<string, unknown> = {
    project_id: projectId,
    invoice_number: data.invoice_number,
    description: data.description,
    amount_cents: data.amount_cents,
    sku: data.sku ?? null,
    due_date: data.due_date ?? null,
    billing_kind: billingKind,
    billing_phase: billingPhase,
    milestone_order: milestoneOrder,
    external_source: externalSource,
    external_object_id: externalObjectId,
    service_period_start: servicePeriodStart,
    service_period_end: servicePeriodEnd,
    maintenance_group_key: maintenanceGroupKey,
  }

  if (externalSource && externalObjectId) {
    const { data: existing, error: findErr } = await supabase
      .from('invoices')
      .select('id')
      .eq('external_source', externalSource)
      .eq('external_object_id', externalObjectId)
      .maybeSingle()

    if (findErr) {
      if (!isMissingColumnError(findErr.message, 'external_source')) {
        return { ok: false, error: new Error(findErr.message) }
      }
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
      const updatePayload: Record<string, unknown> = {
        ...basePayload,
        status,
      }
      if (currencyNorm) updatePayload.currency = currencyNorm
      if (paidAtIso && status === 'paid') updatePayload.paid_at = paidAtIso

      const { error: upErr } = await supabase.from('invoices').update(updatePayload).eq('id', existing.id)
      if (!upErr) {
        return { ok: true, result: 'updated', id: existing.id }
      }
      if (!isMissingAnyCanonicalTimelineColumnError(upErr.message)) {
        return { ok: false, error: new Error(upErr.message) }
      }
      const legacyPayload = stripCanonicalTimelineColumns(updatePayload)
      const { error: legacyUpErr } = await supabase.from('invoices').update(legacyPayload).eq('id', existing.id)
      if (legacyUpErr) {
        return { ok: false, error: new Error(legacyUpErr.message) }
      }
      return { ok: true, result: 'updated', id: existing.id }
    }
  }
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
      const updatePayload: Record<string, unknown> = {
        ...basePayload,
        status,
      }
      if (currencyNorm) updatePayload.currency = currencyNorm
      if (paidAtIso && status === 'paid') updatePayload.paid_at = paidAtIso
      const { error: upErr } = await supabase.from('invoices').update(updatePayload).eq('id', existing.id)
      if (!upErr) {
        return { ok: true, result: 'updated', id: existing.id }
      }
      if (!isMissingAnyCanonicalTimelineColumnError(upErr.message)) {
        return { ok: false, error: new Error(upErr.message) }
      }
      const legacyPayload = stripCanonicalTimelineColumns(updatePayload)
      const { error: legacyUpErr } = await supabase.from('invoices').update(legacyPayload).eq('id', existing.id)
      if (legacyUpErr) {
        return { ok: false, error: new Error(legacyUpErr.message) }
      }
      return { ok: true, result: 'updated', id: existing.id }
    }
  }

  const insertPayload: Record<string, unknown> = {
    ...basePayload,
    status: data.status,
    hubspot_invoice_id: hsId,
  }
  if (currencyNorm) insertPayload.currency = currencyNorm
  if (paidAtIso && data.status === 'paid') insertPayload.paid_at = paidAtIso

  const { error: insErr } = await supabase.from('invoices').insert(insertPayload)
  if (!insErr) {
    return { ok: true, result: 'inserted' }
  }
  if (!isMissingAnyCanonicalTimelineColumnError(insErr.message)) {
    return { ok: false, error: new Error(insErr.message) }
  }
  const legacyPayload = stripCanonicalTimelineColumns(insertPayload)
  const { error: legacyInsErr } = await supabase.from('invoices').insert(legacyPayload)
  if (legacyInsErr) {
    return { ok: false, error: new Error(legacyInsErr.message) }
  }
  return { ok: true, result: 'inserted' }
}
