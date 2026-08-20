import type { Article } from "@repo/strapi-client";
import type {
  DocDetail,
  DocNavLink,
  DocsIndexFixture,
  DocSummary,
} from "@/content/doc";
import { formatArchiveDate } from "@/content/articles/summaries";
import { docsByUpdatedDesc } from "@/content/docs/summaries";
import {
  ATLAS_SITE,
  buildDocToc,
  mapDocCategory,
  mapDocKind,
  mapDocPublishingSections,
} from "@/lib/strapi/assemble-shared";
import {
  buildHandbookCategoryItems,
  DOCS_CROSS_LINK_ITEMS,
} from "@/lib/strapi/docs-index-categories";

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
  const handbookSummaries =
    recentlyUpdated.length > 0 ? recentlyUpdated : docsByUpdatedDesc();

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
        ...buildHandbookCategoryItems(handbookSummaries),
        ...DOCS_CROSS_LINK_ITEMS,
      ],
    },
    recentlyUpdated: {
      chapter: "RECENTLY UPDATED",
      items: handbookSummaries,
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
          ? article.headerMeta.map((item) =>
              item.label.toUpperCase() === "UPDATED"
                ? { ...item, value: formatArchiveDate(item.value) || item.value }
                : item,
            )
          : [
              {
                label: "UPDATED",
                value: formatArchiveDate(summary.updatedDate) || summary.updatedDate,
              },
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
