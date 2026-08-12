import { z } from "zod";
import {
  asBoolean,
  asNumber,
  asString,
  asStringArray,
  documentIdOf,
  flattenEntries,
  flattenEntry,
  parseEnum,
  pickRelation,
  pickRelationList,
  type FlatEntry,
} from "../schemas/common.js";
import {
  shapeHomeBridge,
  shapeCaseArchitecture,
  shapeCaseDecision,
  shapeCaseFigureSlot,
  shapeCaseOutcomes,
  shapeCaseOverview,
  shapeCaseProseSection,
  shapeCaseRowSection,
  shapeCaseToc,
} from "../schemas/atlas.js";
import {
  shapeContactInformation,
  shapeFeatures,
  shapeLink,
  shapeNavigationItem,
  shapeSeo,
  shapeSocialLinks,
  shapeStatItem,
  siteKeyFromToOne,
  siteKeysFromToMany,
} from "../schemas/components.js";
import { shapeMedia, shapeMediaList } from "../schemas/media.js";
import {
  editorialTypeSchema,
  articleSurfaceSchema,
  docKindSchema,
  projectLayoutSchema,
} from "../schemas/atlas.js";
import {
  shapePublishingMedia,
  shapePublishingMetaItems,
  shapePublishingSections,
} from "../schemas/publishing.js";
import type {
  articleSchema,
  authorSchema,
  caseStudySchema,
  categorySchema,
  faqItemSchema,
  navigationSchema,
  pageBlockSchema,
  pageSchema,
  projectRefSchema,
  projectSchema,
  redirectSchema,
  serviceSchema,
  siteSettingsSchema,
  tagSchema,
  technologySchema,
  testimonialSchema,
} from "../schemas/domain.js";
import type { PaginationMeta, SiteKey } from "../types.js";

export type NormalizeContext = {
  mediaBaseUrl?: string;
};

export function shapePagination(meta: unknown): PaginationMeta | null {
  if (!meta || typeof meta !== "object") return null;
  const pagination = (meta as { pagination?: Record<string, unknown> }).pagination;
  if (!pagination) return null;
  const page = asNumber(pagination.page);
  const pageSize = asNumber(pagination.pageSize);
  const pageCount = asNumber(pagination.pageCount);
  const total = asNumber(pagination.total);
  if (page == null || pageSize == null || pageCount == null || total == null) {
    return null;
  }
  return { page, pageSize, pageCount, total };
}

function normalizeProjectStatus(
  value: unknown,
): "planned" | "in-progress" | "completed" | "archived" | null {
  const raw = asString(value);
  if (!raw) return null;
  if (raw === "active") return "in-progress";
  if (
    raw === "planned" ||
    raw === "in-progress" ||
    raw === "completed" ||
    raw === "archived"
  ) {
    return raw;
  }
  return null;
}

function normalizeRedirectStatusCode(
  value: unknown,
): 301 | 302 | 307 | 308 {
  if (typeof value === "number") {
    if (value === 301 || value === 302 || value === 307 || value === 308) {
      return value;
    }
  }
  const raw = asString(value);
  if (!raw) return 301;
  const map: Record<string, 301 | 302 | 307 | 308> = {
    http_301: 301,
    http_302: 302,
    http_307: 307,
    http_308: 308,
    "301": 301,
    "302": 302,
    "307": 307,
    "308": 308,
  };
  return map[raw] ?? 301;
}

export function shapeAuthor(
  raw: unknown,
  ctx: NormalizeContext,
): z.input<typeof authorSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const name = asString(entry.name);
  if (!name) return null;
  return {
    documentId: documentIdOf(entry),
    name,
    slug: asString(entry.slug),
    biography: asString(entry.biography),
    avatar: shapeMedia(entry.avatar, ctx.mediaBaseUrl),
    socialLinks: shapeSocialLinks(entry.socialLinks),
  };
}

