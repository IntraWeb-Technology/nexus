/**
 * Unit tests for Strapi preview / webhook secret helpers.
 */

import {
  extractWebhookSecret,
  safeRedirectPath,
  secretsMatch,
} from '../lib/strapi-secrets';
import {
  parseRevalidatePayload,
  pathsForUid,
  shouldRevalidateForSite,
} from '../lib/strapi-revalidate';

describe('secretsMatch', () => {
  it('accepts equal secrets', () => {
    expect(secretsMatch('abc-secret', 'abc-secret')).toBe(true);
  });

  it('rejects mismatch', () => {
    expect(secretsMatch('abc-secret', 'abc-secreX')).toBe(false);
    expect(secretsMatch('abc', undefined)).toBe(false);
  });
});

describe('extractWebhookSecret', () => {
  it('reads header', () => {
    const headers = new Headers({ 'x-strapi-webhook-secret': 'wh' });
    expect(extractWebhookSecret(headers)).toBe('wh');
  });
});

describe('safeRedirectPath', () => {
  it('blocks open redirects', () => {
    expect(safeRedirectPath('//evil')).toBe('/');
    expect(safeRedirectPath('/blog/hi')).toBe('/blog/hi');
  });
});

describe('shouldRevalidateForSite', () => {
  it('filters by personal site key', () => {
    expect(
      shouldRevalidateForSite({
        event: 'entry.publish',
        uid: 'api::article.article',
        siteKeys: ['personal'],
      }),
    ).toBe(true);
    expect(
      shouldRevalidateForSite({
        event: 'entry.publish',
        uid: 'api::article.article',
        siteKeys: ['intraweb'],
      }),
    ).toBe(false);
  });
});

describe('parseRevalidatePayload + pathsForUid', () => {
  it('parses contract payload', () => {
    const result = parseRevalidatePayload({
      event: 'entry.publish',
      uid: 'api::article.article',
      siteKeys: ['personal'],
      slugs: { article: 'hello' },
    });
    expect(result.ok).toBe(true);
  });

  it('maps article paths', () => {
    expect(pathsForUid('api::article.article', { article: 'x' })).toEqual([
      '/blog',
      '/blog/x',
    ]);
  });
});
