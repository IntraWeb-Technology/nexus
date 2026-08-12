export type EditorialCategory =
  | 'tech_news'
  | 'software_engineering'
  | 'ai_automation'
  | 'engineering_deep_dive'
  | 'weekly_roundup'
  | 'career_productivity'
  | 'evergreen'
  | string

export type PublicationStatus =
  | 'draft'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'failed'
  | 'skipped'

export type ReviewScope = 'publication_group' | 'individual_publication' | 'canonical_content'

export type ReviewItemStatus =
  | 'pending'
  | 'approved'
  | 'rewrite_requested'
  | 'skipped'
  | 'failed'

export type ReviewRiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type ReviewActionType = 'approve' | 'request_rewrite' | 'skip'

export type OutboxEventType =
  | 'social.review.created'
  | 'social.review.completed'
  | 'social.workflow.failed'

export type OutboxEventStatus = 'pending' | 'published' | 'failed'

export interface CanonicalContentRow {
  id: string
  editorial_category: string
  topic: string
  headline: string
  body_long: string
  body_short: string
  primary_url: string | null
  quality_score: number | null
  novelty_score: number | null
  source_system: 'n8n'
  source_workflow_id: string
  source_execution_id: string
  correlation_id: string | null
  idempotency_key: string
  created_at: string
  updated_at: string
}

export interface PlatformPublicationRow {
  id: string
  canonical_content_id: string
  platform: string
  publisher: 'postiz'
  postiz_batch_id: string | null
  postiz_post_id: string | null
  postiz_integration_id: string | null
  external_publication_id: string | null
  status: PublicationStatus
  payload_snapshot: Record<string, unknown>
  publisher_response_snapshot: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ReviewItemRow {
  id: string
  canonical_content_id: string
  review_scope: ReviewScope
  status: ReviewItemStatus
  risk_level: ReviewRiskLevel
  created_at: string
  resolved_at: string | null
}

export interface ReviewActionRow {
  id: string
  review_item_id: string
  action: ReviewActionType
  note: string | null
  actor_staff_id: string | null
  created_at: string
}

export interface OutboxEventRow {
  id: string
  event_type: OutboxEventType
  payload: Record<string, unknown>
  status: OutboxEventStatus
  attempts: number
  available_at: string
  published_at: string | null
  last_error: string | null
  created_at: string
  updated_at: string
}

export interface IngestEditorialDraftResult {
  canonical_content_id: string
  platform_publication_ids: string[]
  review_item_id: string
  outbox_event_id: string
  idempotent_replay: boolean
}

export interface ApplyReviewActionResult {
  review_item_id: string
  status: ReviewItemStatus
  review_action_id: string
  outbox_event_id: string
}

export interface ReviewBundle {
  review: ReviewItemRow
  canonical: CanonicalContentRow
  publications: PlatformPublicationRow[]
  actions: ReviewActionRow[]
}

export const EDITORIAL_CATEGORY_LABELS: Record<string, string> = {
  tech_news: 'Technology news',
  software_engineering: 'Software engineering',
  ai_automation: 'AI and automation',
  engineering_deep_dive: 'Engineering deep dive',
  weekly_roundup: 'Weekly roundup',
  career_productivity: 'Career and productivity',
  evergreen: 'Evergreen',
}

export function editorialCategoryLabel(category: string): string {
  return EDITORIAL_CATEGORY_LABELS[category] ?? category.replace(/_/g, ' ')
}

export function portalReviewUrl(reviewItemId?: string): string {
  const base =
    process.env.NEXT_PUBLIC_PORTAL_URL?.replace(/\/$/, '') ||
    process.env.VERCEL_URL?.replace(/\/$/, '') ||
    'https://portal.intrawebtech.com'
  const origin = base.startsWith('http') ? base : `https://${base}`
  return reviewItemId
    ? `${origin}/admin/social-ops?review=${reviewItemId}`
    : `${origin}/admin/social-ops`
}

export function postizBaseUrl(): string | null {
  const raw = process.env.POSTIZ_BASE_URL?.trim()
  return raw ? raw.replace(/\/$/, '') : null
}
