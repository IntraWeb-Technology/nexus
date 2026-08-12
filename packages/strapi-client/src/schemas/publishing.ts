import { z } from "zod";
import {
  asJsonArray,
  asString,
  asStringArray,
  flattenEntries,
  flattenEntry,
  parseEnum,
} from "./common.js";
import { mediaAssetSchema, shapeMedia } from "./media.js";

export const evidenceClassSchema = z.enum(["production", "composed"]);

export const figureKindSchema = z.enum([
  "application-screenshot",
  "architecture-diagram",
  "workflow-diagram",
  "browser-capture",
  "figma-artifact",
  "ci-pipeline",
  "repository-structure",
  "terminal-output",
  "code-comparison",
]);

export const composedKeySchema = z.enum([
  "architecture-diagram",
  "content-map-render",
  "rsc-request-path",
  "atlas-boundaries",
  "about-approach",
  "about-architecture",
  "home-philosophy",
]);

export const calloutVariantSchema = z.enum(["tradeoff", "note", "warning"]);

export const evidenceKindSchema = z.enum([
  "ci",
  "deploy",
  "test",
  "coverage",
  "performance",
  "a11y",
  "repository",
  "documentation",
]);

const FIGURE_KINDS = figureKindSchema.options;
const COMPOSED_KEYS = composedKeySchema.options;
const EVIDENCE_CLASSES = evidenceClassSchema.options;
const CALLOUT_VARIANTS = calloutVariantSchema.options;
const EVIDENCE_KINDS = evidenceKindSchema.options;

export const publishingMetaItemSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export function shapePublishingMetaItem(
  raw: unknown,
): z.input<typeof publishingMetaItemSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const label = asString(entry.label);
  const value = asString(entry.value);
  if (!label || !value) return null;
  return { label, value };
}

export function shapePublishingMetaItems(
  raw: unknown,
): Array<z.input<typeof publishingMetaItemSchema>> {
  return flattenEntries(raw)
    .map((item) => shapePublishingMetaItem(item))
    .filter((item): item is z.input<typeof publishingMetaItemSchema> => item != null);
}

export const publishingMediaSchema = z.object({
  alt: z.string(),
  caption: z.string().nullable(),
  captionShort: z.string().nullable(),
  label: z.string().nullable(),
  kind: figureKindSchema,
  evidenceClass: evidenceClassSchema,
  composedKey: composedKeySchema.nullable(),
  sizes: z.string().nullable(),
  asset: mediaAssetSchema.nullable(),
});

export function shapePublishingMedia(
  raw: unknown,
  mediaBaseUrl?: string,
): z.input<typeof publishingMediaSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  const alt = asString(entry.alt);
  const kind = parseEnum(entry.kind, FIGURE_KINDS);
  const evidenceClass = parseEnum(entry.evidenceClass, EVIDENCE_CLASSES);
  if (!alt || !kind || !evidenceClass) return null;

  return {
    alt,
    caption: asString(entry.caption),
    captionShort: asString(entry.captionShort),
    label: asString(entry.label),
    kind,
    evidenceClass,
    composedKey: parseEnum(entry.composedKey, COMPOSED_KEYS),
    sizes: asString(entry.sizes),
    asset: shapeMedia(entry.asset, mediaBaseUrl),
  };
}

export const publishingCalloutSchema = z.object({
  variant: calloutVariantSchema,
  title: z.string(),
  body: z.string(),
  bodyCompact: z.string().nullable(),
});

export function shapePublishingCallout(
  raw: unknown,
): z.input<typeof publishingCalloutSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const variant = parseEnum(entry.variant, CALLOUT_VARIANTS);
  const title = asString(entry.title);
  const body = asString(entry.body);
  if (!variant || !title || !body) return null;
  return {
    variant,
    title,
    body,
    bodyCompact: asString(entry.bodyCompact),
  };
}

export const publishingCodeSchema = z.object({
  language: z.string(),
  caption: z.string().nullable(),
  captionCompact: z.string().nullable(),
  code: z.string(),
});

export function shapePublishingCode(
  raw: unknown,
): z.input<typeof publishingCodeSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const language = asString(entry.language);
  const code = asString(entry.code);
  if (!language || !code) return null;
  return {
    language,
    caption: asString(entry.caption),
    captionCompact: asString(entry.captionCompact),
    code,
  };
}

