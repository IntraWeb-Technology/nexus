import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  canApplyReviewAction,
  isTerminalReviewStatus,
  projectedStatusForAction,
} from '@/lib/social-ops/reviews/review-lifecycle'
import { ingestEditorialDraftSchema, reviewActionSchema } from '@/lib/social-ops/schemas'
import { buildReviewCreatedChatMessage } from '@/lib/social-ops/outbox/handlers/google-chat'
import type { OutboxEventRow } from '@/lib/social-ops/types'

const validIngest = {
  command: 'ingest_editorial_draft' as const,
  workflow: {
    name: 'Content Pipeline — Editorial Calendar',
    workflow_id: 'gHdJOdGpVHf6POqo',
    execution_id: 'exec-1',
    slot_date: '2026-07-09',
  },
  canonical: {
    editorial_category: 'tech_news',
    topic: 'Topic',
    headline: 'Headline',
    body_long: 'Long',
    body_short: 'Short',
    primary_url: 'https://example.com',
    quality_score: 85,
    novelty_score: 90,
  },
  publications: [
    {
      platform: 'linkedin',
      publisher: 'postiz' as const,
      payload_snapshot: {},
      publisher_response_snapshot: {},
    },
  ],
  review: { review_scope: 'publication_group' as const, risk_level: 'medium' as const },
  idempotency_key: 'editorial:2026-07-09:primary',
}

describe('ingestEditorialDraftSchema', () => {
  it('accepts a valid ingest command', () => {
    const parsed = ingestEditorialDraftSchema.safeParse(validIngest)
    assert.equal(parsed.success, true)
  })

  it('rejects missing workflow identifiers', () => {
    const parsed = ingestEditorialDraftSchema.safeParse({
      ...validIngest,
      workflow: { ...validIngest.workflow, execution_id: '' },
    })
    assert.equal(parsed.success, false)
  })

  it('rejects empty publications', () => {
    const parsed = ingestEditorialDraftSchema.safeParse({
      ...validIngest,
      publications: [],
    })
    assert.equal(parsed.success, false)
  })
})

describe('reviewActionSchema', () => {
  it('accepts supported actions', () => {
    for (const action of ['approve', 'request_rewrite', 'skip'] as const) {
      assert.equal(reviewActionSchema.safeParse({ action }).success, true)
    }
  })
})

describe('review lifecycle', () => {
  it('allows actions only on pending reviews', () => {
    assert.equal(canApplyReviewAction('pending'), true)
    assert.equal(canApplyReviewAction('approved'), false)
  })

  it('maps actions to projected statuses', () => {
    assert.equal(projectedStatusForAction('approve'), 'approved')
    assert.equal(projectedStatusForAction('request_rewrite'), 'rewrite_requested')
    assert.equal(projectedStatusForAction('skip'), 'skipped')
  })

  it('marks terminal statuses', () => {
    assert.equal(isTerminalReviewStatus('approved'), true)
    assert.equal(isTerminalReviewStatus('pending'), false)
  })
})

describe('buildReviewCreatedChatMessage', () => {
  it('includes headline and review link', () => {
    const event = {
      id: '1',
      event_type: 'social.review.created',
      payload: {
        editorial_category: 'software_engineering',
        headline: 'Example headline',
        platforms: ['linkedin', 'bluesky'],
        risk_level: 'medium',
        review_url: 'https://portal.intrawebtech.com/admin/social-ops',
      },
      status: 'pending',
      attempts: 0,
      available_at: '',
      published_at: null,
      last_error: null,
      created_at: '',
      updated_at: '',
    } as OutboxEventRow

    const message = buildReviewCreatedChatMessage(event)
    assert.match(message, /Example headline/)
    assert.match(message, /Review in IW Portal/)
    assert.match(message, /linkedin, bluesky/i)
  })
})
