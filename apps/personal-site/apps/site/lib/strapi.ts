/**
 * Server-only Strapi access for johnschibelli.dev (site key: `personal`).
 *
 * personal-site is a nested pnpm workspace, so we do not depend on
 * `@repo/strapi-client` via `workspace:*`. This module mirrors the same
 * public methods / query patterns (sites filter, populate, REST paths)
 * with a thin fetch wrapper. Soft-fail + local fallbacks live in
 * `lib/strapi-content.ts` and `lib/content-api.ts`.
 *
 * Env (never NEXT_PUBLIC_ for tokens):
 *   STRAPI_URL, STRAPI_API_TOKEN, STRAPI_CONTENT_ENABLED (optional),
 *   STRAPI_PREVIEW_SECRET (optional; not sent to Strapi),
 *   STRAPI_WEBHOOK_SECRET (optional; webhook route only)
 */

export const STRAPI_SITE_KEY = "personal" as const;

export type StrapiSiteKey = typeof STRAPI_SITE_KEY;

/** Draft preview via Strapi 5 `status=draft` (requires a token that can read drafts). */
export type StrapiRequestOptions = {
  preview?: boolean;
};

export type StrapiArticle = {
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  contentFormat: "markdown" | "mdx" | "blocks" | "html" | null;
  featuredImageUrl: string | null;
  authorName: string | null;
  tags: Array<{ name: string; slug: string }>;
  publishedDate: string | null;
  updatedDate: string | null;
  featured: boolean;
};

export type StrapiProject = {
  documentId: string;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  projectType: string | null;
  technologies: string[];
  featuredImageUrl: string | null;
  repositoryUrl: string | null;
  liveUrl: string | null;
  documentationUrl: string | null;
  status: "planned" | "in-progress" | "completed" | "archived" | null;
  startDate: string | null;
  endDate: string | null;
  featured: boolean;
};

export type StrapiCaseStudy = {
  documentId: string;
  title: string;
  slug: string;
  clientName: string | null;
  summary: string | null;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  technologies: string[];
  featuredImageUrl: string | null;
  relatedProjectSlug: string | null;
  publishedAt: string | null;
};

export type PersonalStrapiClient = {
  getArticles: (
    pageSize?: number,
    options?: StrapiRequestOptions,
  ) => Promise<StrapiArticle[]>;
  getArticleBySlug: (
    slug: string,
    options?: StrapiRequestOptions,
  ) => Promise<StrapiArticle | null>;
  getProjects: (
    pageSize?: number,
    options?: StrapiRequestOptions,
  ) => Promise<StrapiProject[]>;
  getProjectBySlug: (
    slug: string,
    options?: StrapiRequestOptions,
  ) => Promise<StrapiProject | null>;
  getCaseStudies: (
    pageSize?: number,
    options?: StrapiRequestOptions,
  ) => Promise<StrapiCaseStudy[]>;
  getCaseStudyBySlug: (
    slug: string,
    options?: StrapiRequestOptions,
  ) => Promise<StrapiCaseStudy | null>;
};

function statusFromPreview(preview?: boolean): "draft" | "published" {
  return preview ? "draft" : "published";
}

/**
 * Optional gate: when set, must be `true` / `1` for Strapi reads.
 * When unset, Strapi is used whenever `STRAPI_URL` is present.
 */
export function isStrapiContentEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const flag = env.STRAPI_CONTENT_ENABLED?.trim().toLowerCase();
  if (flag === undefined || flag === "") return true;
  return flag === "true" || flag === "1";
}

/**
 * Returns a configured client, or `null` when Strapi should not be used.
 * Safe to call from Server Components / route handlers.
 */
export function getStrapiClient(
  env: NodeJS.ProcessEnv = process.env,
): PersonalStrapiClient | null {
  if (!isStrapiContentEnabled(env)) return null;

  const baseUrl = env.STRAPI_URL?.trim().replace(/\/+$/, "");
  if (!baseUrl) return null;

  const token = env.STRAPI_API_TOKEN?.trim() || undefined;
  return createPersonalStrapiClient(baseUrl, token);
}

