import { ATLAS_SITE_KEY } from "./config";
import type { AtlasFixtures } from "./loadFixtures";

export type PublishingMediaPayload = {
  alt: string;
  kind: string;
  evidenceClass: "production" | "composed";
  label?: string;
  caption?: string;
  captionShort?: string;
  sizes?: string;
  composedKey?: string;
  /** Local source path for upload tooling — omitted on REST write until uploaded */
  _sourcePath?: string;
};

export type UpsertPlanItem = {
  uid: string;
  key: string;
  payload: Record<string, unknown>;
};

export type AtlasMigrationPlan = {
  batchId: string;
  siteKey: typeof ATLAS_SITE_KEY;
  items: UpsertPlanItem[];
  skipped: string[];
};

const APPLICATION_STATIC_SKIP = [
  "favicon",
  "og/default",
  "atlas-mark",
  "A-13",
  "A-14",
];

const DEFERRED_MEDIA = new Set(["A-05", "PA-DOC2", "PA-DOC3", "PA-DOC4", "PA-DOC5"]);

function mapCaseDecisions(
  decisions: unknown,
): Array<Record<string, string | undefined>> | undefined {
  if (!decisions || typeof decisions !== "object") return undefined;
  const items = (decisions as { items?: unknown[] }).items;
  if (!Array.isArray(items)) return undefined;
  return items.map((item) => {
    const row = item as Record<string, string | undefined>;
    return {
      decisionId: row.id ?? "",
      statement: row.statement ?? "",
      statementTablet: row.statementTablet,
      statementMobile: row.statementMobile,
      context: row.context ?? "",
      choice: row.choice ?? "",
      tradeoff: row.tradeoff ?? "",
      consequence: row.consequence ?? "",
    };
  });
}

function mapProseSection(section: unknown): Record<string, unknown> | undefined {
  if (!section || typeof section !== "object") return undefined;
  const s = section as Record<string, unknown>;
  const paragraphs =
    s.paragraphs ?? (typeof s.intro === "string" ? [s.intro] : undefined);
  if (!paragraphs) return undefined;
  const mapped: Record<string, unknown> = {
    chapter: s.chapter,
    title: s.title,
    paragraphs,
  };
  if (s.titleMobile) mapped.titleMobile = s.titleMobile;
  if (s.paragraphsTablet) mapped.paragraphsTablet = s.paragraphsTablet;
  else if (s.introTablet) mapped.paragraphsTablet = [s.introTablet];
  if (s.bodyMobile) mapped.bodyMobile = s.bodyMobile;
  else if (s.introMobile) mapped.bodyMobile = s.introMobile;
  if (s.intro) mapped.intro = s.intro;
  return mapped;
}

function mapSeo(seo: unknown): Record<string, string> | undefined {
  if (!seo || typeof seo !== "object") return undefined;
  const s = seo as Record<string, unknown>;
  const metaTitle = s.metaTitle ?? s.title;
  const metaDescription = s.metaDescription ?? s.description;
  if (!metaTitle && !metaDescription) return undefined;
  const mapped: Record<string, string> = {};
  if (metaTitle) mapped.metaTitle = String(metaTitle);
  if (metaDescription) mapped.metaDescription = String(metaDescription);
  if (s.canonicalUrl) mapped.canonicalUrl = String(s.canonicalUrl);
  return mapped;
}

function productionMedia(input: {
  alt: string;
  kind: string;
  label?: string;
  caption?: string;
  captionShort?: string;
  sizes?: string;
  sourcePath?: string;
}): PublishingMediaPayload {
  return {
    alt: input.alt,
    kind: input.kind,
    evidenceClass: "production",
    label: input.label,
    caption: input.caption,
    captionShort: input.captionShort,
    sizes: input.sizes,
    ...(input.sourcePath ? { _sourcePath: input.sourcePath } : {}),
  };
}

function composedMedia(input: {
  alt: string;
  kind: string;
  composedKey: string;
  label?: string;
  caption?: string;
  captionShort?: string;
}): PublishingMediaPayload {
  return {
    alt: input.alt,
    kind: input.kind,
    evidenceClass: "composed",
    composedKey: input.composedKey,
    label: input.label,
    caption: input.caption,
    captionShort: input.captionShort,
  };
}

