import type {
  Article,
  CaseStudy,
  PublishingMedia,
  PublishingSection,
} from "@repo/strapi-client";
import type {
  ArticleCallout,
  ArticleCodeBlock,
  ArticleEvidenceBlock,
  ArticleFigureBlock,
  ArticleSection,
  ArticleTableBlock,
  ArticleTerminalBlock,
  ArticleTopic,
  ArticleType,
} from "@/content/article";
import type {
  DocCallout,
  DocCodeBlock,
  DocEvidenceBlock,
  DocFigureBlock,
  DocSection,
  DocTableBlock,
  DocTerminalBlock,
  DocCategory,
  DocKind,
} from "@/content/doc";
import type { ArchitectureNode } from "@/content/case-study";
import { mediaFields } from "@/lib/strapi/media";

export const ATLAS_SITE = { key: "personal" as const, name: "Atlas" };

const ARTICLE_TOPICS: ArticleTopic[] = [
  "Architecture",
  "Delivery",
  "Platform",
  "Testing",
  "Tooling",
];

const DOC_CATEGORIES: DocCategory[] = [
  "Architecture",
  "Design System",
  "Frontend",
  "Testing",
  "Publishing",
];

export function titleCaseEnum<T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
): T | undefined {
  if (!value) return undefined;
  const normalized = value.trim();
  const match = allowed.find(
    (item) => item.toLowerCase() === normalized.toLowerCase(),
  );
  return match;
}

export function mapArticleTopic(categories: Article["categories"]): ArticleTopic {
  const fromCategory = categories
    .map((c) => titleCaseEnum(c.name, ARTICLE_TOPICS))
    .find(Boolean);
  return fromCategory ?? "Architecture";
}

export function mapDocCategory(categories: Article["categories"]): DocCategory {
  const fromCategory = categories
    .map((c) => titleCaseEnum(c.name, DOC_CATEGORIES))
    .find(Boolean);
  return fromCategory ?? "Architecture";
}

export function mapEditorialType(
  value: Article["editorialType"],
): ArticleType {
  switch (value) {
    case "decision":
      return "Decision";
    case "note":
      return "Note";
    case "essay":
    default:
      return "Essay";
  }
}

export function mapDocKind(value: Article["docKind"]): DocKind {
  switch (value) {
    case "adr":
      return "ADR";
    case "playbook":
      return "Playbook";
    case "procedure":
      return "Procedure";
    case "reference":
      return "Reference";
    case "guide":
    default:
      return "Guide";
  }
}

/** Composed / application-owned media must not expose raster src (M8A). */
export function isComposedMedia(media: PublishingMedia): boolean {
  return media.evidenceClass === "composed" || media.composedKey != null;
}

export function mapPublishingFigure(
  media: PublishingMedia | null | undefined,
  composedKey?: ArticleFigureBlock["composed"] | DocFigureBlock["composed"],
): ArticleFigureBlock | DocFigureBlock | undefined {
  if (!media) return undefined;
  const fields = mediaFields(media);
  const composed =
    composedKey ??
    (fields.composed === "rsc-request-path"
      ? "rsc-request-path"
      : fields.composed === "atlas-boundaries"
        ? "atlas-boundaries"
        : undefined);
  const omitSrc = isComposedMedia(media) || composed != null;
  return {
    alt: media.alt,
    label: fields.label ?? "",
    labelCompact: fields.captionShort,
    caption: fields.caption ?? "",
    captionCompact: fields.captionShort,
    composed,
    src: omitSrc ? undefined : fields.src,
    width: omitSrc ? undefined : fields.width,
    height: omitSrc ? undefined : fields.height,
    sizes: omitSrc ? undefined : fields.sizes,
  };
}

function mapCallout(
  callout: NonNullable<PublishingSection["callout"]>,
): ArticleCallout | DocCallout {
  return {
    variant: callout.variant,
    title: callout.title,
    body: callout.body,
    bodyCompact: callout.bodyCompact ?? undefined,
  };
}

