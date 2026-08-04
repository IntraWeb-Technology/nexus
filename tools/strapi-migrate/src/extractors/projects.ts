import fs from "node:fs";
import path from "node:path";
import { assignSites, normalizeDate, normalizeSlug } from "../normalize.js";
import type { NormalizedRecord, ReviewItem } from "../types.js";

export interface ProjectExtractResult {
  records: NormalizedRecord[];
  reviewQueue: ReviewItem[];
}

interface ProjectMetaLoose {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  image?: string;
  tags?: string[];
  liveUrl?: string;
  caseStudyUrl?: string;
  githubUrl?: string;
  documentationUrl?: string;
  featured?: boolean;
  published?: boolean;
  status?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string[];
  category?: string;
  client?: string;
  industry?: string;
  teamSize?: string;
  duration?: string;
  overview?: string;
  challenge?: string;
  solution?: string;
  keyFeatures?: string[];
  impact?: string;
  learnings?: string;
  version?: string;
  versionStatus?: string;
  lastUpdated?: string;
  recentUpdates?: string[];
  upcomingFeatures?: string[];
  changelogUrl?: string;
}

/**
 * Regex fallback when dynamic import fails — extracts string/array fields from ProjectMeta literals.
 */
function parseProjectFileFallback(filePath: string): ProjectMetaLoose | null {
  const src = fs.readFileSync(filePath, "utf8");
  if (!/export const \w+.*ProjectMeta\s*=/.test(src) && !/export const \w+\s*[:=]/.test(src)) {
    return null;
  }

  const str = (key: string): string | undefined => {
    const m = src.match(new RegExp(`${key}\\s*:\\s*['\`"]([^'\`"]*)['\`"]`));
    return m?.[1];
  };

  const strArr = (key: string): string[] | undefined => {
    const m = src.match(new RegExp(`${key}\\s*:\\s*\\[([^\\]]*)]`, "s"));
    if (!m) return undefined;
    return [...m[1].matchAll(/['"`]([^'"`]+)['"`]/g)].map((x) => x[1]);
  };

  const bool = (key: string): boolean | undefined => {
    const m = src.match(new RegExp(`${key}\\s*:\\s*(true|false)`));
    return m ? m[1] === "true" : undefined;
  };

  const slug = str("slug");
  if (!slug) return null;

  return {
    id: str("id"),
    title: str("title"),
    slug,
    description: str("description"),
    image: str("image"),
    tags: strArr("tags"),
    liveUrl: str("liveUrl"),
    caseStudyUrl: str("caseStudyUrl"),
    githubUrl: str("githubUrl"),
    documentationUrl: str("documentationUrl"),
    featured: bool("featured"),
    published: bool("published"),
    status: str("status"),
    startDate: str("startDate"),
    endDate: str("endDate"),
    technologies: strArr("technologies"),
    category: str("category"),
    client: str("client"),
    industry: str("industry"),
    teamSize: str("teamSize"),
    duration: str("duration"),
    overview: str("overview"),
    challenge: str("challenge"),
    solution: str("solution"),
    keyFeatures: strArr("keyFeatures"),
    impact: str("impact"),
    learnings: str("learnings"),
    version: str("version"),
    versionStatus: str("versionStatus"),
    lastUpdated: str("lastUpdated"),
    recentUpdates: strArr("recentUpdates"),
    upcomingFeatures: strArr("upcomingFeatures"),
    changelogUrl: str("changelogUrl"),
  };
}

function toRecord(
  p: ProjectMetaLoose,
  sourcePath: string,
): { record?: NormalizedRecord; review?: ReviewItem } {
  const slug = normalizeSlug(String(p.slug ?? p.id ?? ""));
  const title = String(p.title ?? slug);
  if (!slug || !title) {
    return {
      review: {
        reason: "project-missing-slug-or-title",
        type: "project",
        sourcePath,
        data: p as Record<string, unknown>,
      },
    };
  }

  const assignment = assignSites({
    type: "project",
    slug,
    title,
    id: p.id,
    client: p.client,
  });

  const review: ReviewItem | undefined = assignment.ambiguous
    ? {
        reason: "project-ambiguous-site",
        type: "project",
        slug,
        title,
        sourcePath,
        suggestedSiteKeys: assignment.siteKeys,
        notes: assignment.reason,
      }
    : undefined;

  return {
    review,
    record: {
      type: "project",
      upsertKey: `project:slug:${slug}`,
      slug,
      title,
      siteKeys: assignment.siteKeys,
      publishedAt: normalizeDate(p.startDate),
      excerpt: p.description,
      coverUrl: p.image,
      tags: p.tags,
      technologies: p.technologies,
      status: p.status,
      sourcePath,
      sourceKind: "portfolio-project",
      payload: { ...p },
    },
  };
}

export function extractProjects(projectsDir: string): ProjectExtractResult {
  const reviewQueue: ReviewItem[] = [];
  const records: NormalizedRecord[] = [];

  if (!fs.existsSync(projectsDir)) {
    reviewQueue.push({
      reason: "projects-dir-missing",
      notes: projectsDir,
    });
    return { records, reviewQueue };
  }

  // Parse ProjectMeta object literals directly (avoid importing foreign TS graphs).
  const files = fs
    .readdirSync(projectsDir)
    .filter(
      (f) =>
        f.endsWith(".ts") &&
        f !== "index.ts" &&
        f !== "types.ts",
    )
    .map((f) => path.join(projectsDir, f))
    .sort();

  for (const filePath of files) {
    const parsed = parseProjectFileFallback(filePath);
    if (!parsed) {
      reviewQueue.push({
        reason: "project-parse-failed",
        sourcePath: filePath,
      });
      continue;
    }
    const { record, review } = toRecord(parsed, filePath);
    if (review) reviewQueue.push(review);
    if (record) records.push(record);
  }

  return { records, reviewQueue };
}