function link(label: string, href: string) {
  return { label, href };
}

function editorialType(type: string): "essay" | "decision" | "note" {
  switch (type) {
    case "Decision":
      return "decision";
    case "Note":
      return "note";
    default:
      return "essay";
  }
}

function docKind(kind: string): "guide" | "adr" | "playbook" | "procedure" | "reference" {
  switch (kind) {
    case "ADR":
      return "adr";
    case "Playbook":
      return "playbook";
    case "Procedure":
      return "procedure";
    case "Reference":
      return "reference";
    default:
      return "guide";
  }
}

function mapFigureBlock(block: Record<string, unknown> | undefined): PublishingMediaPayload | undefined {
  if (!block) return undefined;
  if (block.composed === "rsc-request-path") {
    return composedMedia({
      alt: String(block.alt ?? ""),
      kind: "architecture-diagram",
      composedKey: "rsc-request-path",
      label: String(block.label ?? ""),
      caption: String(block.caption ?? ""),
      captionShort: block.captionCompact ? String(block.captionCompact) : undefined,
    });
  }
  if (block.composed === "atlas-boundaries") {
    return composedMedia({
      alt: String(block.alt ?? ""),
      kind: "architecture-diagram",
      composedKey: "atlas-boundaries",
      label: String(block.label ?? ""),
      caption: String(block.caption ?? ""),
      captionShort: block.captionCompact ? String(block.captionCompact) : undefined,
    });
  }
  if (block.src) {
    return productionMedia({
      alt: String(block.alt ?? ""),
      kind: "application-screenshot",
      label: String(block.label ?? ""),
      caption: String(block.caption ?? ""),
      captionShort: block.captionCompact ? String(block.captionCompact) : undefined,
      sizes: block.sizes ? String(block.sizes) : undefined,
      sourcePath: String(block.src),
    });
  }
  return undefined;
}

function mapPublishingSection(section: unknown, omitFigureWhenMissing = false): Record<string, unknown> {
  const s = { ...(section as Record<string, unknown>) };
  if (s.id && !s.sectionId) {
    s.sectionId = s.id;
    delete s.id;
  }
  const figure = mapFigureBlock(s.figure as Record<string, unknown> | undefined);
  if (figure) s.figure = figure;
  else if (omitFigureWhenMissing) delete s.figure;
  return s;
}

function mapArticleSections(sections: unknown[]): unknown[] {
  return sections.map((section) => mapPublishingSection(section));
}

function mapDocSections(sections: unknown[]): unknown[] {
  return sections.map((section) => mapPublishingSection(section, true));
}

function mapWorkTaxonomy(taxonomy: unknown): Record<string, unknown> {
  const t = { ...(taxonomy as Record<string, unknown>) };
  if (t.categories && !t.groups) {
    t.groups = t.categories;
    delete t.categories;
  }
  return t;
}

function mapWorkIntro(intro: unknown): Record<string, unknown> {
  const i = { ...(intro as Record<string, unknown>) };
  const note = i.editorialNote as { label?: string; body?: string } | undefined;
  delete i.editorialNote;
  if (note?.label) i.editorialNoteLabel = note.label;
  if (note?.body) i.editorialNoteBody = note.body;
  return i;
}

function mapBridge(bridge: unknown): Record<string, unknown> {
  const b = { ...(bridge as Record<string, unknown>) };
  if (b.bodyCondensed && !b.bodyCompact) b.bodyCompact = b.bodyCondensed;
  if (b.bodyMobile && !b.bodyCompact) b.bodyCompact = b.bodyMobile;
  delete b.bodyCondensed;
  delete b.bodyMobile;
  if (b.secondaryCta && !b.workLink) {
    b.workLink = b.secondaryCta;
    delete b.secondaryCta;
  }
  return b;
}

function mapAboutOpening(opening: unknown): Record<string, unknown> {
  const o = { ...(opening as Record<string, unknown>) };
  const margin = o.marginNote as { label?: string; body?: string } | undefined;
  delete o.marginNote;
  if (margin?.label) o.marginNoteLabel = margin.label;
  if (margin?.body) o.marginNoteBody = margin.body;
  return o;
}

