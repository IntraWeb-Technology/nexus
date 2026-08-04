import { z } from "zod";
import type { SiteKey } from "./config.js";

export const SiteKeySchema = z.enum(["personal", "intraweb"]);

export const ContentTypeSchema = z.enum([
  "article",
  "case-study",
  "project",
  "navigation",
  "faq-item",
  "service",
]);

export type ContentType = z.infer<typeof ContentTypeSchema>;

export const NormalizedRecordSchema = z.object({
  type: ContentTypeSchema,
  /** Stable upsert key: hashnodeId (cuid) or `${type}:${slug}` */
  upsertKey: z.string(),
  slug: z.string(),
  title: z.string(),
  siteKeys: z.array(SiteKeySchema).min(1),
  hashnodeId: z.string().optional(),
  publishedAt: z.string().nullable().optional(),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  coverUrl: z.string().optional(),
  ogImageUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  status: z.string().optional(),
  sourcePath: z.string(),
  sourceKind: z.enum([
    "portfolio-blog",
    "hashnode-mirror",
    "portfolio-case-study",
    "portfolio-project",
    "iw-nav",
    "iw-faq",
    "iw-service",
  ]),
  /** Extra structured payload for Strapi mapping later */
  payload: z.record(z.unknown()).optional(),
});

export type NormalizedRecord = z.infer<typeof NormalizedRecordSchema>;

export const ReviewItemSchema = z.object({
  reason: z.string(),
  upsertKey: z.string().optional(),
  type: ContentTypeSchema.optional(),
  slug: z.string().optional(),
  title: z.string().optional(),
  sourcePath: z.string().optional(),
  suggestedSiteKeys: z.array(SiteKeySchema).optional(),
  notes: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

export type ReviewItem = z.infer<typeof ReviewItemSchema>;

export type UpsertAction = "create" | "update" | "skip-duplicate" | "skip";

export interface UpsertPlanItem {
  action: UpsertAction;
  upsertKey: string;
  type: ContentType;
  slug: string;
  title: string;
  siteKeys: SiteKey[];
  sourcePath: string;
  reason?: string;
  record: NormalizedRecord;
}

export interface DiscoveryCounts {
  portfolioArticles: number;
  hashnodeArticles: number;
  articlesAfterDedupe: number;
  caseStudies: number;
  projects: number;
  navigations: number;
  faqItems: number;
  servicesExtracted: number;
  servicesReviewQueued: number;
}

export interface MigrationRunResult {
  migrationBatch: string;
  mode: "dry-run" | "live" | "validate" | "rollback";
  startedAt: string;
  finishedAt: string;
  counts: DiscoveryCounts;
  plan: UpsertPlanItem[];
  reviewQueue: ReviewItem[];
  migrated: number;
  skipped: number;
  duplicates: number;
  errors: string[];
  reportPath?: string;
  reviewQueuePath?: string;
}