export function shapeCategory(raw: unknown): z.input<typeof categorySchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const name = asString(entry.name);
  const slug = asString(entry.slug);
  if (!name || !slug) return null;
  return {
    documentId: documentIdOf(entry),
    name,
    slug,
    description: asString(entry.description),
  };
}

export function shapeTag(raw: unknown): z.input<typeof tagSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const name = asString(entry.name);
  const slug = asString(entry.slug);
  if (!name || !slug) return null;
  return {
    documentId: documentIdOf(entry),
    name,
    slug,
    description: asString(entry.description),
  };
}

export function shapeTechnology(
  raw: unknown,
  ctx: NormalizeContext,
): z.input<typeof technologySchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const name = asString(entry.name);
  const slug = asString(entry.slug);
  if (!name || !slug) return null;
  return {
    documentId: documentIdOf(entry),
    name,
    slug,
    description: asString(entry.description),
    category: asString(entry.category),
    logo: shapeMedia(entry.logo, ctx.mediaBaseUrl),
    websiteUrl: asString(entry.websiteUrl),
    featured: asBoolean(entry.featured),
  };
}

export function shapeSiteSettings(
  raw: unknown,
  preferredSiteKey: SiteKey,
  ctx: NormalizeContext = {},
): z.input<typeof siteSettingsSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  return {
    documentId: documentIdOf(entry),
    siteKey: siteKeyFromToOne(entry, "site") ?? preferredSiteKey,
    siteName: asString(entry.siteName) as string,
    siteDescription: asString(entry.siteDescription),
    logo: shapeMedia(entry.logo, ctx.mediaBaseUrl),
    favicon: shapeMedia(entry.favicon, ctx.mediaBaseUrl),
    defaultSeo: shapeSeo(entry.defaultSeo, ctx.mediaBaseUrl),
    socialLinks: shapeSocialLinks(entry.socialLinks),
    contact: shapeContactInformation(entry.contactInformation ?? entry.contact),
  };
}

export function shapeNavigation(
  raw: unknown,
  preferredSiteKey: SiteKey,
): z.input<typeof navigationSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const items = flattenEntries(entry.items)
    .map((item) => shapeNavigationItem(item))
    .filter((item): item is NonNullable<typeof item> => item != null);
  return {
    documentId: documentIdOf(entry),
    siteKey: siteKeyFromToOne(entry, "site") ?? preferredSiteKey,
    location: asString(entry.location) as "header" | "footer" | "mobile" | "sidebar",
    name: asString(entry.name),
    items,
  };
}

function shapeFaqItemForBlock(
  raw: unknown,
  preferredSiteKey?: SiteKey,
): z.input<typeof faqItemSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  const siteKeys = siteKeysFromToMany(entry, "sites");
  return {
    documentId: documentIdOf(entry),
    siteKeys: siteKeys.length > 0 ? siteKeys : preferredSiteKey ? [preferredSiteKey] : [],
    question: asString(entry.question) as string,
    answer: asString(entry.answer) as string,
    sortOrder: asNumber(entry.sortOrder),
    featured: asBoolean(entry.featured),
  };
}

