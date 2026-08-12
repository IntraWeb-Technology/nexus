import type { CaseStudy, PublishingMedia } from "@repo/strapi-client";
import type {
  CaseFigure,
  CaseStudyFixture,
  FigureKind,
} from "@/content/case-study";
import {
  ATLAS_SITE,
  caseSeo,
  isComposedMedia,
  parseArchitectureNodes,
} from "@/lib/strapi/assemble-shared";
import { mediaFields } from "@/lib/strapi/media";

type FigureSlotKey = keyof CaseStudyFixture["figures"];

const SLOT_ORDER: Array<{
  slot: CaseStudy["figureSlots"][number]["slot"];
  key: FigureSlotKey;
  priority?: boolean;
}> = [
  { slot: "hero", key: "hero", priority: true },
  { slot: "architecture", key: "architecture" },
  { slot: "implementationPrimary", key: "implementationPrimary" },
  { slot: "implementationUi", key: "implementationUi" },
  { slot: "implementationWorkflow", key: "implementationWorkflow" },
  { slot: "implementationTablet", key: "implementationTablet" },
  { slot: "implementationMobile", key: "implementationMobile" },
];

function figureFromMedia(
  slot: string,
  media: PublishingMedia,
  priority?: boolean,
): CaseFigure {
  const fields = mediaFields(media);
  const omitSrc = isComposedMedia(media);
  return {
    id: `fig-${slot}`,
    kind: media.kind as FigureKind,
    alt: media.alt,
    caption: fields.caption ?? "",
    captionShort: fields.captionShort,
    label: fields.label,
    tone: media.kind === "application-screenshot" ? "ink" : undefined,
    src: omitSrc ? undefined : fields.src,
    width: omitSrc ? undefined : fields.width,
    height: omitSrc ? undefined : fields.height,
    sizes: omitSrc ? undefined : fields.sizes,
    priority,
  };
}

function emptyFigure(slot: string, kind: FigureKind = "application-screenshot"): CaseFigure {
  return {
    id: `fig-${slot}`,
    kind,
    alt: "",
    caption: "",
  };
}

function mapFigureSlots(
  slots: CaseStudy["figureSlots"],
): CaseStudyFixture["figures"] {
  const bySlot = new Map(slots.map((item) => [item.slot, item.media]));
  const figures = {} as CaseStudyFixture["figures"];

  for (const { slot, key, priority } of SLOT_ORDER) {
    const media = bySlot.get(slot);
    figures[key] = media
      ? figureFromMedia(key, media, priority)
      : emptyFigure(
          key,
          slot === "architecture" || slot === "implementationWorkflow"
            ? "architecture-diagram"
            : "application-screenshot",
        );
  }

  return figures;
}

