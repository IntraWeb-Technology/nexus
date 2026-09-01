/**
 * Homepage fixture — mirrors future Strapi / site-keyed content shape.
 * Copy aligned to Story-First Redesign — Homepage Desktop (Figma page 28).
 */

import type { NavLink } from "@/content/types";

export type { NavLink };

export type HomepageFixture = {
  site: { key: "personal"; name: string };
  nav: {
    brand: { label: string; href: string };
    links: NavLink[];
  };
  hero: {
    mediaLabel: string;
    mediaNote: string;
    mediaAlt: string;
    mediaSrc?: string;
    mediaWidth?: number;
    mediaHeight?: number;
    mediaSizes?: string;
    chapter: string;
    title: string;
    deck: string;
    primaryCta: NavLink;
    secondaryCta: NavLink;
  };
  featured: {
    chapter: string;
    title: string;
    meta: string;
    status: string;
    /** Story-First summary under the featured title (optional; CMS may omit). */
    summary?: string;
    figureAlt: string;
    figureCaption: string;
    figureSrc?: string;
    figureWidth?: number;
    figureHeight?: number;
    figureSizes?: string;
    problemLabel: string;
    problem: string;
    outcomeLabel: string;
    outcome: string;
    highlightsLabel: string;
    highlights: string[];
    cta: NavLink;
  };
  selected: {
    chapter: string;
    headline: string;
    /** Story-First section head (e.g. "Latest work"). */
    sectionTitle?: string;
    /** Story-First view-all link. */
    viewAll?: NavLink;
    /** Story-First section deck under the head. */
    deck?: string;
    projects: Array<{
      id: string;
      layout: "feature" | "offset" | "band";
      eyebrow: string;
      title: string;
      outcome: string;
      href: string;
      ctaLabel: string;
      mediaAlt?: string;
      mediaSrc?: string;
      mediaWidth?: number;
      mediaHeight?: number;
      mediaSizes?: string;
    }>;
  };
  philosophy: {
    chapter: string;
    quote: string;
    diagramCaption: string;
    stages: string[];
    principles: Array<{ title: string; body: string }>;
  };
  writing: {
    chapter: string;
    /** Story-First section title (e.g. "Latest writing"). */
    sectionTitle?: string;
    /** Story-First publication link. */
    viewAll?: NavLink;
    /** Story-First deck under the head. */
    deck?: string;
    items: Array<{
      title: string;
      note: string;
      href: string;
      /** Topic eyebrow for cover cards (Story-First). */
      topic?: string;
      /** Cover accent: rust | gold | clay */
      coverTone?: "rust" | "gold" | "clay";
    }>;
  };
  about: {
    chapter: string;
    /** Story-First section title. */
    title?: string;
    summary: string;
    /** Optional second paragraph (Story-First). */
    body?: string;
    href: string;
    ctaLabel: string;
  };
  contact: {
    chapter: string;
    title: string;
    body: string;
    cta: NavLink;
    meta: string;
  };
  footer: {
    links: NavLink[];
    mark: string;
  };
};

