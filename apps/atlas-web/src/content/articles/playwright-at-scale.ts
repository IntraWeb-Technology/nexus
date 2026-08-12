/**
 * Fixture C — structured / evidence-heavy article.
 * Exercises table, callout, evidence block, code, and terminal under realistic prose.
 */

import type { ArticleDetail } from "@/content/article";
import {
  articleSummaries,
  toNavLink,
} from "@/content/articles/summaries";

const self = articleSummaries.find((a) => a.slug === "playwright-at-scale")!;
const featured = articleSummaries[0]!;
const lessons = articleSummaries[2]!;
const migrating = articleSummaries[3]!;

export const playwrightAtScaleArticle: ArticleDetail = {
  site: { key: "personal", name: "Atlas" },
  seo: {
    title: self.title,
    description: self.excerpt,
  },
  article: {
    id: self.id,
    slug: self.slug,
    title: self.title,
    excerpt: self.excerpt,
    excerptCompact: self.excerptCompact,
    publishedDate: self.publishedDate,
    topic: self.topic,
    readingTime: self.readingTime,
    type: self.type,
    status: "Published",
    featured: false,
    contentFormat: "blocks",
  },
  header: {
    chapter: "ARTICLE",
    title: self.title,
    dek: self.excerpt,
    dekCompact: self.excerptCompact,
    meta: [
      { label: "DATE", value: self.publishedDate },
      { label: "TOPIC", value: self.topic },
      { label: "READING", value: self.readingTime },
      { label: "STATUS", value: "Published" },
    ],
  },
  toc: [
    { id: "contract", label: "01 Contract", href: "#contract" },
    { id: "strategy", label: "02 Strategy", href: "#strategy" },
    { id: "proof", label: "03 Proof", href: "#proof" },
    { id: "artifacts", label: "04 Artifacts", href: "#artifacts" },
  ],
  sections: [
    {
      id: "contract",
      chapter: "01 · CONTRACT",
      title: "Fixtures before assertions.",
      paragraphs: [
        "Playwright only pays off when the suite encodes product truth. Atlas treats fixtures as the contract: routes render from typed content, assertions name the editorial landmarks, and CI artifacts must prove the journey before a release is called green.",
        "Flake triage starts with isolation — shared auth state, network boundaries, and screenshot baselines that match the 1440 / 768 / 390 compositions — not with retrying until the noise goes quiet.",
      ],
      paragraphsTablet: [
        "Playwright only pays off when the suite encodes product truth. Fixtures are the contract; CI artifacts must prove the journey before a release is green.",
        "Flake triage starts with isolation — auth state, network boundaries, and baselines that match 1440 / 768 / 390 — not with retries.",
      ],
      callout: {
        variant: "note",
        title: "What the suite must prove",
        body: "Landmarks, current nav, publishing primitives, keyboard path, and axe AA at serious/critical. Visual baselines are secondary evidence — not a substitute for journey assertions.",
        bodyCompact:
          "Landmarks, current nav, primitives, keyboard path, and axe AA. Visuals are secondary evidence.",
      },
    },
    {
      id: "strategy",
      chapter: "02 · STRATEGY",
      title: "Choose the assertion that survives redesign.",
      paragraphs: [
        "Atlas prefers role and landmark queries over brittle CSS. When a composition recomposes at tablet or mobile, the product truth should still be nameable. Tables of strategy help authors decide what belongs in a journey versus a unit check.",
      ],
      paragraphsTablet: [
        "Prefer role and landmark queries over brittle CSS. Strategy tables help authors decide journey versus unit coverage.",
      ],
      table: {
        caption:
          "Table 1 — Fixture strategy vs assertion style for Atlas editorial routes.",
        captionCompact: "Table 1 — Fixture strategy vs assertion style.",
        columns: ["Layer", "Owns", "Avoid"],
        rows: [
          {
            id: "journey",
            cells: [
              "Playwright journey",
              "Route load, landmarks, TOC, prev/next, axe",
              "Pixel-perfect copy diffs in every suite",
            ],
          },
          {
            id: "visual",
            cells: [
              "Visual baseline",
              "Stable D/T/M compositions after freeze",
              "Dynamic timestamps / live CMS noise",
            ],
          },
          {
            id: "unit",
            cells: [
              "Unit / typecheck",
              "Mappers, URL builders, validation",
              "Rendering entire article trees",
            ],
          },
        ],
      },
    },
    {
      id: "proof",
      chapter: "03 · PROOF",
      title: "Evidence must be inspectable.",
      paragraphs: [
        "A green checkmark without artifacts is theater. Atlas publishes the proof surface authors and reviewers can read: suite name, viewport matrix, and the command that produced the run.",
      ],
      paragraphsTablet: [
        "A green checkmark without artifacts is theater. Publish the suite name, viewport matrix, and command.",
      ],
      evidence: {
        kind: "test",
        title: "Articles publishing suite — fixture-backed",
        status: "Passing — 3 viewports",
        meta: [
          { label: "SUITE", value: "articles + article-detail" },
          { label: "VIEWPORTS", value: "1440 · 768 · 390" },
          { label: "AXE", value: "WCAG 2.1 AA — no serious/critical" },
          { label: "COMMAND", value: "pnpm --filter atlas-web test:e2e -- articles" },
        ],
        href: "/docs",
        hrefLabel: "Documentation handbook →",
      },
    },
    {
      id: "artifacts",
      chapter: "04 · ARTIFACTS",
      title: "Keep the config honest.",
      paragraphs: [
        "Projects pin the three Atlas viewports. Snapshot names include the project so desktop, tablet, and mobile stay distinct. Platform suffixes remain tooling debt until M9 hardens baseline portability.",
      ],
      paragraphsTablet: [
        "Projects pin 1440 / 768 / 390. Platform snapshot suffixes remain tooling debt until M9.",
      ],
      code: {
        language: "TYPESCRIPT",
        caption: "Listing 1 — Playwright projects for Atlas editorial surfaces.",
        captionCompact: "Listing 1 — Playwright viewport projects.",
        code: `projects: [
  { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
  { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
  { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
]`,
      },
      terminal: {
        caption: "Listing 2 — Representative CI excerpt for the Articles surface.",
        captionCompact: "Listing 2 — Articles CI excerpt.",
        lines: [
          "> pnpm --filter atlas-web test:e2e -- articles",
          "✓  articles.spec.ts — index journeys",
          "✓  article-detail.spec.ts — featured + structured",
          "✓  axe AA clear · 3 projects",
        ],
      },
    },
  ],
  related: {
    chapter: "RELATED",
    title: "Continue in the same register.",
    items: [toNavLink(featured), toNavLink(lessons), toNavLink(migrating)],
  },
  prevNext: {
    previous: toNavLink(lessons),
    next: toNavLink(featured),
  },
  contact: {
    chapter: "CONTACT",
    title: "A conversation, not a pitch.",
    body: "Qualified questions about architecture, delivery, or Atlas systems. Expectation-setting over funnel language.",
    bodyCompact:
      "Qualified questions about architecture, delivery, or Atlas systems.",
    cta: { label: "Start a conversation", href: "/contact" },
    workLink: { label: "or browse Work →", href: "/work" },
  },
};
