/**
 * Portfolio OS case study fixture — data only.
 * Domain types live in `@/content/case-study`. Registry in `./index`.
 * No live CMS; no Strapi DTOs in UI.
 */

import type { CaseStudyFixture } from "@/content/case-study";

export const portfolioOsCaseStudy: CaseStudyFixture = {
  site: { key: "personal", name: "Atlas" },
  project: {
    id: "portfolio-os",
    slug: "portfolio-os",
    name: "Portfolio OS",
    projectStatus: "in-progress",
  },
  seo: {
    title: "Portfolio OS",
    description:
      "Engineering case study — building a production portfolio platform that treats content, case studies, and engineering proof as a single operating system.",
  },
  hero: {
    chapter: "CASE STUDY",
    title: "Portfolio OS",
    deck: "Building a production portfolio platform that treats content, case studies, and engineering proof as a single operating system — not a brochure.",
    deckTablet:
      "Building a production portfolio platform that treats content, case studies, and engineering proof as a single operating system.",
    deckMobile:
      "A production portfolio platform — content, case studies, and engineering proof as one system.",
    meta: [
      { label: "YEAR", value: "2024 — Present" },
      { label: "ROLE", value: "Design & Engineering" },
      { label: "STATUS", value: "In production" },
      { label: "STACK", value: "Next.js · Strapi · Turborepo · Playwright" },
    ],
    metaLineTablet: "2024 — Present  ·  Design & Engineering  ·  In production",
    metaLineMobileYear: "2024 — Present",
    metaLineMobileRole: "Design & Engineering · In production",
    stackLine: "Next.js · Strapi · Turborepo · Playwright",
  },
  toc: [
    { id: "overview", label: "01 Overview", href: "#overview" },
    { id: "problem", label: "02 Problem", href: "#problem" },
    { id: "constraints", label: "03 Constraints", href: "#constraints" },
    { id: "architecture", label: "04 Architecture", href: "#architecture" },
    { id: "decisions", label: "05 Decisions", href: "#decisions" },
    { id: "implementation", label: "06 Implementation", href: "#implementation" },
    { id: "delivery", label: "07 Delivery", href: "#delivery" },
    { id: "outcomes", label: "08 Outcomes", href: "#outcomes" },
    { id: "lessons", label: "09 Lessons", href: "#lessons" },
  ],
  figures: {
    hero: {
      id: "fig-1",
      kind: "application-screenshot",
      alt: "Portfolio OS application surface placeholder — three-pane production layout",
      caption:
        "Fig. 1 — Portfolio OS application surface. Images are chapters — real work before lengthy explanation.",
      captionShort: "Fig. 1 — Portfolio OS application surface.",
      label: "portfolio-os  ·  production surface",
      tone: "ink",
    },
    architecture: {
      id: "fig-2",
      kind: "architecture-diagram",
      alt: "Canonical Atlas request and delivery path diagram",
      caption:
        "Fig. 2 — Canonical Atlas request and delivery path. Mono IDs label system boundaries.",
      captionShort: "Fig. 2 — Canonical request and delivery path.",
    },
    implementationPrimary: {
      id: "fig-3",
      kind: "browser-capture",
      alt: "Editorial Brand System applied to the homepage reference",
      caption:
        "Fig. 3 — Editorial Brand System applied to the homepage reference implementation.",
      captionShort: "Fig. 3 — Brand system on the homepage reference.",
      label: "IMG  ·  editorial brand system / homepage",
      tone: "ink",
    },
    implementationUi: {
      id: "fig-4",
      kind: "figma-artifact",
      alt: "Chapter marker and title micro-hierarchy close-up",
      caption: "Fig. 4 — Chapter marker + title micro-hierarchy.",
      label: "IMG  ·  UI close-up",
      tone: "ink",
    },
    implementationWorkflow: {
      id: "fig-5",
      kind: "workflow-diagram",
      alt: "Content to map to render path schematic",
      caption: "Fig. 5 — Content → map → render path (schematic).",
      label: "IMG  ·  workflow",
      tone: "ink",
    },
    implementationTablet: {
      id: "fig-3-tablet",
      kind: "browser-capture",
      alt: "Brand system on the homepage reference",
      caption: "Fig. 3 — Brand system on the homepage reference.",
      label: "IMG  ·  implementation artifact",
      tone: "ink",
    },
    implementationMobile: {
      id: "fig-3-mobile",
      kind: "browser-capture",
      alt: "Implementation artifact placeholder",
      caption: "Fig. 3 — Implementation artifact.",
      label: "IMG",
      tone: "ink",
    },
  },
  overview: {
    chapter: "01  ·  OVERVIEW",
    title: "What was built, why it mattered, and what I owned.",
    titleMobile: "What was built.",
    columns: [
      {
        id: "built",
        label: "WHAT WAS BUILT?",
        body: "A greenfield portfolio platform (Atlas) replacing a legacy personal site — with shared Strapi CMS, case-study narrative structure, and production delivery tooling.",
      },
      {
        id: "mattered",
        label: "WHY IT MATTERED?",
        body: "The previous surface could not express engineering depth. Recruiters and technical leaders needed proof of systems thinking, not a template gallery.",
      },
      {
        id: "owned",
        label: "WHAT WAS OWNED?",
        body: "Product direction, editorial design system, frontend architecture, CMS content model, CI/testing strategy, and the case-study information architecture.",
      },
    ],
    bodyTablet: [
      "Greenfield Atlas platform with shared Strapi, editorial case-study structure, and production delivery tooling.",
      "Owned product direction, brand system, frontend architecture, CMS model, and testing strategy.",
    ],
    bodyMobile:
      "Greenfield Atlas with shared Strapi and production delivery. Owned direction, brand, architecture, and testing.",
  },
  problem: {
    chapter: "02  ·  PROBLEM",
    title: "The engineering and product problem.",
    titleMobile: "The problem.",
    paragraphs: [
      "A personal engineering brand needs to communicate senior systems judgment. The existing site optimized for generic portfolio presentation — equal card grids, thin project summaries, and little evidence of architectural decision-making.",
      "The real problem was structural: content, design language, and delivery systems were not designed as one product. Updating work meant fighting the template. Case studies could not carry architecture, tradeoffs, or testing evidence without breaking the layout.",
      "Portfolio OS exists to make the next correct editorial and engineering decision easier than the wrong one — for both the reader and the author.",
    ],
    paragraphsTablet: [
      "The legacy site could not express systems judgment. Content, design, and delivery were not one product.",
      "Portfolio OS makes the next correct editorial and engineering decision easier than the wrong one.",
    ],
    bodyMobile:
      "Legacy site could not express systems judgment. Portfolio OS unifies content, design, and delivery.",
  },
  constraints: {
    chapter: "03  ·  CONSTRAINTS",
    title: "Boundaries that shaped the system.",
    titleMobile: "Constraints.",
    rows: [
      {
        id: "technical",
        label: "Technical",
        body: "Must live inside the Nexus monorepo with affected-only Turborepo CI. No nested repositories. Shared Strapi without inventing a parallel CMS client.",
      },
      {
        id: "organizational",
        label: "Organizational",
        body: "Greenfield rebuild — migration inputs from the existing site, but no requirement to reproduce legacy architecture.",
      },
      {
        id: "architectural",
        label: "Architectural",
        body: "Application owns layout. Strapi provides content. No generic page-builder or universal section registry without proven need.",
      },
      {
        id: "delivery",
        label: "Delivery",
        body: "Production-ready quality bar: Playwright coverage, accessible semantics, graceful CMS failure modes, Vercel deployment.",
      },
      {
        id: "compatibility",
        label: "Compatibility",
        body: "Preserve SEO value, URLs, metadata, and useful assets unless an explicit migration decision says otherwise.",
      },
    ],
    summaryTablet:
      "Technical: Nexus monorepo, affected-only CI, shared Strapi. Architectural: app owns layout. Delivery: Playwright, Vercel, accessible semantics.",
    summaryMobile:
      "Nexus monorepo · affected CI · app-owned layout · Playwright · Vercel · SEO preservation.",
  },
  architecture: {
    chapter: "04  ·  ARCHITECTURE",
    title: "System shape.",
    intro:
      "Request path across the Atlas production surface. Emphasis path uses technical sage; structural strokes use ink.",
    requestPath: [
      { id: "N-01", label: "Browser / Reader", emphasis: true },
      { id: "N-02", label: "Vercel Edge", emphasis: true },
      { id: "N-03", label: "atlas-web (Next.js)", emphasis: true },
      { id: "N-04", label: "Strapi Client Map" },
      { id: "N-05", label: "Shared Strapi CMS" },
    ],
    deliveryPath: [
      { id: "N-06", label: "Nexus Monorepo" },
      { id: "N-07", label: "Turborepo CI" },
      { id: "N-08", label: "Playwright Suite" },
      { id: "N-09", label: "atlas-docs" },
    ],
    tabletRequest: [
      { id: "N-01", label: "Browser" },
      { id: "N-02", label: "Edge" },
      { id: "N-03", label: "atlas-web" },
      { id: "N-05", label: "Strapi" },
    ],
    tabletDelivery: [
      { id: "N-06", label: "Monorepo" },
      { id: "N-07", label: "CI" },
      { id: "N-08", label: "Playwright" },
    ],
    mobileNodes: [
      { id: "N-01", label: "Browser" },
      { id: "N-03", label: "atlas-web" },
      { id: "N-05", label: "Strapi" },
      { id: "N-07", label: "CI" },
      { id: "N-08", label: "Playwright" },
    ],
    legend: [
      "——  Structural path (ink)",
      "——  Emphasis path (sage)",
      "Nodes  ·  1.5px stroke  ·  r2",
    ],
  },
  decisions: {
    chapter: "05  ·  DECISIONS",
    title: "Engineering reasoning.",
    intro:
      "Each decision follows the same editorial composition: statement → context → choice → tradeoff → consequence.",
    items: [
      {
        id: "D-01",
        statement: "Own layout in the application, not the CMS.",
        statementMobile: "Own layout in the app, not the CMS.",
        context:
          "Strapi can store rich structure, but letting CMS authors reshape page architecture creates unbounded design drift.",
        choice:
          "Atlas components and pages define composition. Strapi supplies typed content fields.",
        tradeoff: "Less CMS flexibility for arbitrary layouts.",
        consequence:
          "Visual system stays coherent; content editors stay in a safe, intentional model.",
      },
      {
        id: "D-02",
        statement: "Greenfield rebuild inside Nexus — not a theme swap.",
        statementTablet: "Greenfield rebuild inside Nexus — not a theme swap.",
        statementMobile: "Greenfield inside Nexus.",
        context:
          "The legacy portfolio could not carry architecture diagrams, case-study density, or editorial pacing without fighting its template.",
        choice:
          "New Next.js app (atlas-web) with shared Strapi site key, migration inputs preserved.",
        tradeoff: "Higher upfront cost than restyling the old site.",
        consequence:
          "A platform that can grow case studies and docs without redesigning foundations each time.",
      },
      {
        id: "D-03",
        statement: "Affected-only CI over “build everything.”",
        statementMobile: "Affected-only CI.",
        context:
          "Nexus contains multiple apps. Atlas changes must not force unrelated portals to rebuild.",
        choice:
          "Turborepo filters and workspace boundaries as first-class constraints.",
        tradeoff:
          "Requires discipline about package edges and shared dependencies.",
        consequence: "Faster feedback loops and safer monorepo hygiene.",
      },
    ],
  },
  implementation: {
    chapter: "06  ·  IMPLEMENTATION",
    title: "Artifacts from the build.",
    titleMobile: "Artifacts.",
    intro:
      "Screenshots, workflow figures, and UI close-ups — not decorative terminals or invented code imagery.",
    introTablet:
      "Editorial brand system applied to homepage; chapter-marker hierarchy; content → map → render path. No decorative terminal imagery.",
    introMobile:
      "Brand system, chapter hierarchy, content map path. Placeholders captioned — no fake terminals.",
  },
  delivery: {
    chapter: "07  ·  DELIVERY",
    title: "How quality was established.",
    titleMobile: "Quality.",
    rows: [
      {
        id: "playwright",
        label: "Playwright",
        body: "End-to-end coverage for critical reader journeys — navigation, case-study reading path, contact bridge. Evidence over logos.",
      },
      {
        id: "ci",
        label: "CI / Affected builds",
        body: "Turborepo filters keep Atlas changes from forcing unrelated Nexus apps to rebuild. Feedback stays fast.",
      },
      {
        id: "validation",
        label: "Validation",
        body: "Typecheck, lint, and content-mapping boundaries between Strapi DTOs and UI types.",
      },
      {
        id: "regression",
        label: "Regression",
        body: "Visual regression board (Page 17) freezes brand-system signatures. Design changes are compared against approved states.",
      },
      {
        id: "deployment",
        label: "Deployment",
        body: "Vercel for atlas-web. Preview deployments for review. Production promotion as an explicit step.",
      },
    ],
    summaryTablet:
      "Playwright journeys, affected-only Turborepo CI, type/lint validation, visual regression board, Vercel preview → production.",
    summaryMobile:
      "Playwright · affected CI · validation · visual regression · Vercel.",
  },
  outcomes: {
    chapter: "08  ·  OUTCOMES",
    title: "What changed — without marketing theater.",
    titleMobile: "Outcomes.",
    intro:
      "Verified quantitative metrics are not claimed here. Outcomes below are qualitative and structural — the honest state of a system still in active production.",
    items: [
      {
        id: "editorial",
        title: "Editorial system",
        body: "A frozen Brand System (v1.0) that scales beyond the homepage — typography, color, annotations, diagrams, surfaces.",
      },
      {
        id: "platform",
        title: "Platform foundation",
        body: "atlas-web + shared Strapi site boundary + monorepo placement that respects Nexus affected-only CI.",
      },
      {
        id: "narrative",
        title: "Narrative capacity",
        body: "Case studies can carry architecture, decisions, and delivery evidence without collapsing into résumé cards.",
      },
      {
        id: "reviewability",
        title: "Reviewability",
        body: "Visual regression board and design pages make brand drift visible before implementation.",
      },
    ],
    note: "Note — When verified metrics exist, they occupy this structure. Invented numbers are prohibited.",
    summaryTablet:
      "Frozen Brand System v1.0. Platform foundation in Nexus. Case studies can carry architecture and decisions. No invented metrics.",
    summaryMobile:
      "Brand System v1.0 frozen. Platform foundation. Case-study capacity. No invented metrics.",
  },
  lessons: {
    chapter: "09  ·  LESSONS",
    title: "What maturity looks like after the build.",
    titleMobile: "Lessons.",
    rows: [
      {
        id: "learned",
        label: "LEARNED",
        body: "Freezing the editorial brand system before production pages prevented homepage-only aesthetics. Work and Case Study inherit the same language with different pacing.",
      },
      {
        id: "compromise",
        label: "COMPROMISE",
        body: "Screenshot assets and verified metrics are still pending. Placeholders are explicit, captioned, and tracked — not decorative filler pretending to be final.",
      },
      {
        id: "differently",
        label: "WOULD DO DIFFERENTLY",
        body: "Establish case-study content density rules earlier. Long-form reading columns needed deliberate measure (≈65–75 characters) from the first homepage pass.",
      },
      {
        id: "carry",
        label: "CARRY FORWARD",
        body: "Decision compositions (statement → context → choice → tradeoff → consequence) are reusable across future case studies without forcing visual identity.",
      },
    ],
    summaryTablet:
      "Freeze brand before production pages. Track placeholders honestly. Establish reading-column density early. Reuse decision compositions.",
    summaryMobile:
      "Freeze brand early. Track placeholders. Density rules first. Reusable decision form.",
  },
  related: {
    chapter: "RELATED",
    title: "Next case.",
    titleTablet: "Next case · Shared Strapi CMS / Atlas →",
    titleMobile: "Next · Shared Strapi CMS →",
    projectName: "Shared Strapi CMS / Atlas",
    projectSummary:
      "Platform architecture across multi-site content boundaries.",
    cta: { label: "Continue →", href: "/work/shared-strapi-cms" },
  },
  contact: {
    chapter: "CONTACT",
    title: "Let’s talk about the work.",
    body: "Expectation-setting placeholder. Qualified conversation.",
    cta: { label: "Start a conversation", href: "/contact" },
    meta: "email · form · calendar (TBD)",
  },
};
