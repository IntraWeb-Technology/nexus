import { z } from "zod";
import {
  asJsonArray,
  asNumber,
  asString,
  asStringArray,
  documentIdOf,
  flattenEntries,
  flattenEntry,
  parseEnum,
  pickRelation,
  type FlatEntry,
} from "./common.js";
import { linkSchema, shapeLink } from "./components.js";
import {
  publishingMediaSchema,
  publishingMetaItemSchema,
  shapePublishingMedia,
  shapePublishingMetaItems,
} from "./publishing.js";

export const projectLayoutSchema = z.enum(["feature", "offset", "band"]);
const PROJECT_LAYOUTS = projectLayoutSchema.options;

export const caseFigureSlotSchema = z.enum([
  "hero",
  "architecture",
  "implementationPrimary",
  "implementationUi",
  "implementationWorkflow",
  "implementationTablet",
  "implementationMobile",
]);
const CASE_FIGURE_SLOTS = caseFigureSlotSchema.options;

export const articleSurfaceSchema = z.enum(["writing", "documentation"]);
export const editorialTypeSchema = z.enum(["essay", "decision", "note"]);
export const docKindSchema = z.enum(["guide", "adr", "playbook", "procedure", "reference"]);

// --- home.* ---

export const homeBridgeSchema = z.object({
  chapter: z.string(),
  title: z.string().nullable(),
  body: z.string().nullable(),
  bodyCompact: z.string().nullable(),
  summary: z.string().nullable(),
  cta: linkSchema.nullable(),
  ctaLabel: z.string().nullable(),
  href: z.string().nullable(),
  meta: z.string().nullable(),
  workLink: linkSchema.nullable(),
});

export function shapeHomeBridge(raw: unknown): z.input<typeof homeBridgeSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  if (!chapter) return null;
  return {
    chapter,
    title: asString(entry.title),
    body: asString(entry.body),
    bodyCompact: asString(entry.bodyCompact),
    summary: asString(entry.summary),
    cta: shapeLink(entry.cta),
    ctaLabel: asString(entry.ctaLabel),
    href: asString(entry.href),
    meta: asString(entry.meta),
    workLink: shapeLink(entry.workLink),
  };
}

export const homeHeroSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  deck: z.string(),
  primaryCta: linkSchema,
  secondaryCta: linkSchema,
  media: publishingMediaSchema.nullable(),
  mediaNote: z.string().nullable(),
});

export function shapeHomeHero(
  raw: unknown,
  mediaBaseUrl?: string,
): z.input<typeof homeHeroSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const deck = asString(entry.deck);
  const primaryCta = shapeLink(entry.primaryCta);
  const secondaryCta = shapeLink(entry.secondaryCta);
  if (!chapter || !title || !deck || !primaryCta || !secondaryCta) return null;
  return {
    chapter,
    title,
    deck,
    primaryCta,
    secondaryCta,
    media: shapePublishingMedia(entry.media, mediaBaseUrl),
    mediaNote: asString(entry.mediaNote),
  };
}

export const homeFeaturedSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  meta: z.string().nullable(),
  status: z.string().nullable(),
  problemLabel: z.string(),
  problem: z.string(),
  outcomeLabel: z.string(),
  outcome: z.string(),
  highlightsLabel: z.string().nullable(),
  highlights: z.array(z.string()).nullable(),
  cta: linkSchema,
  figure: publishingMediaSchema.nullable(),
});

export function shapeHomeFeatured(
  raw: unknown,
  mediaBaseUrl?: string,
): z.input<typeof homeFeaturedSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const problemLabel = asString(entry.problemLabel);
  const problem = asString(entry.problem);
  const outcomeLabel = asString(entry.outcomeLabel);
  const outcome = asString(entry.outcome);
  const cta = shapeLink(entry.cta);
  if (!chapter || !title || !problemLabel || !problem || !outcomeLabel || !outcome || !cta) {
    return null;
  }
  const highlightsRaw = entry.highlights;
  return {
    chapter,
    title,
    meta: asString(entry.meta),
    status: asString(entry.status),
    problemLabel,
    problem,
    outcomeLabel,
    outcome,
    highlightsLabel: asString(entry.highlightsLabel),
    highlights: highlightsRaw == null ? null : asStringArray(highlightsRaw),
    cta,
    figure: shapePublishingMedia(entry.figure, mediaBaseUrl),
  };
}

