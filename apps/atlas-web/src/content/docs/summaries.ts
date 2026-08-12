/**
 * Shared documentation summaries — category-driven handbook order.
 * Index and detail fixtures derive from this list so Strapi mapping stays one-shaped.
 */

import type { DocSummary } from "@/content/doc";

/** Canonical handbook order (not newest-first). */
export const docSummaries: DocSummary[] = [
  {
    id: "atlas-architecture",
    slug: "atlas-architecture",
    title: "Atlas Architecture",
    excerpt:
      "System boundaries, site tenancy, and the contracts that keep Atlas inside Nexus.",
    excerptCompact: "Boundaries, tenancy, and contracts inside Nexus.",
    updatedDate: "2025-04-08",
    category: "Architecture",
    readingTime: "12 min",
    kind: "Guide",
    href: "/docs/atlas-architecture",
  },
  {
    id: "editorial-system",
    slug: "editorial-system",
    title: "Editorial Publishing System",
    excerpt:
      "Named primitives, article vs documentation IA, and how Page 26 patterns ship in production.",
    excerptCompact: "Named primitives and article vs documentation IA.",
    updatedDate: "2025-04-06",
    category: "Publishing",
    readingTime: "10 min",
    kind: "ADR",
    href: "/docs/editorial-system",
  },
  {
    id: "design-system",
    slug: "design-system",
    title: "Design System",
    excerpt:
      "Tokens, type roles, surfaces, and the freezes that keep Atlas visually consistent.",
    excerptCompact: "Tokens, type roles, surfaces, and visual freezes.",
    updatedDate: "2025-04-04",
    category: "Design System",
    readingTime: "9 min",
    kind: "Reference",
    href: "/docs/design-system",
  },
  {
    id: "frontend-architecture",
    slug: "frontend-architecture",
    title: "Frontend Architecture",
    excerpt:
      "App Router composition, fixture-first content, and where client islands are allowed.",
    excerptCompact: "RSC composition, fixtures, and client islands.",
    updatedDate: "2025-04-02",
    category: "Frontend",
    readingTime: "11 min",
    kind: "Guide",
    href: "/docs/frontend-architecture",
  },
  {
    id: "testing-strategy",
    slug: "testing-strategy",
    title: "Testing Strategy",
    excerpt:
      "Playwright journeys, a11y gates, and what CI artifacts must prove before release.",
    excerptCompact: "Playwright, a11y, and honest CI artifacts.",
    updatedDate: "2025-03-30",
    category: "Testing",
    readingTime: "10 min",
    kind: "Playbook",
    href: "/docs/testing-strategy",
  },
];

export function toDocNavLink(doc: DocSummary) {
  return {
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    readingTime: doc.readingTime,
    href: doc.href,
  };
}

/** Recently updated: freshness order (distinct from handbook category order). */
export function docsByUpdatedDesc(): DocSummary[] {
  return [...docSummaries].sort((a, b) =>
    a.updatedDate < b.updatedDate ? 1 : a.updatedDate > b.updatedDate ? -1 : 0,
  );
}
