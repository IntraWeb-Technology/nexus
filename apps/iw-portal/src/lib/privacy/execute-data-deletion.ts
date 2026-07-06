import { createHash } from 'node:crypto'
import { createClerkClient } from '@clerk/backend'
import type { SupabaseClient } from '@supabase/supabase-js'
import { classifyDeletionTier, type DeletionTier } from '@/lib/privacy/classify-deletion-tier'
import {
  gdprDeleteHubSpotContact,
  resolveHubSpotContactId,
  setHubSpotEmailOptOut,
} from '@/lib/privacy/hubspot-privacy'
import { getStripe } from '@/lib/stripe/server'
import { triggerStaffAlert } from '@/lib/n8n/client'
import type {
  DataSubjectRequest,
  DataSubjectRequestStatus,
  ExecutionLogEntry,
} from '@/lib/supabase/types'
import { createServiceSupabase } from '@/lib/supabase/server'

export interface ExecuteDataDeletionResult {
  requestId: string
  email: string
  status: DataSubjectRequestStatus
  tier: DeletionTier | 'access_copy'
  executionLog: ExecutionLogEntry[]
  retentionExceptions: string[]
}

function anonymizedEmail(email: string): string {
  const hash = createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 12)
  return `deleted+${hash}@deleted.intrawebtech.com`
}

function log(
  entries: ExecutionLogEntry[],
  step: string,
  status: ExecutionLogEntry['status'],
  detail?: string,
): void {
  entries.push({ step, status, ...(detail ? { detail } : {}) })
}

async function appendRequestLog(
  supabase: SupabaseClient,
  requestId: string,
  executionLog: ExecutionLogEntry[],
  retentionExceptions: string[],
  status: DataSubjectRequestStatus,
): Promise<void> {
  await supabase
    .from('data_subject_requests')
    .update({
      execution_log: executionLog,
      retention_exceptions: retentionExceptions,
      status,
      ...(status === 'completed' || status === 'partial' || status === 'manual_review'
        ? { completed_at: new Date().toISOString() }
        : {}),
    })
    .eq('id', requestId)
}

async function deleteOsDataByEmail(
  supabase: SupabaseClient,
  email: string,
  entries: ExecutionLogEntry[],
): Promise<string[]> {
  const normalized = email.toLowerCase()
  const hubspotIds = new Set<string>()

  const { data: contacts } = await supabase
    .from('os_sheet_contacts')
    .select('id, hubspot_contact_id')
    .ilike('email', normalized)
  for (const row of contacts ?? []) {
    if (row.hubspot_contact_id) hubspotIds.add(row.hubspot_contact_id)
  }
  await supabase.from('os_sheet_contacts').delete().ilike('email', normalized)
  log(entries, 'os_sheet_contacts', 'ok')

  const { data: leads } = await supabase
    .from('os_leads')
    .select('id, hubspot_contact_id')
    .ilike('email', normalized)
  for (const row of leads ?? []) {
    if (row.hubspot_contact_id) hubspotIds.add(row.hubspot_contact_id)
  }
  await supabase.from('os_leads').delete().ilike('email', normalized)
  log(entries, 'os_leads', 'ok')

  await supabase.from('os_pre_call_intake').delete().ilike('email', normalized)
  log(entries, 'os_pre_call_intake', 'ok')

  await supabase.from('os_contracts_queue').delete().ilike('contact_email', normalized)
  log(entries, 'os_contracts_queue', 'ok')

  await supabase
    .from('os_automation_log')
    .update({ contact_name: '[redacted]', phone: '' })
    .ilike('notes', `%${normalized}%`)
  log(entries, 'os_automation_log', 'ok', 'anonymized matching notes')

  return [...hubspotIds]
}

async function deleteCrmMirrorRows(
  supabase: SupabaseClient,
  hubspotContactIds: string[],
  entries: ExecutionLogEntry[],
): Promise<void> {
  for (const id of hubspotContactIds) {
    await supabase.from('hubspot_crm_entities').delete().eq('object_type', 'contact').eq('hubspot_id', id)
  }
  log(entries, 'hubspot_crm_entities', hubspotContactIds.length ? 'ok' : 'skipped')
}

