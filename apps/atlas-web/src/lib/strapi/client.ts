import { createStrapiClient, type StrapiClient } from "@repo/strapi-client";
import { AtlasContentError } from "@/lib/strapi/errors";

let cached: StrapiClient | null = null;

/** Server-only Strapi client for Atlas (`personal` site). */
export function getAtlasStrapiClient(): StrapiClient {
  if (cached) return cached;

  const baseUrl =
    process.env.STRAPI_URL?.trim() || process.env.STRAPI_API_URL?.trim();
  if (!baseUrl) {
    throw new AtlasContentError(
      "CONFIGURATION",
      "STRAPI_URL (or STRAPI_API_URL) is required when ATLAS_CONTENT_SOURCE=strapi",
    );
  }

  cached = createStrapiClient({
    baseUrl,
    token: process.env.STRAPI_API_TOKEN,
    previewSecret: process.env.STRAPI_PREVIEW_SECRET,
  });
  return cached;
}

export const ATLAS_SITE_KEY = "personal" as const;