/** CMS CaseStudy → CaseStudyFixture. Composed architecture diagram has no src. */
export function assembleCaseStudy(study: CaseStudy): CaseStudyFixture {
  const project = study.relatedProject;
  const arch = study.architecture;
  const bridge = study.contactBridge;

  return {
    site: ATLAS_SITE,
    project: {
      id: project?.slug ?? study.slug,
      slug: project?.slug ?? study.slug,
      name: project?.name ?? study.title,
      projectStatus: "in-progress",
    },
    seo: caseSeo(study),
    hero: {
      chapter: "CASE STUDY",
      title: study.title,
      deck: study.deck ?? study.summary ?? "",
      deckTablet: study.deckTablet ?? study.deck ?? "",
      deckMobile: study.deckMobile ?? study.deck ?? "",
      meta: study.heroMeta,
      metaLineTablet: study.metaLineTablet ?? "",
      metaLineMobileYear: study.metaLineMobileYear ?? "",
      metaLineMobileRole: study.metaLineMobileRole ?? "",
      stackLine: study.stackLine ?? "",
    },
    toc: study.toc ?? [],
    figures: mapFigureSlots(study.figureSlots),
    overview: {
      chapter: study.overview?.chapter ?? "",
      title: study.overview?.title ?? "",
      titleMobile: study.overview?.titleMobile ?? "",
      columns: study.overview?.columns ?? [],
      bodyTablet: study.overview?.bodyTablet ?? [],
      bodyMobile: study.overview?.bodyMobile ?? "",
    },
    problem: {
      chapter: study.problem?.chapter ?? "",
      title: study.problem?.title ?? "",
      titleMobile: study.problem?.titleMobile ?? "",
      paragraphs: study.problem?.paragraphs ?? [],
      paragraphsTablet: study.problem?.paragraphsTablet ?? [],
      bodyMobile: study.problem?.bodyMobile ?? "",
    },
    constraints: {
      chapter: study.constraints?.chapter ?? "",
      title: study.constraints?.title ?? "",
      titleMobile: study.constraints?.titleMobile ?? "",
      rows: (study.constraints?.rows ?? []).map((row) => ({
        id: row.id,
        label: row.label,
        body: row.body,
      })),
      summaryTablet: study.constraints?.summaryTablet ?? "",
      summaryMobile: study.constraints?.summaryMobile ?? "",
    },
    architecture: {
      chapter: arch?.chapter ?? "",
      title: arch?.title ?? "",
      intro: arch?.intro ?? "",
      requestPath: parseArchitectureNodes(arch?.requestPath),
      deliveryPath: parseArchitectureNodes(arch?.deliveryPath),
      tabletRequest: parseArchitectureNodes(arch?.tabletRequest),
      tabletDelivery: parseArchitectureNodes(arch?.tabletDelivery),
      mobileNodes: parseArchitectureNodes(arch?.mobileNodes),
      legend: arch?.legend ?? [],
    },
    decisions: {
      chapter: "05  ·  DECISIONS",
      title: "Engineering reasoning.",
      intro:
        "Each decision follows the same editorial composition: statement → context → choice → tradeoff → consequence.",
      items: study.decisions.map((d) => ({
        id: d.decisionId,
        statement: d.statement,
        statementTablet: d.statementTablet ?? undefined,
        statementMobile: d.statementMobile ?? undefined,
        context: d.context,
        choice: d.choice,
        tradeoff: d.tradeoff,
        consequence: d.consequence,
      })),
    },
    implementation: {
      chapter: study.implementation?.chapter ?? "",
      title: study.implementation?.title ?? "",
      titleMobile: study.implementation?.titleMobile ?? "",
      intro: study.implementation?.intro ?? "",
      introTablet: study.implementation?.paragraphsTablet?.join(" ") ?? "",
      introMobile: study.implementation?.bodyMobile ?? "",
    },
    delivery: {
      chapter: study.delivery?.chapter ?? "",
      title: study.delivery?.title ?? "",
      titleMobile: study.delivery?.titleMobile ?? "",
      rows: (study.delivery?.rows ?? []).map((row) => ({
        id: row.id,
        label: row.label,
        body: row.body,
      })),
      summaryTablet: study.delivery?.summaryTablet ?? "",
      summaryMobile: study.delivery?.summaryMobile ?? "",
    },
    outcomes: {
      chapter: study.outcomes?.chapter ?? "",
      title: study.outcomes?.title ?? "",
      titleMobile: study.outcomes?.titleMobile ?? "",
      intro: study.outcomes?.intro ?? "",
      items: (study.outcomes?.items ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
      })),
      note: study.outcomes?.note ?? "",
      summaryTablet: study.outcomes?.summaryTablet ?? "",
      summaryMobile: study.outcomes?.summaryMobile ?? "",
    },
    lessons: {
      chapter: study.lessons?.chapter ?? "",
      title: study.lessons?.title ?? "",
      titleMobile: study.lessons?.titleMobile ?? "",
      rows: (study.lessons?.rows ?? []).map((row) => ({
        id: row.id,
        label: row.label,
        body: row.body,
      })),
      summaryTablet: study.lessons?.summaryTablet ?? "",
      summaryMobile: study.lessons?.summaryMobile ?? "",
    },
    related: {
      chapter: "RELATED",
      title: "Next case.",
      titleTablet: project
        ? `Next case · ${project.name} →`
        : "Next case →",
      titleMobile: project ? `Next · ${project.name} →` : "Next →",
      projectName: project?.name ?? "",
      projectSummary: study.relatedNote ?? study.summary ?? "",
      cta: {
        label: "Continue →",
        href: project ? `/work/${project.slug}` : "/work",
      },
    },
    contact: {
      chapter: bridge?.chapter ?? "CONTACT",
      title: bridge?.title ?? "Let's talk about the work.",
      body: bridge?.body ?? "",
      cta: bridge?.cta ?? { label: "Start a conversation", href: "/contact" },
      meta: bridge?.meta ?? "",
    },
  };
}
