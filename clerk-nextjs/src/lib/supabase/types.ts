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
  created_at: string
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
