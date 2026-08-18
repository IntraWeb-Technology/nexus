import type { DocCategory, DocSummary } from "@/content/doc";

/** Application-owned handbook category cards — hrefs derived from assembled docs. */
const HANDBOOK_CATEGORY_META: Record<
  DocCategory,
  { id: string; description: string }
> = {
  Architecture: {
    id: "architecture",
    description: "System boundaries, contracts, diagrams",
  },
  "Design System": {
    id: "design-system",
    description: "Tokens, type, surfaces, motion",
  },
  Frontend: {
    id: "frontend",
    description: "App Router, fixtures, islands",
  },
  Testing: {
    id: "testing",
    description: "Playwright, a11y, CI proof",
  },
  Publishing: {
    id: "publishing",
    description: "Editorial primitives and IA",
  },
};

const HANDBOOK_CATEGORY_ORDER: DocCategory[] = [
  "Architecture",
  "Design System",
  "Frontend",
  "Testing",
  "Publishing",
];

export function buildHandbookCategoryItems(
  summaries: DocSummary[],
): Array<{
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
}> {
  const byCategory = new Map<DocCategory, DocSummary>();
  for (const summary of summaries) {
    if (!byCategory.has(summary.category)) {
      byCategory.set(summary.category, summary);
    }
  }

  return HANDBOOK_CATEGORY_ORDER.flatMap((category) => {
    const summary = byCategory.get(category);
    if (!summary) return [];
    const meta = HANDBOOK_CATEGORY_META[category];
    return [
      {
        id: meta.id,
        eyebrow: "SECTION",
        title: category,
        description: meta.description,
        href: summary.href,
      },
    ];
  });
}

/** Cross-surface links owned by the application — not derived from CMS slugs. */
export const DOCS_CROSS_LINK_ITEMS = [
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
] as const;
