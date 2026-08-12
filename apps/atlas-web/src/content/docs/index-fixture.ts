/**
 * Documentation index fixture — category-driven handbook landing (Figma Page 22).
 * Distinct from Articles chronology. No live CMS this milestone.
 */

import type { DocsIndexFixture } from "@/content/doc";
import { docsByUpdatedDesc } from "@/content/docs/summaries";

export const docsIndexFixture: DocsIndexFixture = {
  site: { key: "personal", name: "Atlas" },
  seo: {
    title: "Documentation",
    description:
      "Atlas engineering handbook — architecture, design system, frontend, testing, and publishing. Category-driven and distinct from the Articles journal.",
  },
  intro: {
    chapter: "DOCUMENTATION",
    title: "Engineering handbook.",
    dek: "Architecture, design system, frontend, testing, and publishing — as one readable handbook. Distinct from the chronological Articles journal.",
    dekCompact:
      "Architecture, design system, frontend, testing, and publishing. Distinct from Articles.",
  },
  search: {
    placeholder: "Search documentation…",
    shortcut: "⌘K",
  },
  categories: {
    chapter: "CATEGORIES",
    items: [
      {
        id: "architecture",
        eyebrow: "SECTION",
        title: "Architecture",
        description: "System boundaries, contracts, diagrams",
        href: "/docs/atlas-architecture",
      },
      {
        id: "design-system",
        eyebrow: "SECTION",
        title: "Design System",
        description: "Tokens, type, surfaces, motion",
        href: "/docs/design-system",
      },
      {
        id: "frontend",
        eyebrow: "SECTION",
        title: "Frontend",
        description: "App Router, fixtures, islands",
        href: "/docs/frontend-architecture",
      },
      {
        id: "testing",
        eyebrow: "SECTION",
        title: "Testing",
        description: "Playwright, a11y, CI proof",
        href: "/docs/testing-strategy",
      },
      {
        id: "publishing",
        eyebrow: "SECTION",
        title: "Publishing",
        description: "Editorial primitives and IA",
        href: "/docs/editorial-system",
      },
      {
        id: "articles",
        eyebrow: "SECTION",
        title: "Articles",
        description: "Chronological engineering journal",
        href: "/articles",
      },
      {
        id: "work",
        eyebrow: "SECTION",
        title: "Case Studies",
        description: "Evidence-based project records",
        href: "/work",
      },
      {
        id: "recent",
        eyebrow: "SECTION",
        title: "Recently Updated",
        description: "Changelog of handbook pages",
        href: "#recently-updated",
      },
    ],
  },
  recentlyUpdated: {
    chapter: "RECENTLY UPDATED",
    items: docsByUpdatedDesc(),
  },
  progressNote: {
    chapter: "READING PROGRESS",
    body: "Per-document progress for long handbook entries. Shown on documentation templates; summarized here.",
  },
};
