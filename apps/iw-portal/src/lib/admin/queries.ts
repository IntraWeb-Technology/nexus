import { createRlsSupabaseForUser } from '@/lib/supabase/server'
import type {
  ChangeOrderRow,
  Client,
  ClientMemberRow,
  DataHealthCheckRow,
  Document,
  FeatureFlagRow,
  IntegrationEventRow,
  InternalNoteRow,
  Invoice,
  Message,
  OsAutomationLogRow,
  OsContractsQueueRow,
  OsDealsSheetRow,
  Project,
  StaffAuditLogRow,
  StaffUser,
} from '@/lib/supabase/types'

async function adminSupabase() {
  const supabase = await createRlsSupabaseForUser()
  if (!supabase) throw new Error('Supabase RLS client unavailable')
  return supabase
}

async function countRows(table: string): Promise<number> {
  const supabase = await adminSupabase()
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
  return count ?? 0
}

async function countRowsByEq(table: string, column: string, value: string): Promise<number> {
  const supabase = await adminSupabase()
  const { count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq(column, value)
  return count ?? 0
}

export async function getAdminOverview() {
  const supabase = await adminSupabase()
  const today = new Date().toISOString()
  const [
    clients,
    projects,
    pendingChangeOrders,
    unpaidInvoices,
    recentMessages,
    failedIntegrations,
    automationEvents,
  ] = await Promise.all([
    countRows('clients'),
    countRows('projects'),
    supabase.from('change_orders').select('*', { count: 'exact', head: true }).in('status', ['pending', 'reviewed']),
    supabase.from('invoices').select('*', { count: 'exact', head: true }).in('status', ['pending', 'overdue']),
    supabase
      .from('messages')
      .select('*')
      .eq('sender_type', 'client')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('integration_events')
      .select('*')
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('os_automation_log')
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(6),
  ])

  return {
    generatedAt: today,
    counts: {
      clients,
      projects,
      pendingChangeOrders: pendingChangeOrders.count ?? 0,
      unpaidInvoices: unpaidInvoices.count ?? 0,
      failedIntegrations: (failedIntegrations.data ?? []).length,
    },
    recentMessages: (recentMessages.data ?? []) as Message[],
    failedIntegrations: (failedIntegrations.data ?? []) as IntegrationEventRow[],
    automationEvents: (automationEvents.data ?? []) as OsAutomationLogRow[],
  }
}

export async function getAdminClients() {
  const supabase = await adminSupabase()
  const { data } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  const clients = (data ?? []) as Client[]
  const projectCounts = await Promise.all(
    clients.map(async (client) => ({
      clientId: client.id,
      count: await countRowsByEq('projects', 'client_id', client.id),
    })),
  )
  return { clients, projectCounts }
}

export async function getClient360(clientId: string) {
  const supabase = await adminSupabase()
  const [
    client,
    members,
    projects,
    notes,
    audit,
    health,
  ] = await Promise.all([
    supabase.from('clients').select('*').eq('id', clientId).maybeSingle(),
    supabase.from('client_members').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
    supabase.from('projects').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
    supabase.from('client_internal_notes').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
    supabase
      .from('staff_audit_log')
      .select('*')
      .eq('resource_type', 'client')
      .eq('resource_id', clientId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('data_health_checks')
      .select('*')
      .eq('resource_type', 'client')
      .eq('resource_id', clientId)
      .is('resolved_at', null)
      .order('created_at', { ascending: false }),
  ])

  const projectRows = (projects.data ?? []) as Project[]
  const projectIds = projectRows.map((p) => p.id)
  const [messages, invoices, documents] = await Promise.all([
    projectIds.length
      ? supabase.from('messages').select('*').in('project_id', projectIds).order('created_at', { ascending: false }).limit(20)
      : Promise.resolve({ data: [] }),
    projectIds.length
      ? supabase.from('invoices').select('*').in('project_id', projectIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    projectIds.length
      ? supabase.from('documents').select('*').in('project_id', projectIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  return {
    client: client.data as Client | null,
    members: (members.data ?? []) as ClientMemberRow[],
    projects: projectRows,
    notes: (notes.data ?? []) as InternalNoteRow[],
    audit: (audit.data ?? []) as StaffAuditLogRow[],
    health: (health.data ?? []) as DataHealthCheckRow[],
    messages: (messages.data ?? []) as Message[],
    invoices: (invoices.data ?? []) as Invoice[],
    documents: (documents.data ?? []) as Document[],
  }
}

export async function getAdminProjects() {
  const supabase = await adminSupabase()
  const { data } = await supabase
    .from('projects')
    .select('*, clients(name, email, company)')
    .order('created_at', { ascending: false })
  return (data ?? []) as Array<Project & { clients?: Pick<Client, 'name' | 'email' | 'company'> }>
}

export async function getOperationsQueue() {
  const supabase = await adminSupabase()
  const [projects, approvals, changeOrders] = await Promise.all([
    supabase
      .from('projects')
      .select('*, clients(name, email)')
      .or('hubspot_deal_id.is.null,estimated_launch.lt.' + new Date().toISOString().slice(0, 10))
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('milestone_approvals').select('*').order('created_at', { ascending: false }).limit(25),
    supabase.from('change_orders').select('*').in('status', ['pending', 'reviewed']).order('created_at', { ascending: false }),
  ])
  return {
    projects: (projects.data ?? []) as Array<Project & { clients?: Pick<Client, 'name' | 'email'> }>,
    approvals: approvals.data ?? [],
    changeOrders: (changeOrders.data ?? []) as ChangeOrderRow[],
  }
}

export async function getMessageTriage() {
  const supabase = await adminSupabase()
  const { data } = await supabase
    .from('messages')
    .select('*, projects(slug, clients(name, email))')
    .eq('sender_type', 'client')
    .order('created_at', { ascending: false })
    .limit(100)
  return (data ?? []) as Array<Message & { projects?: Project & { clients?: Pick<Client, 'name' | 'email'> } }>
}

export async function getAdminChangeOrders() {
  const supabase = await adminSupabase()
  const { data } = await supabase
    .from('change_orders')
    .select('*, projects(slug, clients(name, email))')
    .order('created_at', { ascending: false })
  return (data ?? []) as Array<ChangeOrderRow & { projects?: Project & { clients?: Pick<Client, 'name' | 'email'> } }>
}

export async function getBillingReconciliation() {
  const supabase = await adminSupabase()
  const { data } = await supabase
    .from('invoices')
    .select('*, projects(slug, hubspot_deal_id, clients(name, stripe_customer_id))')
    .order('created_at', { ascending: false })
  return (data ?? []) as Array<Invoice & { projects?: Project & { clients?: Pick<Client, 'name' | 'stripe_customer_id'> } }>
}

export async function getOsCommandCenter() {
  const supabase = await adminSupabase()
  const [automation, deals, queue, revenue] = await Promise.all([
    supabase.from('os_automation_log').select('*').order('logged_at', { ascending: false }).limit(50),
    supabase.from('os_deals_sheet').select('*').order('updated_at', { ascending: false }).limit(50),
    supabase.from('os_contracts_queue').select('*').order('updated_at', { ascending: false }).limit(50),
    supabase.from('os_revenue_monthly').select('*').order('month_key', { ascending: false }).limit(12),
  ])
  return {
    automation: (automation.data ?? []) as OsAutomationLogRow[],
    deals: (deals.data ?? []) as OsDealsSheetRow[],
    queue: (queue.data ?? []) as OsContractsQueueRow[],
    revenue: revenue.data ?? [],
  }
}

export async function getDataHealth() {
  const supabase = await adminSupabase()
  const [persisted, clientsMissingClerk, projectsMissingHubspot, invoicesMissingRefs] = await Promise.all([
    supabase.from('data_health_checks').select('*').is('resolved_at', null).order('created_at', { ascending: false }),
    supabase.from('clients').select('*').or('clerk_user_id.is.null,clerk_user_id.eq.'),
    supabase.from('projects').select('*').or('hubspot_deal_id.is.null,hubspot_deal_id.eq.'),
    supabase.from('invoices').select('*').or('stripe_checkout_session_id.is.null,hubspot_invoice_id.is.null'),
  ])
  return {
    persisted: (persisted.data ?? []) as DataHealthCheckRow[],
    clientsMissingClerk: (clientsMissingClerk.data ?? []) as Client[],
    projectsMissingHubspot: (projectsMissingHubspot.data ?? []) as Project[],
    invoicesMissingRefs: (invoicesMissingRefs.data ?? []) as Invoice[],
  }
}

export async function getIntegrationEvents() {
  const supabase = await adminSupabase()
  const { data } = await supabase
    .from('integration_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  return (data ?? []) as IntegrationEventRow[]
}

export async function getAdminSettings() {
  const supabase = await adminSupabase()
  const [staff, flags] = await Promise.all([
    supabase.from('staff_users').select('*').order('created_at', { ascending: false }),
    supabase.from('feature_flags').select('*').order('flag_key', { ascending: true }),
  ])
  return {
    staff: (staff.data ?? []) as StaffUser[],
    flags: (flags.data ?? []) as FeatureFlagRow[],
  }
}