async function anonymizePortalClient(
  supabase: SupabaseClient,
  clientId: string,
  email: string,
  entries: ExecutionLogEntry[],
  retentionExceptions: string[],
): Promise<void> {
  const anonEmail = anonymizedEmail(email)

  const { data: projects } = await supabase.from('projects').select('id').eq('client_id', clientId)
  const projectIds = (projects ?? []).map((p) => p.id)

  if (projectIds.length) {
    await supabase
      .from('messages')
      .update({ sender_name: 'Deleted User', body: '[redacted]' })
      .in('project_id', projectIds)
    await supabase.from('documents').update({ name: '[redacted document]' }).in('project_id', projectIds)
    await supabase.from('invoices').update({ description: '[redacted]' }).in('project_id', projectIds)
    retentionExceptions.push('invoices: retained for legal period with redacted description')
    retentionExceptions.push('documents: metadata redacted; files may remain in storage')
    log(entries, 'portal_anonymize_children', 'ok')
  }

  await supabase.from('client_members').delete().eq('client_id', clientId)
  await supabase.from('notification_preferences').delete().eq('client_id', clientId)

  await supabase
    .from('clients')
    .update({
      name: 'Deleted User',
      email: anonEmail,
      phone: null,
      company: null,
      clerk_user_id: `deleted:${clientId}`,
    })
    .eq('id', clientId)
  retentionExceptions.push('clients: PII anonymized in place for financial record retention')
  log(entries, 'clients_anonymize', 'ok')
}

async function deleteClerkUser(clerkUserId: string, entries: ExecutionLogEntry[]): Promise<void> {
  const sk = process.env.CLERK_SECRET_KEY?.trim()
  if (!sk) {
    log(entries, 'clerk_delete', 'skipped', 'CLERK_SECRET_KEY not set')
    return
  }
  if (clerkUserId.startsWith('deleted:') || clerkUserId.startsWith('provision:')) {
    log(entries, 'clerk_delete', 'skipped', 'placeholder or already deleted')
    return
  }
  try {
    const clerk = createClerkClient({ secretKey: sk })
    await clerk.users.deleteUser(clerkUserId)
    log(entries, 'clerk_delete', 'ok')
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('not found') || msg.includes('404')) {
      log(entries, 'clerk_delete', 'skipped', 'user not found')
    } else {
      log(entries, 'clerk_delete', 'error', msg)
      throw e
    }
  }
}

async function redactStripeCustomer(
  stripeCustomerId: string | null,
  entries: ExecutionLogEntry[],
): Promise<void> {
  if (!stripeCustomerId?.trim()) {
    log(entries, 'stripe_redact', 'skipped', 'no stripe customer id')
    return
  }
  try {
    const stripe = getStripe()
    await stripe.customers.update(stripeCustomerId, {
      name: 'Deleted User',
      email: anonymizedEmail(stripeCustomerId),
      phone: undefined,
      metadata: { deleted: 'true', redacted_at: new Date().toISOString() },
    })
    log(entries, 'stripe_redact', 'ok')
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    log(entries, 'stripe_redact', 'error', msg)
    throw e
  }
}


