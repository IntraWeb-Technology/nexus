export type Plan = 'starter' | 'growth' | 'custom'
export type ProjectStatus =
  | 'onboarding'
  | 'build'
  | 'qa'
  | 'launch'
  | 'retainer'
  | 'paused'
export type MilestoneStatus = 'done' | 'active' | 'pending'
export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'void'
export type SenderType = 'staff' | 'client'
export type NotificationType =
  | 'action_required'
  | 'message'
  | 'milestone'
  | 'document'
  | 'invoice'

export interface Client {
  id: string
  clerk_user_id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  hubspot_contact_id: string | null
  stripe_customer_id: string | null
  created_at: string
}

export interface Project {
  id: string
  client_id: string
  slug: string
  plan: Plan
  status: ProjectStatus
  progress_pct: number
  start_date: string | null
  estimated_launch: string | null
  hubspot_deal_id: string | null
  created_at: string
}

export interface Milestone {
  id: string
  project_id: string
  title: string
  description: string | null
  status: MilestoneStatus
  phase: string
  completed_at: string | null
  estimated_at: string | null
  sort_order: number
  created_at: string
}

export interface Message {
  id: string
  project_id: string
  sender_type: SenderType
  sender_name: string
  body: string
  read: boolean
  created_at: string
}

export interface Document {
  id: string
  project_id: string
  name: string
  file_url: string
  file_size_kb: number | null
  requires_signature: boolean
  signed: boolean
  signed_at: string | null
  signed_by: string | null
  created_at: string
}

export interface MilestoneApproval {
  id: string
  milestone_id: string
  project_id: string
  approved_by_name: string
  approved_at: string
  notes: string | null
  created_at: string
}

export type ChangeOrderStatus = 'pending' | 'reviewed' | 'approved' | 'declined' | 'cancelled'

/** Canonical contractual payload (matches zod schema in change-order/schema). */
export type ChangeOrderPayloadJSON = Record<string, unknown>

export interface ChangeOrderRow {
  id: string
  project_id: string
  /** Present after DB migration `006_change_order_contract.sql`. */
  co_number?: string | null
  title: string
  description: string
  payload?: ChangeOrderPayloadJSON | null
  requested_at: string
  status: ChangeOrderStatus
  staff_notes: string | null
  created_at: string
  pdf_storage_path?: string | null
  hubspot_submission_id?: string | null
  hubspot_sync_status?: string | null
  hubspot_sync_error?: string | null
}

export interface Invoice {
  id: string
  project_id: string
  invoice_number: string
  description: string
  amount_cents: number
  status: InvoiceStatus
  sku: string | null
  due_date: string | null
  paid_at: string | null
  created_at: string
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  /** Defaults to `usd` in DB after migration `003_stripe_columns`. */
  currency?: string
  /** When set, matches HubSpot CRM invoice id — used to dedupe merged billing view. */
  hubspot_invoice_id?: string | null
}

export interface ActivityLogRow {
  id: string
  project_id: string
  type: string
  label: string
  detail: string | null
  created_at: string
}

export interface NotificationRow {
  id: string
  project_id: string
  type: string
  title: string
  body: string
  read: boolean
  created_at: string
}

export interface NotificationPreferences {
  id: string
  client_id: string
  email_notifications: boolean
  message_alerts: boolean
  invoice_reminders: boolean
  document_uploads: boolean
  created_at: string
}

/** Operational store (Supabase `public.os_*`) — n8n + internal APIs; not client RLS tables. */
export interface OsAutomationLogRow {
  id: string
  logged_at: string
  workflow_name: string
  contact_name: string
  phone: string
  event_type: string
  status: string
  notes: string
  hubspot_deal_id: string | null
  hubspot_contact_id: string | null
}

export interface OsDealsSheetRow {
  id: string
  hubspot_deal_id: string | null
  deal_name: string | null
  company: string | null
  industry: string | null
  tier: string | null
  lead_score: string | null
  hubspot_contact_id: string | null
  hubspot_company_id: string | null
  sheet_timestamp: string | null
  created_at: string
  updated_at: string
}

export interface OsLeadRow {
  id: string
  source_kind: string
  occurred_at: string
  name: string | null
  company: string | null
  industry: string | null
  source: string | null
  lead_score: number | null
  status: string | null
  place_id: string | null
  website: string | null
  email: string | null
  phone: string | null
  address: string | null
  hubspot_contact_id: string | null
  hubspot_deal_id: string | null
}

export interface OsContractsQueueRow {
  id: string
  queue_type: 'contract' | 'proposal'
  hubspot_deal_id: string | null
  queue_date: string | null
  client_name: string | null
  company: string | null
  industry: string | null
  deal_value: string | null
  tier: string | null
  contact_email: string | null
  pain_points: string | null
  drive_link: string | null
  status: string
  proposal_status_detail: string | null
  created_at: string
  updated_at: string
}

export interface OsClientSuccessClientRow {
  id: string
  hubspot_deal_id: string | null
  client_name: string
  tier: string | null
  mrr: string | null
  start_date: string | null
  last_activity: string | null
  health_score: string | null
  updated_at: string
}

export interface OsPreCallIntakeRow {
  id: string
  email: string
  payload: Record<string, unknown>
  submitted_at: string
}
