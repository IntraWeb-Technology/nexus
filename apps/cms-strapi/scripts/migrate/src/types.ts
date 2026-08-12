/**
 * Shared types for the multi-site content migration tooling.
 * Site keys and content-type UIDs mirror `nexus/docs/strapi-migration/contracts.md`.
 * Do not diverge from that contract without updating it first.
 */

export type SiteKey = "personal" | "intraweb";

export type OriginalSource =
  | "hashnode"
  | "portfolio-markdown"
  | "portfolio-mdx"
  | "hardcoded-ts";

export type RunMode = "dry-run" | "validate" | "write";

export interface CliOptions {
  mode: RunMode;
  types: Set<ContentDomain>;
  withMedia: boolean;
  verbose: boolean;
}

export type ContentDomain =
  | "sites"
  | "articles"
  | "projects"
  | "case-studies"
  | "faq"
  | "nav";

export interface ReviewQueueItem {
  domain: ContentDomain;
  identifier: string;
  reason: string;
  sourceFile?: string;
  suggestedSites: SiteKey[];
  notes?: string;
}

export interface ValidationIssue {
  domain: ContentDomain;
  identifier: string;
  field: string;
  message: string;
  severity: "error" | "warning";
  sourceFile?: string;
}

export type UpsertAction =
  | "created"
  | "updated"
  | "skipped-duplicate"
  | "skipped-invalid"
  | "would-create"
  | "would-update"
  | "error";

export interface UpsertResult {
  domain: ContentDomain;
  identifier: string;
  action: UpsertAction;
  documentId?: string;
  detail?: string;
  sourceFile?: string;
  sourceFiles?: string[];
}

/** Intermediate, normalized representation shared by every article source before upsert. */
export interface ArticlePlan {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  contentFormat: "markdown" | "mdx" | "blocks" | "html";
  sites: SiteKey[];
  tagSlugs: string[];
  authorName?: string;
  authorEmail?: string;
  featuredImageUrl?: string;
  ogImageUrl?: string;
  originalSource: OriginalSource;
  originalUrl?: string;
  canonicalUrl?: string;
  hashnodeId?: string;
  hashnodePublication?: string;
  publishedDate?: string;
  updatedDate?: string;
  featured: boolean;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  shouldPublish: boolean;
  sourceFile: string;
  reviewFlags: string[];
}

export interface ProjectPlan {
  name: string;
  slug: string;
  summary: string;
  description: string;
  sites: SiteKey[];
  projectType?: string;
  technologyNames: string[];
  repositoryUrl?: string;
  liveUrl?: string;
  documentationUrl?: string;
  featuredImageUrl?: string;
  status: "planned" | "active" | "completed" | "archived";
  startDate?: string;
  endDate?: string;
  featured: boolean;
  originalSource: OriginalSource;
  sourceFile: string;
  reviewFlags: string[];
}

export interface CaseStudyPlan {
  title: string;
  slug: string;
  clientName?: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string;
  technologyNames: string[];
  relatedProjectSlug?: string;
  featuredImageUrl?: string;
  sites: SiteKey[];
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  canonicalUrl?: string;
  shouldPublish: boolean;
  originalSource: OriginalSource;
  sourceFile: string;
  reviewFlags: string[];
}

export interface FaqPlan {
  question: string;
  answer: string;
  sites: SiteKey[];
  sortOrder: number;
  sourceFile: string;
}

export interface NavPlan {
  name: string;
  siteKey: SiteKey;
  location: "header" | "footer" | "mobile" | "sidebar";
  items: Array<{ label: string; href: string }>;
  sourceFile: string;
}

export interface SourceCounts {
  filesScanned: number;
  itemsExtracted: number;
  duplicatesSkipped: number;
}
