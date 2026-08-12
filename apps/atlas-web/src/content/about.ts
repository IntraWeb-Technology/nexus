/**
 * About fixture — mirrors planned Strapi about-page / site-setting fields.
 * No live CMS this sprint. UI consumes this shape only (no DTOs).
 *
 * Copy matches Figma About (Page 20) desktop / tablet / mobile compositions.
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
    meta: string;
  };
};

export const aboutFixture: AboutFixture = {
  seo: {
    title: "About",
    description:
      "An engineer’s editorial profile — practice, principles, and how systems stay inspectable.",
  },
  opening: {
    chapter: "ABOUT",
    title: "An engineer’s editorial profile.",
    deck: "Placeholder — a short statement of practice: how systems are designed, how decisions are recorded, and how delivery stays inspectable.",
    deckCondensed:
      "Placeholder — how systems are designed, decisions recorded, delivery kept inspectable.",
    meta: "Role  ·  Lead Engineer (placeholder)    ·    Focus  ·  Product systems & platform architecture",
    metaCondensed: "Lead Engineer · Product systems (placeholder)",
    marginNote: {
      label: "MARGIN NOTE",
      body: "Placeholder — authenticity note. Personal context that frames the engineering voice without résumé language.",
    },
  },
  philosophy: {
    chapter: "ENGINEERING PHILOSOPHY",
    quote:
      "“Systems should remain legible under pressure — architecture, delivery, and documentation as one continuous record.”",
    quoteCondensed: "“Systems should remain legible under pressure.”",
    attribution: "— Placeholder principle statement",
    body: "Placeholder body — expand on how clarity, constraints, and inspectability guide day-to-day engineering judgment. Prefer evidence over narrative polish.",
  },
  approach: {
    chapter: "HOW PROBLEMS ARE APPROACHED",
    chapterCondensed: "APPROACH",
    title: "Observe → Bound → Decide → Prove.",
    body: "Placeholder — describe the working method: surface constraints early, keep options reversible where cost allows, and leave a trail that another engineer can audit.",
    bodyCondensed:
      "Placeholder — surface constraints early; leave an audit trail.",
    stages: [
      { id: "01", label: "Observe" },
      { id: "02", label: "Bound" },
      { id: "03", label: "Decide" },
      { id: "04", label: "Prove" },
    ],
    figureCaption: "Fig. 1 — Problem approach loop (placeholder diagram).",
  },
  style: {
    chapter: "WORKING STYLE",
    title: "Quiet intensity. Written decisions. Few surprises.",
    items: [
      {
        title: "Async-first",
        body: "Placeholder — prefer written briefs, clear owners, and reviewable diffs over status theater.",
      },
      {
        title: "Evidence-led",
        body: "Placeholder — demos, logs, diagrams, and ADRs carry more weight than slide narrative.",
      },
      {
        title: "Boundary-aware",
        body: "Placeholder — protect site and service boundaries; make coupling intentional and named.",
      },
    ],
  },
  principles: {
    chapter: "PRINCIPLES",
    title: "Non-negotiables for how work ships.",
    items: [
      {
        id: "01",
        title: "Prefer reversible decisions",
        body: "Placeholder — keep migration paths and feature flags when uncertainty is high.",
      },
      {
        id: "02",
        title: "Document the why",
        body: "Placeholder — ADRs and margin notes exist so future readers can recover intent.",
      },
      {
        id: "03",
        title: "Make failure inspectable",
        body: "Placeholder — logs, traces, and runbooks are part of the product surface.",
      },
      {
        id: "04",
        title: "Design for operators",
        body: "Placeholder — the next engineer is a first-class user of the system.",
      },
      {
        id: "05",
        title: "Ship the smallest honest increment",
        body: "Placeholder — scope to learning, not theater.",
      },
    ],
  },
  timeline: {
    chapter: "TIMELINE",
    title: "A selective record of practice — not a CV.",
    entries: [
      {
        period: "YYYY — Present",
        title: "Lead / Principal engineering (placeholder)",
        note: "Product systems, platform boundaries, delivery architecture.",
      },
      {
        period: "YYYY — YYYY",
        title: "Platform & product engineering (placeholder)",
        note: "Multi-surface delivery, CMS architecture, automation.",
      },
      {
        period: "YYYY — YYYY",
        title: "Engineering practice (placeholder)",
        note: "Foundations in systems thinking and operator-aware design.",
      },
    ],
  },
  focus: {
    chapter: "CURRENT FOCUS",
    title: "Atlas — editorial systems for engineering proof.",
    body: "Placeholder — current work concentrates on publication-grade case studies, documentation architecture, and inspectable delivery surfaces. Specifics TBD.",
    bodyCondensed:
      "Placeholder — publication-grade case studies, documentation architecture, inspectable delivery.",
    statusLabel: "STATUS",
    status: "In progress",
    themesLabel: "Themes",
    themes: "Architecture · Documentation · Delivery · DX",
  },
  reading: {
    chapter: "READING  /  DOCUMENTATION",
    title: "How knowledge is kept usable.",
    items: [
      {
        label: "ADRS",
        body: "Placeholder — architecture decisions recorded with context, options, and consequences.",
      },
      {
        label: "RUNBOOKS",
        body: "Placeholder — operational truth over tribal knowledge; kept near the code.",
      },
      {
        label: "CASE NOTES",
        body: "Placeholder — post-delivery writeups that preserve tradeoffs, not just outcomes.",
      },
      {
        label: "EXTERNAL READING",
        body: "Placeholder — systems papers, design essays, operator literature. List TBD.",
      },
    ],
  },
  architecture: {
    chapter: "ARCHITECTURE MINDSET",
    title: "Boundaries first. Interfaces second. Implementation last.",
    body: "Placeholder — architecture is treated as a communication medium: named boundaries, explicit contracts, and diagrams that survive contact with production. Prefer boring primitives with clear ownership over clever centralization.",
    layers: [
      { name: "Surface", note: "sites / apps" },
      { name: "Contract", note: "APIs / events" },
      { name: "Capability", note: "domains" },
      { name: "Platform", note: "shared infra" },
    ],
    figureCaption: "Fig. 2 — Layered boundary model (placeholder).",
  },
  notes: {
    chapter: "PERSONAL NOTES",
    pullQuote:
      "Placeholder pull quote — a human register that keeps the profile from becoming corporate biography.",
    body: "Placeholder — short personal notes: what draws attention outside delivery, how craft is practiced, what “done” feels like when the system is quiet and the documentation still holds.",
    bodyCondensed:
      "Placeholder personal note — authenticity without résumé language.",
  },
  contact: {
    chapter: "CONTACT",
    title: "A conversation, not a pitch.",
    body: "Placeholder — qualified conversations about product systems, architecture, and delivery. Expectation-setting copy TBD.",
    bodyCondensed:
      "Placeholder — qualified conversations. Expectation-setting copy TBD.",
    cta: { label: "Start a conversation", href: "/contact" },
    meta: "email · form · calendar (TBD)",
  },
};
