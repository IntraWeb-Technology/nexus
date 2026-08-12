/**
 * Shared article summaries — newest-first chronological order.
 * Index and detail fixtures derive from this list so Strapi mapping stays one-shaped.
 */

import type { ArticleSummary } from "@/content/article";

export const articleSummaries: ArticleSummary[] = [
  {
    id: "why-we-chose-rsc",
    slug: "why-we-chose-react-server-components",
    title: "Why We Chose React Server Components",
    excerpt:
      "A decision record for Atlas: streaming boundaries, cache discipline, and what RSC did not solve.",
    publishedDate: "2025-04-02",
    topic: "Architecture",
    readingTime: "14 min",
    type: "Essay",
    featured: true,
    href: "/articles/why-we-chose-react-server-components",
  },
  {
    id: "playwright-at-scale",
    slug: "playwright-at-scale",
    title: "Playwright at Scale",
    excerpt:
      "Fixture strategy, flake triage, and what CI artifacts must prove before a release.",
    excerptCompact:
      "Fixture strategy, flake triage, and CI artifacts before release.",
    publishedDate: "2025-03-28",
    topic: "Testing",
    readingTime: "11 min",
    type: "Essay",
    featured: false,
    href: "/articles/playwright-at-scale",
  },
  {
    id: "lessons-from-building-atlas",
    slug: "lessons-from-building-atlas",
    title: "Lessons from Building Atlas",
    excerpt:
      "What held up — and what we rewrote — shipping an editorial engineering publication.",
    excerptCompact: "What held up — and what we rewrote — shipping Atlas.",
    publishedDate: "2025-03-12",
    topic: "Architecture",
    readingTime: "12 min",
    type: "Essay",
    featured: false,
    href: "/articles/lessons-from-building-atlas",
  },
  {
    id: "migrating-contentful-to-strapi",
    slug: "migrating-from-contentful-to-strapi",
    title: "Migrating from Contentful to Strapi",
    excerpt:
      "Boundary decisions, content modeling, and keeping draft safety across sites.",
    excerptCompact: "Boundaries, modeling, and draft safety across sites.",
    publishedDate: "2025-02-19",
    topic: "Platform",
    readingTime: "16 min",
    type: "Decision",
    featured: false,
    href: "/articles/migrating-from-contentful-to-strapi",
  },
  {
    id: "ai-assisted-workflows",
    slug: "ai-assisted-engineering-workflows",
    title: "AI-Assisted Engineering Workflows",
    excerpt:
      "Where agents help, where they invent, and how review stays human.",
    publishedDate: "2025-01-30",
    topic: "Tooling",
    readingTime: "10 min",
    type: "Note",
    featured: false,
    href: "/articles/ai-assisted-engineering-workflows",
  },
  {
    id: "turborepo-build-optimization",
    slug: "turborepo-build-optimization",
    title: "Turborepo Build Optimization",
    excerpt:
      "Affected graphs, remote cache discipline, and keeping CI honest.",
    excerptCompact: "Affected graphs, remote cache, and honest CI.",
    publishedDate: "2025-01-08",
    topic: "Delivery",
    readingTime: "9 min",
    type: "Note",
    featured: false,
    href: "/articles/turborepo-build-optimization",
  },
];

export function summaryMetaLine(article: ArticleSummary): string {
  return `${article.publishedDate}  ·  ${article.topic}  ·  ${article.readingTime}  ·  ${article.type}`;
}

export function summaryMetaCompact(article: ArticleSummary): string {
  return `${article.topic}  ·  ${article.readingTime}  ·  ${article.type}`;
}

export function toNavLink(article: ArticleSummary) {
  return {
    slug: article.slug,
    title: article.title,
    topic: article.topic,
    readingTime: article.readingTime,
    href: article.href,
  };
}
