/**
 * Documentation domain types — handbook entries shaped for future Strapi `article` mapping.
 * Distinct from Articles (`content/article.ts`): category-driven evergreen IA, not chronology.
 * UI and sections import from here; fixtures supply data only. No Strapi DTOs.
 */

import type { MetaItem, NavLink } from "@/content/types";

/** Handbook categories — map from Strapi `category` later. */
export type DocCategory =
  | "Architecture"
  | "Design System"
  | "Frontend"
  | "Testing"
  | "Publishing";

/** Document kind for list meta — distinct from ArticleType. */
export type DocKind = "Guide" | "ADR" | "Playbook" | "Procedure" | "Reference";

export type DocStatus = "Published" | "Draft";

/** Index / list row — mirrors Strapi article fields used on `/docs`. */
export type DocSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  excerptCompact?: string;
  /** Last updated — handbook surface cares about freshness, not publish chronology. */
  updatedDate: string;
  category: DocCategory;
  readingTime: string;
  kind: DocKind;
  href: string;
};

export type DocTocItem = {
  id: string;
  label: string;
  href: string;
};

export type DocCallout = {
  variant: "tradeoff" | "note" | "warning";
  title: string;
  body: string;
  bodyCompact?: string;
};

export type DocCodeBlock = {
  language: string;
  caption: string;
  captionCompact?: string;
  code: string;
};

export type DocTerminalBlock = {
  caption: string;
  captionCompact?: string;
  lines: string[];
};

export type DocFigureBlock = {
  alt: string;
  label: string;
  labelCompact?: string;
  caption: string;
  captionCompact?: string;
};

/** Comparison / compatibility matrix — semantic table in DocBody. */
export type DocTableBlock = {
  caption: string;
  captionCompact?: string;
  columns: string[];
  rows: Array<{ id: string; cells: string[] }>;
};

/** Engineering evidence — CI, tests, a11y, repository proof. */
export type DocEvidenceKind =
  | "ci"
  | "deploy"
  | "test"
  | "coverage"
  | "performance"
  | "a11y"
  | "repository"
  | "documentation";

export type DocEvidenceBlock = {
  kind: DocEvidenceKind;
  title: string;
  /** Human-readable status — never color-only. */
  status: string;
  meta: Array<{ label: string; value: string }>;
  href?: string;
  hrefLabel?: string;
};

export type DocSection = {
  id: string;
  chapter: string;
  title: string;
  paragraphs: string[];
  paragraphsTablet?: string[];
  bodyMobile?: string;
  figure?: DocFigureBlock;
  callout?: DocCallout;
  code?: DocCodeBlock;
  terminal?: DocTerminalBlock;
  table?: DocTableBlock;
  evidence?: DocEvidenceBlock;
};

export type DocNavLink = {
  slug: string;
  title: string;
  category: DocCategory;
  readingTime: string;
  href: string;
};

export type DocDetail = {
  site: { key: "personal"; name: string };
  seo: {
    title: string;
    description: string;
  };
  /** Collection fields — map cleanly from Strapi `article` with Documentation category. */
  document: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    excerptCompact?: string;
    updatedDate: string;
    category: DocCategory;
    readingTime: string;
    kind: DocKind;
    status: DocStatus;
    contentFormat: "markdown" | "mdx" | "blocks" | "html";
  };
  header: {
    chapter: string;
    title: string;
    dek: string;
    dekCompact?: string;
    meta: MetaItem[];
  };
  toc: DocTocItem[];
  sections: DocSection[];
  related: {
    chapter: string;
    title: string;
    items: DocNavLink[];
  };
  prevNext: {
    previous: DocNavLink | null;
    next: DocNavLink | null;
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

export type DocsCategoryCard = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
};

export type DocsIndexFixture = {
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
  search: {
    placeholder: string;
    shortcut: string;
  };
  categories: {
    chapter: string;
    items: DocsCategoryCard[];
  };
  recentlyUpdated: {
    chapter: string;
    items: DocSummary[];
  };
  progressNote: {
    chapter: string;
    body: string;
  };
};