function shapePageBlock(
  raw: unknown,
  ctx: NormalizeContext,
  preferredSiteKey?: SiteKey,
): z.input<typeof pageBlockSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  const component = asString(entry.__component);
  const id = documentIdOf(entry);

  switch (component) {
    case "blocks.hero":
      return {
        type: "hero",
        id,
        headline: asString(entry.headline) as string,
        subheadline: asString(entry.subheadline),
        media: shapeMedia(entry.media, ctx.mediaBaseUrl),
        primaryCta: shapeLink(entry.primaryCta),
        secondaryCta: shapeLink(entry.secondaryCta),
      };
    case "blocks.rich-text":
      return {
        type: "rich-text",
        id,
        body: asString(entry.body) as string,
      };
    case "blocks.cta":
      return {
        type: "cta",
        id,
        headline: asString(entry.headline) as string,
        body: asString(entry.body),
        button: shapeLink(entry.button),
      };
    case "blocks.faq-section": {
      const items = pickRelationList(entry, "items")
        .map((item) => shapeFaqItemForBlock(item, preferredSiteKey))
        .filter((item): item is NonNullable<typeof item> => item != null);
      return {
        type: "faq-section",
        id,
        title: asString(entry.title),
        items,
      };
    }
    case "blocks.media":
      return {
        type: "media",
        id,
        media: shapeMedia(entry.media, ctx.mediaBaseUrl),
        alt: asString(entry.alt),
        caption: asString(entry.caption),
      };
    case "blocks.stats": {
      const items = flattenEntries(entry.items)
        .map((item) => shapeStatItem(item))
        .filter((item): item is NonNullable<typeof item> => item != null);
      return { type: "stats", id, items };
    }
    default:
      console.warn(`[strapi-client] Skipping unknown page block: ${component ?? "unknown"}`);
      return null;
  }
}

export function shapePage(
  raw: unknown,
  preferredSiteKey: SiteKey,
  ctx: NormalizeContext = {},
): z.input<typeof pageSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  const sections = flattenEntries(entry.sections)
    .map((block) => shapePageBlock(block, ctx, preferredSiteKey))
    .filter((block): block is NonNullable<typeof block> => block != null);

  return {
    documentId: documentIdOf(entry),
    siteKey: siteKeyFromToOne(entry, "site") ?? preferredSiteKey,
    title: asString(entry.title) as string,
    slug: asString(entry.slug) as string,
    pageType: asString(entry.pageType),
    sections,
    seo: shapeSeo(entry.seo, ctx.mediaBaseUrl),
    publishedAt: asString(entry.publishedAt),
  };
}

export function shapeArticle(
  raw: unknown,
  preferredSiteKey: SiteKey | undefined,
  ctx: NormalizeContext = {},
): z.input<typeof articleSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  const title = asString(entry.title);
  const slug = asString(entry.slug);
  if (!title || !slug) return null;

  const siteKeys = siteKeysFromToMany(entry, "sites");
  if (siteKeys.length === 0 && preferredSiteKey) siteKeys.push(preferredSiteKey);

  return {
    documentId: documentIdOf(entry),
    siteKeys,
    title,
    slug,
    excerpt: asString(entry.excerpt),
    body: asString(entry.body),
    contentFormat: asString(entry.contentFormat) as
      | "markdown"
      | "mdx"
      | "blocks"
      | "html"
      | null,
    featuredImage: shapeMedia(entry.featuredImage, ctx.mediaBaseUrl),
    author: shapeAuthor(entry.author, ctx),
    categories: pickRelationList(entry, "categories")
      .map((item) => shapeCategory(item))
      .filter((item): item is NonNullable<typeof item> => item != null),
    tags: pickRelationList(entry, "tags")
      .map((item) => shapeTag(item))
      .filter((item): item is NonNullable<typeof item> => item != null),
    seo: shapeSeo(entry.seo, ctx.mediaBaseUrl),
    publishedDate: asString(entry.publishedDate),
    updatedDate: asString(entry.updatedDate),
    featured: asBoolean(entry.featured),
    canonicalUrl: asString(entry.canonicalUrl),
    hashnodeId: asString(entry.hashnodeId),
    surface: parseEnum(entry.surface, articleSurfaceSchema.options) ?? "writing",
    editorialType: parseEnum(entry.editorialType, editorialTypeSchema.options),
    docKind: parseEnum(entry.docKind, docKindSchema.options),
    readingTime: asString(entry.readingTime),
    dek: asString(entry.dek),
    dekCompact: asString(entry.dekCompact),
    headerChapter: asString(entry.headerChapter),
    headerMeta: shapePublishingMetaItems(entry.headerMeta),
    sections: shapePublishingSections(entry.sections, ctx.mediaBaseUrl),
    contactBridge: shapeHomeBridge(entry.contactBridge),
  };
}