function mapFeaturedWithFigure(
  source: Record<string, unknown>,
): Record<string, unknown> {
  const {
    figureAlt,
    figureCaption,
    figureCaptionShort,
    figureSrc,
    figureSizes,
    figureWidth,
    figureHeight,
    figureCompactAlt,
    figureCompactCaption,
    figureCompactSrc,
    figureSrcCompact,
    figureCompactSizes,
    figureWidthCompact,
    figureHeightCompact,
    ...rest
  } = source;
  const mapped: Record<string, unknown> = { ...rest };
  const compactSrc = figureCompactSrc ?? figureSrcCompact;
  if (figureSrc) {
    mapped.figure = productionMedia({
      alt: String(figureAlt ?? ""),
      kind: "application-screenshot",
      caption: figureCaption ? String(figureCaption) : undefined,
      captionShort: figureCaptionShort ? String(figureCaptionShort) : undefined,
      sizes: figureSizes ? String(figureSizes) : undefined,
      sourcePath: String(figureSrc),
    });
  }
  if (compactSrc) {
    mapped.figureCompact = productionMedia({
      alt: String(figureCompactAlt ?? figureAlt ?? ""),
      kind: "application-screenshot",
      caption: figureCompactCaption ? String(figureCompactCaption) : undefined,
      sizes: figureCompactSizes ? String(figureCompactSizes) : undefined,
      sourcePath: String(compactSrc),
    });
  }
  return mapped;
}