export const publishingTerminalSchema = z.object({
  caption: z.string().nullable(),
  captionCompact: z.string().nullable(),
  lines: z.array(z.string()),
});

export function shapePublishingTerminal(
  raw: unknown,
): z.input<typeof publishingTerminalSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const lines = asStringArray(entry.lines);
  if (lines.length === 0) return null;
  return {
    caption: asString(entry.caption),
    captionCompact: asString(entry.captionCompact),
    lines,
  };
}

export const publishingTableRowSchema = z.object({
  id: z.string(),
  cells: z.array(z.string()),
});

export const publishingTableSchema = z.object({
  caption: z.string().nullable(),
  captionCompact: z.string().nullable(),
  columns: z.array(z.string()),
  rows: z.array(publishingTableRowSchema),
});

function shapePublishingTableRows(raw: unknown): Array<z.input<typeof publishingTableRowSchema>> {
  return asJsonArray(raw)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const id = asString(row.id);
      const cells = asStringArray(row.cells);
      if (!id || cells.length === 0) return null;
      return { id, cells };
    })
    .filter((row): row is z.input<typeof publishingTableRowSchema> => row != null);
}

export function shapePublishingTable(
  raw: unknown,
): z.input<typeof publishingTableSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const columns = asStringArray(entry.columns);
  const rows = shapePublishingTableRows(entry.rows);
  if (columns.length === 0 || rows.length === 0) return null;
  return {
    caption: asString(entry.caption),
    captionCompact: asString(entry.captionCompact),
    columns,
    rows,
  };
}

export const publishingEvidenceSchema = z.object({
  kind: evidenceKindSchema,
  title: z.string(),
  status: z.string(),
  meta: z.array(publishingMetaItemSchema),
  href: z.string().nullable(),
  hrefLabel: z.string().nullable(),
});

export function shapePublishingEvidence(
  raw: unknown,
): z.input<typeof publishingEvidenceSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const kind = parseEnum(entry.kind, EVIDENCE_KINDS);
  const title = asString(entry.title);
  const status = asString(entry.status);
  if (!kind || !title || !status) return null;
  return {
    kind,
    title,
    status,
    meta: shapePublishingMetaItems(entry.meta),
    href: asString(entry.href),
    hrefLabel: asString(entry.hrefLabel),
  };
}

export const publishingSectionSchema = z.object({
  sectionId: z.string(),
  chapter: z.string(),
  title: z.string(),
  paragraphs: z.array(z.string()),
  paragraphsTablet: z.array(z.string()).nullable(),
  bodyMobile: z.string().nullable(),
  figure: publishingMediaSchema.nullable(),
  callout: publishingCalloutSchema.nullable(),
  code: publishingCodeSchema.nullable(),
  terminal: publishingTerminalSchema.nullable(),
  table: publishingTableSchema.nullable(),
  evidence: publishingEvidenceSchema.nullable(),
});

export function shapePublishingSection(
  raw: unknown,
  mediaBaseUrl?: string,
): z.input<typeof publishingSectionSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  const sectionId = asString(entry.sectionId);
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const paragraphs = asStringArray(entry.paragraphs);
  if (!sectionId || !chapter || !title || paragraphs.length === 0) return null;

  const paragraphsTabletRaw = entry.paragraphsTablet;
  const paragraphsTablet =
    paragraphsTabletRaw == null ? null : asStringArray(paragraphsTabletRaw);

  return {
    sectionId,
    chapter,
    title,
    paragraphs,
    paragraphsTablet,
    bodyMobile: asString(entry.bodyMobile),
    figure: shapePublishingMedia(entry.figure, mediaBaseUrl),
    callout: shapePublishingCallout(entry.callout),
    code: shapePublishingCode(entry.code),
    terminal: shapePublishingTerminal(entry.terminal),
    table: shapePublishingTable(entry.table),
    evidence: shapePublishingEvidence(entry.evidence),
  };
}

export function shapePublishingSections(
  raw: unknown,
  mediaBaseUrl?: string,
): Array<z.input<typeof publishingSectionSchema>> {
  return flattenEntries(raw)
    .map((item) => shapePublishingSection(item, mediaBaseUrl))
    .filter((item): item is z.input<typeof publishingSectionSchema> => item != null);
}
