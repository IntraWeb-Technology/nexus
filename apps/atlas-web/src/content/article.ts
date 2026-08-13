/**
 * Article domain types — target shape for future Strapi `article` mapping.
 * UI and sections import from here; fixtures supply data only.
 * No Strapi DTOs in this module.
 */

import type { MetaItem, NavLink } from "@/content/types";

/** Atlas Articles topics — map from Strapi `category` later. */
export type ArticleTopic =
  | "Architecture"
  | "Delivery"
  | "Platform"
  | "Testing"
  | "Tooling";

/** Editorial type — distinct from Documentation handbook entries. */
export type ArticleType = "Essay" | "Decision" | "Note";

export type ArticleStatus = "Published" | "Draft";

/** Author lockup — map from Strapi `author` when present. */
export type ArticleAuthor = {
  name: string;
  portraitSrc: string;
  portraitAlt: string;
};

/** Featured / hero media for index and detail compositions. */
export type ArticleFeaturedMedia = {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};

/** Index / list card — mirrors Strapi article collection fields used on `/articles`. */
export type ArticleSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Shorter excerpt for tablet / mobile list rows */
  excerptCompact?: string;
  publishedDate: string;
  topic: ArticleTopic;
  readingTime: string;
  type: ArticleType;
  featured: boolean;
  href: string;
};

export type ArticleTocItem = {
  id: string;
  label: string;
  href: string;
};

export type ArticleCallout = {
  variant: "tradeoff" | "note" | "warning";
  title: string;
  body: string;
  /** Shorter body for tablet / mobile */
  bodyCompact?: string;
};

export type ArticleCodeBlock = {
  language: string;
  caption: string;
  captionCompact?: string;
  code: string;
};

export type ArticleTerminalBlock = {
  caption: string;
  captionCompact?: string;
  lines: string[];
};

export type ArticleFigureBlock = {
  alt: string;
  label: string;
  labelCompact?: string;
  caption: string;
  captionCompact?: string;
  /**
   * When set, ArticleBody prefers a composed diagram / production media
   * over the placeholder label plane. `composed: "rsc-request-path"` is M7 PA-ART1.
   */
  composed?: "rsc-request-path";
  src?: string;
  width?: number;
  height?: number;
  sizes?: string;
};

/** Comparison / compatibility matrix — semantic table in ArticleBody. */
export type ArticleTableBlock = {
  caption: string;
  captionCompact?: string;
  columns: string[];
  rows: Array<{ id: string; cells: string[] }>;
};

/** Engineering evidence — CI, deploy, tests, coverage, a11y, repo proof. */
export type ArticleEvidenceKind =
  | "ci"
  | "deploy"
  | "test"
  | "coverage"
  | "performance"
  | "a11y"
  | "repository"
  | "documentation";

export type ArticleEvidenceBlock = {
  kind: ArticleEvidenceKind;
  title: string;
  /** Human-readable status — never color-only. */
  status: string;
  meta: Array<{ label: string; value: string }>;
  href?: string;
  hrefLabel?: string;
};

export type ArticleSection = {
  id: string;
  chapter: string;
  title: string;
  paragraphs: string[];
  /** Condensed paragraphs for tablet */
  paragraphsTablet?: string[];
  /** Single condensed body for mobile when needed */
  bodyMobile?: string;
  figure?: ArticleFigureBlock;
  callout?: ArticleCallout;
  code?: ArticleCodeBlock;
  terminal?: ArticleTerminalBlock;
  table?: ArticleTableBlock;
  evidence?: ArticleEvidenceBlock;
};

export type ArticleNavLink = {
  slug: string;
  title: string;
  topic: ArticleTopic;
  readingTime: string;
  href: string;
};

export type ArticlesPagination = {
  label: string;
  currentPage: number;
  totalPages: number;
  pages: number[];
  newerHref: string | null;
  olderHref: string | null;
};

export type ArticleDetail = {
  site: { key: "personal"; name: string };
  seo: {
    title: string;
    description: string;
  };
  /** Collection fields — map cleanly from Strapi `article` */
  article: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    excerptCompact?: string;
    publishedDate: string;
    topic: ArticleTopic;
    readingTime: string;
    type: ArticleType;
    status: ArticleStatus;
    featured: boolean;
    contentFormat: "markdown" | "mdx" | "blocks" | "html";
  };
  header: {
    chapter: string;
    title: string;
    dek: string;
    dekCompact?: string;
    author: ArticleAuthor;
    meta: MetaItem[];
    featuredImage?: ArticleFeaturedMedia;
  };
  toc: ArticleTocItem[];
  sections: ArticleSection[];
  related: {
    chapter: string;
    title: string;
    items: ArticleNavLink[];
  };
  prevNext: {
    previous: ArticleNavLink | null;
    next: ArticleNavLink | null;
  };
  contact: {
    chapter: string;
    title: string;
    body: string;
    bodyCompact?: string;
    cta: NavLink;
    workLink: NavLink;
  };
};

export type ArticlesIndexFixture = {
  site: { key: "personal"; name: string };
  seo: {
    title: string;
    description: string;
  };
  intro: {
    chapter: string;
    title: string;
    dek: string;
    dekCompact: string;
  };
  topics: {
    label: string;
    items: Array<{ id: string; label: string; active?: boolean }>;
  };
  featured: {
    chapter: string;
    article: ArticleSummary;
    author: ArticleAuthor;
    image: ArticleFeaturedMedia;
  };
  list: {
    chapter: string;
    headline: string;
    articles: ArticleSummary[];
  };
  pagination: ArticlesPagination;
  cue: {
    chapter: string;
    title: string;
    body: string;
    bodyCompact: string;
    cta: NavLink;
    workLink: NavLink;
  };
};

/** Default publishing identity when CMS author is absent. */
export const ATLAS_DEFAULT_AUTHOR: ArticleAuthor = {
  name: "John Schibelli",
  portraitSrc: "/images/brand/john-schibelli-portrait.png",
  portraitAlt: "Portrait of John Schibelli",
};
