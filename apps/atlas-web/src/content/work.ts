/**
 * Work index fixture — Story-First gallery (Figma page 28).
 * Shape kept compatible with assemble-work / Strapi project mapping.
 */

import type { MetaItem, NavLink } from "@/content/types";

export type WorkProjectLayout = "feature" | "offset" | "band";

/** Normalized project card — survives CMS mapping unchanged at the UI boundary. */
export type WorkProject = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  summaryTablet?: string;
  summaryMobile?: string;
  category: string;
  themes: string[];
  projectStatus: "completed" | "in-progress" | "planned" | "archived";
  statusLabel: string;
  featured: boolean;
  layout: WorkProjectLayout;
  /** Alternating gallery: media on left (default) or right. */
  mediaSide?: "left" | "right";
  /** Story-First gradient placeholder when no production media. */
  mediaTone?: "ink-gold" | "moss-clay" | "ink-rust" | "clay-moss";
  mediaLabel?: string;
  mediaSrc?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  mediaSizes?: string;
  href?: string;
  ctaLabel?: string;
  metaNote?: string;
};

export type WorkFixture = {
  site: { key: "personal"; name: string };
  seo: {
    title: string;
    description: string;
  };
  intro: {
    chapter: string;
    title: string;
    deck: string;
    deckMobile: string;
    meta: MetaItem[];
    editorialNote: {
      label: string;
      body: string;
    };
  };
  stageRules: {
    afterIntro: string;
    afterFeatured: string;
    afterSelected: string;
    afterTaxonomy: string;
    afterContact: string;
  };
  featured: {
    chapter: string;
    title: string;
    summary: string;
    summaryMobile: string;
    flagshipLabel: string;
    status: string;
    timeframe: string;
    role: string;
    figureAlt: string;
    figureCaption: string;
    figureCaptionShort: string;
    figureSrc?: string;
    figureWidth?: number;
    figureHeight?: number;
    figureSizes?: string;
    figureSrcCompact?: string;
    figureWidthCompact?: number;
    figureHeightCompact?: number;
    themesLabel: string;
    themes: string[];
    themesCompact: string;
    cta: NavLink;
    ctaNote: string;
  };
  selected: {
    chapter: string;
    headline: string;
    deck: string;
    projects: WorkProject[];
  };
  /** Story-First alternating gallery rows (preferred over featured+selected). */
  gallery: {
    projects: WorkProject[];
  };
  taxonomy: {
    chapter: string;
    title: string;
    deck: string;
    categories: Array<{
      id: string;
      index: string;
      label: string;
      description: string;
    }>;
  };
  contact: {
    chapter: string;
    title: string;
    body: string;
    bodyMobile: string;
    cta: NavLink;
    meta: string;
  };
};

