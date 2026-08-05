import { z } from "zod";
import { asNumber, asString, flattenEntry } from "./common.js";

/** Matches `shared.seo.ogImage` and any single Strapi media field once flattened. */
export const mediaAssetSchema = z.object({
  id: z.string(),
  url: z.string(),
  alternativeText: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  mime: z.string().nullable(),
  name: z.string().nullable(),
});

function absolutizeUrl(url: string, baseUrl?: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  if (!baseUrl) return url;
  const base = baseUrl.replace(/\/+$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

/**
 * Shapes a raw Strapi media relation (`{ data: {...} }` or a flat document)
 * into the pre-validation candidate for `mediaAssetSchema`. Returns `null`
 * when there is no media attached (a legitimate, common case).
 */
export function shapeMedia(
  raw: unknown,
  mediaBaseUrl?: string,
): z.input<typeof mediaAssetSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  const url = asString(entry.url);
  if (!url) return null;

  return {
    id: asString(entry.documentId) ?? String(entry.id ?? url),
    url: absolutizeUrl(url, mediaBaseUrl),
    alternativeText: asString(entry.alternativeText),
    width: asNumber(entry.width),
    height: asNumber(entry.height),
    mime: asString(entry.mime),
    name: asString(entry.name),
  };
}

export function shapeMediaList(
  raw: unknown,
  mediaBaseUrl?: string,
): Array<z.input<typeof mediaAssetSchema>> {
  if (raw == null) return [];
  let list: unknown[];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === "object" && raw !== null && "data" in raw) {
    const data = (raw as { data: unknown }).data;
    list = Array.isArray(data) ? data : data != null ? [data] : [];
  } else {
    list = [raw];
  }

  return list
    .map((item) => shapeMedia(item, mediaBaseUrl))
    .filter((item): item is z.input<typeof mediaAssetSchema> => item != null);
}
