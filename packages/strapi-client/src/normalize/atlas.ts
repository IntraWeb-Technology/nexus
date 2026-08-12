import { z } from "zod";
import {
  asString,
  documentIdOf,
  flattenEntries,
  flattenEntry,
  pickRelation,
} from "../schemas/common.js";
import {
  shapeAboutApproach,
  shapeAboutArchitecture,
  shapeAboutFocus,
  shapeAboutNotes,
  shapeAboutOpening,
  shapeAboutPhilosophy,
  shapeAboutPrinciples,
  shapeAboutReading,
  shapeAboutStyle,
  shapeAboutTimeline,
  shapeCaseArchitecture,
  shapeCaseDecision,
  shapeCaseFigureSlot,
  shapeCaseOutcomes,
  shapeCaseOverview,
  shapeCaseProseSection,
  shapeCaseRowSection,
  shapeCaseToc,
  shapeHomeBridge,
  shapeHomeFeatured,
  shapeHomeHero,
  shapeHomePhilosophy,
  shapeHomeSelectedItem,
  shapeHomeWritingItem,
  shapeProjectCardRef,
  shapeProjectRefFromEntry,
  shapeWorkFeaturedCopy,
  shapeWorkIntro,
  shapeWorkTaxonomy,
} from "../schemas/atlas.js";
import { siteKeyFromToOne } from "../schemas/components.js";
import {
  shapePublishingMetaItems,
  shapePublishingSections,
} from "../schemas/publishing.js";
import { shapeSeo } from "../schemas/components.js";
import type {
  aboutPageSchema,
  contactPageSchema,
  homePageSchema,
  workPageSchema,
} from "../schemas/domain.js";
import type { NormalizeContext } from "./content.js";
import type { SiteKey } from "../types.js";

export function shapeHomePage(
  raw: unknown,
  preferredSiteKey: SiteKey,
  ctx: NormalizeContext = {},
): z.input<typeof homePageSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  const hero = shapeHomeHero(entry.hero, ctx.mediaBaseUrl);
  const featured = shapeHomeFeatured(entry.featured, ctx.mediaBaseUrl);
  const philosophy = shapeHomePhilosophy(entry.philosophy);
  const aboutTeaser = shapeHomeBridge(entry.aboutTeaser);
  const contactBridge = shapeHomeBridge(entry.contactBridge);
  const writingChapter = asString(entry.writingChapter);

  const featuredProjectEntry = pickRelation(entry, "featuredProject");
  const featuredProject = featuredProjectEntry
    ? shapeProjectRefFromEntry(featuredProjectEntry)
    : null;

  const selected = flattenEntries(entry.selected)
    .map((item) => shapeHomeSelectedItem(item, ctx.mediaBaseUrl))
    .filter((item): item is NonNullable<typeof item> => item != null);

  const writingItems = flattenEntries(entry.writingItems)
    .map((item) => shapeHomeWritingItem(item))
    .filter((item): item is NonNullable<typeof item> => item != null);

  if (
    !hero ||
    !featured ||
    !philosophy ||
    !aboutTeaser ||
    !contactBridge ||
    !writingChapter ||
    !featuredProject
  ) {
    return null;
  }

  return {
    documentId: documentIdOf(entry),
    siteKey: siteKeyFromToOne(entry, "site") ?? preferredSiteKey,
    seo: shapeSeo(entry.seo, ctx.mediaBaseUrl),
    hero,
    featured,
    featuredProject,
    selected,
    philosophy,
    writingChapter,
    writingItems,
    aboutTeaser,
    contactBridge,
  };
}

export function shapeAboutPage(
  raw: unknown,
  preferredSiteKey: SiteKey,
  ctx: NormalizeContext = {},
): z.input<typeof aboutPageSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  const opening = shapeAboutOpening(entry.opening);
  const philosophy = shapeAboutPhilosophy(entry.philosophy);
  const approach = shapeAboutApproach(entry.approach, ctx.mediaBaseUrl);
  const style = shapeAboutStyle(entry.style);
  const principles = shapeAboutPrinciples(entry.principles);
  const timeline = shapeAboutTimeline(entry.timeline);
  const focus = shapeAboutFocus(entry.focus);
  const reading = shapeAboutReading(entry.reading);
  const architecture = shapeAboutArchitecture(entry.architecture, ctx.mediaBaseUrl);
  const notes = shapeAboutNotes(entry.notes);
  const contactBridge = shapeHomeBridge(entry.contactBridge);
  const seo = shapeSeo(entry.seo, ctx.mediaBaseUrl);

  if (
    !opening ||
    !philosophy ||
    !approach ||
    !style ||
    !principles ||
    !timeline ||
    !focus ||
    !reading ||
    !architecture ||
    !notes ||
    !contactBridge ||
    !seo
  ) {
    return null;
  }

  return {
    documentId: documentIdOf(entry),
    siteKey: siteKeyFromToOne(entry, "site") ?? preferredSiteKey,
    seo,
    opening,
    philosophy,
    approach,
    style,
    principles,
    timeline,
    focus,
    reading,
    architecture,
    notes,
    contactBridge,
  };
}