function mapCode(
  code: NonNullable<PublishingSection["code"]>,
): ArticleCodeBlock | DocCodeBlock {
  return {
    language: code.language,
    caption: code.caption ?? "",
    captionCompact: code.captionCompact ?? undefined,
    code: code.code,
  };
}

function mapTerminal(
  terminal: NonNullable<PublishingSection["terminal"]>,
): ArticleTerminalBlock | DocTerminalBlock {
  return {
    caption: terminal.caption ?? "",
    captionCompact: terminal.captionCompact ?? undefined,
    lines: terminal.lines,
  };
}

function mapTable(
  table: NonNullable<PublishingSection["table"]>,
): ArticleTableBlock | DocTableBlock {
  return {
    caption: table.caption ?? "",
    captionCompact: table.captionCompact ?? undefined,
    columns: table.columns,
    rows: table.rows,
  };
}

function mapEvidence(
  evidence: NonNullable<PublishingSection["evidence"]>,
): ArticleEvidenceBlock | DocEvidenceBlock {
  return {
    kind: evidence.kind,
    title: evidence.title,
    status: evidence.status,
    meta: evidence.meta,
    href: evidence.href ?? undefined,
    hrefLabel: evidence.hrefLabel ?? undefined,
  };
}

export function mapPublishingSections(
  sections: PublishingSection[],
): ArticleSection[] {
  return sections.map((section) => ({
    id: section.sectionId,
    chapter: section.chapter,
    title: section.title,
    paragraphs: section.paragraphs,
    paragraphsTablet: section.paragraphsTablet ?? undefined,
    bodyMobile: section.bodyMobile ?? undefined,
    figure: mapPublishingFigure(section.figure, "rsc-request-path") as
      | ArticleFigureBlock
      | undefined,
    callout: section.callout ? mapCallout(section.callout) : undefined,
    code: section.code ? mapCode(section.code) : undefined,
    terminal: section.terminal ? mapTerminal(section.terminal) : undefined,
    table: section.table ? mapTable(section.table) : undefined,
    evidence: section.evidence ? mapEvidence(section.evidence) : undefined,
  }));
}

export function mapDocPublishingSections(
  sections: PublishingSection[],
): DocSection[] {
  return sections.map((section) => ({
    id: section.sectionId,
    chapter: section.chapter,
    title: section.title,
    paragraphs: section.paragraphs,
    paragraphsTablet: section.paragraphsTablet ?? undefined,
    bodyMobile: section.bodyMobile ?? undefined,
    figure: mapPublishingFigure(section.figure, "atlas-boundaries") as
      | DocFigureBlock
      | undefined,
    callout: section.callout ? mapCallout(section.callout) : undefined,
    code: section.code ? mapCode(section.code) : undefined,
    terminal: section.terminal ? mapTerminal(section.terminal) : undefined,
    table: section.table ? mapTable(section.table) : undefined,
    evidence: section.evidence ? mapEvidence(section.evidence) : undefined,
  }));
}

export function buildArticleToc(sections: ArticleSection[]) {
  return sections
    .filter((s) => s.chapter && s.title)
    .map((s, index) => ({
      id: s.id,
      label: `${String(index + 1).padStart(2, "0")} ${s.title.split(".")[0]?.trim() ?? s.title}`,
      href: `#${s.id}`,
    }));
}

export function buildDocToc(sections: DocSection[]) {
  return buildArticleToc(sections as ArticleSection[]);
}

export function parseArchitectureNodes(raw: unknown): ArchitectureNode[] {
  if (!Array.isArray(raw)) return [];
  const nodes: ArchitectureNode[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id : "";
    const label = typeof row.label === "string" ? row.label : "";
    if (!id || !label) continue;
    const node: ArchitectureNode = { id, label };
    if (typeof row.labelShort === "string") node.labelShort = row.labelShort;
    if (row.emphasis === true) node.emphasis = true;
    nodes.push(node);
  }
  return nodes;
}

export function caseSeo(study: CaseStudy) {
  return {
    title: study.seo?.metaTitle ?? study.title,
    description: study.seo?.metaDescription ?? study.summary ?? "",
  };
}
