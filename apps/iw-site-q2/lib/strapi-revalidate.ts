/**
 * Path resolution for Strapi publishing webhooks (site key: intraweb).
 * Pure helpers — unit-testable without Next.js.
 */

export const INTRAWEB_SITE_KEY = "intraweb" as const;

export type StrapiRevalidatePayload = {
  event: string;
  uid: string;
  entryId?: string;
  siteKeys?: string[];
  paths?: string[];
  slugs?: Record<string, string>;
};

export type ParsePayloadResult =
  | { ok: true; payload: StrapiRevalidatePayload }
  | { ok: false; error: string };

const ALLOWED_EVENTS = new Set([
  "entry.publish",
  "entry.unpublish",
  "entry.update",
  "entry.delete",
  "entry.create",
]);

export function parseRevalidatePayload(body: unknown): ParsePayloadResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Body must be a JSON object" };
  }

  const record = body as Record<string, unknown>;
  const event = typeof record.event === "string" ? record.event.trim() : "";
  const uid = typeof record.uid === "string" ? record.uid.trim() : "";

  if (!event || !uid) {
    return { ok: false, error: "Missing required fields: event, uid" };
  }

  if (!ALLOWED_EVENTS.has(event)) {
    return { ok: false, error: `Unsupported event: ${event}` };
  }

  const siteKeys = Array.isArray(record.siteKeys)
    ? record.siteKeys.filter((k): k is string => typeof k === "string")
    : undefined;

  const paths = Array.isArray(record.paths)
    ? record.paths.filter((p): p is string => typeof p === "string" && p.startsWith("/"))
    : undefined;

  let slugs: Record<string, string> | undefined;
  if (record.slugs && typeof record.slugs === "object" && !Array.isArray(record.slugs)) {
    slugs = {};
    for (const [key, value] of Object.entries(record.slugs as Record<string, unknown>)) {
      if (typeof value === "string" && value.trim()) {
        slugs[key] = value.trim();
      }
    }
  }

  const entryId =
    typeof record.entryId === "string"
      ? record.entryId
      : typeof record.entryId === "number"
        ? String(record.entryId)
        : undefined;

  return {
    ok: true,
    payload: { event, uid, entryId, siteKeys, paths, slugs },
  };
}

/**
 * Whether this app should act on the webhook.
 * True when siteKeys includes our key, or explicit paths were provided.
 */
export function shouldRevalidateForSite(
  payload: StrapiRevalidatePayload,
  siteKey: string = INTRAWEB_SITE_KEY,
): boolean {
  const hasPaths = Boolean(payload.paths && payload.paths.length > 0);
  if (hasPaths) return true;

  if (!payload.siteKeys || payload.siteKeys.length === 0) {
    // Shared/global types may omit siteKeys — still map by uid.
    return true;
  }

  return payload.siteKeys.includes(siteKey);
}

/** Fallback paths when payload.paths is empty. */
export function pathsForUid(
  uid: string,
  slugs?: Record<string, string>,
): string[] {
  const paths = new Set<string>();

  switch (uid) {
    case "api::article.article": {
      paths.add("/blog");
      const slug = slugs?.article ?? slugs?.slug;
      if (slug) paths.add(`/blog/${slug}`);
      break;
    }
    case "api::service.service": {
      paths.add("/services");
      break;
    }
    case "api::page.page": {
      const slug = slugs?.page ?? slugs?.slug;
      if (!slug || slug === "home" || slug === "index") {
        paths.add("/");
      } else {
        paths.add(`/${slug}`);
      }
      break;
    }
    case "api::navigation.navigation":
    case "api::site-setting.site-setting": {
      // Layout consumers — invalidate root layout tree.
      paths.add("/");
      paths.add("/services");
      paths.add("/about");
      paths.add("/contact");
      paths.add("/blog");
      paths.add("/work");
      paths.add("/diagnostic");
      break;
    }
    case "api::faq-item.faq-item": {
      paths.add("/services");
      paths.add("/diagnostic");
      break;
    }
    case "api::project.project":
    case "api::case-study.case-study": {
      paths.add("/work");
      break;
    }
    case "api::testimonial.testimonial": {
      paths.add("/");
      paths.add("/about");
      break;
    }
    case "api::redirect.redirect": {
      paths.add("/");
      break;
    }
    default:
      break;
  }

  return [...paths];
}

export function resolveRevalidatePaths(
  payload: StrapiRevalidatePayload,
): string[] {
  if (payload.paths && payload.paths.length > 0) {
    return [...new Set(payload.paths.filter((p) => p.startsWith("/")))];
  }
  return pathsForUid(payload.uid, payload.slugs);
}
