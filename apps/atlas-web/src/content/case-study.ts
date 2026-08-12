/**
 * Case study domain types — target shape for future Strapi `case-study` mapping.
 * UI and editorial primitives import from here; fixtures supply data only.
 * No Strapi DTOs in this module.
 */

import type { MetaItem, NavLink } from "@/content/types";

export type FigureKind =
  | "application-screenshot"
  | "architecture-diagram"
  | "workflow-diagram"
  | "browser-capture"
  | "figma-artifact"
  | "ci-pipeline"
  | "repository-structure"
  | "terminal-output"
  | "code-comparison";

export type CaseFigure = {
  id: string;
  kind: FigureKind;
  alt: string;
  caption: string;
  captionShort?: string;
  /** Mono overlay on placeholder plane until real media ships */
  label?: string;
  tone?: "secondary" | "ink";
  /** Neutral media URL (static now; Strapi later). */
  src?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
};

export type EditorialRow = {
  id: string;
  label: string;
  body: string;
};

export type Decision = {
  id: string;
  statement: string;
  statementTablet?: string;
  statementMobile?: string;
  context: string;
  choice: string;
  tradeoff: string;
  consequence: string;
};

export type ArchitectureNode = {
  id: string;
  label: string;
  labelShort?: string;
  emphasis?: boolean;
};

export type CaseStudyFixture = {
  site: { key: "personal"; name: string };
  /** Related Strapi `project` fields */
  project: {
    id: string;
    slug: string;
    name: string;
    projectStatus: "completed" | "in-progress" | "planned" | "archived";
  };
  seo: {
    title: string;
    description: string;
  };
  hero: {
    chapter: string;
    title: string;
    deck: string;
    deckTablet: string;
    deckMobile: string;
    meta: MetaItem[];
    /** Compact mono lines for tablet / mobile */
    metaLineTablet: string;
    metaLineMobileYear: string;
    metaLineMobileRole: string;
    stackLine: string;
  };
  toc: Array<{ id: string; label: string; href: string }>;
  figures: {
    hero: CaseFigure;
    architecture: CaseFigure;
    implementationPrimary: CaseFigure;
    implementationUi: CaseFigure;
    implementationWorkflow: CaseFigure;
    implementationTablet: CaseFigure;
    implementationMobile: CaseFigure;
  };
  overview: {
    chapter: string;
    title: string;
    titleMobile: string;
    columns: Array<{ id: string; label: string; body: string }>;
    bodyTablet: string[];
    bodyMobile: string;
  };
  problem: {
    chapter: string;
    title: string;
    titleMobile: string;
    paragraphs: string[];
    paragraphsTablet: string[];
    bodyMobile: string;
  };
  constraints: {
    chapter: string;
    title: string;
    titleMobile: string;
    rows: EditorialRow[];
    summaryTablet: string;
    summaryMobile: string;
  };
  architecture: {
    chapter: string;
    title: string;
    intro: string;
    requestPath: ArchitectureNode[];
    deliveryPath: ArchitectureNode[];
    tabletRequest: ArchitectureNode[];
    tabletDelivery: ArchitectureNode[];
    mobileNodes: ArchitectureNode[];
    legend: string[];
  };
  decisions: {
    chapter: string;
    title: string;
    intro: string;
    items: Decision[];
  };
  implementation: {
    chapter: string;
    title: string;
    titleMobile: string;
    intro: string;
    introTablet: string;
    introMobile: string;
  };
  delivery: {
    chapter: string;
    title: string;
    titleMobile: string;
    rows: EditorialRow[];
    summaryTablet: string;
    summaryMobile: string;
  };
  outcomes: {
    chapter: string;
    title: string;
    titleMobile: string;
    intro: string;
    items: Array<{ id: string; title: string; body: string }>;
    note: string;
    summaryTablet: string;
    summaryMobile: string;
  };
  lessons: {
    chapter: string;
    title: string;
    titleMobile: string;
    rows: EditorialRow[];
    summaryTablet: string;
    summaryMobile: string;
  };
  related: {
    chapter: string;
    title: string;
    titleTablet: string;
    titleMobile: string;
    projectName: string;
    projectSummary: string;
    cta: NavLink;
  };
  contact: {
    chapter: string;
    title: string;
    body: string;
    cta: NavLink;
    meta: string;
  };
};
