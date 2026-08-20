/**
 * Homepage fixture — mirrors future Strapi / site-keyed content shape.
 * Copy aligned to Approved — Homepage (Figma production).
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
    items: Array<{ title: string; note: string; href: string }>;
  };
  about: {
    chapter: string;
    summary: string;
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
    mediaNote: "Engineering publication · decisions and evidence",
    mediaAlt:
      "Desk workspace with a laptop showing a minimal interface — Atlas editorial context",
    mediaSrc:
      "/images/case-studies/portfolio-os/portfolio-os-home-hero-desktop.webp",
    mediaWidth: 4480,
    mediaHeight: 6720,
    mediaSizes: "(min-width: 1440px) 880px, 100vw",
    chapter: "JOHN SCHIBELLI · SENIOR SOFTWARE ENGINEER",
    title: "I design and build software systems.",
    deck: "My work spans web platforms, automation, architecture, testing, and documentation. This site presents selected projects through their decisions, tradeoffs, and supporting evidence.",
    primaryCta: { label: "View selected work", href: "#selected-work" },
    secondaryCta: { label: "Contact", href: "#contact" },
  },
  featured: {
    chapter: "FEATURED CASE STUDY",
    title: "Atlas",
    meta: "flagship",
    status: "IN PRODUCTION",
    figureAlt:
      "Data center corridor — Atlas production surface and evidence-led case studies",
    figureCaption:
      "A1 · production surface · responsive routes · evidence-led case studies",
    figureSrc:
      "/images/case-studies/portfolio-os/portfolio-os-home-featured-desktop.webp",
    figureWidth: 3000,
    figureHeight: 1725,
    figureSizes: "(min-width: 1440px) 1376px, 100vw",
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
    cta: { label: "Read case study", href: "/work/portfolio-os" },
  },
  selected: {
    chapter: "SELECTED WORK",
    headline: "Systems with visible operating evidence.",
    projects: [
      {
        id: "shared-strapi-cms",
        layout: "feature",
        eyebrow: "PLATFORM",
        title: "Shared Strapi CMS",
        outcome:
          "One content platform serves Atlas and IntraWeb through explicit site tenancy, versioned schemas, and route-level filtering.",
        href: "/work",
        ctaLabel: "View project →",
        mediaAlt:
          "Shared Strapi architecture — Atlas, atlas-docs, and IntraWeb consumers under site-key tenancy",
        mediaSrc: "/images/work/shared-strapi-architecture.svg",
        mediaWidth: 1520,
        mediaHeight: 860,
        mediaSizes: "(min-width: 1440px) 1376px, 100vw",
      },
      {
        id: "intraweb-automation",
        layout: "offset",
        eyebrow: "SELECTED · OFFSET",
        title: "IntraWeb Automation Platform",
        outcome:
          "Operational workflows coordinate lead, sales, delivery, and reporting across n8n, HubSpot, Stripe, Resend, and Drive—with documented handoffs.",
        href: "/work",
        ctaLabel: "View project →",
        mediaAlt: "Automation workflow diagram for IntraWeb operations",
        mediaSrc: "/images/work/intraweb-automation-workflow.svg",
        mediaWidth: 640,
        mediaHeight: 440,
        mediaSizes: "(min-width: 1440px) 320px, 50vw",
      },
      {
        id: "vehicle-maintenance",
        layout: "band",
        eyebrow: "PRODUCT ENGINEERING",
        title: "Vehicle Maintenance Platform",
        outcome: "Operational product for maintenance cycles.",
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
    stages: ["Architecture", "Quality", "Automation", "Documentation"],
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
    items: [
      {
        title: "Lessons from Building Atlas",
        note: "What held up, what changed, and what the system made visible.",
        href: "/articles/lessons-from-building-atlas",
      },
      {
        title: "Migrating from Contentful to Strapi",
        note: "Moving to a shared, self-hosted content platform.",
        href: "/articles/migrating-from-contentful-to-strapi",
      },
    ],
  },
  about: {
    chapter: "ABOUT",
    summary:
      "I’m a senior software engineer focused on architecture, product delivery, automation, and the evidence that makes complex work easier to evaluate.",
    href: "/about",
    ctaLabel: "Read the profile →",
  },
  contact: {
    chapter: "CONTACT",
    title: "Let’s talk about the work.",
    body: "For qualified conversations about product systems, architecture, and delivery.",
    cta: { label: "Start a conversation", href: "/contact" },
    meta: "email · form · calendar",
  },
  footer: {
    links: navOrder,
    mark: "ATLAS",
  },
};
