import type {
  BillingKind,
  BillingPhase,
  ChangeOrderStatus,
  ExternalInvoiceSource,
  NotificationType,
  Plan,
} from '@/lib/supabase/types'
import type { EngagementPhase } from '@/lib/milestones-templates'
import type { ProposalLifecycleEventType } from '@/lib/proposals/lifecycle'

export type N8nInboundAction =
  | 'update_milestone'
  | 'update_progress'
  | 'add_message'
  | 'add_document'
  | 'add_notification'
  | 'add_invoice'
  | 'log_activity'
  | 'provision_client'
  | 'link_portal_clerk_user'
  | 'update_change_order'

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
  /**
   * HubSpot CRM `invoices` object id (string). When set, `add_invoice` **updates** the existing Supabase
   * row for that id instead of inserting, keeping one portal row in sync and deduplicating the merged
   * billing list with HubSpot-fetched invoices (`mergeBillingRows` in `src/lib/billing/types.ts`).
   */
  hubspot_invoice_id?: string
  /** ISO 8601 or parseable date-time when the invoice was marked paid (e.g. HubSpot payment date). */
  paid_at?: string
  /** Three-letter ISO currency code (lowercase in DB), e.g. `usd`. */
  currency?: string
  /** Canonical billing timeline phase for UI grouping. */
  billing_phase?: BillingPhase
  /** Explicit billing kind so recurring rows do not mix with milestone rows. */
  billing_kind?: BillingKind
  /** Fixed ordering for phase timeline cards (1..3). */
  milestone_order?: 1 | 2 | 3
  /** External source for idempotent upserts by external object id. */
  external_source?: ExternalInvoiceSource
  /** Source object id (HubSpot invoice id, Stripe invoice id, etc.). */
  external_object_id?: string
  /** Recurring service period start date (YYYY-MM-DD). */
  service_period_start?: string
  /** Recurring service period end date (YYYY-MM-DD). */
  service_period_end?: string
  /** Optional recurring group key, e.g. monthly maintenance series id. */
  maintenance_group_key?: string
}

/** Use `project_slug` **or** `hubspot_deal_id` (matches `projects.hubspot_deal_id`) to resolve the project. */
export type AddInvoiceInboundPayload =
  | { action: 'add_invoice'; project_slug: string; data: AddInvoiceData }
  | { action: 'add_invoice'; hubspot_deal_id: string; data: AddInvoiceData }

export type LogActivityData = {
  type: 'milestone' | 'payment' | 'message' | 'document' | 'task' | 'login' | 'system' | 'proposal'
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
  /**
   * If omitted, `provision:hs:<hubspot_contact_id>` is used until Clerk links.
   * When set to a real `user_…` id and that portal client already exists (e.g. auto-provision),
   * the new project is attached to that row so `hubspot_deal_id` / milestones live under the
   * signed-in user without a duplicate client.
   */
  clerk_user_id?: string
  /** When `qualified`, seeds pre-contract milestones instead of the full delivery template. */
  engagement_phase?: EngagementPhase
  /**
   * When `false`, the portal does not insert `invoicesForPlan` template rows. Use n8n `add_invoice` with
   * `amount_cents` from HubSpot (deal/line items, including discounts). When omitted or `true`, template
   * invoice seeds are inserted (legacy list-style amounts).
   */
  seed_template_invoices?: boolean
}

/**
 * After HubSpot `provision_client`, swap placeholder `clerk_user_id` for the real Clerk
 * `user_…` id (e.g. from Clerk API / invite accepted). At least one of `hubspot_contact_id`
 * or `email` should match the provisioned client row.
 */
export type LinkPortalClerkUserData = {
  clerk_user_id: string
  hubspot_contact_id?: string
  /** Strongly recommended when the HubSpot row was linked by contact id only — merges placeholder clients after auto-provision. */
  email?: string
}

/** HubSpot / n8n: set portal row status after staff approval (or decline). `project_slug` must match the change order's project. */
export type UpdateChangeOrderData = {
  change_order_id: string
  status: ChangeOrderStatus
  staff_notes?: string | null
}

/** Inbound actions that do not use `project_slug` on the envelope (HubSpot continuity helpers). */
export type N8nInboundPayloadNoSlug =
  | { action: 'link_portal_clerk_user'; data: LinkPortalClerkUserData }

export type N8nInboundPayload =
  | N8nEnvelope<'update_milestone', UpdateMilestoneData>
  | N8nEnvelope<'update_progress', UpdateProgressData>
  | N8nEnvelope<'add_message', AddMessageData>
  | N8nEnvelope<'add_document', AddDocumentData>
  | N8nEnvelope<'add_notification', AddNotificationData>
  | AddInvoiceInboundPayload
  | N8nEnvelope<'log_activity', LogActivityData>
  | N8nEnvelope<'provision_client', ProvisionClientData>
  | N8nInboundPayloadNoSlug
  | N8nEnvelope<'update_change_order', UpdateChangeOrderData>

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

/** Discount / promo summary for catalog checkouts (Payment Links). */
export interface StripeCatalogDiscountSummary {
  amount_discount_cents: number | null
  promotion_code_id: string | null
  coupon_id: string | null
}

/**
 * Fired when a catalog Payment Link (or similar) completes in Stripe and the session
 * is not a portal invoice checkout. n8n uses this to PATCH HubSpot / notify staff.
 *
 * Payment Link metadata is copied onto the session; standard keys: `sku`, `type`,
 * optional `hubspot_deal_id`, `project_slug`.
 */
export interface StripeCatalogCheckoutPayload {
  event: 'stripe_catalog_checkout_completed'
  stripe_checkout_session_id: string
  stripe_payment_intent_id: string | null
  stripe_payment_link_id: string | null
  stripe_subscription_id: string | null
  mode: 'payment' | 'subscription'
  amount_total: number | null
  currency: string | null
  customer_email: string | null
  /** Full Stripe session metadata (sku, type, hubspot_deal_id, project_slug, …). */
  metadata: Record<string, string>
  discounts?: StripeCatalogDiscountSummary | null
}

/** Stripe subscription lifecycle mirror payload (Stripe -> Supabase -> HubSpot Deal). */
export interface StripeSubscriptionSyncPayload {
  event: 'stripe_subscription_sync'
  stripe_event_id: string
  stripe_subscription_id: string
  stripe_customer_id: string | null
  status:
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'incomplete'
    | 'incomplete_expired'
  cancel_at_period_end: boolean
  current_period_start: string | null
  current_period_end: string | null
  latest_invoice_id: string | null
  currency: string | null
  amount_cents: number | null
  price_id: string | null
  product_id: string | null
  project_slug: string | null
  hubspot_deal_id: string | null
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
  client_email: string
  co_number: string
  change_order_id: string
  hubspot_deal_id: string | null
  hubspot_contact_id: string | null
  /** Time-limited signed URL to the PDF packet (e.g. 48h). */
  pdf_signed_url: string | null
  /** Plain-text summary for HubSpot deal notes / Slack. */
  summary: string
}

export interface ProposalLifecyclePayload {
  event_id: string
  event_type: ProposalLifecycleEventType | 'generated'
  proposal_id: string
  project_id: string
  project_slug: string
  client_name: string
  client_email: string
  actor_clerk_user_id: string | null
  actor_name: string
  hubspot_deal_id: string | null
  hubspot_contact_id: string | null
  occurred_at: string
  decision_version: number
  metadata: {
    status: string
    proposal_status_detail: string | null
    queue_type: 'proposal'
    drive_link: string | null
    deal_value: string | null
    note: string | null
  }
}