export const projectCardRefSchema = z.object({
  documentId: z.string(),
  name: z.string(),
  slug: z.string(),
  cardMedia: publishingMediaSchema.nullable(),
});

export function shapeProjectCardRef(
  raw: unknown,
  mediaBaseUrl?: string,
): z.input<typeof projectCardRefSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const name = asString(entry.name);
  const slug = asString(entry.slug);
  if (!name || !slug) return null;
  return {
    documentId: documentIdOf(entry),
    name,
    slug,
    cardMedia: shapePublishingMedia(entry.cardMedia, mediaBaseUrl),
  };
}

export const homeSelectedItemSchema = z.object({
  project: projectCardRefSchema,
  layout: projectLayoutSchema,
  eyebrow: z.string().nullable(),
  outcome: z.string(),
  ctaLabel: z.string().nullable(),
});

export function shapeHomeSelectedItem(
  raw: unknown,
  mediaBaseUrl?: string,
): z.input<typeof homeSelectedItemSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const layout = parseEnum(entry.layout, PROJECT_LAYOUTS);
  const outcome = asString(entry.outcome);
  const project = shapeProjectCardRef(pickRelation(entry, "project"), mediaBaseUrl);
  if (!layout || !outcome || !project) return null;
  return {
    project,
    layout,
    eyebrow: asString(entry.eyebrow),
    outcome,
    ctaLabel: asString(entry.ctaLabel),
  };
}

export const homePhilosophySchema = z.object({
  chapter: z.string(),
  quote: z.string(),
  diagramCaption: z.string().nullable(),
  stages: z.array(z.string()),
  principles: z.array(z.object({ title: z.string(), body: z.string() })),
});

function shapePrinciples(raw: unknown): Array<{ title: string; body: string }> {
  return asJsonArray(raw)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const title = asString(obj.title);
      const body = asString(obj.body);
      if (!title || !body) return null;
      return { title, body };
    })
    .filter((item): item is { title: string; body: string } => item != null);
}

export function shapeHomePhilosophy(
  raw: unknown,
): z.input<typeof homePhilosophySchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const quote = asString(entry.quote);
  const stages = asStringArray(entry.stages);
  const principles = shapePrinciples(entry.principles);
  if (!chapter || !quote || stages.length === 0 || principles.length === 0) return null;
  return {
    chapter,
    quote,
    diagramCaption: asString(entry.diagramCaption),
    stages,
    principles,
  };
}

export const articleRefSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  slug: z.string(),
});

export function shapeArticleRef(raw: unknown): z.input<typeof articleRefSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const title = asString(entry.title);
  const slug = asString(entry.slug);
  if (!title || !slug) return null;
  return {
    documentId: documentIdOf(entry),
    title,
    slug,
  };
}

export const homeWritingItemSchema = z.object({
  article: articleRefSchema,
  note: z.string(),
});

export function shapeHomeWritingItem(raw: unknown): z.input<typeof homeWritingItemSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const note = asString(entry.note);
  const article = shapeArticleRef(pickRelation(entry, "article"));
  if (!note || !article) return null;
  return { article, note };
}

// --- about.* ---

export const aboutOpeningSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  deck: z.string(),
  deckCondensed: z.string().nullable(),
  meta: z.string().nullable(),
  metaCondensed: z.string().nullable(),
  marginNoteLabel: z.string().nullable(),
  marginNoteBody: z.string().nullable(),
});

export function shapeAboutOpening(raw: unknown): z.input<typeof aboutOpeningSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const deck = asString(entry.deck);
  if (!chapter || !title || !deck) return null;
  return {
    chapter,
    title,
    deck,
    deckCondensed: asString(entry.deckCondensed),
    meta: asString(entry.meta),
    metaCondensed: asString(entry.metaCondensed),
    marginNoteLabel: asString(entry.marginNoteLabel),
    marginNoteBody: asString(entry.marginNoteBody),
  };
}

export const aboutPhilosophySchema = z.object({
  chapter: z.string(),
  quote: z.string(),
  quoteCondensed: z.string().nullable(),
  attribution: z.string().nullable(),
  body: z.string(),
});

