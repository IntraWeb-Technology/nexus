/**
 * Work index fixture — mirrors planned Strapi `project` + page composition shape.
 * No live CMS this sprint. Component props should stay stable when Strapi lands.
 *
 * Project fields align with `apps/cms-strapi` Project collection, plus Atlas editorial
 * fields planned in the Build Manifest (featured, taxonomy themes, case-study link).
 */

import type { MetaItem, NavLink } from "@/content/types";

export type WorkProjectLayout = "feature" | "offset" | "band";

/** Normalized project card — survives CMS mapping unchanged at the UI boundary. */
export type WorkProject = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  /** Shorter summaries for tablet / mobile compositions */
  summaryTablet?: string;
  summaryMobile?: string;
  /** Editorial taxonomy eyebrow (not a filter) */
  category: string;
  /** Atlas editorial themes (map from tags / categories later) */
  themes: string[];
  projectStatus: "completed" | "in-progress" | "planned" | "archived";
  statusLabel: string;
  featured: boolean;
  layout: WorkProjectLayout;
  mediaLabel: string;
  /** Neutral media URL when production evidence exists (M7). */
  mediaSrc?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  mediaSizes?: string;
  /** When true, media remains intentionally unresolved (blocked source). */
  mediaBlocked?: boolean;
  href: string;
  ctaLabel: string;
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
      "Selected engineering work — systems, platforms, and product engineering presented as editorial chapters.",
  },
  intro: {
    chapter: "WORK",
    title: "Selected engineering work",
    deck: "A curated body of systems, platforms, and product engineering — presented as editorial chapters, not a gallery of cards.",
    deckMobile:
      "A curated body of systems and product engineering — editorial chapters, not a card gallery.",
    meta: [
      { label: "Role", value: "Lead Engineer" },
      { label: "Focus", value: "Product systems" },
      { label: "Status", value: "Active body of work" },
    ],
    editorialNote: {
      label: "EDITORIAL NOTE",
      body: "Projects are ordered by narrative weight — flagship first, then breadth, then depth. Classification is editorial, not a filter UI.",
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
      "Portfolio OS architecture diagram on the case-study production surface — request path and delivery tooling",
    figureCaption:
      "Fig. 1 — Portfolio OS production surface. Canonical request and delivery path from the live case study.",
    figureCaptionShort: "Fig. 1 — Portfolio OS production surface.",
    figureSrc:
      "/images/case-studies/portfolio-os/portfolio-os-work-featured-desktop.webp",
    figureWidth: 2400,
    figureHeight: 1350,
    figureSizes: "(min-width: 1440px) 1216px, 100vw",
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
    cta: { label: "Read case study", href: "/work/portfolio-os" },
    ctaNote: "Full engineering narrative → architecture, decisions, delivery",
  },
  selected: {
    chapter: "SELECTED WORK",
    headline: "Additional dimensions.",
    deck: "Unequal compositions — media scale, alignment, and density shift with each project. No card grid.",
    projects: [
      {
        id: "shared-strapi-cms",
        slug: "shared-strapi-cms",
        name: "Shared Strapi CMS / Atlas",
        summary:
          "A multi-site content platform shared across Atlas and sibling properties — one CMS, explicit site boundaries, production content workflows.",
        summaryTablet:
          "Multi-site content platform — one CMS, explicit site boundaries, production workflows.",
        summaryMobile: "Multi-site CMS with explicit site boundaries.",
        category: "PLATFORM",
        themes: ["Architecture", "Platform"],
        projectStatus: "in-progress",
        statusLabel: "In production",
        featured: false,
        layout: "feature",
        mediaLabel: "Shared Strapi multi-site architecture",
        mediaSrc: "/images/work/shared-strapi-architecture.svg",
        mediaWidth: 1520,
        mediaHeight: 860,
        mediaSizes: "(min-width: 1440px) 760px, 100vw",
        href: "/work/shared-strapi-cms",
        ctaLabel: "View project →",
      },
      {
        id: "intraweb-automation",
        slug: "intraweb-automation",
        name: "IntraWeb Automation Platform",
        summary:
          "Workflow automation across internal operations — reducing manual process load through reliable, inspectable pipelines.",
        summaryTablet:
          "Workflow automation across internal operations — inspectable pipelines.",
        summaryMobile: "Inspectable pipelines for internal operations.",
        category: "AUTOMATION",
        themes: ["Automation", "Developer Experience"],
        projectStatus: "in-progress",
        statusLabel: "In production",
        featured: false,
        layout: "offset",
        mediaLabel: "IntraWeb n8n orchestration workflow",
        mediaSrc: "/images/work/intraweb-automation-workflow.svg",
        mediaWidth: 1120,
        mediaHeight: 640,
        mediaSizes: "(min-width: 1440px) 560px, 100vw",
        href: "/work/intraweb-automation",
        ctaLabel: "View project →",
      },
      {
        id: "vehicle-maintenance",
        slug: "vehicle-maintenance",
        name: "Vehicle Maintenance Platform",
        summary:
          "Operational product for tracking maintenance cycles, service history, and scheduling constraints — engineering for real-world reliability.",
        summaryTablet: undefined,
        summaryMobile: "Operational product for maintenance cycles.",
        category: "PRODUCT ENGINEERING",
        themes: ["Product Engineering"],
        projectStatus: "completed",
        statusLabel: "Completed",
        featured: false,
        layout: "band",
        mediaLabel:
          "Vehicle Maintenance production media blocked — source required",
        mediaBlocked: true,
        href: "/work/vehicle-maintenance",
        ctaLabel: "View →",
        metaNote: "systems note",
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
    body: "Expectation-setting placeholder. Qualified conversation.",
    bodyMobile: "Qualified conversation.",
    cta: { label: "Start a conversation", href: "/contact" },
    meta: "email · form · calendar (TBD)",
  },
};
