/**
 * Path resolution for Strapi publishing webhooks (site key: personal).
 */

export const PERSONAL_SITE_KEY = "personal" as const;

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

export function shouldRevalidateForSite(
  payload: StrapiRevalidatePayload,
  siteKey: string = PERSONAL_SITE_KEY,
): boolean {
  const hasPaths = Boolean(payload.paths && payload.paths.length > 0);
  if (hasPaths) return true;

  if (!payload.siteKeys || payload.siteKeys.length === 0) {
    return true;
  }

  return payload.siteKeys.includes(siteKey);
}

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
    case "api::project.project": {
      paths.add("/projects");
      const slug = slugs?.project ?? slugs?.slug;
      if (slug) paths.add(`/projects/${slug}`);
      break;
    }
    case "api::case-study.case-study": {
      paths.add("/case-studies");
      const slug = slugs?.["case-study"] ?? slugs?.caseStudy ?? slugs?.slug;
      if (slug) paths.add(`/case-studies/${slug}`);
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
      paths.add("/");
      paths.add("/blog");
      paths.add("/projects");
      paths.add("/case-studies");
      paths.add("/about");
      paths.add("/contact");
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