export function shapeWorkPage(
  raw: unknown,
  preferredSiteKey: SiteKey,
  ctx: NormalizeContext = {},
): z.input<typeof workPageSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  const intro = shapeWorkIntro(entry.intro);
  const featuredCopy = shapeWorkFeaturedCopy(entry.featuredCopy, ctx.mediaBaseUrl);
  const taxonomy = shapeWorkTaxonomy(entry.taxonomy);
  const contactBridge = shapeHomeBridge(entry.contactBridge);
  const seo = shapeSeo(entry.seo, ctx.mediaBaseUrl);
  const selectedChapter = asString(entry.selectedChapter);
  const selectedHeadline = asString(entry.selectedHeadline);
  const selectedDeck = asString(entry.selectedDeck);

  const featuredProject = shapeProjectCardRef(
    pickRelation(entry, "featuredProject"),
    ctx.mediaBaseUrl,
  );

  if (
    !intro ||
    !featuredCopy ||
    !taxonomy ||
    !contactBridge ||
    !seo ||
    !selectedChapter ||
    !selectedHeadline ||
    !selectedDeck ||
    !featuredProject
  ) {
    return null;
  }

  return {
    documentId: documentIdOf(entry),
    siteKey: siteKeyFromToOne(entry, "site") ?? preferredSiteKey,
    seo,
    intro,
    featuredProject,
    featuredCopy,
    selectedChapter,
    selectedHeadline,
    selectedDeck,
    taxonomy,
    contactBridge,
  };
}

export function shapeContactPage(
  raw: unknown,
  preferredSiteKey: SiteKey,
  ctx: NormalizeContext = {},
): z.input<typeof contactPageSchema> | null {
  const entry = flattenEntry(raw);
  if (!entry) return null;

  const seo = shapeSeo(entry.seo, ctx.mediaBaseUrl);
  const chapter = asString(entry.chapter);
  const title = asString(entry.title);
  const body = asString(entry.body);
  const nameLabel = asString(entry.nameLabel);
  const namePlaceholder = asString(entry.namePlaceholder);
  const emailLabel = asString(entry.emailLabel);
  const emailPlaceholder = asString(entry.emailPlaceholder);
  const messageLabel = asString(entry.messageLabel);
  const messagePlaceholder = asString(entry.messagePlaceholder);
  const submitLabel = asString(entry.submitLabel);
  const successTitle = asString(entry.successTitle);
  const successBody = asString(entry.successBody);
  const failureTitle = asString(entry.failureTitle);
  const failureBody = asString(entry.failureBody);

  if (
    !seo ||
    !chapter ||
    !title ||
    !body ||
    !nameLabel ||
    !namePlaceholder ||
    !emailLabel ||
    !emailPlaceholder ||
    !messageLabel ||
    !messagePlaceholder ||
    !submitLabel ||
    !successTitle ||
    !successBody ||
    !failureTitle ||
    !failureBody
  ) {
    return null;
  }

  return {
    documentId: documentIdOf(entry),
    siteKey: siteKeyFromToOne(entry, "site") ?? preferredSiteKey,
    seo,
    chapter,
    title,
    body,
    nameLabel,
    namePlaceholder,
    emailLabel,
    emailPlaceholder,
    messageLabel,
    messagePlaceholder,
    submitLabel,
    meta: asString(entry.meta),
    successTitle,
    successBody,
    failureTitle,
    failureBody,
  };
}

export {
  shapeCaseArchitecture,
  shapeCaseDecision,
  shapeCaseFigureSlot,
  shapeCaseOutcomes,
  shapeCaseOverview,
  shapeCaseProseSection,
  shapeCaseRowSection,
  shapeCaseToc,
  shapeHomeBridge,
  shapePublishingMetaItems,
  shapePublishingSections,
};