const navOrder = [
  { label: "Work", href: "/work" },
  { label: "Articles", href: "/articles" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] satisfies NavLink[];

export const homepageFixture: HomepageFixture = {
  site: { key: "personal", name: "Atlas" },
  nav: {
    brand: { label: "ATLAS", href: "/" },
    links: navOrder,
  },
  hero: {
    mediaLabel: "ATLAS",
    mediaNote: "Editorial portrait — workspace, warm directional light",
    mediaAlt:
      "Editorial portrait placeholder — John at his workspace with warm directional light",
    mediaSrc:
      "/images/case-studies/portfolio-os/portfolio-os-home-hero-desktop.webp",
    mediaWidth: 4480,
    mediaHeight: 6720,
    mediaSizes: "(min-width: 1440px) 560px, 100vw",
    chapter: "John Schibelli — design, engineering, and the thinking in between",
    title: "This is where I keep the work — and the reasoning behind it.",
    deck: "Atlas is my home base for what I design, build, write, and think through. It's part portfolio, part publication, and part notebook.",
    primaryCta: { label: "See the work", href: "/work" },
    secondaryCta: { label: "Read the notes", href: "/articles" },
  },
  featured: {
    chapter: "ATLAS · THIS SITE",
    title: "Atlas",
    meta: "flagship",
    status: "IN PRODUCTION",
    summary:
      "The site you're looking at. Part portfolio, part publication, part notebook — where I share design and engineering work, the writing that comes out of it, and what I'm learning along the way.",
    figureAlt:
      "Layered UI screenshots of Portfolio OS — editorial collage crop",
    figureCaption: "Atlas production surface — portfolio, publication, notebook",
    figureSrc:
      "/images/case-studies/portfolio-os/portfolio-os-home-featured-desktop.webp",
    figureWidth: 3000,
    figureHeight: 1725,
    figureSizes: "(min-width: 1440px) 640px, 100vw",
    problemLabel: "PROBLEM",
    problem:
      "The previous portfolio reduced complex engineering work to project summaries, leaving the decisions, constraints, and proof out of view.",
    outcomeLabel: "OUTCOME",
    outcome:
      "Atlas rebuilds the site as an engineering publication with structured case studies, shared CMS content, documented architecture, and tested responsive routes.",
    highlightsLabel: "TECHNICAL HIGHLIGHTS",
    highlights: [
      "Next.js monorepo",
      "Shared Strapi contract",
      "Playwright regression suite",
    ],
    cta: { label: "Read the case study →", href: "/work/portfolio-os" },
  },
  selected: {
    chapter: "SELECTED WORK",
    headline: "Systems with visible operating evidence.",
    sectionTitle: "Latest work",
    viewAll: { label: "View all work →", href: "/work" },
    deck: "A few things I've been building lately.",
    projects: [
      {
        id: "intraweb-automation",
        layout: "feature",
        eyebrow: "AUTOMATION",
        title: "IntraWeb Automation",
        outcome:
          "A set of tools that takes the repetitive, easy-to-forget work off a small team's plate. Nothing flashy — just time given back.",
        href: "/work",
        ctaLabel: "View project →",
        mediaAlt: "Automation workflow diagram for IntraWeb operations",
        mediaSrc: "/images/work/intraweb-automation-workflow.svg",
        mediaWidth: 640,
        mediaHeight: 440,
        mediaSizes: "(min-width: 1440px) 416px, 50vw",
      },
      {
        id: "portfolio-os",
        layout: "offset",
        eyebrow: "PLATFORM",
        title: "Portfolio OS",
        outcome:
          "The system running underneath sites like this one. It handles content, case studies, and updates so that keeping a portfolio current doesn't turn into a second job.",
        href: "/work/portfolio-os",
        ctaLabel: "Read case study →",
        mediaAlt: "Portfolio OS architecture and publishing surface",
        mediaSrc: "/images/work/shared-strapi-architecture.svg",
        mediaWidth: 1520,
        mediaHeight: 860,
        mediaSizes: "(min-width: 1440px) 416px, 50vw",
      },
      {
        id: "intraweb-portal",
        layout: "band",
        eyebrow: "PORTAL",
        title: "IntraWeb Portal",
        outcome:
          "A client-facing home base for project status — what's done, what's in progress, what's next. Built on one idea: nobody should have to chase an update over email.",
        href: "/work",
        ctaLabel: "View →",
      },
    ],
  },
  philosophy: {
    chapter: "ENGINEERING PHILOSOPHY",
    quote:
      "Good systems reduce ambiguity: the next correct action should be visible, testable, and documented.",
    diagramCaption:
      "Workflow evidence — architecture stays close to delivery.",
    stages: ["ARCHITECTURE", "QUALITY", "AUTOMATION", "DOCUMENTATION"],
    principles: [
      {
        title: "Architecture",
        body: "Define boundaries before expanding features.",
      },
      {
        title: "Quality",
        body: "Treat tests and review artifacts as part of delivery.",
      },
      {
        title: "Automation",
        body: "Automate repeated work without hiding how it runs.",
      },
      {
        title: "Documentation",
        body: "Record decisions close to the system they govern.",
      },
    ],
  },
  writing: {
    chapter: "ARTICLES",
    sectionTitle: "Latest writing",
    viewAll: { label: "Visit the publication →", href: "/articles" },
    deck: "Notes on the work, and what it's teaching me.",
    items: [
      {
        title: "Why We Chose React Server Components",
        note: "The tradeoffs — and why the simplest server-first model won.",
        topic: "ARCHITECTURE",
        coverTone: "rust",
        href: "/articles/why-we-chose-react-server-components",
      },
      {
        title: "Playwright at Scale",
        note: "How the suite stays fast enough to gate every merge.",
        topic: "TESTING",
        coverTone: "gold",
        href: "/articles/playwright-at-scale",
      },
      {
        title: "Lessons from Building Atlas",
        note: "What held up, what changed, and what the system made visible.",
        topic: "ARCHITECTURE",
        coverTone: "clay",
        href: "/articles/lessons-from-building-atlas",
      },
    ],
  },
  about: {
    chapter: "ABOUT",
    title: "A bit about me",
    summary:
      "I'm John, a designer and engineer who moves between code, interfaces, writing, and the messy middle where ideas start to take shape.",
    body: "I like systems that make sense, language that gets to the point, and work that still holds up once someone's actually using it.",
    href: "/about",
    ctaLabel: "Read the full story →",
  },
  contact: {
    chapter: "CONTACT",
    title: "Let's talk about what you're building",
    body: "Product systems, content infrastructure, technical architecture, or design-to-build implementation work.",
    cta: { label: "Get in touch", href: "/contact" },
    meta: "email · form",
  },
  footer: {
    links: navOrder,
    mark: "ATLAS",
  },
};