export function shapeAboutPhilosophy(
  raw: unknown,
): z.input<typeof aboutPhilosophySchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const quote = asString(entry.quote);
  const body = asString(entry.body);
  if (!chapter || !quote || !body) return null;
  return {
    chapter,
    quote,
    quoteCondensed: asString(entry.quoteCondensed),
    attribution: asString(entry.attribution),
    body,
  };
}

export const aboutApproachSchema = z.object({
  chapter: z.string(),
  chapterCondensed: z.string().nullable(),
  title: z.string(),
  body: z.string(),
  bodyCondensed: z.string().nullable(),
  stages: z.array(z.object({ id: z.string(), label: z.string() })),
  figureCaption: z.string().nullable(),
  figure: publishingMediaSchema.nullable(),
});

function shapeStages(raw: unknown): Array<{ id: string; label: string }> {
  return asJsonArray(raw)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const id = asString(obj.id);
      const label = asString(obj.label);
      if (!id || !label) return null;
      return { id, label };
    })
    .filter((item): item is { id: string; label: string } => item != null);
}

export function shapeAboutApproach(
  raw: unknown,
  mediaBaseUrl?: string,
): z.input<typeof aboutApproachSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const body = asString(entry.body);
  const stages = shapeStages(entry.stages);
  if (!chapter || !title || !body || stages.length === 0) return null;
  return {
    chapter,
    chapterCondensed: asString(entry.chapterCondensed),
    title,
    body,
    bodyCondensed: asString(entry.bodyCondensed),
    stages,
    figureCaption: asString(entry.figureCaption),
    figure: shapePublishingMedia(entry.figure, mediaBaseUrl),
  };
}

export const aboutStyleSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  items: z.array(z.object({ title: z.string(), body: z.string() })),
});

export function shapeAboutStyle(raw: unknown): z.input<typeof aboutStyleSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const items = shapePrinciples(entry.items);
  if (!chapter || !title || items.length === 0) return null;
  return { chapter, title, items };
}

export const aboutPrinciplesSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  items: z.array(z.object({ id: z.string(), title: z.string(), body: z.string() })),
});

function shapePrincipleItems(
  raw: unknown,
): Array<{ id: string; title: string; body: string }> {
  return asJsonArray(raw)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const id = asString(obj.id);
      const title = asString(obj.title);
      const body = asString(obj.body);
      if (!id || !title || !body) return null;
      return { id, title, body };
    })
    .filter((item): item is { id: string; title: string; body: string } => item != null);
}

export function shapeAboutPrinciples(
  raw: unknown,
): z.input<typeof aboutPrinciplesSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const items = shapePrincipleItems(entry.items);
  if (!chapter || !title || items.length === 0) return null;
  return { chapter, title, items };
}

export const aboutTimelineSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  entries: z.array(
    z.object({ period: z.string(), title: z.string(), note: z.string() }),
  ),
});

function shapeTimelineEntries(
  raw: unknown,
): Array<{ period: string; title: string; note: string }> {
  return asJsonArray(raw)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const period = asString(obj.period);
      const title = asString(obj.title);
      const note = asString(obj.note);
      if (!period || !title || !note) return null;
      return { period, title, note };
    })
    .filter(
      (item): item is { period: string; title: string; note: string } => item != null,
    );
}

export function shapeAboutTimeline(raw: unknown): z.input<typeof aboutTimelineSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const entries = shapeTimelineEntries(entry.entries);
  if (!chapter || !title || entries.length === 0) return null;
  return { chapter, title, entries };
}

export const aboutFocusSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  body: z.string(),
  bodyCondensed: z.string().nullable(),
  statusLabel: z.string().nullable(),
  status: z.string().nullable(),
  themesLabel: z.string().nullable(),
  themes: z.string().nullable(),
});

export function shapeAboutFocus(raw: unknown): z.input<typeof aboutFocusSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const body = asString(entry.body);
  if (!chapter || !title || !body) return null;
  return {
    chapter,
    title,
    body,
    bodyCondensed: asString(entry.bodyCondensed),
    statusLabel: asString(entry.statusLabel),
    status: asString(entry.status),
    themesLabel: asString(entry.themesLabel),
    themes: asString(entry.themes),
  };
}

export const aboutReadingSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  items: z.array(z.object({ label: z.string(), body: z.string() })),
});

function shapeReadingItems(raw: unknown): Array<{ label: string; body: string }> {
  return asJsonArray(raw)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const label = asString(obj.label);
      const body = asString(obj.body);
      if (!label || !body) return null;
      return { label, body };
    })
    .filter((item): item is { label: string; body: string } => item != null);
}

