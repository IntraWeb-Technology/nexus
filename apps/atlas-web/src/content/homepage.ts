/**
 * Homepage fixture — mirrors future Strapi / site-keyed content shape.
 * No live CMS in this sprint. Component props should stay stable when Strapi lands.
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
    figureCaption: string;
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

export const homepageFixture: HomepageFixture = {
  site: { key: "personal", name: "Atlas" },
  nav: {
    brand: { label: "ATLAS", href: "/" },
    links: [
      { label: "Work", href: "/work" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Articles", href: "/articles" },
    ],
  },
  hero: {
    mediaLabel: "SYSTEM DESIGN",
    mediaNote: "Screenshot / diagram chapter\n~880×680 · answers what is built",
    chapter: "MOMENT ONE",
    title: "Systems that\nearn trust",
    deck: "What this engineer builds — platforms and operating systems, not a résumé opener.",
    primaryCta: { label: "View selected work", href: "#selected-work" },
    secondaryCta: { label: "Contact", href: "#contact" },
  },
  featured: {
    chapter: "MOMENT TWO  ·  CASE STUDY",
    title: "Portfolio OS",
    meta: "flagship",
    status: "IN PRODUCTION",
    figureCaption: "Visual anchor — text explains this image",
    problemLabel: "PROBLEM",
    problem:
      "Problem framing placeholder — the constraint that made the system necessary.",
    outcomeLabel: "OUTCOME",
    outcome:
      "Outcome placeholder — what changed because the work shipped.",
    highlightsLabel: "TECHNICAL HIGHLIGHTS",
    highlights: [
      "Architecture decision",
      "Systems / delivery",
      "Quality / testing",
    ],
    cta: { label: "Read case study", href: "/work/portfolio-os" },
  },
  selected: {
    chapter: "SELECTED WORK",
    headline: "Three roles. One sequence.",
    projects: [
      {
        id: "project-a",
        layout: "feature",
        eyebrow: "LARGE FEATURE",
        title: "Project A — large feature",
        outcome: "One-line outcome.",
        href: "/work/project-a",
        ctaLabel: "View project →",
      },
      {
        id: "project-b",
        layout: "offset",
        eyebrow: "OFFSET FEATURE",
        title: "Project B title",
        outcome:
          "Deliberate deep indent — intentional offset, not accidental middle ground.",
        href: "/work/project-b",
        ctaLabel: "View project →",
      },
      {
        id: "project-c",
        layout: "band",
        eyebrow: "WIDE BAND",
        title: "Project C — compressed systems note",
        outcome: "Short systems note.",
        href: "/work/project-c",
        ctaLabel: "View →",
      },
    ],
  },
  philosophy: {
    chapter: "MOMENT THREE  ·  ENGINEERING PHILOSOPHY",
    quote:
      "“Systems should make the next correct decision easier than the wrong one.”",
    diagramCaption:
      "Dominant visual — principles orbit; quote remains the verbal anchor.",
    stages: ["Discover", "Architect", "Deliver", "Measure"],
    principles: [
      { title: "Architecture", body: "Structure before features." },
      { title: "Quality", body: "Proof is part of the product." },
    ],
  },
  writing: {
    chapter: "DOCUMENTATION  ·  WRITING",
    items: [
      {
        title: "Why We Chose React Server Components",
        note: "Architecture · decision record",
        href: "/articles/why-we-chose-react-server-components",
      },
      {
        title: "Playwright at Scale",
        note: "Testing · fixture strategy",
        href: "/articles/playwright-at-scale",
      },
    ],
  },
  about: {
    chapter: "ABOUT",
    summary: "Short human summary — authentic, not a résumé.",
    href: "/about",
    ctaLabel: "About →",
  },
  contact: {
    chapter: "CONTACT",
    title: "Let’s talk about the work.",
    body: "Expectation-setting placeholder. Qualified conversation.",
    cta: { label: "Start a conversation", href: "/contact" },
    meta: "email · form · calendar (TBD)",
  },
  footer: {
    links: [
      { label: "Work", href: "/work" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Articles", href: "/articles" },
    ],
    mark: "Atlas",
  },
};
