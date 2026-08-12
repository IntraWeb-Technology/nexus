/**
 * Atlas Architecture — handbook guide proving editorial primitives on Documentation.
 */

import type { DocDetail } from "@/content/doc";
import { baseDocShell } from "@/content/docs/build-detail";
import { docSummaries } from "@/content/docs/summaries";

const self = docSummaries[0]!;

export const atlasArchitectureDoc: DocDetail = {
  ...baseDocShell(self),
  toc: [
    { id: "purpose", label: "01 Purpose", href: "#purpose" },
    { id: "boundaries", label: "02 Boundaries", href: "#boundaries" },
    { id: "contracts", label: "03 Contracts", href: "#contracts" },
    { id: "evidence", label: "04 Evidence", href: "#evidence" },
  ],
  sections: [
    {
      id: "purpose",
      chapter: "01 · PURPOSE",
      title: "Atlas is an engineering publication inside Nexus.",
      paragraphs: [
        "Atlas ships as `apps/atlas-web` — a greenfield rebuild of johnschibelli.dev. It is not a marketing theme. Routes prove systems through case studies, documentation, and evidence.",
        "This handbook entry records the architectural contracts that keep Atlas independent from IntraWeb while sharing `apps/cms-strapi` under the `personal` site key.",
      ],
      paragraphsTablet: [
        "Atlas ships as `apps/atlas-web` — an engineering publication, not a marketing theme.",
        "This entry records the contracts that keep Atlas independent from IntraWeb while sharing Strapi under `personal`.",
      ],
    },
    {
      id: "boundaries",
      chapter: "02 · BOUNDARIES",
      title: "One repository, explicit application edges.",
      paragraphs: [
        "Nexus remains one Git repository. Atlas must not create nested repos or force unrelated apps through affected CI. Shared packages appear only when two real consumers exist today.",
        "Product documentation for Atlas lives in `apps/atlas-docs`. The public handbook on `/docs` is a different surface — evergreen procedures and ADRs for readers of the site.",
      ],
      callout: {
        variant: "note",
        title: "Articles vs Documentation",
        body: "Articles is the chronological engineering journal. Documentation is the category-driven handbook. They share editorial primitives — never information architecture.",
        bodyCompact:
          "Articles is chronological. Documentation is the handbook. Shared primitives — not shared IA.",
      },
    },
    {
      id: "contracts",
      chapter: "03 · CONTRACTS",
      title: "Site tenancy is enforced at the API boundary.",
      paragraphs: [
        "Every Strapi query for Atlas filters by site key `personal`. Tags are not tenancy. Draft content must never leak into public routes.",
      ],
      code: {
        language: "typescript",
        caption: "TYPESCRIPT · future `@repo/strapi-client` boundary",
        code: `export async function getAtlasArticles() {
  return strapi.articles.findMany({
    filters: { sites: { key: { $eq: "personal" } } },
    status: "published",
  });
}`,
      },
    },
    {
      id: "evidence",
      chapter: "04 · EVIDENCE",
      title: "Architecture decisions leave inspectable trails.",
      paragraphs: [
        "Diagrams, CI captures, and repository structure are evidence — not decoration. Prefer fixtures in CI over live production content until Strapi wiring lands.",
      ],
      terminal: {
        caption: "TERMINAL · affected check",
        lines: [
          "$ pnpm ci:affected",
          "• @repo/atlas-web",
          "✓ unrelated apps skipped",
        ],
      },
      figure: {
        alt: "Atlas application boundaries inside the Nexus monorepo",
        label: "FIG · atlas-web · cms-strapi · atlas-docs",
        caption:
          "Fig. 1 — Atlas sits beside IntraWeb apps; Strapi is shared with site isolation.",
        captionCompact:
          "Fig. 1 — Atlas beside IntraWeb; Strapi shared with site isolation.",
      },
    },
  ],
};
