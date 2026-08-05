import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { normalizeDate, normalizeSlug, assignSites } from "../normalize.js";
import type { NormalizedRecord, ReviewItem } from "../types.js";

export interface ArticleExtractResult {
  records: NormalizedRecord[];
  reviewQueue: ReviewItem[];
  portfolioCount: number;
  hashnodeCount: number;
  duplicatesSkipped: number;
}

function stripLeadingSlashNoise(body: string): string {
  return body.replace(/^\s*\/(?=\S)/, "");
}

function parseArticleFile(
  filePath: string,
  sourceKind: "portfolio-blog" | "hashnode-mirror",
): { record?: NormalizedRecord; review?: ReviewItem } {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const slugRaw =
    (data.slug as string | undefined) ??
    path.basename(filePath, path.extname(filePath));
  const slug = normalizeSlug(String(slugRaw));
  const title = String(data.title ?? "").trim() || slug;
  const cuid = data.cuid != null ? String(data.cuid) : undefined;

  if (!slug) {
    return {
      review: {
        reason: "article-missing-slug",
        type: "article",
        title,
        sourcePath: filePath,
      },
    };
  }

  const publishedAt =
    normalizeDate(data.datePublished) ??
    normalizeDate(data.publishedAt) ??
    null;

  const coverUrl =
    (data.cover as string | undefined) ??
    (data.coverImage as string | undefined);
  const ogImageUrl = data.ogImage as string | undefined;

  let tags: string[] | undefined;
  if (Array.isArray(data.tags)) {
    tags = data.tags.map((t) => {
      if (typeof t === "string") return t;
      if (t && typeof t === "object" && "name" in t) {
        return String((t as { name: string }).name);
      }
      return String(t);
    });
  }

  const { siteKeys } = assignSites({ type: "article", slug, title });
  const upsertKey = cuid ? `article:cuid:${cuid}` : `article:slug:${slug}`;

  return {
    record: {
      type: "article",
      upsertKey,
      slug,
      title,
      siteKeys,
      hashnodeId: cuid,
      publishedAt,
      body: stripLeadingSlashNoise(content.trim()),
      coverUrl,
      ogImageUrl,
      tags,
      excerpt:
        typeof data.subtitle === "string"
          ? data.subtitle
          : typeof data.excerpt === "string"
            ? data.excerpt
            : undefined,
      sourcePath: filePath,
      sourceKind,
      payload: {
        metaTags: data.metaTags,
        settings: data.settings,
        isPublished: data.isPublished,
        visibility: data.visibility,
      },
    },
  };
}

function listMdFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(dir, f))
    .sort();
}

/**
 * Discover portfolio blog + Hashnode mirror; dedupe by cuid then slug.
 * Prefer portfolio copy when both exist.
 */
export function extractArticles(
  portfolioBlogDir: string,
  hashnodeDir: string,
): ArticleExtractResult {
  const reviewQueue: ReviewItem[] = [];
  const portfolioFiles = listMdFiles(portfolioBlogDir);
  const hashnodeFiles = listMdFiles(hashnodeDir);

  const byKey = new Map<string, NormalizedRecord>();
  const slugOwner = new Map<string, string>();
  let duplicatesSkipped = 0;

  const ingest = (
    filePath: string,
    sourceKind: "portfolio-blog" | "hashnode-mirror",
  ) => {
    const { record, review } = parseArticleFile(filePath, sourceKind);
    if (review) reviewQueue.push(review);
    if (!record) return;

    const existing = byKey.get(record.upsertKey);
    if (existing) {
      duplicatesSkipped += 1;
      if (
        sourceKind === "portfolio-blog" &&
        existing.sourceKind === "hashnode-mirror"
      ) {
        byKey.set(record.upsertKey, record);
      }
      return;
    }

    const priorSlugKey = slugOwner.get(record.slug);
    if (priorSlugKey && priorSlugKey !== record.upsertKey) {
      duplicatesSkipped += 1;
      reviewQueue.push({
        reason: "article-slug-collision",
        upsertKey: record.upsertKey,
        type: "article",
        slug: record.slug,
        title: record.title,
        sourcePath: filePath,
        notes: `Collides with ${priorSlugKey}`,
      });
      return;
    }

    byKey.set(record.upsertKey, record);
    slugOwner.set(record.slug, record.upsertKey);
  };

  for (const f of portfolioFiles) ingest(f, "portfolio-blog");
  for (const f of hashnodeFiles) ingest(f, "hashnode-mirror");

  return {
    records: [...byKey.values()].sort((a, b) => a.slug.localeCompare(b.slug)),
    reviewQueue,
    portfolioCount: portfolioFiles.length,
    hashnodeCount: hashnodeFiles.length,
    duplicatesSkipped,
  };
}
