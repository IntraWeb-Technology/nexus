/**
 * Content source resolution (M8A fallback contract).
 *
 * - `strapi`: production/CMS path — failures are errors, never silent fixture swap
 * - `fixture`: explicit test/demo/local mode when CMS is not configured
 *
 * Set `ATLAS_CONTENT_SOURCE=fixture|strapi` to force. Otherwise:
 * Strapi when `STRAPI_URL` / `STRAPI_API_URL` is set; fixture otherwise.
 *
 * Production deployments must declare their content-source mode explicitly.
 * Fixture mode is intentional for local development, Playwright, and demos —
 * it is not proof of live CMS delivery.
 */

export type AtlasContentSource = "strapi" | "fixture";

export type ContentSourceEnv = {
  ATLAS_CONTENT_SOURCE?: string;
  STRAPI_URL?: string;
  STRAPI_API_URL?: string;
};

export function resolveContentSource(
  env: ContentSourceEnv = process.env as ContentSourceEnv,
): AtlasContentSource {
  const explicit = env.ATLAS_CONTENT_SOURCE?.trim().toLowerCase();
  if (explicit === "fixture" || explicit === "strapi") {
    return explicit;
  }
  const url = env.STRAPI_URL?.trim() || env.STRAPI_API_URL?.trim();
  if (url) return "strapi";
  return "fixture";
}

export function isStrapiRequired(env: ContentSourceEnv = process.env as ContentSourceEnv): boolean {
  return resolveContentSource(env) === "strapi";
}