function slugFromWorkFeatured(work: AtlasFixtures["workFixture"]): string {
  const featured = work as { featured: { cta: { href: string } } };
  const match = featured.featured.cta.href.match(/\/work\/([^/?#]+)/);
  return match?.[1] ?? "portfolio-os";
}

export function buildAtlasMigrationPlan(fixtures: AtlasFixtures, batchId: string): AtlasMigrationPlan {
  const items: UpsertPlanItem[] = [];
  const skipped = [...APPLICATION_STATIC_SKIP];

  const work = fixtures.workFixture as {
    featured: {
      title: string;
      cta: { href: string };
      figureAlt: string;
      figureCaption: string;
      figureCaptionShort: string;
      figureSrc?: string;
      figureSizes?: string;
    };
    selected: {
      projects: Array<{
        id: string;
        slug: string;
        name: string;
        summary: string;
        summaryTablet?: string;
        summaryMobile?: string;
        category: string;
        themes: string[];
        projectStatus: string;
        statusLabel: string;
        featured: boolean;
        layout: string;
        mediaLabel?: string;
        mediaSrc?: string;
        mediaSizes?: string;
        ctaLabel: string;
      }>;
    };
    seo: { title: string; description: string };
    intro: unknown;
    featuredCopy?: unknown;
    taxonomy: unknown;
    contact: unknown;
  };

  const homepage = fixtures.homepageFixture as {
    hero: {
      chapter: string;
      title: string;
      deck: string;
      mediaAlt: string;
      mediaLabel: string;
      mediaNote: string;
      mediaSrc?: string;
      mediaSizes?: string;
      primaryCta: { label: string; href: string };
      secondaryCta: { label: string; href: string };
    };
    featured: {
      title: string;
      figureAlt: string;
      figureCaption: string;
      figureSrc?: string;
      figureSizes?: string;
    };
    selected: {
      chapter: string;
      headline: string;
      projects: Array<{
        id: string;
        layout: string;
        eyebrow: string;
        title: string;
        outcome: string;
        href: string;
        ctaLabel: string;
        mediaAlt?: string;
        mediaSrc?: string;
        mediaSizes?: string;
      }>;
    };
    philosophy: unknown;
    writing: { chapter: string; items: unknown[] };
    about: unknown;
    contact: unknown;
    seo?: { title: string; description: string };
  };

  const flagshipSlug = slugFromWorkFeatured(work);

  items.push({
    uid: "projects",
    key: flagshipSlug,
    payload: {
      name: work.featured.title,
      slug: flagshipSlug,
      summary: (work.featured as { summary?: string }).summary ?? work.featured.title,
      projectStatus: "in-progress",
      statusLabel: (work.featured as { status?: string }).status ?? "In production",
      featured: true,
      layout: "feature",
      category: "PRODUCT ENGINEERING",
      themes: (work.featured as { themes?: string[] }).themes ?? [],
      ctaLabel: work.featured.cta.label.replace(/^Read case study$/i, "Read case study"),
      sites: [{ key: ATLAS_SITE_KEY }],
      seo: {
        metaTitle: work.featured.title,
        metaDescription: (work.featured as { summary?: string }).summary ?? work.featured.title,
      },
      migrationBatch: batchId,
    },
  });

  for (const project of work.selected.projects) {
    const cardMedia =
      project.slug === "vehicle-maintenance" || !project.mediaSrc
        ? undefined
        : productionMedia({
            alt: project.mediaLabel ?? project.name,
            kind: project.slug.includes("strapi") ? "architecture-diagram" : "workflow-diagram",
            label: project.mediaLabel,
            sizes: project.mediaSizes,
            sourcePath: project.mediaSrc,
          });

    if (project.slug === "vehicle-maintenance") {
      skipped.push("A-05 vehicle-maintenance cardMedia");
    }

    items.push({
      uid: "projects",
      key: project.slug,
      payload: {
        name: project.name,
        slug: project.slug,
        summary: project.summary,
        summaryTablet: project.summaryTablet,
        summaryMobile: project.summaryMobile,
        category: project.category,
        themes: project.themes,
        projectStatus: project.projectStatus,
        statusLabel: project.statusLabel,
        featured: project.featured,
        layout: project.layout,
        ctaLabel: project.ctaLabel,
        ...(cardMedia ? { cardMedia } : {}),
        sites: [{ key: ATLAS_SITE_KEY }],
        seo: { metaTitle: project.name, metaDescription: project.summary },
        migrationBatch: batchId,
      },
    });
  }

  const caseStudy = fixtures.caseStudyBySlug["portfolio-os"] as Record<string, unknown> | undefined;
  if (caseStudy) {
    const figures = caseStudy.figures as Record<string, Record<string, unknown>> | undefined;
    const figureSlots: Array<{ slot: string; media: PublishingMediaPayload | null }> = [];

    const hero = figures?.hero;
    if (hero?.src) {
      figureSlots.push({
        slot: "hero",
        media: productionMedia({
          alt: String(hero.alt ?? ""),
          kind: String(hero.kind ?? "application-screenshot"),
          caption: String(hero.caption ?? ""),
          captionShort: hero.captionShort ? String(hero.captionShort) : undefined,
          sizes: hero.sizes ? String(hero.sizes) : undefined,
          sourcePath: String(hero.src),
        }),
      });
    }

    const architecture = figures?.architecture;
    if (architecture) {
      figureSlots.push({
        slot: "architecture",
        media: composedMedia({
          alt: String(architecture.alt ?? "Architecture diagram"),
          kind: "architecture-diagram",
          composedKey: "architecture-diagram",
          caption: architecture.caption ? String(architecture.caption) : undefined,
        }),
      });
    }

    items.push({
      uid: "case-studies",
      key: "portfolio-os",
      payload: {
        title: String((caseStudy.hero as { title?: string })?.title ?? "Portfolio OS"),
        slug: "portfolio-os",
        summary: String((caseStudy.seo as { description?: string })?.description ?? ""),
        challenge: String((caseStudy.problem as { paragraphs?: string[] })?.paragraphs?.[0] ?? "Challenge TBD"),
        solution: String(
          (caseStudy.implementation as { paragraphs?: string[] })?.paragraphs?.[0] ?? "Solution TBD",
        ),
        results: String((caseStudy.outcomes as { summary?: string })?.summary ?? "Results TBD"),
        relatedProject: { slug: "portfolio-os" },
        deck: (caseStudy.hero as { deck?: string })?.deck,
        deckTablet: (caseStudy.hero as { deckTablet?: string })?.deckTablet,
        deckMobile: (caseStudy.hero as { deckMobile?: string })?.deckMobile,
        heroMeta: (caseStudy.hero as { meta?: unknown[] })?.meta,
        toc: caseStudy.toc,
        overview: caseStudy.overview,
        problem: mapProseSection(caseStudy.problem),
        constraints: caseStudy.constraints,
        architecture: caseStudy.architecture,
        decisions: mapCaseDecisions(caseStudy.decisions),
        implementation: mapProseSection(caseStudy.implementation),
        delivery: caseStudy.delivery,
        outcomes: caseStudy.outcomes,
        lessons: caseStudy.lessons,
        figureSlots,
        sites: [{ key: ATLAS_SITE_KEY }],
        seo: mapSeo(caseStudy.seo),
        migrationBatch: batchId,
      },
    });
  }

  for (const summary of fixtures.articleSummaries) {
    const detail = fixtures.articleBySlug[summary.slug] as Record<string, unknown> | undefined;
    if (!detail) continue;
    const article = detail.article as Record<string, unknown>;
    items.push({
      uid: "articles",
      key: summary.slug,
      payload: {
        title: article.title,
        slug: summary.slug,
        excerpt: article.excerpt,
        surface: "writing",
        editorialType: editorialType(String(article.type ?? "Essay")),
        readingTime: article.readingTime,
        publishedDate: article.publishedDate,
        featured: article.featured,
        contentFormat: article.contentFormat ?? "blocks",
        headerChapter: (detail.header as { chapter?: string })?.chapter,
        dek: (detail.header as { dek?: string })?.dek,
        headerMeta: (detail.header as { meta?: unknown[] })?.meta,
        sections: mapArticleSections((detail.sections as unknown[]) ?? []),
        contactBridge: mapBridge(detail.contact),
        sites: [{ key: ATLAS_SITE_KEY }],
        seo: mapSeo(detail.seo),
        migrationBatch: batchId,
      },
    });
  }

  for (const summary of fixtures.docSummaries) {
    const detail = fixtures.docBySlug[summary.slug] as Record<string, unknown> | undefined;
    if (!detail) continue;
    const document = detail.document as Record<string, unknown>;
    items.push({
      uid: "articles",
      key: `doc:${summary.slug}`,
      payload: {
        title: document.title,
        slug: summary.slug,
        excerpt: document.excerpt,
        surface: "documentation",
        docKind: docKind(String(document.kind ?? "Guide")),
        readingTime: document.readingTime,
        updatedDate: document.updatedDate,
        contentFormat: document.contentFormat ?? "blocks",
        headerChapter: (detail.header as { chapter?: string })?.chapter,
        dek: (detail.header as { dek?: string })?.dek,
        sections: mapDocSections((detail.sections as unknown[]) ?? []),
        contactBridge: mapBridge(detail.contact),
        sites: [{ key: ATLAS_SITE_KEY }],
        seo: mapSeo(detail.seo),
        migrationBatch: batchId,
      },
    });
    skipped.push(...[...DEFERRED_MEDIA].filter((id) => id.startsWith("PA-DOC")));
  }

  items.push({
    uid: "home-pages",
    key: ATLAS_SITE_KEY,
    payload: {
      site: { key: ATLAS_SITE_KEY },
      seo: mapSeo(homepage.seo) ?? { metaTitle: "Atlas", metaDescription: "Atlas home" },
      hero: {
        chapter: homepage.hero.chapter,
        title: homepage.hero.title,
        deck: homepage.hero.deck,
        mediaNote: homepage.hero.mediaNote,
        primaryCta: link(homepage.hero.primaryCta.label, homepage.hero.primaryCta.href),
        secondaryCta: link(homepage.hero.secondaryCta.label, homepage.hero.secondaryCta.href),
        ...(homepage.hero.mediaSrc
          ? {
              media: productionMedia({
                alt: homepage.hero.mediaAlt,
                kind: "application-screenshot",
                label: homepage.hero.mediaLabel,
                sizes: homepage.hero.mediaSizes,
                sourcePath: homepage.hero.mediaSrc,
              }),
            }
          : {}),
      },
      featured: mapFeaturedWithFigure(homepage.featured as Record<string, unknown>),
      featuredProject: { slug: flagshipSlug },
      selected: homepage.selected.projects.map((p) => ({
        layout: p.layout,
        eyebrow: p.eyebrow,
        outcome: p.outcome,
        ctaLabel: p.ctaLabel,
        project: { slug: p.id },
      })),
      philosophy: homepage.philosophy,
      writingChapter: homepage.writing.chapter,
      writingItems: homepage.writing.items.map((item) => ({
        note: item.note,
        article: { slug: item.href.replace(/^\/articles\//, "") },
      })),
      aboutTeaser: {
        chapter: homepage.about.chapter,
        summary: homepage.about.summary,
        href: homepage.about.href,
        cta: link(homepage.about.ctaLabel, homepage.about.href),
      },
      contactBridge: mapBridge(homepage.contact),
    },
  });

  const about = fixtures.aboutFixture as Record<string, unknown>;
  items.push({
    uid: "about-pages",
    key: ATLAS_SITE_KEY,
    payload: {
      site: { key: ATLAS_SITE_KEY },
      seo: mapSeo(about.seo),
      opening: mapAboutOpening(about.opening),
      philosophy: about.philosophy,
      approach: {
        ...(about.approach as Record<string, unknown>),
        figure: composedMedia({
          alt: "About approach diagram",
          kind: "architecture-diagram",
          composedKey: "about-approach",
          caption: String((about.approach as { figureCaption?: string })?.figureCaption ?? ""),
        }),
      },
      style: about.style,
      principles: about.principles,
      timeline: about.timeline,
      focus: about.focus,
      reading: about.reading,
      architecture: {
        ...(about.architecture as Record<string, unknown>),
        figure: composedMedia({
          alt: "About architecture diagram",
          kind: "architecture-diagram",
          composedKey: "about-architecture",
          caption: String((about.architecture as { figureCaption?: string })?.figureCaption ?? ""),
        }),
      },
      notes: about.notes,
      contactBridge: mapBridge(about.contact),
    },
  });

  items.push({
    uid: "work-pages",
    key: ATLAS_SITE_KEY,
    payload: {
      site: { key: ATLAS_SITE_KEY },
      seo: mapSeo(work.seo),
      intro: mapWorkIntro(work.intro),
      featuredProject: { slug: flagshipSlug },
      featuredCopy: mapFeaturedWithFigure(work.featured as Record<string, unknown>),
      selectedChapter: (work.selected as { chapter?: string }).chapter,
      selectedHeadline: (work.selected as { headline?: string }).headline,
      selectedDeck: (work.selected as { deck?: string }).deck,
      taxonomy: mapWorkTaxonomy(work.taxonomy),
      contactBridge: mapBridge(work.contact),
    },
  });

  const contact = fixtures.contactFixture as Record<string, unknown>;
  items.push({
    uid: "contact-pages",
    key: ATLAS_SITE_KEY,
    payload: {
      site: { key: ATLAS_SITE_KEY },
      seo: mapSeo(contact.seo),
      chapter: contact.chapter,
      title: contact.title,
      body: contact.body,
      nameLabel: (contact.fields as { name: { label: string } }).name.label,
      namePlaceholder: (contact.fields as { name: { placeholder: string } }).name.placeholder,
      emailLabel: (contact.fields as { email: { label: string } }).email.label,
      emailPlaceholder: (contact.fields as { email: { placeholder: string } }).email.placeholder,
      messageLabel: (contact.fields as { message: { label: string } }).message.label,
      messagePlaceholder: (contact.fields as { message: { placeholder: string } }).message.placeholder,
      submitLabel: contact.submitLabel,
      meta: contact.meta,
      successTitle: (contact.success as { title: string }).title,
      successBody: (contact.success as { body: string }).body,
      failureTitle: (contact.failure as { title: string }).title,
      failureBody: (contact.failure as { body: string }).body,
    },
  });

  return {
    batchId,
    siteKey: ATLAS_SITE_KEY,
    items,
    skipped: [...new Set(skipped)],
  };
}

export function printMigrationPlan(plan: AtlasMigrationPlan): void {
  console.log(`\n=== Atlas → Strapi migration plan (batch: ${plan.batchId}) ===`);
  console.log(`Site: ${plan.siteKey}`);
  console.log(`Upserts: ${plan.items.length}`);
  for (const item of plan.items) {
    const mediaHints = JSON.stringify(item.payload).includes("_sourcePath") ? " [has production media sources]" : "";
    console.log(`  - ${item.uid} :: ${item.key}${mediaHints}`);
  }
  if (plan.skipped.length) {
    console.log(`Skipped / deferred:`);
    for (const note of plan.skipped) {
      console.log(`  - ${note}`);
    }
  }
  console.log("");
}
