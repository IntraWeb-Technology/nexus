/**
 * Testing Strategy — handbook playbook for Atlas verification.
 */

import type { DocDetail } from "@/content/doc";
import { baseDocShell } from "@/content/docs/build-detail";
import { docSummaries } from "@/content/docs/summaries";

const self = docSummaries[4]!;

export const testingStrategyDoc: DocDetail = {
  ...baseDocShell(self),
  toc: [
    { id: "layers", label: "01 Layers", href: "#layers" },
    { id: "playwright", label: "02 Playwright", href: "#playwright" },
    { id: "a11y", label: "03 Accessibility", href: "#a11y" },
    { id: "ci", label: "04 CI", href: "#ci" },
  ],
  sections: [
    {
      id: "layers",
      chapter: "01 · LAYERS",
      title: "Prefer journeys and fixtures over coverage vanity.",
      paragraphs: [
        "Atlas testing follows the Build Manifest: unit checks for mappers and validation, Playwright for critical journeys, axe for major routes, visual snapshots for stable pages at 1440 / 768 / 390.",
        "No coverage vanity targets. Prefer fixtures and seeds over live production content in CI.",
      ],
      paragraphsTablet: [
        "Unit for mappers, Playwright for journeys, axe for major routes, visuals at three breakpoints.",
        "Prefer fixtures over live production content in CI.",
      ],
    },
    {
      id: "playwright",
      chapter: "02 · PLAYWRIGHT",
      title: "Documentation joins the frozen smoke set carefully.",
      paragraphs: [
        "Add docs coverage for `/docs` and at least one detail route. Keep Home, Work, Case Study, About, Contact, and Articles smoke checks green — do not rewrite their assertions as a side effect of M6.",
      ],
      code: {
        language: "typescript",
        caption: "TYPESCRIPT · docs journey sketch",
        code: `test("renders handbook landmarks", async ({ page }) => {
  await page.goto("/docs");
  await expect(
    page.getByRole("heading", { level: 1, name: "Engineering handbook." }),
  ).toBeVisible();
});`,
      },
    },
    {
      id: "a11y",
      chapter: "03 · ACCESSIBILITY",
      title: "WCAG 2.2 AA — keyboard, focus, contrast.",
      paragraphs: [
        "One `h1` per page. Skip link to main. Visible focus rings. Progressbars expose `aria-valuenow`. Category cards and search controls need accessible names.",
      ],
      callout: {
        variant: "note",
        title: "Search is a filter — not AI.",
        body: "Documentation search is a static filter or UI placeholder this milestone — not an AI search product. Label the control clearly.",
        bodyCompact:
          "Docs search is a static filter/placeholder — label it clearly.",
      },
    },
    {
      id: "ci",
      chapter: "04 · CI",
      title: "Affected-only Turbo behavior stays intact.",
      paragraphs: [
        "Atlas changes must not force unrelated apps to build. Playwright runs against a production build on port 3020 with fixture content locked.",
      ],
      terminal: {
        caption: "TERMINAL · docs e2e",
        lines: [
          "$ pnpm --filter @repo/atlas-web exec playwright test e2e/docs.spec.ts",
          "✓ desktop / tablet / mobile",
        ],
      },
      figure: {
        alt: "Playwright projects for desktop, tablet, and mobile Atlas breakpoints",
        label: "FIG · 1440 · 768 · 390",
        caption:
          "Fig. 1 — Breakpoint projects match Figma frames used across Atlas routes.",
        captionCompact:
          "Fig. 1 — Breakpoint projects match Atlas Figma frames.",
      },
    },
  ],
};
