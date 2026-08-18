import type { Project, WorkPage } from "@repo/strapi-client";
import type { WorkFixture, WorkProject } from "@/content/work";
import { workFixture } from "@/content/work";
import { mediaFields } from "@/lib/strapi/media";
import { ATLAS_SITE } from "@/lib/strapi/assemble-shared";
import { AtlasContentError } from "@/lib/strapi/errors";

function parseTaxonomyGroups(
  groups: unknown,
): WorkFixture["taxonomy"]["categories"] {
  if (!Array.isArray(groups)) return [];
  return groups
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const id = typeof row.id === "string" ? row.id : "";
      const index = typeof row.index === "string" ? row.index : "";
      const label = typeof row.label === "string" ? row.label : "";
      const description =
        typeof row.description === "string" ? row.description : "";
      if (!id || !label) return null;
      return { id, index, label, description };
    })
    .filter(
      (item): item is WorkFixture["taxonomy"]["categories"][number] =>
        item != null,
    );
}

function projectToWorkProject(
  project: Project,
  caseStudySlugs: ReadonlySet<string>,
): WorkProject {
  const card = mediaFields(project.cardMedia);
  const layout = project.layout ?? "feature";
  const projectStatus = project.status ?? "planned";
  const href = caseStudySlugs.has(project.slug)
    ? `/work/${project.slug}`
    : undefined;

  const base: WorkProject = {
    id: project.slug,
    slug: project.slug,
    name: project.name,
    summary: project.summary ?? "",
    summaryTablet: project.summaryTablet ?? undefined,
    summaryMobile: project.summaryMobile ?? undefined,
    category: project.category ?? "",
    themes: project.themes ?? [],
    projectStatus,
    statusLabel: project.statusLabel ?? "",
    featured: project.featured,
    layout,
    ...(href
      ? { href, ctaLabel: project.ctaLabel ?? "View →" }
      : {}),
  };

  if (project.cardMedia && card.src) {
    return {
      ...base,
      mediaLabel: card.label,
      mediaSrc: card.src,
      mediaWidth: card.width,
      mediaHeight: card.height,
      mediaSizes: card.sizes,
    };
  }

  return base;
}

/** CMS WorkPage + projects → WorkFixture. stageRules remain application-static. */
export function assembleWork(
  workPage: WorkPage,
  projects: Project[],
  caseStudySlugs: ReadonlySet<string> = new Set(),
): WorkFixture {
  const featuredSlug = workPage.featuredProject.slug;
  const featuredFigure = mediaFields(workPage.featuredCopy.figure);
  const featuredFigureCompact = mediaFields(workPage.featuredCopy.figureCompact);
  const copy = workPage.featuredCopy;

  const selectedProjects = projects
    .filter((p) => p.slug !== featuredSlug)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((project) => projectToWorkProject(project, caseStudySlugs));

  const bridge = workPage.contactBridge;

  return {
    site: ATLAS_SITE,
    seo: {
      title: workPage.seo.metaTitle ?? "Work",
      description: workPage.seo.metaDescription ?? "",
    },
    intro: {
      chapter: workPage.intro.chapter,
      title: workPage.intro.title,
      deck: workPage.intro.deck,
      deckMobile: workPage.intro.deckMobile ?? workPage.intro.deck,
      meta: workPage.intro.meta,
      editorialNote: {
        label: workPage.intro.editorialNoteLabel ?? "EDITORIAL NOTE",
        body: workPage.intro.editorialNoteBody ?? "",
      },
    },
    stageRules: { ...workFixture.stageRules },
    featured: {
      chapter: copy.chapter,
      title: copy.title ?? workPage.featuredProject.name,
      summary: copy.summary ?? "",
      summaryMobile: copy.summaryMobile ?? copy.summary ?? "",
      flagshipLabel: copy.flagshipLabel ?? "flagship",
      status: copy.status ?? "",
      timeframe: copy.timeframe ?? "",
      role: copy.role ?? "",
      figureAlt: featuredFigure.alt ?? copy.figure?.alt ?? "",
      figureCaption: featuredFigure.caption ?? "",
      figureCaptionShort: featuredFigure.captionShort ?? "",
      figureSrc: featuredFigure.src,
      figureWidth: featuredFigure.width,
      figureHeight: featuredFigure.height,
      figureSizes: featuredFigure.sizes,
      figureSrcCompact: featuredFigureCompact.src,
      figureWidthCompact: featuredFigureCompact.width,
      figureHeightCompact: featuredFigureCompact.height,
      themesLabel: copy.themesLabel ?? "ENGINEERING THEMES",
      themes: copy.themes ?? [],
      themesCompact: copy.themesCompact ?? "",
      cta: copy.cta ?? {
        label: "Read case study",
        href: `/work/${featuredSlug}`,
      },
      ctaNote: copy.ctaNote ?? "",
    },
    selected: {
      chapter: workPage.selectedChapter,
      headline: workPage.selectedHeadline,
      deck: workPage.selectedDeck,
      projects: selectedProjects,
    },
    taxonomy: {
      chapter: workPage.taxonomy.chapter,
      title: workPage.taxonomy.title,
      deck: workPage.taxonomy.deck,
      categories: parseTaxonomyGroups(workPage.taxonomy.groups),
    },
    contact: {
      chapter: bridge.chapter,
      title: bridge.title ?? "",
      body: bridge.body ?? "",
      bodyMobile: bridge.bodyCompact ?? bridge.body ?? "",
      cta: bridge.cta ?? { label: "Start a conversation", href: "/contact" },
      meta: bridge.meta ?? "",
    },
  };
}

export function requireWorkPage(work: WorkPage | null): WorkPage {
  if (!work) {
    throw new AtlasContentError(
      "SINGLETON_MISSING",
      "Work page singleton missing for site key personal",
    );
  }
  return work;
}
