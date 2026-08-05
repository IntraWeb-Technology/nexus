import { StrapiClientError } from "./errors.js";

export type CreateStrapiClientOptions = {
  /** Strapi base URL, e.g. `https://cms.example.com` (no trailing slash required). */
  baseUrl: string;
  /**
   * Server-only API token (`STRAPI_API_TOKEN`). Optional only if the Strapi
   * `public` role has been granted `find`/`findOne` on every content type
   * this client reads — required to read draft/preview content. Never pass
   * a `NEXT_PUBLIC_*` value here.
   */
  token?: string;
  /**
   * Server-only secret (`STRAPI_PREVIEW_SECRET`) used by callers to validate
   * incoming preview/draft-mode requests via `client.verifyPreviewSecret()`.
   * It is never sent to Strapi.
   */
  previewSecret?: string;
  /** Default request timeout in milliseconds. Defaults to 15_000. */
  defaultTimeoutMs?: number;
  /** Optional fetch implementation (defaults to global `fetch`). */
  fetch?: typeof fetch;
};

export type ResolvedStrapiConfig = {
  baseUrl: string;
  token: string | null;
  previewSecret: string | null;
  defaultTimeoutMs: number;
  fetch: typeof fetch;
};

const DEFAULT_TIMEOUT_MS = 15_000;

export function resolveConfig(options: CreateStrapiClientOptions): ResolvedStrapiConfig {
  const baseUrl = options.baseUrl?.trim().replace(/\/+$/, "");

  if (!baseUrl) {
    throw new StrapiClientError(
      "createStrapiClient requires a non-empty baseUrl",
      "INVALID_CONFIG",
    );
  }

  return {
    baseUrl,
    token: options.token?.trim() || null,
    previewSecret: options.previewSecret?.trim() || null,
    defaultTimeoutMs: options.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS,
    fetch: options.fetch ?? globalThis.fetch.bind(globalThis),
  };
}

/**
 * Constant-time-ish comparison for preview secrets. Not cryptographically
 * hardened (no `crypto.timingSafeEqual`, to stay runtime-agnostic for Edge),
 * but avoids trivial short-circuit string `===` timing leaks for the common
 * case of comparing tokens of equal length.
 */
export function verifyPreviewSecret(
  config: ResolvedStrapiConfig,
  secret: string | null | undefined,
): boolean {
  if (!config.previewSecret) return false;
  if (!secret) return false;
  if (secret.length !== config.previewSecret.length) return false;
  let mismatch = 0;
  for (let i = 0; i < secret.length; i++) {
    mismatch |= secret.charCodeAt(i) ^ config.previewSecret.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Env keys used by frontends / server runtimes (see
 * `docs/strapi-migration/contracts.md`). `STRAPI_PREVIEW_SECRET` gates
 * Next.js draft-mode routes — it is never sent on Strapi REST calls. Draft
 * content is instead requested via `status=draft` with an API token that has
 * permission to read drafts.
 */
export const STRAPI_ENV_KEYS = [
  "STRAPI_URL",
  "STRAPI_API_TOKEN",
  "STRAPI_PREVIEW_SECRET",
  "STRAPI_WEBHOOK_SECRET",
] as const;
