/**
 * Unit smoke tests for Strapi gating (no network).
 */

import { getStrapiClient, isStrapiContentEnabled } from './strapi';

describe('isStrapiContentEnabled', () => {
  it('defaults to enabled when unset', () => {
    expect(isStrapiContentEnabled({} as NodeJS.ProcessEnv)).toBe(true);
  });

  it('respects false', () => {
    expect(
      isStrapiContentEnabled({
        STRAPI_CONTENT_ENABLED: 'false',
      } as NodeJS.ProcessEnv),
    ).toBe(false);
  });
});

describe('getStrapiClient', () => {
  it('returns null when STRAPI_URL is unset', () => {
    expect(
      getStrapiClient({
        STRAPI_URL: '',
        STRAPI_API_TOKEN: 'token',
        STRAPI_CONTENT_ENABLED: 'true',
      } as NodeJS.ProcessEnv),
    ).toBeNull();
  });

  it('returns null when STRAPI_CONTENT_ENABLED is false', () => {
    expect(
      getStrapiClient({
        STRAPI_URL: 'http://127.0.0.1:1337',
        STRAPI_API_TOKEN: 'token',
        STRAPI_CONTENT_ENABLED: 'false',
      } as NodeJS.ProcessEnv),
    ).toBeNull();
  });

  it('builds a client when STRAPI_URL is set', () => {
    const client = getStrapiClient({
      STRAPI_URL: 'http://127.0.0.1:1337',
      STRAPI_API_TOKEN: 'test-token',
      STRAPI_CONTENT_ENABLED: 'true',
    } as NodeJS.ProcessEnv);
    expect(client).not.toBeNull();
    expect(typeof client?.getArticles).toBe('function');
  });
});
