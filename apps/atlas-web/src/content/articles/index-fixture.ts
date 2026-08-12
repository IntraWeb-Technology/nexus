/**
 * Articles index fixture — chronological publishing surface.
 * Distinct from Documentation. No live CMS this milestone.
 */

import type { ArticlesIndexFixture } from "@/content/article";
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
    ctaLabel: "Read article →",
  },
  list: {
    chapter: "ALL ARTICLES",
    headline: "Newest first.",
    articles: listArticles,
  },
  cue: {
    chapter: "CONTINUE",
    title: "Prefer a conversation over a list.",
    body: "For qualified questions about systems, delivery, or Atlas itself — use Contact. Documentation remains the handbook for procedures and ADRs.",
    bodyCompact:
      "For qualified questions — use Contact. Documentation remains the handbook.",
    links: [
      { label: "Contact →", href: "/contact" },
      { label: "Work →", href: "/work" },
    ],
  },
};
