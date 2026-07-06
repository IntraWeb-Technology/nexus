import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { classifyDeletionTier } from './classify-deletion-tier'

describe('classifyDeletionTier', () => {
  it('returns marketing_opt_out for opt-out request type', () => {
    assert.equal(
      classifyDeletionTier({
        requestType: 'marketing_opt_out',
        hasClient: true,
        projects: [{ status: 'build' }],
        openInvoiceCount: 5,
        activeSubscriptionCount: 1,
      }),
      'marketing_opt_out',
    )
  })

  it('returns marketing_only when no portal client exists', () => {
    assert.equal(
      classifyDeletionTier({
        requestType: 'delete_personal_data',
        hasClient: false,
        projects: [],
        openInvoiceCount: 0,
        activeSubscriptionCount: 0,
      }),
      'marketing_only',
    )
  })

  it('returns blocked_active for open invoices', () => {
    assert.equal(
      classifyDeletionTier({
        requestType: 'delete_personal_data',
        hasClient: true,
        projects: [{ status: 'launch' }],
        openInvoiceCount: 1,
        activeSubscriptionCount: 0,
      }),
      'blocked_active',
    )
  })

  it('returns blocked_active for active project phases', () => {
    assert.equal(
      classifyDeletionTier({
        requestType: 'delete_personal_data',
        hasClient: true,
        projects: [{ status: 'qa' }],
        openInvoiceCount: 0,
        activeSubscriptionCount: 0,
      }),
      'blocked_active',
    )
  })

  it('returns portal_inactive for completed engagements', () => {
    assert.equal(
      classifyDeletionTier({
        requestType: 'delete_personal_data',
        hasClient: true,
        projects: [{ status: 'retainer' }],
        openInvoiceCount: 0,
        activeSubscriptionCount: 0,
      }),
      'portal_inactive',
    )
  })
})