export function shapeAboutReading(raw: unknown): z.input<typeof aboutReadingSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const items = shapeReadingItems(entry.items);
  if (!chapter || !title || items.length === 0) return null;
  return { chapter, title, items };
}

export const aboutArchitectureSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  body: z.string(),
  layers: z.array(z.object({ name: z.string(), note: z.string() })),
  figureCaption: z.string().nullable(),
  figure: publishingMediaSchema.nullable(),
});

function shapeLayers(raw: unknown): Array<{ name: string; note: string }> {
  return asJsonArray(raw)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const name = asString(obj.name);
      const note = asString(obj.note);
      if (!name || !note) return null;
      return { name, note };
    })
    .filter((item): item is { name: string; note: string } => item != null);
}

export function shapeAboutArchitecture(
  raw: unknown,
  mediaBaseUrl?: string,
): z.input<typeof aboutArchitectureSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const body = asString(entry.body);
  const layers = shapeLayers(entry.layers);
  if (!chapter || !title || !body || layers.length === 0) return null;
  return {
    chapter,
    title,
    body,
    layers,
    figureCaption: asString(entry.figureCaption),
    figure: shapePublishingMedia(entry.figure, mediaBaseUrl),
  };
}

export const aboutNotesSchema = z.object({
  chapter: z.string(),
  pullQuote: z.string(),
  body: z.string(),
  bodyCondensed: z.string().nullable(),
});

export function shapeAboutNotes(raw: unknown): z.input<typeof aboutNotesSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const pullQuote = asString(entry.pullQuote);
  const body = asString(entry.body);
  if (!chapter || !pullQuote || !body) return null;
  return {
    chapter,
    pullQuote,
    body,
    bodyCondensed: asString(entry.bodyCondensed),
  };
}

// --- work.* ---

export const workIntroSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  deck: z.string(),
  deckMobile: z.string().nullable(),
  meta: z.array(publishingMetaItemSchema),
  editorialNoteLabel: z.string().nullable(),
  editorialNoteBody: z.string().nullable(),
});

export function shapeWorkIntro(raw: unknown): z.input<typeof workIntroSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const deck = asString(entry.deck);
  if (!chapter || !title || !deck) return null;
  return {
    chapter,
    title,
    deck,
    deckMobile: asString(entry.deckMobile),
    meta: shapePublishingMetaItems(entry.meta),
    editorialNoteLabel: asString(entry.editorialNoteLabel),
    editorialNoteBody: asString(entry.editorialNoteBody),
  };
}

export const workFeaturedCopySchema = z.object({
  chapter: z.string(),
  flagshipLabel: z.string().nullable(),
  title: z.string().nullable(),
  summary: z.string().nullable(),
  summaryMobile: z.string().nullable(),
  status: z.string().nullable(),
  timeframe: z.string().nullable(),
  role: z.string().nullable(),
  figure: publishingMediaSchema.nullable(),
  figureCompact: publishingMediaSchema.nullable(),
  themesLabel: z.string().nullable(),
  themes: z.array(z.string()).nullable(),
  themesCompact: z.string().nullable(),
  cta: linkSchema.nullable(),
  ctaNote: z.string().nullable(),
});

export function shapeWorkFeaturedCopy(
  raw: unknown,
  mediaBaseUrl?: string,
): z.input<typeof workFeaturedCopySchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  if (!chapter) return null;
  const themesRaw = entry.themes;
  return {
    chapter,
    flagshipLabel: asString(entry.flagshipLabel),
    title: asString(entry.title),
    summary: asString(entry.summary),
    summaryMobile: asString(entry.summaryMobile),
    status: asString(entry.status),
    timeframe: asString(entry.timeframe),
    role: asString(entry.role),
    figure: shapePublishingMedia(entry.figure, mediaBaseUrl),
    figureCompact: shapePublishingMedia(entry.figureCompact, mediaBaseUrl),
    themesLabel: asString(entry.themesLabel),
    themes: themesRaw == null ? null : asStringArray(themesRaw),
    themesCompact: asString(entry.themesCompact),
    cta: shapeLink(entry.cta),
    ctaNote: asString(entry.ctaNote),
  };
}

