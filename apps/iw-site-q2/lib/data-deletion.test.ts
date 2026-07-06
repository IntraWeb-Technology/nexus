import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  generateVerificationToken,
  hashVerificationToken,
  isRequestExpired,
  verifyVerificationToken,
} from './data-deletion'

describe('data-deletion tokens', () => {
  const prev = process.env.DATA_DELETION_SECRET

  it('generates and verifies HMAC tokens', () => {
    process.env.DATA_DELETION_SECRET = 'test-secret-for-deletion-flow'
    const requestId = '11111111-1111-1111-1111-111111111111'
    const email = 'user@example.com'
    const token = generateVerificationToken(requestId, email)
    assert.ok(verifyVerificationToken(requestId, email, token))
    assert.equal(verifyVerificationToken(requestId, 'other@example.com', token), false)
    assert.equal(hashVerificationToken(token).length, 64)
    process.env.DATA_DELETION_SECRET = prev
  })

  it('detects expired requests', () => {
    const old = new Date(Date.now() - 80 * 60 * 60 * 1000).toISOString()
    assert.equal(isRequestExpired(old), true)
    assert.equal(isRequestExpired(new Date().toISOString()), false)
  })
})