export const workFixture: WorkFixture = {
  site: { key: "personal", name: "Atlas" },
  seo: {
    title: "Work",
    description:
      "Selected engineering work — websites, internal tools, content systems, and product workflows presented with the reasoning behind them.",
  },
  intro: {
    chapter: "SELECTED WORK",
    title: "A closer look at what I've been building.",
    deck: "A mix of websites, internal tools, content systems, and product workflows. For each one, I try to show what started it, how it came together, and what changed.",
    deckMobile:
      "A mix of websites, tools, and content systems — shown as decisions, not just a list.",
    meta: [
      { label: "Role", value: "Lead Engineer" },
      { label: "Focus", value: "Product systems" },
      { label: "Status", value: "Active body of work" },
    ],
    editorialNote: {
      label: "EDITORIAL NOTE",
      body: "Projects are ordered by narrative weight — flagship first, then breadth. Classification is editorial, not a filter UI.",
    },
  },
  stageRules: {
    afterIntro: "01  ·  INTRODUCTION",
    afterFeatured: "02  ·  FEATURED WORK",
    afterSelected: "03  ·  SELECTED WORK",
    afterTaxonomy: "04  ·  WORK TAXONOMY",
    afterContact: "05  ·  CONTACT",
  },
  featured: {
    chapter: "FEATURED  ·  FLAGSHIP",
    title: "Portfolio OS",
    summary:
      "An operating system for a senior engineer’s public work — content, case studies, and delivery proof in one production surface.",
    summaryMobile:
      "Content, case studies, and delivery proof in one production surface.",
    flagshipLabel: "flagship",
    status: "IN PRODUCTION",
    timeframe: "2024 — Present",
    role: "Design & Engineering",
    figureAlt:
      "Portfolio OS architecture diagram on the case-study production surface",
    figureCaption:
      "Fig. 1 — Portfolio OS production surface. Canonical request and delivery path from the live case study.",
    figureCaptionShort: "Fig. 1 — Portfolio OS production surface.",
    figureSrc:
      "/images/case-studies/portfolio-os/portfolio-os-work-featured-desktop.webp",
    figureWidth: 2688,
    figureHeight: 1240,
    figureSizes: "(min-width: 1440px) 560px, 100vw",
    figureSrcCompact:
      "/images/case-studies/portfolio-os/portfolio-os-work-featured-compact.webp",
    figureWidthCompact: 1536,
    figureHeightCompact: 864,
    themesLabel: "ENGINEERING THEMES",
    themes: [
      "Product Engineering",
      "Content Architecture",
      "Delivery Systems",
      "Developer Experience",
    ],
    themesCompact: "Themes · Product · Architecture · Delivery · DX",
    cta: { label: "Read the case study →", href: "/work/portfolio-os" },
    ctaNote: "Full engineering narrative → architecture, decisions, delivery",
  },
  selected: {
    chapter: "SELECTED WORK",
    headline: "Additional dimensions.",
    deck: "Unequal compositions — media scale, alignment, and density shift with each project.",
    projects: [],
  },
  gallery: {
    projects: [
      {
        id: "atlas",
        slug: "atlas",
        name: "Atlas",
        summary:
          "The site you're looking at now. Part portfolio, part publication, part notebook, built to hold the work, the writing, and the thinking behind both.",
        summaryTablet:
          "The site you're looking at now. Part portfolio, part publication, part notebook, built to hold the work and the writing behind it.",
        summaryMobile:
          "The site you're looking at now. Part portfolio, part publication, part notebook.",
        category: "PERSONAL SITE · IN PROGRESS",
        themes: ["Design", "Engineering", "Writing"],
        projectStatus: "in-progress",
        statusLabel: "In progress",
        featured: true,
        layout: "feature",
        mediaSide: "left",
        mediaTone: "ink-gold",
        mediaLabel: "Atlas screens / workflow, editorial crop",
        href: "/work/portfolio-os",
        ctaLabel: "Read the case study →",
        metaNote: "Design, engineering, writing · 2026",
      },
      {
        id: "intraweb-automation",
        slug: "intraweb-automation",
        name: "IntraWeb Automation",
        summary:
          "A set of n8n workflows for the repetitive internal work that tends to slip through the cracks. Nothing flashy, just time given back and fewer things to chase.",
        summaryTablet:
          "A set of n8n workflows for the repetitive internal work that tends to slip through the cracks.",
        summaryMobile:
          "A set of n8n workflows for the repetitive internal work that slips through the cracks.",
        category: "AUTOMATION · IN PRODUCTION",
        themes: ["Automation", "Workflow"],
        projectStatus: "in-progress",
        statusLabel: "In production",
        featured: false,
        layout: "offset",
        mediaSide: "right",
        mediaTone: "moss-clay",
        mediaLabel: "IntraWeb Automation screens / workflow, editorial crop",
        ctaLabel: "Read the case study →",
        metaNote: "n8n, automation, workflow design · 2025-Present",
      },
      {
        id: "portfolio-os",
        slug: "portfolio-os",
        name: "Portfolio OS",
        summary:
          "A publishing system for people who need to show their work without rebuilding the same portfolio over and over. It keeps projects, case studies, notes, and updates organized so the work stays easier to maintain.",
        summaryTablet:
          "A publishing system for showing work without rebuilding the same portfolio over and over.",
        summaryMobile:
          "A publishing system so showing your work doesn't mean rebuilding the same portfolio.",
        category: "PUBLISHING SYSTEM · IN PROGRESS",
        themes: ["Content systems", "Front-end"],
        projectStatus: "in-progress",
        statusLabel: "In progress",
        featured: true,
        layout: "feature",
        mediaSide: "left",
        mediaTone: "ink-rust",
        mediaLabel: "Portfolio OS screens / workflow, editorial crop",
        href: "/work/portfolio-os",
        ctaLabel: "Read the case study →",
        metaNote: "Content systems, front-end engineering · 2024-Present",
      },
      {
        id: "intraweb-portal",
        slug: "intraweb-portal",
        name: "IntraWeb Portal",
        summary:
          "A client-facing home base for project status: what's done, what's in progress, and what's next. Built on one idea: nobody should have to chase an update over email.",
        summaryTablet:
          "A client-facing home base for project status — nobody should have to chase an update over email.",
        summaryMobile:
          "A client-facing home base — nobody should chase an update over email.",
        category: "CLIENT PORTAL · IN PRODUCTION",
        themes: ["Product design", "Client experience"],
        projectStatus: "in-progress",
        statusLabel: "In production",
        featured: false,
        layout: "band",
        mediaSide: "right",
        mediaTone: "clay-moss",
        mediaLabel: "IntraWeb Portal screens / workflow, editorial crop",
        ctaLabel: "Read the case study →",
        metaNote: "Product design, client experience · 2025",
      },
    ],
  },
  taxonomy: {
    chapter: "TAXONOMY",
    title: "How the work is classified.",
    deck: "Editorial categories for orientation — not filters, pills, or interactive chips.",
    categories: [
      {
        id: "product-engineering",
        index: "01",
        label: "Product Engineering",
        description: "Shipped product surfaces and user-facing systems.",
      },
      {
        id: "architecture",
        index: "02",
        label: "Architecture",
        description: "Structural decisions across CMS, apps, and boundaries.",
      },
      {
        id: "automation",
        index: "03",
        label: "Automation",
        description: "Reliable pipelines that remove manual operational load.",
      },
      {
        id: "platform",
        index: "04",
        label: "Platform",
        description: "Shared infrastructure other products depend on.",
      },
      {
        id: "developer-experience",
        index: "05",
        label: "Developer Experience",
        description: "Tooling, workflows, and delivery that keep teams fast.",
      },
    ],
  },
  contact: {
    chapter: "CONTACT",
    title: "Let’s talk about the work.",
    body: "For qualified conversations about product systems, architecture, and delivery.",
    bodyMobile:
      "For qualified conversations about product systems, architecture, and delivery.",
    cta: { label: "Start a conversation", href: "/contact" },
    meta: "email · form · calendar",
  },
};