export const workTaxonomySchema = z.object({
  chapter: z.string(),
  title: z.string(),
  deck: z.string(),
  groups: z.unknown().nullable(),
});

export function shapeWorkTaxonomy(raw: unknown): z.input<typeof workTaxonomySchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const deck = asString(entry.deck);
  if (!chapter || !title || !deck) return null;
  return {
    chapter,
    title,
    deck,
    groups: entry.groups ?? null,
  };
}

// --- case.* ---

export const caseOverviewColumnSchema = z.object({
  id: z.string(),
  label: z.string(),
  body: z.string(),
});

function shapeOverviewColumns(raw: unknown): Array<z.input<typeof caseOverviewColumnSchema>> {
  return asJsonArray(raw)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const id = asString(obj.id);
      const label = asString(obj.label);
      const body = asString(obj.body);
      if (!id || !label || !body) return null;
      return { id, label, body };
    })
    .filter((item): item is z.input<typeof caseOverviewColumnSchema> => item != null);
}

export const caseOverviewSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  titleMobile: z.string().nullable(),
  columns: z.array(caseOverviewColumnSchema),
  bodyTablet: z.array(z.string()).nullable(),
  bodyMobile: z.string().nullable(),
});

export function shapeCaseOverview(raw: unknown): z.input<typeof caseOverviewSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const columns = shapeOverviewColumns(entry.columns);
  if (!chapter || !title || columns.length === 0) return null;
  const bodyTabletRaw = entry.bodyTablet;
  return {
    chapter,
    title,
    titleMobile: asString(entry.titleMobile),
    columns,
    bodyTablet: bodyTabletRaw == null ? null : asStringArray(bodyTabletRaw),
    bodyMobile: asString(entry.bodyMobile),
  };
}

export const caseProseSectionSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  titleMobile: z.string().nullable(),
  paragraphs: z.array(z.string()),
  paragraphsTablet: z.array(z.string()).nullable(),
  bodyMobile: z.string().nullable(),
  intro: z.string().nullable(),
});

export function shapeCaseProseSection(
  raw: unknown,
): z.input<typeof caseProseSectionSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const paragraphs = asStringArray(entry.paragraphs);
  if (!chapter || !title || paragraphs.length === 0) return null;
  const paragraphsTabletRaw = entry.paragraphsTablet;
  return {
    chapter,
    title,
    titleMobile: asString(entry.titleMobile),
    paragraphs,
    paragraphsTablet:
      paragraphsTabletRaw == null ? null : asStringArray(paragraphsTabletRaw),
    bodyMobile: asString(entry.bodyMobile),
    intro: asString(entry.intro),
  };
}

export const caseRowItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  body: z.string(),
});

function shapeCaseRows(raw: unknown): Array<z.input<typeof caseRowItemSchema>> {
  return asJsonArray(raw)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const id = asString(obj.id);
      const label = asString(obj.label);
      const body = asString(obj.body);
      if (!id || !label || !body) return null;
      return { id, label, body };
    })
    .filter((item): item is z.input<typeof caseRowItemSchema> => item != null);
}

export const caseRowSectionSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  titleMobile: z.string().nullable(),
  rows: z.array(caseRowItemSchema),
  summaryTablet: z.string().nullable(),
  summaryMobile: z.string().nullable(),
});

export function shapeCaseRowSection(
  raw: unknown,
): z.input<typeof caseRowSectionSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const rows = shapeCaseRows(entry.rows);
  if (!chapter || !title || rows.length === 0) return null;
  return {
    chapter,
    title,
    titleMobile: asString(entry.titleMobile),
    rows,
    summaryTablet: asString(entry.summaryTablet),
    summaryMobile: asString(entry.summaryMobile),
  };
}

export const caseArchitectureSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  intro: z.string(),
  requestPath: z.unknown(),
  deliveryPath: z.unknown(),
  tabletRequest: z.unknown().nullable(),
  tabletDelivery: z.unknown().nullable(),
  mobileNodes: z.unknown().nullable(),
  legend: z.array(z.string()).nullable(),
});

