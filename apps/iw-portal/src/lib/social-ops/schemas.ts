import { z } from 'zod'

const publicationSchema = z.object({
  platform: z.string().min(1),
  publisher: z.literal('postiz').default('postiz'),
  postiz_batch_id: z.string().nullable().optional(),
  postiz_post_id: z.string().nullable().optional(),
  postiz_integration_id: z.string().nullable().optional(),
  payload_snapshot: z.record(z.string(), z.unknown()).default({}),
  publisher_response_snapshot: z.record(z.string(), z.unknown()).default({}),
})

export const ingestEditorialDraftSchema = z.object({
  command: z.literal('ingest_editorial_draft'),
  workflow: z.object({
    name: z.string().min(1),
    workflow_id: z.string().min(1),
    execution_id: z.string().min(1),
    slot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  canonical: z.object({
    editorial_category: z.string().min(1),
    topic: z.string(),
    headline: z.string(),
    body_long: z.string(),
    body_short: z.string(),
    primary_url: z.string().url().nullable().optional(),
    quality_score: z.number().nullable().optional(),
    novelty_score: z.number().nullable().optional(),
  }),
  publications: z.array(publicationSchema).min(1),
  review: z
    .object({
      review_scope: z.enum(['publication_group', 'individual_publication', 'canonical_content']).default(
        'publication_group',
      ),
      risk_level: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    })
    .default({ review_scope: 'publication_group', risk_level: 'medium' }),
  idempotency_key: z.string().min(1),
})

export type IngestEditorialDraftCommand = z.infer<typeof ingestEditorialDraftSchema>

export const reviewActionSchema = z.object({
  action: z.enum(['approve', 'request_rewrite', 'skip']),
  note: z.string().max(4000).optional(),
})

export type ReviewActionCommand = z.infer<typeof reviewActionSchema>

export const ingestResultSchema = z.object({
  canonical_content_id: z.string().uuid(),
  platform_publication_ids: z.array(z.string().uuid()),
  review_item_id: z.string().uuid(),
  outbox_event_id: z.string().uuid().nullable(),
  idempotent_replay: z.boolean(),
})

export const applyReviewResultSchema = z.object({
  review_item_id: z.string().uuid(),
  status: z.enum(['approved', 'rewrite_requested', 'skipped']),
  review_action_id: z.string().uuid(),
  outbox_event_id: z.string().uuid(),
})