function shapeProjectRef(raw: unknown): z.input<typeof projectRefSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;
  return {
    documentId: documentIdOf(entry),
    name: asString(entry.name) as string,
    slug: asString(entry.slug) as string,
  };
}

export function shapeProject(
  raw: unknown,
  preferredSiteKey: SiteKey | undefined,
  ctx: NormalizeContext = {},
): z.input<typeof projectSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  const siteKeys = siteKeysFromToMany(entry, "sites");
  if (siteKeys.length === 0 && preferredSiteKey) siteKeys.push(preferredSiteKey);

  return {
    documentId: documentIdOf(entry),
    siteKeys,
    name: asString(entry.name) as string,
    slug: asString(entry.slug) as string,
    summary: asString(entry.summary),
    description: asString(entry.description),
    projectType: asString(entry.projectType),
    technologies: pickRelationList(entry, "technologies")
      .map((item) => shapeTechnology(item, ctx))
      .filter((item): item is NonNullable<typeof item> => item != null),
    featuredImage: shapeMedia(entry.featuredImage, ctx.mediaBaseUrl),
    gallery: shapeMediaList(entry.gallery, ctx.mediaBaseUrl),
    repositoryUrl: asString(entry.repositoryUrl),
    liveUrl: asString(entry.liveUrl),
    documentationUrl: asString(entry.documentationUrl),
    status: normalizeProjectStatus(entry.projectStatus ?? entry.status),
    startDate: asString(entry.startDate),
    endDate: asString(entry.endDate),
    featured: asBoolean(entry.featured),
    seo: shapeSeo(entry.seo, ctx.mediaBaseUrl),
    publishedAt: asString(entry.publishedAt),
    category: asString(entry.category),
    themes: entry.themes == null ? null : asStringArray(entry.themes),
    statusLabel: asString(entry.statusLabel),
    layout: parseEnum(entry.layout, projectLayoutSchema.options),
    sortOrder: asNumber(entry.sortOrder),
    summaryTablet: asString(entry.summaryTablet),
    summaryMobile: asString(entry.summaryMobile),
    ctaLabel: asString(entry.ctaLabel),
    cardMedia: shapePublishingMedia(entry.cardMedia, ctx.mediaBaseUrl),
  };
}

export function shapeCaseStudy(
  raw: unknown,
  preferredSiteKey: SiteKey | undefined,
  ctx: NormalizeContext = {},
): z.input<typeof caseStudySchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  const siteKeys = siteKeysFromToMany(entry, "sites");
  if (siteKeys.length === 0 && preferredSiteKey) siteKeys.push(preferredSiteKey);

  const tocRaw = entry.toc;
  const toc = tocRaw == null ? null : shapeCaseToc(tocRaw);

  const decisions = flattenEntries(entry.decisions)
    .map((item) => shapeCaseDecision(item))
    .filter((item): item is NonNullable<typeof item> => item != null);

  const figureSlots = flattenEntries(entry.figureSlots)
    .map((item) => shapeCaseFigureSlot(item, ctx.mediaBaseUrl))
    .filter((item): item is NonNullable<typeof item> => item != null);

  return {
    documentId: documentIdOf(entry),
    siteKeys,
    title: asString(entry.title) as string,
    slug: asString(entry.slug) as string,
    clientName: asString(entry.clientName),
    summary: asString(entry.summary),
    challenge: asString(entry.challenge),
    solution: asString(entry.solution),
    results: asString(entry.results),
    technologies: pickRelationList(entry, "technologies")
      .map((item) => shapeTechnology(item, ctx))
      .filter((item): item is NonNullable<typeof item> => item != null),
    relatedProject: shapeProjectRef(pickRelation(entry, "relatedProject")),
    featuredImage: shapeMedia(entry.featuredImage, ctx.mediaBaseUrl),
    gallery: shapeMediaList(entry.gallery, ctx.mediaBaseUrl),
    seo: shapeSeo(entry.seo, ctx.mediaBaseUrl),
    publishedAt: asString(entry.publishedAt),
    role: asString(entry.role),
    year: asString(entry.year),
    stackLine: asString(entry.stackLine),
    deck: asString(entry.deck),
    deckTablet: asString(entry.deckTablet),
    deckMobile: asString(entry.deckMobile),
    heroMeta: shapePublishingMetaItems(entry.heroMeta),
    metaLineTablet: asString(entry.metaLineTablet),
    metaLineMobileYear: asString(entry.metaLineMobileYear),
    metaLineMobileRole: asString(entry.metaLineMobileRole),
    toc,
    overview: shapeCaseOverview(entry.overview),
    problem: shapeCaseProseSection(entry.problem),
    constraints: shapeCaseRowSection(entry.constraints),
    architecture: shapeCaseArchitecture(entry.architecture),
    decisions,
    implementation: shapeCaseProseSection(entry.implementation),
    delivery: shapeCaseRowSection(entry.delivery),
    outcomes: shapeCaseOutcomes(entry.outcomes),
    lessons: shapeCaseRowSection(entry.lessons),
    figureSlots,
    relatedNote: asString(entry.relatedNote),
    contactBridge: shapeHomeBridge(entry.contactBridge),
  };
}

