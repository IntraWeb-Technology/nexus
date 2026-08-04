import path from "node:path";
import { randomUUID } from "node:crypto";
import { getEnvPaths } from "./config.js";
import { extractArticles } from "./extractors/articles.js";
import { extractCaseStudies } from "./extractors/case-studies.js";
import { extractProjects } from "./extractors/projects.js";
import { extractIntraweb } from "./extractors/intraweb.js";
import type {
  DiscoveryCounts,
  NormalizedRecord,
  ReviewItem,
  UpsertPlanItem,
} from "./types.js";

export interface DiscoveryBundle {
  migrationBatch: string;
  records: NormalizedRecord[];
  reviewQueue: ReviewItem[];
  counts: DiscoveryCounts;
  plan: UpsertPlanItem[];
  paths: ReturnType<typeof getEnvPaths>;
}

/** Build idempotent upsert plan keyed by upsertKey (hashnodeId/cuid or slug+type). */
export function buildUpsertPlan(records: NormalizedRecord[]): UpsertPlanItem[] {
  const seen = new Map<string, UpsertPlanItem>();
  const plan: UpsertPlanItem[] = [];

  for (const record of records) {
    const existing = seen.get(record.upsertKey);
    if (existing) {
      plan.push({
        action: "skip-duplicate",
        upsertKey: record.upsertKey,
        type: record.type,
        slug: record.slug,
        title: record.title,
        siteKeys: record.siteKeys,
        sourcePath: record.sourcePath,
        reason: `Duplicate of plan item from ${existing.sourcePath}`,
        record,
      });
      continue;
    }

    const item: UpsertPlanItem = {
      action: "create", // live mode resolves create vs update via Strapi lookup
      upsertKey: record.upsertKey,
      type: record.type,
      slug: record.slug,
      title: record.title,
      siteKeys: record.siteKeys,
      sourcePath: record.sourcePath,
      record,
    };
    seen.set(record.upsertKey, item);
    plan.push(item);
  }

  return plan;
}

export async function discoverAll(
  migrationBatch = randomUUID(),
): Promise<DiscoveryBundle> {
  const paths = getEnvPaths();
  const portfolioBlog = path.join(paths.portfolioSite, "content/blog");
  const caseStudies = path.join(paths.portfolioSite, "content/case-studies");
  const projectsDir = path.join(paths.portfolioSite, "data/projects");

  const articles = extractArticles(portfolioBlog, paths.hashnodeMirror);
  const cases = extractCaseStudies(caseStudies);
  const projects = extractProjects(projectsDir);
  const intraweb = extractIntraweb(paths.iwSite);

  const records: NormalizedRecord[] = [
    ...articles.records,
    ...cases.records,
    ...projects.records,
    ...intraweb.records,
  ];

  const reviewQueue: ReviewItem[] = [
    ...articles.reviewQueue,
    ...cases.reviewQueue,
    ...projects.reviewQueue,
    ...intraweb.reviewQueue,
  ];

  const plan = buildUpsertPlan(records);

  const counts: DiscoveryCounts = {
    portfolioArticles: articles.portfolioCount,
    hashnodeArticles: articles.hashnodeCount,
    articlesAfterDedupe: articles.records.length,
    caseStudies: cases.records.length,
    projects: projects.records.length,
    navigations: intraweb.navCount,
    faqItems: intraweb.faqCount,
    servicesExtracted: intraweb.servicesExtracted,
    servicesReviewQueued: intraweb.servicesReviewQueued,
  };

  return {
    migrationBatch,
    records,
    reviewQueue,
    counts,
    plan,
    paths,
  };
}
