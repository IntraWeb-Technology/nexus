import { getStrapiEnv } from "./config.js";
import type { ContentType, NormalizedRecord, UpsertPlanItem } from "./types.js";

const UID_PATH: Record<ContentType, string> = {
  article: "articles",
  "case-study": "case-studies",
  project: "projects",
  navigation: "navigations",
  "faq-item": "faq-items",
  service: "services",
};

export class StrapiNotConfiguredError extends Error {
  constructor() {
    super(
      "STRAPI_URL and STRAPI_API_TOKEN are required for live migrate/rollback. Dry-run does not need them.",
    );
    this.name = "StrapiNotConfiguredError";
  }
}

export class StrapiSchemaNotReadyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StrapiSchemaNotReadyError";
  }
}

export function requireStrapiEnv() {
  const env = getStrapiEnv();
  if (!env) throw new StrapiNotConfiguredError();
  return env;
}

async function strapiFetch(
  method: string,
  apiPath: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; json: unknown }> {
  const { url, token } = requireStrapiEnv();
  const res = await fetch(`${url}/api/${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json };
}

function connectIds(ids: string[]): { connect: Array<{ documentId: string }> } {
  return { connect: ids.map((documentId) => ({ documentId })) };
}

const siteIdCache = new Map<string, string>();

async function resolveSiteDocumentIds(siteKeys: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const key of siteKeys) {
    const cached = siteIdCache.get(key);
    if (cached) {
      ids.push(cached);
      continue;
    }
    const q = new URLSearchParams({
      "filters[key][$eq]": key,
      "pagination[pageSize]": "1",
    });
    const res = await strapiFetch("GET", `sites?${q}`);
    const row = (
      res.json as { data?: Array<{ documentId?: string; id?: number }> }
    )?.data?.[0];
    const documentId = row?.documentId ?? (row?.id != null ? String(row.id) : null);
    if (!documentId) {
      throw new Error(
        `Site key "${key}" not found. Seed sites first (apps/cms-strapi/scripts/seed-sites.ts).`,
      );
    }
    siteIdCache.set(key, documentId);
    ids.push(documentId);
  }
  return ids;
}

function seoFromRecord(record: NormalizedRecord): Record<string, unknown> | undefined {
  const payload = record.payload ?? {};
  const metaTitle =
    (typeof payload.seoTitle === "string" && payload.seoTitle) || record.title;
  const metaDescription =
    (typeof payload.seoDescription === "string" && payload.seoDescription) ||
    record.excerpt;
  if (!metaTitle && !metaDescription && !record.ogImageUrl) return undefined;
  return {
    metaTitle: metaTitle ?? undefined,
    metaDescription: metaDescription ?? undefined,
    canonicalUrl:
      (typeof payload.canonicalUrl === "string" && payload.canonicalUrl) ||
      undefined,
    ogTitle: metaTitle ?? undefined,
    ogDescription: metaDescription ?? undefined,
  };
}

function featuresFromHighlights(payload: Record<string, unknown> | undefined) {
  const highlights = payload?.highlights;
  if (!Array.isArray(highlights)) return undefined;
  return highlights
    .map((h) => {
      if (typeof h === "string") return { title: h, description: h };
      if (h && typeof h === "object") {
        const o = h as Record<string, unknown>;
        const title = typeof o.title === "string" ? o.title : String(o.label ?? "");
        const description =
          typeof o.description === "string"
            ? o.description
            : typeof o.body === "string"
              ? o.body
              : title;
        if (!title) return null;
        return { title, description };
      }
      return null;
    })
    .filter(Boolean);
}

function navigationItems(payload: Record<string, unknown> | undefined) {
  const items = payload?.items;
  if (!Array.isArray(items)) return undefined;
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const label = typeof o.label === "string" ? o.label : String(o.title ?? "");
      const href = typeof o.href === "string" ? o.href : String(o.url ?? "");
      if (!label || !href) return null;
      return {
        label,
        href,
        openInNewTab: Boolean(o.openInNewTab),
      };
    })
    .filter(Boolean);
}

/**
 * Map normalized record → Strapi 5 REST `data` payload aligned to apps/cms-strapi schemas.
 * Site relations are resolved asynchronously via {@link toStrapiDataAsync}.
 */
export function toStrapiData(
  record: NormalizedRecord,
  migrationBatch: string,
  siteDocumentIds: string[],
): Record<string, unknown> {
  const payload = record.payload ?? {};
  const sitesConnect = connectIds(siteDocumentIds);
  const singleSite = siteDocumentIds[0]
    ? connectIds([siteDocumentIds[0]])
    : undefined;

  switch (record.type) {
    case "article":
      return {
        title: record.title,
        slug: record.slug,
        excerpt: record.excerpt,
        body: record.body,
        contentFormat: "markdown",
        hashnodeId: record.hashnodeId,
        originalSource: record.sourceKind,
        originalUrl:
          (typeof payload.originalUrl === "string" && payload.originalUrl) ||
          undefined,
        canonicalUrl:
          (typeof payload.canonicalUrl === "string" && payload.canonicalUrl) ||
          undefined,
        publishedDate: record.publishedAt ?? undefined,
        seo: seoFromRecord(record),
        sites: sitesConnect,
        migrationBatch,
      };
    case "case-study":
      return {
        title: record.title,
        slug: record.slug,
        clientName:
          (typeof payload.clientName === "string" && payload.clientName) ||
          undefined,
        summary: record.excerpt,
        challenge:
          (typeof payload.challenge === "string" && payload.challenge) ||
          undefined,
        solution:
          (typeof payload.solution === "string" && payload.solution) ||
          undefined,
        results:
          (typeof payload.results === "string" && payload.results) ||
          record.body,
        sites: sitesConnect,
        seo: seoFromRecord(record),
        migrationBatch,
      };
    case "project":
      return {
        name: record.title,
        slug: record.slug,
        summary: record.excerpt,
        description: record.body,
        sites: sitesConnect,
        repositoryUrl:
          (typeof payload.repositoryUrl === "string" && payload.repositoryUrl) ||
          undefined,
        liveUrl:
          (typeof payload.liveUrl === "string" && payload.liveUrl) || undefined,
        documentationUrl:
          (typeof payload.documentationUrl === "string" &&
            payload.documentationUrl) ||
          undefined,
        // Strapi field is projectStatus (status is reserved by Draft & Publish)
        projectStatus:
          record.status === "completed" ||
          record.status === "in-progress" ||
          record.status === "planned" ||
          record.status === "archived"
            ? record.status
            : "planned",
        seo: seoFromRecord(record),
        migrationBatch,
      };
    case "service":
      return {
        name: record.title,
        slug: record.slug,
        shortDescription: record.excerpt,
        description: record.body,
        site: singleSite,
        features: featuresFromHighlights(payload),
        seo: seoFromRecord(record),
        migrationBatch,
      };
    case "faq-item":
      return {
        question:
          (typeof payload.question === "string" && payload.question) ||
          record.title,
        answer:
          (typeof payload.answer === "string" && payload.answer) ||
          record.body ||
          "",
        sites: sitesConnect,
        sortOrder:
          typeof payload.sortOrder === "number" ? payload.sortOrder : 0,
        featured: Boolean(payload.featured),
        migrationBatch,
      };
    case "navigation":
      return {
        name: record.title,
        location:
          (typeof payload.location === "string" && payload.location) || "header",
        site: singleSite,
        items: navigationItems(payload),
        migrationBatch,
      };
    default: {
      const _exhaustive: never = record.type;
      throw new Error(`Unsupported content type: ${_exhaustive}`);
    }
  }
}

export async function toStrapiDataAsync(
  record: NormalizedRecord,
  migrationBatch: string,
): Promise<Record<string, unknown>> {
  const siteIds = await resolveSiteDocumentIds(record.siteKeys);
  return toStrapiData(record, migrationBatch, siteIds);
}

export interface LiveUpsertResult {
  plan: UpsertPlanItem[];
  migrated: number;
  skipped: number;
  duplicates: number;
  errors: string[];
  schemaReady: boolean;
}

/**
 * Probe whether collection endpoints exist. If 404 across the board, schemas are not ready.
 */
export async function probeSchemaReady(): Promise<{
  ready: boolean;
  detail: string;
}> {
  try {
    const probe = await strapiFetch(
      "GET",
      "articles?pagination[pageSize]=1",
    );
    if (probe.status === 404) {
      return {
        ready: false,
        detail:
          "Strapi responded 404 for /api/articles — content-types not implemented yet. Dry-run works; live upsert waits until schema is ready.",
      };
    }
    if (probe.status === 401 || probe.status === 403) {
      return {
        ready: false,
        detail: `Strapi auth failed (${probe.status}). Check STRAPI_API_TOKEN.`,
      };
    }
    if (probe.ok || probe.status < 500) {
      return { ready: true, detail: "Article collection reachable." };
    }
    return {
      ready: false,
      detail: `Unexpected Strapi status ${probe.status}`,
    };
  } catch (err) {
    return {
      ready: false,
      detail: `Could not reach Strapi: ${String(err)}`,
    };
  }
}

async function findExisting(
  type: ContentType,
  record: NormalizedRecord,
): Promise<string | null> {
  const collection = UID_PATH[type];
  if (type === "article" && record.hashnodeId) {
    const q = new URLSearchParams({
      "filters[hashnodeId][$eq]": record.hashnodeId,
      "pagination[pageSize]": "1",
    });
    const res = await strapiFetch("GET", `${collection}?${q}`);
    const data = (res.json as { data?: Array<{ documentId?: string; id?: number }> })
      ?.data;
    if (data?.[0]) return String(data[0].documentId ?? data[0].id);
  }

  if (type === "faq-item") {
    const question =
      (typeof record.payload?.question === "string" && record.payload.question) ||
      record.title;
    const q = new URLSearchParams({
      "filters[question][$eq]": question,
      "pagination[pageSize]": "1",
    });
    const res = await strapiFetch("GET", `${collection}?${q}`);
    const data = (res.json as { data?: Array<{ documentId?: string; id?: number }> })
      ?.data;
    if (data?.[0]) return String(data[0].documentId ?? data[0].id);
    return null;
  }

  if (type === "navigation") {
    const location =
      (typeof record.payload?.location === "string" && record.payload.location) ||
      "header";
    const q = new URLSearchParams({
      "filters[location][$eq]": location,
      "filters[name][$eq]": record.title,
      "pagination[pageSize]": "1",
    });
    const res = await strapiFetch("GET", `${collection}?${q}`);
    const data = (res.json as { data?: Array<{ documentId?: string; id?: number }> })
      ?.data;
    if (data?.[0]) return String(data[0].documentId ?? data[0].id);
    return null;
  }

  const q = new URLSearchParams({
    "filters[slug][$eq]": record.slug,
    "pagination[pageSize]": "1",
  });
  const res = await strapiFetch("GET", `${collection}?${q}`);
  const data = (res.json as { data?: Array<{ documentId?: string; id?: number }> })
    ?.data;
  if (data?.[0]) return String(data[0].documentId ?? data[0].id);
  return null;
}

/**
 * Live upsert. If schemas are missing, returns a clear stub result (no silent success).
 */
export async function liveUpsert(
  plan: UpsertPlanItem[],
  migrationBatch: string,
): Promise<LiveUpsertResult> {
  requireStrapiEnv();
  siteIdCache.clear();

  const probe = await probeSchemaReady();
  if (!probe.ready) {
    return {
      plan: plan.map((p) =>
        p.action === "skip-duplicate"
          ? p
          : {
              ...p,
              action: "skip",
              reason: `Schema not ready: ${probe.detail}`,
            },
      ),
      migrated: 0,
      skipped: plan.filter((p) => p.action !== "skip-duplicate").length,
      duplicates: plan.filter((p) => p.action === "skip-duplicate").length,
      errors: [
        `Live upsert blocked until schema ready. ${probe.detail}`,
      ],
      schemaReady: false,
    };
  }

  let migrated = 0;
  let skipped = 0;
  let duplicates = 0;
  const errors: string[] = [];
  const nextPlan: UpsertPlanItem[] = [];

  for (const item of plan) {
    if (item.action === "skip-duplicate") {
      duplicates += 1;
      nextPlan.push(item);
      continue;
    }

    try {
      const collection = UID_PATH[item.type];
      const existingId = await findExisting(item.type, item.record);
      const data = await toStrapiDataAsync(item.record, migrationBatch);

      if (existingId) {
        const res = await strapiFetch("PUT", `${collection}/${existingId}`, {
          data,
        });
        if (!res.ok) {
          errors.push(
            `Update failed ${item.upsertKey}: HTTP ${res.status} ${JSON.stringify(res.json)}`,
          );
          nextPlan.push({ ...item, action: "skip", reason: `HTTP ${res.status}` });
          skipped += 1;
          continue;
        }
        nextPlan.push({ ...item, action: "update" });
        migrated += 1;
      } else {
        const res = await strapiFetch("POST", collection, { data });
        if (!res.ok) {
          errors.push(
            `Create failed ${item.upsertKey}: HTTP ${res.status} ${JSON.stringify(res.json)}`,
          );
          nextPlan.push({ ...item, action: "skip", reason: `HTTP ${res.status}` });
          skipped += 1;
          continue;
        }
        nextPlan.push({ ...item, action: "create" });
        migrated += 1;
      }
    } catch (err) {
      errors.push(`${item.upsertKey}: ${String(err)}`);
      nextPlan.push({ ...item, action: "skip", reason: String(err) });
      skipped += 1;
    }
  }

  return {
    plan: nextPlan,
    migrated,
    skipped,
    duplicates,
    errors,
    schemaReady: true,
  };
}

/**
 * Best-effort rollback: delete entries matching migrationBatch.
 */
export async function rollbackBatch(migrationBatch: string): Promise<{
  deleted: number;
  errors: string[];
}> {
  requireStrapiEnv();
  const probe = await probeSchemaReady();
  if (!probe.ready) {
    return {
      deleted: 0,
      errors: [`Cannot rollback: ${probe.detail}`],
    };
  }

  let deleted = 0;
  const errors: string[] = [];
  const collections = Object.values(UID_PATH);

  for (const collection of collections) {
    try {
      const q = new URLSearchParams({
        "filters[migrationBatch][$eq]": migrationBatch,
        "pagination[pageSize]": "100",
      });
      const list = await strapiFetch("GET", `${collection}?${q}`);
      const rows =
        (list.json as { data?: Array<{ documentId?: string; id?: number }> })
          ?.data ?? [];
      for (const row of rows) {
        const id = row.documentId ?? row.id;
        if (id == null) continue;
        const del = await strapiFetch("DELETE", `${collection}/${id}`);
        if (del.ok) deleted += 1;
        else {
          errors.push(
            `Delete ${collection}/${id} failed: HTTP ${del.status}`,
          );
        }
      }
    } catch (err) {
      errors.push(`${collection}: ${String(err)}`);
    }
  }

  return { deleted, errors };
}