function createPersonalStrapiClient(
  baseUrl: string,
  token?: string,
): PersonalStrapiClient {
  const getArticles = async (
    pageSize = 25,
    options?: StrapiRequestOptions,
  ) => {
    const data = await strapiList(baseUrl, token, "/api/articles", {
      "filters[sites][key][$eq]": STRAPI_SITE_KEY,
      "populate[featuredImage]": "true",
      "populate[author]": "true",
      "populate[tags]": "true",
      "pagination[page]": "1",
      "pagination[pageSize]": String(pageSize),
      sort: "publishedDate:desc",
      status: statusFromPreview(options?.preview),
    });
    return data.map((raw) => shapeArticle(raw, baseUrl)).filter(Boolean) as StrapiArticle[];
  };

  const getArticleBySlug = async (
    slug: string,
    options?: StrapiRequestOptions,
  ) => {
    const data = await strapiList(baseUrl, token, "/api/articles", {
      "filters[sites][key][$eq]": STRAPI_SITE_KEY,
      "filters[slug][$eq]": slug,
      "populate[featuredImage]": "true",
      "populate[author]": "true",
      "populate[tags]": "true",
      "pagination[page]": "1",
      "pagination[pageSize]": "1",
      status: statusFromPreview(options?.preview),
    });
    const shaped = shapeArticle(data[0], baseUrl);
    return shaped;
  };

  const getProjects = async (
    pageSize = 25,
    options?: StrapiRequestOptions,
  ) => {
    const data = await strapiList(baseUrl, token, "/api/projects", {
      "filters[sites][key][$eq]": STRAPI_SITE_KEY,
      "populate[featuredImage]": "true",
      "populate[technologies]": "true",
      "pagination[page]": "1",
      "pagination[pageSize]": String(pageSize),
      sort: "featured:desc",
      status: statusFromPreview(options?.preview),
    });
    return data.map((raw) => shapeProject(raw, baseUrl)).filter(Boolean) as StrapiProject[];
  };

  const getProjectBySlug = async (
    slug: string,
    options?: StrapiRequestOptions,
  ) => {
    const data = await strapiList(baseUrl, token, "/api/projects", {
      "filters[sites][key][$eq]": STRAPI_SITE_KEY,
      "filters[slug][$eq]": slug,
      "populate[featuredImage]": "true",
      "populate[technologies]": "true",
      "pagination[page]": "1",
      "pagination[pageSize]": "1",
      status: statusFromPreview(options?.preview),
    });
    return shapeProject(data[0], baseUrl);
  };

  const getCaseStudies = async (
    pageSize = 25,
    options?: StrapiRequestOptions,
  ) => {
    const data = await strapiList(baseUrl, token, "/api/case-studies", {
      "filters[sites][key][$eq]": STRAPI_SITE_KEY,
      "populate[featuredImage]": "true",
      "populate[technologies]": "true",
      "populate[relatedProject]": "true",
      "pagination[page]": "1",
      "pagination[pageSize]": String(pageSize),
      status: statusFromPreview(options?.preview),
    });
    return data
      .map((raw) => shapeCaseStudy(raw, baseUrl))
      .filter(Boolean) as StrapiCaseStudy[];
  };

  const getCaseStudyBySlug = async (
    slug: string,
    options?: StrapiRequestOptions,
  ) => {
    const data = await strapiList(baseUrl, token, "/api/case-studies", {
      "filters[sites][key][$eq]": STRAPI_SITE_KEY,
      "filters[slug][$eq]": slug,
      "populate[featuredImage]": "true",
      "populate[technologies]": "true",
      "populate[relatedProject]": "true",
      "pagination[page]": "1",
      "pagination[pageSize]": "1",
      status: statusFromPreview(options?.preview),
    });
    return shapeCaseStudy(data[0], baseUrl);
  };

  return {
    getArticles,
    getArticleBySlug,
    getProjects,
    getProjectBySlug,
    getCaseStudies,
    getCaseStudyBySlug,
  };
}