export function shapeCaseArchitecture(
  raw: unknown,
): z.input<typeof caseArchitectureSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const intro = asString(entry.intro);
  if (!chapter || !title || !intro) return null;
  if (entry.requestPath == null || entry.deliveryPath == null) return null;
  const legendRaw = entry.legend;
  return {
    chapter,
    title,
    intro,
    requestPath: entry.requestPath,
    deliveryPath: entry.deliveryPath,
    tabletRequest: entry.tabletRequest ?? null,
    tabletDelivery: entry.tabletDelivery ?? null,
    mobileNodes: entry.mobileNodes ?? null,
    legend: legendRaw == null ? null : asStringArray(legendRaw),
  };
}

export const caseDecisionSchema = z.object({
  decisionId: z.string(),
  statement: z.string(),
  statementTablet: z.string().nullable(),
  statementMobile: z.string().nullable(),
  context: z.string(),
  choice: z.string(),
  tradeoff: z.string(),
  consequence: z.string(),
});

export function shapeCaseDecision(raw: unknown): z.input<typeof caseDecisionSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const decisionId = asString(entry.decisionId);
  const statement = asString(entry.statement);
  const context = asString(entry.context);
  const choice = asString(entry.choice);
  const tradeoff = asString(entry.tradeoff);
  const consequence = asString(entry.consequence);
  if (!decisionId || !statement || !context || !choice || !tradeoff || !consequence) {
    return null;
  }
  return {
    decisionId,
    statement,
    statementTablet: asString(entry.statementTablet),
    statementMobile: asString(entry.statementMobile),
    context,
    choice,
    tradeoff,
    consequence,
  };
}

export const caseOutcomeItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
});

function shapeOutcomeItems(raw: unknown): Array<z.input<typeof caseOutcomeItemSchema>> {
  return asJsonArray(raw)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const id = asString(obj.id);
      const title = asString(obj.title);
      const body = asString(obj.body);
      if (!id || !title || !body) return null;
      return { id, title, body };
    })
    .filter((item): item is z.input<typeof caseOutcomeItemSchema> => item != null);
}

export const caseOutcomesSchema = z.object({
  chapter: z.string(),
  title: z.string(),
  titleMobile: z.string().nullable(),
  intro: z.string(),
  items: z.array(caseOutcomeItemSchema),
  note: z.string().nullable(),
  summaryTablet: z.string().nullable(),
  summaryMobile: z.string().nullable(),
});

export function shapeCaseOutcomes(raw: unknown): z.input<typeof caseOutcomesSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const intro = asString(entry.intro);
  const items = shapeOutcomeItems(entry.items);
  if (!chapter || !title || !intro || items.length === 0) return null;
  return {
    chapter,
    title,
    titleMobile: asString(entry.titleMobile),
    intro,
    items,
    note: asString(entry.note),
    summaryTablet: asString(entry.summaryTablet),
    summaryMobile: asString(entry.summaryMobile),
  };
}

export const caseFigureSlotItemSchema = z.object({
  slot: caseFigureSlotSchema,
  media: publishingMediaSchema,
});

export function shapeCaseFigureSlot(
  raw: unknown,
  mediaBaseUrl?: string,
): z.input<typeof caseFigureSlotItemSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const slot = parseEnum(entry.slot, CASE_FIGURE_SLOTS);
  const media = shapePublishingMedia(entry.media, mediaBaseUrl);
  if (!slot || !media) return null;
  return { slot, media };
}

export const caseTocItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string(),
});

export function shapeCaseToc(raw: unknown): Array<z.input<typeof caseTocItemSchema>> {
  return asJsonArray(raw)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const id = asString(obj.id);
      const label = asString(obj.label);
      const href = asString(obj.href);
      if (!id || !label || !href) return null;
      return { id, label, href };
    })
    .filter((item): item is z.input<typeof caseTocItemSchema> => item != null);
}

export function shapeProjectRefFromEntry(entry: FlatEntry): {
  documentId: string;
  name: string;
  slug: string;
} {
  return {
    documentId: documentIdOf(entry),
    name: asString(entry.name) as string,
    slug: asString(entry.slug) as string,
  };
}

export function shapeNullableComponent<T>(
  raw: unknown,
  shaper: (value: unknown) => T | null,
): T | null {
  return shaper(raw);
}

export function shapeComponentList<T>(
  raw: unknown,
  shaper: (value: unknown) => T | null,
): T[] {
  return flattenEntries(raw)
    .map((item) => shaper(item))
    .filter((item): item is T => item != null);
}

export function shapeSortOrder(value: unknown): number | null {
  return asNumber(value);
}