export async function executeDataDeletion(input: {
  requestId: string
  email: string
}): Promise<ExecuteDataDeletionResult> {
  const supabase = createServiceSupabase()
  const email = input.email.trim().toLowerCase()
  const executionLog: ExecutionLogEntry[] = []
  const retentionExceptions: string[] = []

  const { data: request, error: reqErr } = await supabase
    .from('data_subject_requests')
    .select('*')
    .eq('id', input.requestId)
    .maybeSingle()

  if (reqErr || !request) {
    throw new Error('Data subject request not found')
  }

  const row = request as DataSubjectRequest

  if (row.status === 'completed' || row.status === 'partial') {
    return {
      requestId: row.id,
      email: row.email,
      status: row.status,
      tier: 'marketing_only',
      executionLog: row.execution_log,
      retentionExceptions: row.retention_exceptions,
    }
  }

  await supabase
    .from('data_subject_requests')
    .update({ status: 'processing' })
    .eq('id', input.requestId)

  if (row.request_type === 'access_copy') {
    log(executionLog, 'access_copy', 'skipped', 'manual fulfillment required')
    await appendRequestLog(supabase, input.requestId, executionLog, retentionExceptions, 'manual_review')
    triggerStaffAlert({
      project_slug: 'privacy',
      client_name: email,
      sender_name: 'Data subject request',
      message_body: `Access/copy request ${input.requestId} requires manual fulfillment.`,
    })
    return {
      requestId: input.requestId,
      email,
      status: 'manual_review',
      tier: 'access_copy',
      executionLog,
      retentionExceptions,
    }
  }

  const { data: client } = await supabase
    .from('clients')
    .select('id, clerk_user_id, hubspot_contact_id, stripe_customer_id, email')
    .ilike('email', email)
    .maybeSingle()

  const { data: projects } = client
    ? await supabase.from('projects').select('id, status').eq('client_id', client.id)
    : { data: [] }

  let openInvoiceCount = 0
  if (projects?.length) {
    const projectIds = projects.map((p) => p.id)
    const { count } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .in('status', ['pending', 'overdue'])
    openInvoiceCount = count ?? 0
  }

  let activeSubscriptionCount = 0
  if (client) {
    const { count } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', client.id)
      .in('status', ['active', 'trialing', 'past_due'])
    activeSubscriptionCount = count ?? 0
  }

  const tier = classifyDeletionTier({
    requestType: row.request_type,
    hasClient: !!client,
    projects: projects ?? [],
    openInvoiceCount,
    activeSubscriptionCount,
  })

  if (tier === 'blocked_active') {
    log(executionLog, 'preflight', 'skipped', 'active engagement or open billing')
    retentionExceptions.push('active project, open invoice, or active subscription')
    await appendRequestLog(supabase, input.requestId, executionLog, retentionExceptions, 'manual_review')
    triggerStaffAlert({
      project_slug: 'privacy',
      client_name: email,
      sender_name: 'Data subject request',
      message_body: `Deletion request ${input.requestId} blocked — active engagement or billing.`,
    })
    return {
      requestId: input.requestId,
      email,
      status: 'manual_review',
      tier,
      executionLog,
      retentionExceptions,
    }
  }

  const hubspotContactId = await resolveHubSpotContactId(
    email,
    client?.hubspot_contact_id ?? null,
  )

  try {
    if (tier === 'marketing_opt_out') {
      if (hubspotContactId) {
        await setHubSpotEmailOptOut(hubspotContactId)
        log(executionLog, 'hubspot_opt_out', 'ok')
      } else {
        log(executionLog, 'hubspot_opt_out', 'skipped', 'contact not found')
      }
      await appendRequestLog(supabase, input.requestId, executionLog, retentionExceptions, 'completed')
      return { requestId: input.requestId, email, status: 'completed', tier, executionLog, retentionExceptions }
    }

    const osHubspotIds = await deleteOsDataByEmail(supabase, email, executionLog)

    if (tier === 'portal_inactive' && client) {
      await anonymizePortalClient(supabase, client.id, email, executionLog, retentionExceptions)
      if (client.clerk_user_id) await deleteClerkUser(client.clerk_user_id, executionLog)
      await redactStripeCustomer(client.stripe_customer_id, executionLog)
    } else if (tier === 'marketing_only') {
      log(executionLog, 'portal', 'skipped', 'no client record')
    }

    const allHubspotIds = [...new Set([...(hubspotContactId ? [hubspotContactId] : []), ...osHubspotIds])]
    await deleteCrmMirrorRows(supabase, allHubspotIds, executionLog)

    if (hubspotContactId) {
      await gdprDeleteHubSpotContact(hubspotContactId)
      log(executionLog, 'hubspot_gdpr_delete', 'ok')
    } else {
      log(executionLog, 'hubspot_gdpr_delete', 'skipped', 'contact not found')
    }

    const finalStatus: DataSubjectRequestStatus =
      retentionExceptions.length > 0 && tier === 'portal_inactive' ? 'partial' : 'completed'

    await appendRequestLog(supabase, input.requestId, executionLog, retentionExceptions, finalStatus)
    return {
      requestId: input.requestId,
      email,
      status: finalStatus,
      tier,
      executionLog,
      retentionExceptions,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    log(executionLog, 'execution_error', 'error', msg)
    await appendRequestLog(supabase, input.requestId, executionLog, retentionExceptions, 'partial')
    throw e
  }
}

/** Idempotent cleanup when Clerk deletes a user before portal orchestration runs. */
export async function cleanupClientAfterClerkDeletion(clerkUserId: string): Promise<void> {
  const supabase = createServiceSupabase()
  const { data: client } = await supabase
    .from('clients')
    .select('id, email')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle()
  if (!client) return

  await supabase
    .from('clients')
    .update({
      clerk_user_id: `deleted:${client.id}`,
      name: 'Deleted User',
      email: anonymizedEmail(client.email),
      phone: null,
    })
    .eq('id', client.id)
}
