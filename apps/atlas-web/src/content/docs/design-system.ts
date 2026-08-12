/**
 * Design System — handbook reference for Atlas tokens and freezes.
 */

import type { DocDetail } from "@/content/doc";
import { baseDocShell } from "@/content/docs/build-detail";
import { docSummaries } from "@/content/docs/summaries";

const self = docSummaries[2]!;

export const designSystemDoc: DocDetail = {
  ...baseDocShell(self),
  toc: [
    { id: "tokens", label: "01 Tokens", href: "#tokens" },
    { id: "type", label: "02 Type", href: "#type" },
    { id: "surfaces", label: "03 Surfaces", href: "#surfaces" },
    { id: "freeze", label: "04 Freeze", href: "#freeze" },
  ],
  sections: [
    {
      id: "tokens",
      chapter: "01 · TOKENS",
      title: "Paper, ink, sage — and nothing purple.",
      paragraphs: [
        "Atlas tokens live as CSS variables under `--atlas-*`. Paper `#F3F0E9`, elevated `#FFFCF7`, ink `#1A1814`, body `#5A554C`, sage `#4A5C56`, umber `#5C4A3A`, border `#D4CEC2`.",
        "Forbidden looks from the brand rules stay forbidden in implementation: purple marketing gradients, badge rainbows, multi-layer shadows as default elevation.",
      ],
      paragraphsTablet: [
        "Tokens live as `--atlas-*` CSS variables: paper, elevated, ink, body, sage, umber, border.",
        "Purple marketing gradients and multi-layer shadow defaults remain forbidden.",
      ],
      code: {
        language: "css",
        caption: "CSS · core tokens",
        code: `:root {
  --atlas-paper: #f3f0e9;
  --atlas-elevated: #fffcf7;
  --atlas-ink: #1a1814;
  --atlas-sage: #4a5c56;
}`,
      },
    },
    {
      id: "type",
      chapter: "02 · TYPE",
      title: "Newsreader for display. Inter for UI. JetBrains for meta.",
      paragraphs: [
        "Display titles use Newsreader. Body and UI use Inter. Metadata and code use JetBrains Mono. Load via `next/font` — do not fall back to anonymous system stacks as the designed face.",
      ],
      callout: {
        variant: "note",
        title: "Chapter markers are not headings.",
        body: "Chapter markers are tracked uppercase labels. They are not heading substitutes — one `h1` per page, logical `h2` order beneath.",
        bodyCompact:
          "Chapter markers are labels, not headings. One h1 per page.",
      },
    },
    {
      id: "surfaces",
      chapter: "03 · SURFACES",
      title: "Elevation is a surface change, not a shadow stack.",
      paragraphs: [
        "Radius defaults to `0`, elevated cards and inputs may use `2px`, never decorative pill clusters. Borders are hairlines. Radius max `4px`.",
      ],
      figure: {
        alt: "Atlas surface stack — paper ground, elevated cards, secondary band",
        label: "FIG · paper · elevated · secondary",
        caption:
          "Fig. 1 — Surface stack used on Documentation landing category cards and search.",
        captionCompact:
          "Fig. 1 — Surface stack for docs landing cards and search.",
      },
    },
    {
      id: "freeze",
      chapter: "04 · FREEZE",
      title: "Figma pages 15–26 are frozen for v1.",
      paragraphs: [
        "Do not redesign during implementation. If implementation and Figma disagree on visuals, Figma wins. If engineering boundaries disagree with the Build Manifest, update the manifest first.",
      ],
      terminal: {
        caption: "TERMINAL · visual gate",
        lines: [
          "$ pnpm --filter @repo/atlas-web test:e2e -- docs.spec.ts",
          "✓ docs landing matches D/T/M compositions",
        ],
      },
    },
  ],
};
