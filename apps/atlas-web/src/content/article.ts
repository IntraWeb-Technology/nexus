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
    meta: MetaItem[];
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
    ctaLabel: string;
  };
  list: {
    chapter: string;
    headline: string;
    articles: ArticleSummary[];
  };
  cue: {
    chapter: string;
    title: string;
    body: string;
    bodyCompact: string;
    links: NavLink[];
  };
};
