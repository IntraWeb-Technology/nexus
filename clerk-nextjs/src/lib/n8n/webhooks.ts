import type { NotificationType, Plan } from '@/lib/supabase/types'

export type N8nInboundAction =
  | 'update_milestone'
  | 'update_progress'
  | 'add_message'
  | 'add_document'
  | 'add_notification'
  | 'add_invoice'
  | 'log_activity'
  | 'provision_client'

export interface N8nEnvelope<T extends N8nInboundAction, D> {
  action: T
  project_slug: string
  data: D
}

export type UpdateMilestoneData = {
  milestone_id: string
  status: 'done' | 'active' | 'pending'
  completed_at?: string
}

export type UpdateProgressData = { progress_pct: number }

export type AddMessageData = {
  sender_type: 'staff' | 'client'
  sender_name: string
  body: string
}

export type AddDocumentData = {
  name: string
  file_url: string
  file_size_kb?: number
  requires_signature?: boolean
}

export type AddNotificationData = {
  type: NotificationType
  title: string
  body: string
}

export type AddInvoiceData = {
  invoice_number: string
  description: string
  amount_cents: number
  status: 'paid' | 'pending' | 'overdue' | 'void'
  sku?: string
  due_date?: string
}

/** Use `project_slug` **or** `hubspot_deal_id` (matches `projects.hubspot_deal_id`) to resolve the project. */
export type AddInvoiceInboundPayload =
  | { action: 'add_invoice'; project_slug: string; data: AddInvoiceData }
  | { action: 'add_invoice'; hubspot_deal_id: string; data: AddInvoiceData }

export type LogActivityData = {
  type: 'milestone' | 'payment' | 'message' | 'document' | 'task' | 'login' | 'system'
  label: string
  detail?: string
}

export type ProvisionClientData = {
  name: string
  email: string
  phone?: string
  hubspot_contact_id: string
  hubspot_deal_id: string
  plan: Plan
  start_date: string
  /** If omitted, a unique placeholder is generated until Clerk user exists */
  clerk_user_id?: string
}

export type N8nInboundPayload =
  | N8nEnvelope<'update_milestone', UpdateMilestoneData>
  | N8nEnvelope<'update_progress', UpdateProgressData>
  | N8nEnvelope<'add_message', AddMessageData>
  | N8nEnvelope<'add_document', AddDocumentData>
  | N8nEnvelope<'add_notification', AddNotificationData>
  | AddInvoiceInboundPayload
  | N8nEnvelope<'log_activity', LogActivityData>
  | N8nEnvelope<'provision_client', ProvisionClientData>

export interface StaffAlertPayload {
  project_slug: string
  client_name: string
  message_body: string
  sender_name: string
}

export interface LoginEventPayload {
  project_slug: string
  client_name: string
  client_email: string
  occurred_at: string
}

export interface DocumentRequestPayload {
  project_slug: string
  document_name: string
  client_email: string
}

/** Fired when Stripe Checkout completes for a portal invoice (server webhook). */
export interface InvoicePaidPayload {
  project_slug: string
  invoice_number: string
  amount_cents: number
  stripe_checkout_session_id: string
}

export interface DocumentSignedPayload {
  project_slug: string
  document_name: string
  signed_by: string
  signed_at: string
}

export interface MilestoneApprovedPayload {
  project_slug: string
  milestone_title: string
  approved_by_name: string
  notes: string | null
}

export interface ChangeOrderRequestedPayload {
  project_slug: string
  title: string
  description: string
  client_name: string
}
