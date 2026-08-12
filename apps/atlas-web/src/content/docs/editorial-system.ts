/**
 * Editorial Publishing System — handbook ADR for Page 26 primitives.
 */

import type { DocDetail } from "@/content/doc";
import { baseDocShell } from "@/content/docs/build-detail";
import { docSummaries } from "@/content/docs/summaries";

const self = docSummaries[1]!;

export const editorialSystemDoc: DocDetail = {
  ...baseDocShell(self),
  toc: [
    { id: "intent", label: "01 Intent", href: "#intent" },
    { id: "primitives", label: "02 Primitives", href: "#primitives" },
    { id: "surfaces", label: "03 Surfaces", href: "#surfaces" },
    { id: "constraints", label: "04 Constraints", href: "#constraints" },
  ],
  sections: [
    {
      id: "intent",
      chapter: "01 · INTENT",
      title: "Publishing patterns are named, finite, and reusable.",
      paragraphs: [
        "Page 26 defines the Editorial Publishing System — Callout, CodeBlock, TerminalBlock, Figure, MetadataRow, TOC, related rows, and prev/next. Authors compose from this set; they do not invent layout engines.",
        "M5 proved these primitives on Articles. M6 reuses them on Documentation without merging the two routes.",
      ],
      paragraphsTablet: [
        "Page 26 names the publishing primitives. Authors compose from a finite set.",
        "M5 proved them on Articles; M6 reuses them on Documentation without merging IA.",
      ],
    },
    {
      id: "primitives",
      chapter: "02 · PRIMITIVES",
      title: "Evidence beats decoration.",
      paragraphs: [
        "Callouts carry tradeoffs and warnings. Code and terminal blocks are proof surfaces. Figures require alt text and captions. Metadata rows stay quiet mono Label · value pairs.",
      ],
      callout: {
        variant: "tradeoff",
        title: "Share primitives — not index IA.",
        body: "Sharing primitives across Articles and Documentation reduces drift. Sharing index IA would collapse chronology into a handbook — rejected.",
        bodyCompact:
          "Share primitives across surfaces. Do not share index information architecture.",
      },
      code: {
        language: "tsx",
        caption: "TSX · Callout usage",
        code: `<Callout variant="tradeoff" title="TRADEOFF">
  Share primitives. Keep Articles and Documentation IA separate.
</Callout>`,
      },
    },
    {
      id: "surfaces",
      chapter: "03 · SURFACES",
      title: "Two surfaces, one primitive kit.",
      paragraphs: [
        "`/articles` remains newest-first engineering writing. `/docs` remains category-driven handbook entries. Both may use ReadingProgress, TOC, related content, and prev/next.",
      ],
      figure: {
        alt: "Editorial publishing primitives shared across Articles and Documentation",
        label: "FIG · Page 26 primitive kit",
        caption:
          "Fig. 1 — Shared publishing kit; separate route compositions for Articles and Documentation.",
        captionCompact:
          "Fig. 1 — Shared kit; separate Articles and Documentation compositions.",
      },
    },
    {
      id: "constraints",
      chapter: "04 · CONSTRAINTS",
      title: "No page builder. No dynamic-zone mapper.",
      paragraphs: [
        "Section compositions stay page-local. Fixtures are typed for later Strapi `article` mapping. Do not introduce a generic section renderer for Atlas v1.",
      ],
      terminal: {
        caption: "TERMINAL · fixture resolve",
        lines: [
          "$ getDoc('editorial-system')",
          "→ DocDetail { category: 'Publishing', kind: 'ADR' }",
        ],
      },
    },
  ],
};
