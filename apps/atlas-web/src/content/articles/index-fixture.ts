/**
 * Articles index fixture — chronological publishing surface.
 * Distinct from Documentation. No live CMS this milestone.
 */

import {
  ATLAS_DEFAULT_AUTHOR,
  type ArticlesIndexFixture,
} from "@/content/article";
import { articleSummaries } from "@/content/articles/summaries";

const featured = articleSummaries.find((a) => a.featured)!;
const listArticles = articleSummaries.filter((a) => !a.featured);

export const articlesIndexFixture: ArticlesIndexFixture = {
  site: { key: "personal", name: "Atlas" },
  seo: {
    title: "Articles",
    description:
      "Engineering writing — chronological notes on architecture, delivery, tooling, and production decisions. Distinct from the Documentation handbook.",
  },
  intro: {
    chapter: "ARTICLES",
    title: "Engineering writing.",
    dek: "Chronological notes on architecture, delivery, tooling, and the decisions that survive production. Distinct from the Documentation handbook.",
    dekCompact:
      "Chronological notes on architecture, delivery, tooling, and production decisions. Distinct from Documentation.",
  },
  topics: {
    label: "TOPICS",
    items: [
      { id: "all", label: "All", active: true },
      { id: "architecture", label: "Architecture" },
      { id: "delivery", label: "Delivery" },
      { id: "platform", label: "Platform" },
      { id: "testing", label: "Testing" },
      { id: "tooling", label: "Tooling" },
    ],
  },
  featured: {
    chapter: "FEATURED",
    article: featured,
    author: ATLAS_DEFAULT_AUTHOR,
    image: {
      src: "/images/articles/featured-rsc.png",
      alt: "Network infrastructure cables — featured article atmosphere",
      width: 1420,
      height: 840,
    },
  },
  list: {
    chapter: "ALL ARTICLES",
    headline: "Newest first.",
    articles: listArticles,
  },
  pagination: {
    label: "ARCHIVE PAGES",
    currentPage: 1,
    totalPages: 3,
    pages: [1, 2, 3],
    newerHref: null,
    olderHref: "?page=2",
  },
  cue: {
    chapter: "CONTINUE",
    title: "Prefer a conversation over a list.",
    body: "For qualified questions about systems, delivery, or Atlas itself — use Contact. Documentation remains the handbook for procedures and ADRs.",
    bodyCompact:
      "For qualified questions — use Contact. Documentation remains the handbook.",
    cta: { label: "Start a conversation", href: "/contact" },
    workLink: { label: "or browse Work →", href: "/work" },
  },
};
