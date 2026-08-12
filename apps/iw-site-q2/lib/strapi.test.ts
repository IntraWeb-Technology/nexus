import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getStrapiClient, isStrapiContentEnabled } from './strapi'

describe('getStrapiClient', () => {
  it('returns null when STRAPI_URL is unset', () => {
    const client = getStrapiClient({
      STRAPI_URL: '',
      STRAPI_API_TOKEN: 'token',
      STRAPI_CONTENT_ENABLED: 'true',
    })
    assert.equal(client, null)
  })

  it('returns null when STRAPI_CONTENT_ENABLED is false', () => {
    const client = getStrapiClient({
      STRAPI_URL: 'http://127.0.0.1:1337',
      STRAPI_API_TOKEN: 'token',
      STRAPI_CONTENT_ENABLED: 'false',
    })
    assert.equal(client, null)
  })

  it('builds a client when STRAPI_URL is set', () => {
    const client = getStrapiClient({
      STRAPI_URL: 'http://127.0.0.1:1337',
      STRAPI_API_TOKEN: 'test-token',
      STRAPI_CONTENT_ENABLED: 'true',
    })
    assert.ok(client)
    assert.equal(typeof client.getNavigation, 'function')
    assert.equal(typeof client.getFaqItems, 'function')
    assert.equal(typeof client.getServices, 'function')
  })

  it('builds a client with URL only (token optional)', () => {
    const client = getStrapiClient({
      STRAPI_URL: 'http://127.0.0.1:1337/',
    })
    assert.ok(client)
  })
})

describe('isStrapiContentEnabled', () => {
  it('defaults to enabled when flag unset', () => {
    const prev = process.env.STRAPI_CONTENT_ENABLED
    delete process.env.STRAPI_CONTENT_ENABLED
    try {
      assert.equal(isStrapiContentEnabled(), true)
    } finally {
      if (prev === undefined) delete process.env.STRAPI_CONTENT_ENABLED
      else process.env.STRAPI_CONTENT_ENABLED = prev
    }
  })
})
