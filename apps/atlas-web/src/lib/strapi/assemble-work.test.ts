import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Project, WorkPage } from "@repo/strapi-client";
import { assembleWork } from "./assemble-work.js";

const baseWorkPage = {
  documentId: "work-1",
  siteKey: "personal",
  seo: { metaTitle: "Work", metaDescription: "Work index" },
  intro: {
    chapter: "WORK",
    title: "Selected engineering work",
    deck: "Deck",
    deckMobile: "Deck mobile",
    meta: [],
    editorialNoteLabel: "EDITORIAL NOTE",
    editorialNoteBody: "Note body",
  },
  featuredProject: {
    documentId: "p-flagship",
    name: "Portfolio OS",
    slug: "portfolio-os",
    cardMedia: null,
  },
  featuredCopy: {
    chapter: "FEATURED",
    flagshipLabel: "flagship",
    title: "Portfolio OS",
    summary: "Summary",
    summaryMobile: "Summary mobile",
    status: "IN PRODUCTION",
    timeframe: "2024 — Present",
    role: "Design & Engineering",
    figure: null,
    figureCompact: null,
    themesLabel: "ENGINEERING THEMES",
    themes: ["Product Engineering"],
    themesCompact: "Themes",
    cta: { label: "Read case study", href: "/work/portfolio-os" },
    ctaNote: "Note",
  },
  selectedChapter: "SELECTED WORK",
  selectedHeadline: "Additional dimensions.",
  selectedDeck: "Deck",
  taxonomy: {
    chapter: "TAXONOMY",
    title: "How the work is classified.",
    deck: "Editorial categories",
    groups: [],
  },
  contactBridge: {
    chapter: "CONTACT",
    title: "Let's talk",
    body: "Body",
    bodyCompact: null,
    summary: null,
    cta: { label: "Start a conversation", href: "/contact" },
    ctaLabel: null,
    href: null,
    meta: null,
    workLink: null,
  },
} as unknown as WorkPage;

const vehicleMaintenance: Project = {
  documentId: "p-vm",
  siteKeys: ["personal"],
  name: "Vehicle Maintenance Platform",
  slug: "vehicle-maintenance",
  summary: "Operational product",
  description: null,
  projectType: null,
  technologies: [],
  featuredImage: null,
  gallery: [],
  repositoryUrl: null,
  liveUrl: null,
  documentationUrl: null,
  status: "completed",
  startDate: null,
  endDate: null,
  featured: false,
  seo: null,
  publishedAt: null,
  category: "PRODUCT ENGINEERING",
  themes: ["Product Engineering"],
  statusLabel: "Completed",
  layout: "band",
  sortOrder: 30,
  summaryTablet: null,
  summaryMobile: null,
  ctaLabel: "View →",
  cardMedia: null,
};

const sharedStrapi: Project = {
  ...vehicleMaintenance,
  documentId: "p-strapi",
  name: "Shared Strapi CMS / Atlas",
  slug: "shared-strapi-cms",
  layout: "feature",
  sortOrder: 10,
  cardMedia: {
    alt: "Architecture",
    caption: null,
    captionShort: null,
    label: "Shared Strapi multi-site architecture",
    kind: "architecture-diagram",
    evidenceClass: "production",
    composedKey: null,
    sizes: "(min-width: 1440px) 760px, 100vw",
    asset: {
      id: "asset-1",
      url: "/images/work/shared-strapi-architecture.svg",
      width: 1520,
      height: 860,
      mime: "image/svg+xml",
      alternativeText: null,
      name: "shared-strapi-architecture.svg",
    },
  },
} as Project;

describe("assembleWork", () => {
  it("A-05 vehicle-maintenance has no mediaSrc when cardMedia absent", () => {
    const fixture = assembleWork(
      baseWorkPage,
      [vehicleMaintenance, sharedStrapi],
      new Set(["portfolio-os"]),
    );

    const vm = fixture.selected.projects.find(
      (p) => p.slug === "vehicle-maintenance",
    );
    assert.ok(vm, "vehicle-maintenance project present");
    assert.equal(vm.mediaSrc, undefined);
    assert.equal(vm.mediaLabel, undefined);
    assert.equal(vm.href, undefined);

    const withMedia = fixture.selected.projects.find(
      (p) => p.slug === "shared-strapi-cms",
    );
    assert.ok(withMedia?.mediaSrc);
    assert.equal(withMedia.href, undefined);
  });

  it("links selected projects only when case study slug is implemented", () => {
    const fixture = assembleWork(
      baseWorkPage,
      [sharedStrapi],
      new Set(["shared-strapi-cms"]),
    );
    const linked = fixture.selected.projects.find(
      (p) => p.slug === "shared-strapi-cms",
    );
    assert.equal(linked?.href, "/work/shared-strapi-cms");
    assert.equal(linked?.ctaLabel, "View →");
  });

  it("keeps application-static stageRules from workFixture", () => {
    const fixture = assembleWork(baseWorkPage, [vehicleMaintenance]);
    assert.equal(fixture.stageRules.afterIntro, "01  ·  INTRODUCTION");
    assert.equal(fixture.stageRules.afterContact, "05  ·  CONTACT");
  });
});
