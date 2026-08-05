import type { z } from "zod";
import type {
  articleSchema,
  authorSchema,
  caseStudySchema,
  categorySchema,
  faqItemSchema,
  navigationSchema,
  pageBlockSchema,
  pageSchema,
  projectRefSchema,
  projectSchema,
  redirectSchema,
  serviceSchema,
  siteRefSchema,
  siteSettingsSchema,
  tagSchema,
  technologySchema,
  testimonialSchema,
} from "./schemas/domain.js";
import type {
  contactInformationSchema,
  featureSchema,
  linkSchema,
  navigationItemSchema,
  seoSchema,
  socialLinkSchema,
  statItemSchema,
} from "./schemas/components.js";
import type { mediaAssetSchema } from "./schemas/media.js";

/** Stable site keys from architecture contracts (`docs/strapi-migration/contracts.md`). */
export type SiteKey = "personal" | "intraweb";

export type NavigationLocation = "header" | "footer" | "mobile" | "sidebar";

/** Draft preview via Strapi 5 `status=draft` (requires a token that can read drafts). */
export type PublicationStatus = "published" | "draft";

export type ListOptions = {
  page?: number;
  pageSize?: number;
  sort?: string | string[];
  featured?: boolean;
  /** When true, requests `status=draft` instead of `status=published`. */
  preview?: boolean;
  /** Extra Strapi filters merged with the site/slug/featured filters. */
  filters?: Record<string, unknown>;
};

export type CollectionOptions = {
  featured?: boolean;
  sort?: string | string[];
  preview?: boolean;
  filters?: Record<string, unknown>;
};

export type RequestOptions = {
  preview?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type Paginated<T> = {
  items: T[];
  pagination: PaginationMeta | null;
};

// Building-block domain types, inferred from zod schemas (schemas/*.ts) so the
// runtime validation and the static types can never drift apart.
export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type Seo = z.infer<typeof seoSchema>;
export type Link = z.infer<typeof linkSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type NavigationItem = z.infer<typeof navigationItemSchema>;
export type ContactInformation = z.infer<typeof contactInformationSchema>;
export type Feature = z.infer<typeof featureSchema>;
export type StatItem = z.infer<typeof statItemSchema>;

export type SiteRef = z.infer<typeof siteRefSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type Navigation = z.infer<typeof navigationSchema>;
export type PageBlock = z.infer<typeof pageBlockSchema>;
export type Page = z.infer<typeof pageSchema>;
export type Author = z.infer<typeof authorSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Tag = z.infer<typeof tagSchema>;
export type Technology = z.infer<typeof technologySchema>;
export type Article = z.infer<typeof articleSchema>;
export type ProjectRef = z.infer<typeof projectRefSchema>;
export type Project = z.infer<typeof projectSchema>;
export type CaseStudy = z.infer<typeof caseStudySchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type Redirect = z.infer<typeof redirectSchema>;

export type StrapiClient = {
  /** Verify an incoming preview/draft-mode request secret against the configured `previewSecret`. */
  verifyPreviewSecret: (secret: string | null | undefined) => boolean;

  getSiteSettings: (
    siteKey: SiteKey,
    options?: RequestOptions,
  ) => Promise<SiteSettings | null>;

  getNavigation: (
    siteKey: SiteKey,
    location: NavigationLocation,
    options?: RequestOptions,
  ) => Promise<Navigation | null>;

  getPageBySlug: (
    siteKey: SiteKey,
    slug: string,
    options?: RequestOptions,
  ) => Promise<Page | null>;

  getArticles: (
    siteKey: SiteKey,
    options?: ListOptions & RequestOptions,
  ) => Promise<Paginated<Article>>;

  getArticleBySlug: (
    siteKey: SiteKey,
    slug: string,
    options?: RequestOptions,
  ) => Promise<Article | null>;

  getProjects: (
    siteKey: SiteKey,
    options?: ListOptions & RequestOptions,
  ) => Promise<Paginated<Project>>;

  getProjectBySlug: (
    siteKey: SiteKey,
    slug: string,
    options?: RequestOptions,
  ) => Promise<Project | null>;

  getServices: (
    siteKey: SiteKey,
    options?: CollectionOptions & RequestOptions,
  ) => Promise<Service[]>;

  getCaseStudies: (
    siteKey: SiteKey,
    options?: ListOptions & RequestOptions,
  ) => Promise<Paginated<CaseStudy>>;

  getCaseStudyBySlug: (
    siteKey: SiteKey,
    slug: string,
    options?: RequestOptions,
  ) => Promise<CaseStudy | null>;

  getTestimonials: (
    siteKey: SiteKey,
    options?: CollectionOptions & RequestOptions,
  ) => Promise<Testimonial[]>;

  getFaqItems: (
    siteKey: SiteKey,
    options?: CollectionOptions & RequestOptions,
  ) => Promise<FaqItem[]>;

  getRedirect: (
    siteKey: SiteKey,
    sourcePath: string,
    options?: RequestOptions,
  ) => Promise<Redirect | null>;
};
