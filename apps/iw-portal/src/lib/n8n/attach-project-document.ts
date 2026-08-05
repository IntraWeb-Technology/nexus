import type { AttachProjectDocumentData } from '@/lib/n8n/webhooks'
import {
  extensionLower,
  isPortalStorageObjectPath,
  sanitizeUploadFileName,
} from '@/lib/documents/upload'
import type { SupabaseClient } from '@supabase/supabase-js'

/** Align with migration 016 bucket limit for client-uploads (25 MB). */
export const MAX_ATTACH_PROJECT_DOCUMENT_BYTES = 25 * 1024 * 1024

function stripBase64Payload(raw: string): string {
  const t = raw.trim()
  const comma = t.indexOf(',')
  if (t.startsWith('data:') && comma !== -1) return t.slice(comma + 1).trim()
  return t
}

export type AttachProjectDocumentResult =
  | { ok: true; document_id: string; storage_path: string }
  | { ok: false; message: string; status: number }

/**
 * Upload PDF bytes (or adopt existing Storage path), register documents row,
 * and link os_contracts_queue for proposal/contract delivery.
 */
export async function attachProjectDocument(
  supabase: SupabaseClient,
  projectId: string,
  hubspotDealId: string,
  data: AttachProjectDocumentData,
): Promise<AttachProjectDocumentResult> {
  const dealId = hubspotDealId.trim()
  if (!dealId) return { ok: false, message: 'hubspot_deal_id required', status: 400 }

  const name = sanitizeUploadFileName(data.name || 'proposal.pdf')
  const ext = extensionLower(name)
  if (ext !== 'pdf') {
    return { ok: false, message: 'Only PDF files are allowed for attach_project_document', status: 400 }
  }

  let storagePath: string
  let sizeKb: number | null = data.file_size_kb ?? null

  if (data.storage_path?.trim()) {
    const p = data.storage_path.trim()
    if (!isPortalStorageObjectPath(p, projectId)) {
      return { ok: false, message: 'storage_path must start with project id', status: 400 }
    }
    storagePath = p
  } else if (data.base64?.trim()) {
    const buf = Buffer.from(stripBase64Payload(data.base64), 'base64')
    if (buf.length < 16) return { ok: false, message: 'Invalid base64 payload', status: 400 }
    if (buf.length > MAX_ATTACH_PROJECT_DOCUMENT_BYTES) {
      return { ok: false, message: `File exceeds ${MAX_ATTACH_PROJECT_DOCUMENT_BYTES} bytes`, status: 400 }
    }
    storagePath = `${projectId}/deliverables/${Date.now()}-${name}`
    const { error: upErr } = await supabase.storage.from('client-uploads').upload(storagePath, buf, {
      contentType: 'application/pdf',
      upsert: true,
    })
    if (upErr) {
      console.error('[attach_project_document] storage upload', upErr)
      return { ok: false, message: upErr.message || 'Storage upload failed', status: 502 }
    }
    sizeKb = Math.max(1, Math.round(buf.length / 1024))
  } else {
    return { ok: false, message: 'base64 or storage_path required', status: 400 }
  }

  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .insert({
      project_id: projectId,
      name,
      file_url: storagePath,
      file_size_kb: sizeKb,
      requires_signature: data.requires_signature ?? false,
      signed: false,
    })
    .select('id')
    .single()

  if (docErr || !doc) {
    console.error('[attach_project_document] documents insert', docErr)
    return { ok: false, message: docErr?.message ?? 'Could not register document', status: 500 }
  }

  const now = new Date().toISOString()
  const queuePatch = {
    pdf_storage_path: storagePath,
    proposal_document_id: doc.id,
    updated_at: now,
  }

  const { data: existing } = await supabase
    .from('os_contracts_queue')
    .select('id')
    .eq('hubspot_deal_id', dealId)
    .eq('queue_type', data.queue_type)
    .maybeSingle()

  if (existing?.id) {
    const { error: upQ } = await supabase.from('os_contracts_queue').update(queuePatch).eq('id', existing.id)
    if (upQ) {
      console.error('[attach_project_document] queue update', upQ)
      return { ok: false, message: upQ.message ?? 'Could not link queue row', status: 500 }
    }
  } else {
    const { error: insQ } = await supabase.from('os_contracts_queue').insert({
      queue_type: data.queue_type,
      hubspot_deal_id: dealId,
      queue_date: now.slice(0, 10),
      client_name: data.client_name?.trim() || null,
      company: data.company?.trim() || null,
      industry: data.industry?.trim() || null,
      deal_value: data.deal_value?.trim() || null,
      tier: data.tier?.trim() || null,
      contact_email: data.contact_email?.trim() || null,
      pain_points: data.pain_points?.trim() || null,
      drive_link: data.drive_link?.trim() || null,
      status: 'Pending Review',
      ...queuePatch,
    })
    if (insQ) {
      console.error('[attach_project_document] queue insert', insQ)
      return { ok: false, message: insQ.message ?? 'Could not create queue row', status: 500 }
    }
  }

  return { ok: true, document_id: doc.id, storage_path: storagePath }
}