async function strapiList(
  baseUrl: string,
  token: string | undefined,
  path: string,
  params: Record<string, string>,
): Promise<unknown[]> {
  const qs = new URLSearchParams(params).toString();
  const url = `${baseUrl}${path}?${qs}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`Strapi ${path} returned ${res.status}`);
    }
    const body = (await res.json()) as { data?: unknown };
    return Array.isArray(body.data) ? body.data : [];
  } finally {
    clearTimeout(timeout);
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  // Strapi v4 nested attributes
  if (obj.attributes && typeof obj.attributes === "object") {
    return {
      ...(obj.attributes as Record<string, unknown>),
      documentId: obj.documentId ?? obj.id,
      id: obj.id,
    };
  }
  return obj;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function mediaUrl(raw: unknown, baseUrl: string): string | null {
  const entry = asRecord(raw);
  if (!entry) return null;
  // populated media may be { data: { attributes: { url } } } or flat
  const nested = entry.data ? asRecord(entry.data) : entry;
  if (!nested) return null;
  const url = asString(nested.url);
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

function relationList(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.map(asRecord).filter(Boolean) as Record<string, unknown>[];
  }
  const wrapped = asRecord(raw);
  if (wrapped?.data && Array.isArray(wrapped.data)) {
    return wrapped.data
      .map(asRecord)
      .filter(Boolean) as Record<string, unknown>[];
  }
  return [];
}

function relationOne(raw: unknown): Record<string, unknown> | null {
  if (Array.isArray(raw)) return asRecord(raw[0]);
  const wrapped = asRecord(raw);
  if (!wrapped) return null;
  if (wrapped.data !== undefined) {
    if (Array.isArray(wrapped.data)) return asRecord(wrapped.data[0]);
    return asRecord(wrapped.data);
  }
  return wrapped;
}

function shapeArticle(raw: unknown, baseUrl: string): StrapiArticle | null {
  const entry = asRecord(raw);
  if (!entry) return null;
  const title = asString(entry.title);
  const slug = asString(entry.slug);
  if (!title || !slug) return null;

  const author = relationOne(entry.author);
  const tags = relationList(entry.tags)
    .map((tag) => {
      const name = asString(tag.name);
      const tagSlug = asString(tag.slug) || (name ? name.toLowerCase().replace(/\s+/g, "-") : null);
      if (!name || !tagSlug) return null;
      return { name, slug: tagSlug };
    })
    .filter(Boolean) as Array<{ name: string; slug: string }>;

  const format = asString(entry.contentFormat);
  const contentFormat =
    format === "markdown" ||
    format === "mdx" ||
    format === "blocks" ||
    format === "html"
      ? format
      : null;

  return {
    documentId: String(entry.documentId ?? entry.id ?? slug),
    title,
    slug,
    excerpt: asString(entry.excerpt),
    body: asString(entry.body),
    contentFormat,
    featuredImageUrl: mediaUrl(entry.featuredImage, baseUrl),
    authorName: author ? asString(author.name) : null,
    tags,
    publishedDate:
      asString(entry.publishedDate) || asString(entry.publishedAt),
    updatedDate: asString(entry.updatedDate) || asString(entry.updatedAt),
    featured: Boolean(entry.featured),
  };
}

function shapeProject(raw: unknown, baseUrl: string): StrapiProject | null {
  const entry = asRecord(raw);
  if (!entry) return null;
  const name = asString(entry.name) || asString(entry.title);
  const slug = asString(entry.slug);
  if (!name || !slug) return null;

  const statusRaw =
    asString(entry.projectStatus) || asString(entry.status) || "";
  let status: StrapiProject["status"] = null;
  if (statusRaw === "active") status = "in-progress";
  else if (
    statusRaw === "planned" ||
    statusRaw === "in-progress" ||
    statusRaw === "completed" ||
    statusRaw === "archived"
  ) {
    status = statusRaw;
  }

  const technologies = relationList(entry.technologies)
    .map((t) => asString(t.name))
    .filter(Boolean) as string[];

  return {
    documentId: String(entry.documentId ?? entry.id ?? slug),
    name,
    slug,
    summary: asString(entry.summary),
    description: asString(entry.description),
    projectType: asString(entry.projectType),
    technologies,
    featuredImageUrl: mediaUrl(entry.featuredImage, baseUrl),
    repositoryUrl: asString(entry.repositoryUrl),
    liveUrl: asString(entry.liveUrl),
    documentationUrl: asString(entry.documentationUrl),
    status,
    startDate: asString(entry.startDate),
    endDate: asString(entry.endDate),
    featured: Boolean(entry.featured),
  };
}

function shapeCaseStudy(
  raw: unknown,
  baseUrl: string,
): StrapiCaseStudy | null {
  const entry = asRecord(raw);
  if (!entry) return null;
  const title = asString(entry.title);
  const slug = asString(entry.slug);
  if (!title || !slug) return null;

  const related = relationOne(entry.relatedProject);
  const technologies = relationList(entry.technologies)
    .map((t) => asString(t.name))
    .filter(Boolean) as string[];

  return {
    documentId: String(entry.documentId ?? entry.id ?? slug),
    title,
    slug,
    clientName: asString(entry.clientName),
    summary: asString(entry.summary),
    challenge: asString(entry.challenge),
    solution: asString(entry.solution),
    results: asString(entry.results),
    technologies,
    featuredImageUrl: mediaUrl(entry.featuredImage, baseUrl),
    relatedProjectSlug: related ? asString(related.slug) : null,
    publishedAt: asString(entry.publishedAt),
  };
}
