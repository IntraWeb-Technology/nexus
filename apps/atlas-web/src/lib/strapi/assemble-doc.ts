import type { Article } from "@repo/strapi-client";
import type {
  DocDetail,
  DocNavLink,
  DocsIndexFixture,
  DocSummary,
} from "@/content/doc";
import { docsByUpdatedDesc } from "@/content/docs/summaries";
import {
  ATLAS_SITE,
  buildDocToc,
  mapDocCategory,
  mapDocKind,
  mapDocPublishingSections,
} from "@/lib/strapi/assemble-shared";

function toDocSummary(article: Article): DocSummary {
  const category = mapDocCategory(article.categories);
  const kind = mapDocKind(article.docKind);
  return {
    id: article.documentId,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt ?? "",
    excerptCompact: article.dekCompact ?? undefined,
    updatedDate: article.updatedDate ?? article.publishedDate ?? "",
    category,
    readingTime: article.readingTime ?? "",
    kind,
    href: `/docs/${article.slug}`,
  };
}

function toDocNavLink(summary: DocSummary): DocNavLink {
  return {
    slug: summary.slug,
    title: summary.title,
    category: summary.category,
    readingTime: summary.readingTime,
    href: summary.href,
  };
}

/** Documentation-surface articles → DocsIndexFixture. */
export function assembleDocsIndex(articles: Article[]): DocsIndexFixture {
  const docArticles = articles.filter((a) => a.surface === "documentation");
  const recentlyUpdated = [...docArticles]
    .map(toDocSummary)
    .sort((a, b) =>
      a.updatedDate < b.updatedDate ? 1 : a.updatedDate > b.updatedDate ? -1 : 0,
    );

  return {
    site: ATLAS_SITE,
    seo: {
      title: "Documentation",
      description:
        "Atlas engineering handbook — architecture, design system, frontend, testing, and publishing. Category-driven and distinct from the Articles journal.",
    },
    intro: {
      chapter: "DOCUMENTATION",
      title: "Engineering handbook.",
      dek: "Architecture, design system, frontend, testing, and publishing — as one readable handbook. Distinct from the chronological Articles journal.",
      dekCompact:
        "Architecture, design system, frontend, testing, and publishing. Distinct from Articles.",
    },
    search: {
      placeholder: "Search documentation…",
      shortcut: "⌘K",
    },
    categories: {
      chapter: "CATEGORIES",
      items: [
        {
          id: "architecture",
          eyebrow: "SECTION",
          title: "Architecture",
          description: "System boundaries, contracts, diagrams",
          href: "/docs/atlas-architecture",
        },
        {
          id: "design-system",
          eyebrow: "SECTION",
          title: "Design System",
          description: "Tokens, type, surfaces, motion",
          href: "/docs/design-system",
        },
        {
          id: "frontend",
          eyebrow: "SECTION",
          title: "Frontend",
          description: "App Router, fixtures, islands",
          href: "/docs/frontend-architecture",
        },
        {
          id: "testing",
          eyebrow: "SECTION",
          title: "Testing",
          description: "Playwright, a11y, CI proof",
          href: "/docs/testing-strategy",
        },
        {
          id: "publishing",
          eyebrow: "SECTION",
          title: "Publishing",
          description: "Editorial primitives and IA",
          href: "/docs/editorial-system",
        },
        {
          id: "articles",
          eyebrow: "SECTION",
          title: "Articles",
          description: "Chronological engineering journal",
          href: "/articles",
        },
        {
          id: "work",
          eyebrow: "SECTION",
          title: "Case Studies",
          description: "Evidence-based project records",
          href: "/work",
        },
        {
          id: "recent",
          eyebrow: "SECTION",
          title: "Recently Updated",
          description: "Changelog of handbook pages",
          href: "#recently-updated",
        },
      ],
    },
    recentlyUpdated: {
      chapter: "RECENTLY UPDATED",
      items:
        recentlyUpdated.length > 0 ? recentlyUpdated : docsByUpdatedDesc(),
    },
    progressNote: {
      chapter: "READING PROGRESS",
      body: "Per-document progress for long handbook entries. Shown on documentation templates; summarized here.",
    },
  };
}

export function assembleDocDetail(
  article: Article,
  allDocs: Article[],
): DocDetail {
  const summary = toDocSummary(article);
  const sections = mapDocPublishingSections(article.sections);
  const toc =
    sections.some((s) => s.chapter && s.title)
      ? buildDocToc(sections)
      : sections.map((s) => ({
          id: s.id,
          label: s.title || s.chapter,
          href: `#${s.id}`,
        }));

  const ordered = allDocs
    .filter((a) => a.surface === "documentation")
    .map(toDocSummary);
  const index = ordered.findIndex((d) => d.slug === article.slug);
  const previous = index > 0 ? toDocNavLink(ordered[index - 1]!) : null;
  const next =
    index >= 0 && index < ordered.length - 1
      ? toDocNavLink(ordered[index + 1]!)
      : null;

  const relatedItems = ordered
    .filter((d) => d.slug !== article.slug)
    .slice(0, 3)
    .map(toDocNavLink);

  const bridge = article.contactBridge;

  return {
    site: ATLAS_SITE,
    seo: {
      title: article.seo?.metaTitle ?? article.title,
      description: article.seo?.metaDescription ?? article.excerpt ?? "",
    },
    document: {
      id: article.documentId,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt ?? "",
      excerptCompact: article.dekCompact ?? undefined,
      updatedDate: summary.updatedDate,
      category: summary.category,
      readingTime: article.readingTime ?? "",
      kind: summary.kind,
      status: "Published",
      contentFormat: article.contentFormat ?? "blocks",
    },
    header: {
      chapter: article.headerChapter ?? "DOCUMENTATION",
      title: article.title,
      dek: article.dek ?? article.excerpt ?? "",
      dekCompact: article.dekCompact ?? undefined,
      meta:
        article.headerMeta.length > 0
          ? article.headerMeta
          : [
              { label: "UPDATED", value: summary.updatedDate },
              { label: "CATEGORY", value: summary.category },
              { label: "READING", value: article.readingTime ?? "" },
              { label: "KIND", value: summary.kind },
            ],
    },
    toc,
    sections,
    related: {
      chapter: "RELATED",
      title: "Continue in the handbook.",
      items: relatedItems,
    },
    prevNext: { previous, next },
    contact: {
      chapter: bridge?.chapter ?? "CONTACT",
      title: bridge?.title ?? "A conversation, not a pitch.",
      body: bridge?.body ?? "",
      bodyCompact: bridge?.bodyCompact ?? undefined,
      cta: bridge?.cta ?? { label: "Start a conversation", href: "/contact" },
      workLink: bridge?.workLink ?? { label: "or browse Work →", href: "/work" },
    },
  };
}

export { toDocSummary as docToSummary };
