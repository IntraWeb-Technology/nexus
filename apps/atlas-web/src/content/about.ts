/**
 * About fixture — Approved — About (Figma production).
 * Shape kept compatible with assemble-about / Strapi AboutPage.
 */

import type { NavLink } from "@/content/types";

export type AboutFixture = {
  seo: { title: string; description: string };
  opening: {
    chapter: string;
    title: string;
    deck: string;
    deckCondensed: string;
    meta: string;
    metaCondensed: string;
    marginNote: { label: string; body: string };
  };
  philosophy: {
    chapter: string;
    quote: string;
    quoteCondensed: string;
    attribution: string;
    body: string;
  };
  approach: {
    chapter: string;
    chapterCondensed: string;
    title: string;
    body: string;
    bodyCondensed: string;
    stages: Array<{ id: string; label: string }>;
    figureCaption: string;
  };
  style: {
    chapter: string;
    title: string;
    items: Array<{ title: string; body: string }>;
  };
  principles: {
    chapter: string;
    title: string;
    items: Array<{ id: string; title: string; body: string }>;
  };
  timeline: {
    chapter: string;
    title: string;
    entries: Array<{ period: string; title: string; note: string }>;
  };
  focus: {
    chapter: string;
    title: string;
    body: string;
    bodyCondensed: string;
    statusLabel: string;
    status: string;
    themesLabel: string;
    themes: string;
  };
  reading: {
    chapter: string;
    title: string;
    items: Array<{ label: string; body: string }>;
  };
  architecture: {
    chapter: string;
    title: string;
    body: string;
    layers: Array<{ name: string; note: string }>;
    figureCaption: string;
  };
  notes: {
    chapter: string;
    pullQuote: string;
    body: string;
    bodyCondensed: string;
  };
  contact: {
    chapter: string;
    title: string;
    body: string;
    bodyCondensed: string;
    cta: NavLink;
    secondaryCta?: NavLink;
    meta: string;
  };
};

