import { buildChangeOrderDescription, parseChangeOrderPayload } from '@/lib/change-order/schema'
import { renderChangeOrderPdf } from '@/lib/change-order/pdf'
import { getPortalBundle } from '@/lib/data/portal'
import { submitChangeOrderHubSpotForm } from '@/lib/hubspot/forms'
import { triggerChangeOrderRequested } from '@/lib/n8n/client'
import { createServiceSupabase, createServerSupabaseForUser } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

function generateCoNumber(projectSlug: string): string {
  const safe = projectSlug
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'project'
  return `CO-${safe}-${randomBytes(3).toString('hex').toUpperCase()}`
}

function changeOrderSummary(payload: import('@/lib/change-order/schema').ChangeOrderPayloadInput): string {
  return [
    payload.title,
    `SOW ref: ${payload.masterAgreementReference}`,
    `Effective: ${payload.proposedEffectiveDate} · Cost: ${payload.costImpactType}`,
    `Signer: ${payload.authorizedSignerName} (${payload.authorizedSignerTitle})`,
  ].join('\n')
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bundle = await getPortalBundle()
  if (!bundle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = parseChangeOrderPayload(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }
  const payload = parsed.data
  const title = payload.title
  const description = buildChangeOrderDescription(payload)
  const coNumber = generateCoNumber(bundle.project.slug)

  let supabaseService: ReturnType<typeof createServiceSupabase>
  try {
    supabaseService = createServiceSupabase()
  } catch {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  const { data: row, error: insertErr } = await supabaseService
    .from('change_orders')
    .insert({
      project_id: bundle.project.id,
      co_number: coNumber,
      title,
      description,
      payload: payload as unknown as Record<string, unknown>,
      hubspot_sync_status: 'pending',
    })
    .select('*')
    .single()

  if (insertErr || !row) {
    console.error('[change-orders] insert', insertErr)
    return NextResponse.json({ error: 'Could not submit request' }, { status: 500 })
  }

  const rowId = row.id as string
  const storagePath = `${bundle.project.id}/${rowId}.pdf`
  const submittedAtIso = new Date().toISOString()
  let pdfPath: string | null = null

  try {
    const pdfBuf = await renderChangeOrderPdf({
      coNumber,
      projectName: bundle.project.slug,
      clientName: bundle.client.name,
      clientEmail: bundle.client.email,
      submittedAtIso,
      payload,
    })
    const { error: upErr } = await supabaseService.storage
      .from('change-order-packets')
      .upload(storagePath, pdfBuf, { contentType: 'application/pdf', upsert: true })
    if (upErr) throw upErr
    await supabaseService.from('change_orders').update({ pdf_storage_path: storagePath }).eq('id', rowId)
    pdfPath = storagePath
  } catch (e) {
    console.error('[change-orders] pdf/storage', e)
  }

  const portalRef = `${bundle.project.slug} · ${rowId}`
  const hsResult = await submitChangeOrderHubSpotForm({
    email: bundle.client.email,
    portalReference: portalRef,
    payload,
  })

  if (hsResult.ok) {
    const sid =
      hsResult.body &&
      typeof hsResult.body === 'object' &&
      hsResult.body !== null &&
      'submissionId' in hsResult.body
        ? String((hsResult.body as { submissionId?: string }).submissionId ?? '')
        : ''
    await supabaseService
      .from('change_orders')
      .update({
        hubspot_sync_status: 'synced',
        hubspot_sync_error: null,
        ...(sid ? { hubspot_submission_id: sid } : {}),
      })
      .eq('id', rowId)
  } else if (hsResult.error.includes('not configured')) {
    await supabaseService
      .from('change_orders')
      .update({ hubspot_sync_status: 'skipped', hubspot_sync_error: hsResult.error })
      .eq('id', rowId)
  } else {
    await supabaseService
      .from('change_orders')
      .update({
        hubspot_sync_status: 'error',
        hubspot_sync_error: hsResult.error,
      })
      .eq('id', rowId)
  }

  let pdfSignedUrl: string | null = null
  if (pdfPath) {
    const { data: signed } = await supabaseService.storage
      .from('change-order-packets')
      .createSignedUrl(pdfPath, 172800)
    pdfSignedUrl = signed?.signedUrl ?? null
  }

  const userSb = await createServerSupabaseForUser()
  if (userSb) {
    await userSb.from('activity_log').insert({
      project_id: bundle.project.id,
      type: 'task',
      label: 'Scope change request submitted',
      detail: `${coNumber}: ${title}`,
    })

    await userSb.from('notifications').insert({
      project_id: bundle.project.id,
      type: 'action_required',
      title: 'We received your scope change request',
      body: `${coNumber} — ${title}`,
      read: false,
    })
  }

  triggerChangeOrderRequested({
    project_slug: bundle.project.slug,
    title,
    description,
    client_name: bundle.client.name,
    client_email: bundle.client.email,
    co_number: coNumber,
    change_order_id: rowId,
    hubspot_deal_id: bundle.project.hubspot_deal_id,
    hubspot_contact_id: bundle.client.hubspot_contact_id,
    pdf_signed_url: pdfSignedUrl,
    summary: changeOrderSummary(payload),
  })

  const { data: fresh } = await supabaseService.from('change_orders').select('*').eq('id', rowId).single()

  return NextResponse.json({ change_order: fresh ?? row }, { status: 201 })
}
