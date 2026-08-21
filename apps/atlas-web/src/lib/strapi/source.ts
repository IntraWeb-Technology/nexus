/**
 * Content source resolution — Atlas v1 hybrid architecture.
 *
 * Surfaces:
 * - **static (committed):** Homepage, Work, case studies, About, Contact, chrome
 *   Always load from `src/content/*`. Never call Strapi at build/runtime for these.
 * - **cms:** Articles (+ Documentation handbook pages as Article surface=documentation)
 *   Use Strapi when content source resolves to `strapi`; fixture for Playwright/local demos.
 *
 * `ATLAS_CONTENT_SOURCE=fixture|strapi` forces the CMS-surface mode.
 * Otherwise: Strapi when `STRAPI_URL` / `STRAPI_API_URL` is set; fixture otherwise.
 *
 * Production: declare CMS mode explicitly. Fixture mode is intentional for local
 * development, Playwright, and demos — it is not proof of live CMS delivery.
 *
 * Gates:
 * - ARTICLES_CMS_REQUIRED = YES
 * - STATIC_CORE_PAGES_REQUIRED = YES
 * - FULL_SITE_CMS_REQUIRED = NO
 */

export type AtlasContentSource = "strapi" | "fixture";

/** Routes that must stay code-managed for Atlas v1 launch. */
export type AtlasContentFamily = "static" | "cms";

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

/**
 * Whether Strapi is required for CMS-managed surfaces (articles / docs).
 * Static core pages never require Strapi in v1.
 */
export function isStrapiRequired(
  env: ContentSourceEnv = process.env as ContentSourceEnv,
): boolean {
  return resolveContentSource(env) === "strapi";
}

/** True when this content family should load from Strapi for the current source. */
export function usesStrapiFor(
  family: AtlasContentFamily,
  env: ContentSourceEnv = process.env as ContentSourceEnv,
): boolean {
  if (family === "static") return false;
  return resolveContentSource(env) === "strapi";
}