export const aboutFixture: AboutFixture = {
  seo: {
    title: "About",
    description:
      "John Schibelli — senior software engineer working across product development, architecture, testing, and automation.",
  },
  opening: {
    chapter: "ABOUT",
    title:
      "I’m a senior software engineer working across product development, architecture, testing, and automation.",
    deck: "John Schibelli",
    deckCondensed: "John Schibelli",
    meta: "John Schibelli",
    metaCondensed: "Senior Software Engineer · IntraWeb Technologies",
    marginNote: {
      label: "ROLE",
      body: "Senior Software Engineer · IntraWeb Technologies",
    },
  },
  philosophy: {
    chapter: "ENGINEERING PHILOSOPHY",
    quote:
      "Good systems reduce ambiguity: the next correct action should be visible, testable, and documented.",
    quoteCondensed:
      "Good systems reduce ambiguity: the next correct action should be visible, testable, and documented.",
    attribution: "— Practice",
    body: "Architecture, delivery, and documentation stay close enough that another engineer can maintain, question, or revise the decision.",
  },
  approach: {
    chapter: "HOW PROBLEMS ARE APPROACHED",
    chapterCondensed: "APPROACH",
    title: "Boundaries before features.",
    body: "Define system boundaries and ownership before expanding features. Treat testing, CI, and review artifacts as part of implementation.",
    bodyCondensed:
      "Define boundaries before expanding features. Treat tests and CI as part of delivery.",
    stages: [
      { id: "01", label: "Bound" },
      { id: "02", label: "Decide" },
      { id: "03", label: "Prove" },
      { id: "04", label: "Document" },
    ],
    figureCaption: "Working method — bound, decide, prove, document.",
  },
  style: {
    chapter: "WORKING STYLE",
    title: "Quiet intensity. Written decisions. Few surprises.",
    items: [
      {
        title: "Async-first",
        body: "Prefer written briefs, clear owners, and reviewable diffs over status theater.",
      },
      {
        title: "Evidence-led",
        body: "Demos, logs, diagrams, and ADRs carry more weight than slide narrative.",
      },
      {
        title: "Boundary-aware",
        body: "Protect site and service boundaries; make coupling intentional and named.",
      },
    ],
  },
  principles: {
    chapter: "HOW I WORK",
    title: "",
    items: [
      {
        id: "01",
        title: "ARCHITECTURE",
        body: "I define system boundaries and ownership before expanding features.",
      },
      {
        id: "02",
        title: "DELIVERY",
        body: "I treat testing, CI, and review artifacts as part of implementation.",
      },
      {
        id: "03",
        title: "COMMUNICATION",
        body: "I document the reasoning so another engineer can maintain, question, or revise the decision.",
      },
    ],
  },
  timeline: {
    chapter: "CAREER ARC",
    title: "",
    entries: [
      {
        period: "2005 — 2009",
        title: "Teaching and program leadership",
        note: "Developed web-development curriculum and led eight instructors across four campuses.",
      },
      {
        period: "2009 — 2016",
        title: "Agency and client development",
        note: "Built websites, interfaces, and content systems for small businesses, agencies, financial teams, and pharmaceutical clients.",
      },
      {
        period: "2016 — 2020",
        title: "Operational web systems",
        note: "Connected customer booking and front-end experiences to reservation, scheduling, and dispatch systems.",
      },
      {
        period: "2020 — PRESENT",
        title: "Architecture, automation, and product engineering",
        note: "At IntraWeb Technologies, I design and build web applications, shared platforms, delivery tooling, and operational automation. My 2024 work at ColorStreet focused on e-commerce, Playwright, CI, API validation, and SQL Server.",
      },
    ],
  },
  focus: {
    chapter: "CURRENT FOCUS",
    title: "",
    body: "I’m currently focused on product engineering, shared content platforms, automated testing, and operational workflows. I prefer work where technical decisions stay close to implementation and can be reviewed through code, tests, and documentation.",
    bodyCondensed:
      "Product engineering, shared content platforms, automated testing, and operational workflows — with decisions close to implementation.",
    statusLabel: "STATUS",
    status: "Active",
    themesLabel: "Themes",
    themes: "Product · Platforms · Testing · Automation",
  },
  reading: {
    chapter: "READING",
    title: "How knowledge is kept usable.",
    items: [
      {
        label: "ADRS",
        body: "Architecture decisions recorded with context, options, and consequences.",
      },
      {
        label: "RUNBOOKS",
        body: "Operational truth over tribal knowledge; kept near the code.",
      },
      {
        label: "CASE NOTES",
        body: "Post-delivery writeups that preserve tradeoffs, not just outcomes.",
      },
      {
        label: "EXTERNAL READING",
        body: "Systems papers, design essays, and operator literature.",
      },
    ],
  },
  architecture: {
    chapter: "ARCHITECTURE MINDSET",
    title: "Boundaries first. Interfaces second. Implementation last.",
    body: "Architecture is treated as a communication medium: named boundaries, explicit contracts, and diagrams that survive contact with production.",
    layers: [
      { name: "Surface", note: "sites / apps" },
      { name: "Contract", note: "APIs / events" },
      { name: "Capability", note: "domains" },
      { name: "Platform", note: "shared infra" },
    ],
    figureCaption:
      "Layered boundary model. Surface → Contract → Capability → Platform.",
  },
  notes: {
    chapter: "PERSONAL NOTES",
    pullQuote: "Evidence over résumé language.",
    body: "Craft stays close to the work: quiet systems, readable decisions, documentation that still holds after the release is forgotten.",
    bodyCondensed: "Quiet systems, readable decisions, durable documentation.",
  },
  contact: {
    chapter: "CONTACT",
    title: "Let’s talk about the work.",
    body: "Questions about architecture, product development, automation, or delivery are welcome.",
    bodyCondensed:
      "Questions about architecture, product development, automation, or delivery are welcome.",
    cta: { label: "Start a conversation", href: "/contact" },
    secondaryCta: { label: "Browse Work →", href: "/work" },
    meta: "form",
  },
};
