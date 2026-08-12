/**
 * Frontend Architecture — handbook guide for atlas-web composition.
 */

import type { DocDetail } from "@/content/doc";
import { baseDocShell } from "@/content/docs/build-detail";
import { docSummaries } from "@/content/docs/summaries";

const self = docSummaries[3]!;

export const frontendArchitectureDoc: DocDetail = {
  ...baseDocShell(self),
  toc: [
    { id: "composition", label: "01 Composition", href: "#composition" },
    { id: "fixtures", label: "02 Fixtures", href: "#fixtures" },
    { id: "islands", label: "03 Islands", href: "#islands" },
    { id: "routing", label: "04 Routing", href: "#routing" },
  ],
  sections: [
    {
      id: "composition",
      chapter: "01 · COMPOSITION",
      title: "RSC by default. Explicit section components.",
      paragraphs: [
        "Atlas pages are React Server Components composed from page-local sections under `components/sections/`. Publishing primitives live in `components/editorial/`. Chrome lives in `components/chrome/`.",
        "There is no section registry, no dynamic-zone mapper, and no runtime layout DSL for Atlas v1.",
      ],
      paragraphsTablet: [
        "Pages are RSC compositions from page-local sections. Editorial primitives and chrome stay separate folders.",
        "No section registry or dynamic-zone mapper for Atlas v1.",
      ],
    },
    {
      id: "fixtures",
      chapter: "02 · FIXTURES",
      title: "Fixture-first, Strapi-shaped.",
      paragraphs: [
        "Content modules under `content/` mirror the fields planned for Strapi. UI imports domain types — never raw CMS DTOs. Documentation fixtures use `content/doc.ts`; Articles use `content/article.ts`.",
      ],
      code: {
        language: "typescript",
        caption: "TYPESCRIPT · docs registry",
        code: `export function getDoc(slug: string): DocDetail | undefined {
  return docBySlug[slug];
}`,
      },
      callout: {
        variant: "warning",
        title: "Strapi wiring waits for M8.",
        body: "Do not begin Strapi integration as a side quest during M6. Keep fixtures testable; wire CMS in M8.",
        bodyCompact:
          "No Strapi wiring in M6. Fixtures stay testable until M8.",
      },
    },
    {
      id: "islands",
      chapter: "03 · ISLANDS",
      title: "Client components only where interaction requires them.",
      paragraphs: [
        "Allowed islands today: route-aware nav active state, reading progress, contact form, and the documentation search filter placeholder. Prefer RSC for prose.",
      ],
      terminal: {
        caption: "TERMINAL · client boundary check",
        lines: [
          "$ rg '\"use client\"' apps/atlas-web/src",
          "chrome/site-nav-active.tsx",
          "chrome/reading-progress.tsx",
          "sections/docs-search.tsx",
          "sections/contact-form.tsx",
        ],
      },
    },
    {
      id: "routing",
      chapter: "04 · ROUTING",
      title: "`/docs` and `/docs/[...slug]` are handbook routes.",
      paragraphs: [
        "The catch-all slug keeps room for nested handbook paths later without inventing a CMS tree walker now. v1 fixtures use single-segment slugs.",
      ],
      figure: {
        alt: "Atlas frontend folder layout for docs routes and content fixtures",
        label: "FIG · app/docs · content/docs · sections/docs-*",
        caption:
          "Fig. 1 — Documentation routes resolve fixtures by slug; sections stay page-owned.",
        captionCompact:
          "Fig. 1 — Docs routes resolve fixtures; sections stay page-owned.",
      },
    },
  ],
};
