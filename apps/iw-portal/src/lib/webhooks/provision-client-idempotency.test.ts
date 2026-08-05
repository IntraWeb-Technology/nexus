import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { findProjectByHubSpotDealId } from './provision-client-idempotency'

describe('findProjectByHubSpotDealId', () => {
  it('returns null when deal id is missing or whitespace', async () => {
    const neverCalled = {
      from: () => {
        throw new Error('from() should not run')
      },
    } as unknown as SupabaseClient
    assert.equal(await findProjectByHubSpotDealId(neverCalled, null), null)
    assert.equal(await findProjectByHubSpotDealId(neverCalled, ''), null)
    assert.equal(await findProjectByHubSpotDealId(neverCalled, '   '), null)
  })

  it('returns project + client ids when Supabase finds a row', async () => {
    const supabase = {
      from() {
        return {
          select() {
            return this
          },
          eq() {
            return this
          },
          async maybeSingle() {
            return { data: { id: 'proj-1', client_id: 'client-9' }, error: null }
          },
        }
      },
    } as unknown as SupabaseClient

    const row = await findProjectByHubSpotDealId(supabase, '987654321')
    assert.deepEqual(row, { id: 'proj-1', client_id: 'client-9' })
  })

  it('returns null on Supabase error', async () => {
    const supabase = {
      from() {
        return {
          select() {
            return this
          },
          eq() {
            return this
          },
          async maybeSingle() {
            return { data: null, error: { message: 'boom' } }
          },
        }
      },
    } as unknown as SupabaseClient

    assert.equal(await findProjectByHubSpotDealId(supabase, '1'), null)
  })
})
