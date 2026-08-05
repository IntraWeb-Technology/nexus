/**
 * Server-only Strapi client for IntraWeb editorial content.
 * Never import from Client Components. Never use NEXT_PUBLIC_ for tokens.
 */

import { createStrapiClient, type StrapiClient } from "@repo/strapi-client";

/** Architecture contract site key for intrawebtech.com */
export const STRAPI_SITE_KEY = "intraweb" as const;

/**
 * Optional gate: when set, must be `true` / `1` for Strapi reads.
 * When unset, Strapi is used whenever `STRAPI_URL` is present.
 */
export function isStrapiContentEnabled(): boolean {
  const flag = process.env.STRAPI_CONTENT_ENABLED?.trim().toLowerCase();
  if (flag === undefined || flag === "") return true;
  return flag === "true" || flag === "1";
}

type StrapiEnv = {
  STRAPI_URL?: string;
  STRAPI_API_TOKEN?: string;
  STRAPI_CONTENT_ENABLED?: string;
  STRAPI_PREVIEW_SECRET?: string;
};

/**
 * Returns a configured client, or `null` when Strapi should not be used.
 * Does not throw at import time; safe to call from server components.
 */
export function getStrapiClient(
  env: StrapiEnv = process.env as StrapiEnv,
): StrapiClient | null {
  const flag = env.STRAPI_CONTENT_ENABLED?.trim().toLowerCase();
  if (flag !== undefined && flag !== "" && flag !== "true" && flag !== "1") {
    return null;
  }

  const baseUrl = env.STRAPI_URL?.trim();
  if (!baseUrl) return null;

  try {
    return createStrapiClient({
      baseUrl,
      token: env.STRAPI_API_TOKEN?.trim() || undefined,
      previewSecret: env.STRAPI_PREVIEW_SECRET?.trim() || undefined,
    });
  } catch {
    return null;
  }
}