export function shapeService(
  raw: unknown,
  preferredSiteKey: SiteKey,
  ctx: NormalizeContext = {},
): z.input<typeof serviceSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  return {
    documentId: documentIdOf(entry),
    siteKey: siteKeyFromToOne(entry, "site") ?? preferredSiteKey,
    name: asString(entry.name) as string,
    slug: asString(entry.slug) as string,
    shortDescription: asString(entry.shortDescription),
    description: asString(entry.description),
    features: shapeFeatures(entry.features),
    technologies: pickRelationList(entry, "technologies")
      .map((item) => shapeTechnology(item, ctx))
      .filter((item): item is NonNullable<typeof item> => item != null),
    featuredImage: shapeMedia(entry.featuredImage, ctx.mediaBaseUrl),
    featured: asBoolean(entry.featured),
    seo: shapeSeo(entry.seo, ctx.mediaBaseUrl),
    publishedAt: asString(entry.publishedAt),
  };
}

export function shapeTestimonial(
  raw: unknown,
  preferredSiteKey: SiteKey | undefined,
  ctx: NormalizeContext = {},
): z.input<typeof testimonialSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  const siteKeys = siteKeysFromToMany(entry, "sites");
  if (siteKeys.length === 0 && preferredSiteKey) siteKeys.push(preferredSiteKey);

  return {
    documentId: documentIdOf(entry),
    siteKeys,
    name: asString(entry.name) as string,
    role: asString(entry.role),
    company: asString(entry.company),
    quote: asString(entry.quote) as string,
    avatar: shapeMedia(entry.avatar, ctx.mediaBaseUrl),
    featured: asBoolean(entry.featured),
  };
}

export function shapeFaqItem(
  raw: unknown,
  preferredSiteKey?: SiteKey,
): z.input<typeof faqItemSchema> | null {
  return shapeFaqItemForBlock(raw, preferredSiteKey);
}

export function shapeRedirect(
  raw: unknown,
  preferredSiteKey: SiteKey,
): z.input<typeof redirectSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  return {
    documentId: documentIdOf(entry),
    siteKey: siteKeyFromToOne(entry, "site") ?? preferredSiteKey,
    sourcePath: asString(entry.sourcePath) as string,
    destinationPath: asString(entry.destinationPath) as string,
    statusCode: normalizeRedirectStatusCode(entry.statusCode),
    enabled: asBoolean(entry.enabled, true),
  };
}

export type { FlatEntry };
