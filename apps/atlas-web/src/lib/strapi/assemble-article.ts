import type { Article } from "@repo/strapi-client";
import type {
  ArticleDetail,
  ArticleNavLink,
  ArticlesIndexFixture,
  ArticleSummary,
} from "@/content/article";
import {
  ATLAS_SITE,
  buildArticleToc,
  mapArticleTopic,
  mapEditorialType,
  mapPublishingSections,
} from "@/lib/strapi/assemble-shared";

function toSummary(article: Article): ArticleSummary {
  const topic = mapArticleTopic(article.categories);
  const type = mapEditorialType(article.editorialType);
  return {
    id: article.documentId,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt ?? "",
    excerptCompact: article.dekCompact ?? undefined,
    publishedDate: article.publishedDate ?? "",
    topic,
    readingTime: article.readingTime ?? "",
    type,
    featured: article.featured,
    href: `/articles/${article.slug}`,
  };
}

function toNavLink(summary: ArticleSummary): ArticleNavLink {
  return {
    slug: summary.slug,
    title: summary.title,
    topic: summary.topic,
    readingTime: summary.readingTime,
    href: summary.href,
  };
}

/** Writing-surface articles → ArticlesIndexFixture. */
export function assembleArticlesIndex(articles: Article[]): ArticlesIndexFixture {
  const summaries = articles
    .filter((a) => a.surface === "writing")
    .map(toSummary);
  const featuredArticle =
    summaries.find((a) => a.featured) ?? summaries[0]!;
  const listArticles = summaries.filter((a) => !a.featured);

  return {
    site: ATLAS_SITE,
    seo: {
      title: "Articles",
      description:
        "Engineering writing — chronological notes on architecture, delivery, tooling, and production decisions. Distinct from the Documentation handbook.",
    },
    intro: {
      chapter: "ARTICLES",
      title: "Engineering writing.",
      dek: "Chronological notes on architecture, delivery, tooling, and the decisions that survive production. Distinct from the Documentation handbook.",
      dekCompact:
        "Chronological notes on architecture, delivery, tooling, and production decisions. Distinct from Documentation.",
    },
    topics: {
      label: "TOPICS",
      items: [
        { id: "all", label: "All", active: true },
        { id: "architecture", label: "Architecture" },
        { id: "delivery", label: "Delivery" },
        { id: "platform", label: "Platform" },
        { id: "testing", label: "Testing" },
        { id: "tooling", label: "Tooling" },
      ],
    },
    featured: {
      chapter: "FEATURED",
      article: featuredArticle,
      ctaLabel: "Read article →",
    },
    list: {
      chapter: "ALL ARTICLES",
      headline: "Newest first.",
      articles: listArticles,
    },
    cue: {
      chapter: "CONTINUE",
      title: "Prefer a conversation over a list.",
      body: "For qualified questions about systems, delivery, or Atlas itself — use Contact. Documentation remains the handbook for procedures and ADRs.",
      bodyCompact:
        "For qualified questions — use Contact. Documentation remains the handbook.",
      links: [
        { label: "Contact →", href: "/contact" },
        { label: "Work →", href: "/work" },
      ],
    },
  };
}

export function assembleArticleDetail(
  article: Article,
  allWriting: Article[],
): ArticleDetail {
  const summary = toSummary(article);
  const sections = mapPublishingSections(article.sections);
  const toc =
    sections.some((s) => s.chapter && s.title)
      ? buildArticleToc(sections)
      : sections.map((s) => ({
          id: s.id,
          label: s.title || s.chapter,
          href: `#${s.id}`,
        }));

  const ordered = allWriting
    .filter((a) => a.surface === "writing")
    .map(toSummary);
  const index = ordered.findIndex((a) => a.slug === article.slug);
  const previous = index > 0 ? toNavLink(ordered[index - 1]!) : null;
  const next =
    index >= 0 && index < ordered.length - 1
      ? toNavLink(ordered[index + 1]!)
      : null;

  const relatedItems = ordered
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3)
    .map(toNavLink);

  const bridge = article.contactBridge;

  return {
    site: ATLAS_SITE,
    seo: {
      title: article.seo?.metaTitle ?? article.title,
      description: article.seo?.metaDescription ?? article.excerpt ?? "",
    },
    article: {
      id: article.documentId,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt ?? "",
      excerptCompact: article.dekCompact ?? undefined,
      publishedDate: article.publishedDate ?? "",
      topic: summary.topic,
      readingTime: article.readingTime ?? "",
      type: summary.type,
      status: "Published",
      featured: article.featured,
      contentFormat: article.contentFormat ?? "blocks",
    },
    header: {
      chapter: article.headerChapter ?? "ARTICLE",
      title: article.title,
      dek: article.dek ?? article.excerpt ?? "",
      dekCompact: article.dekCompact ?? undefined,
      meta:
        article.headerMeta.length > 0
          ? article.headerMeta
          : [
              { label: "DATE", value: article.publishedDate ?? "" },
              { label: "TOPIC", value: summary.topic },
              { label: "READING", value: article.readingTime ?? "" },
              { label: "STATUS", value: "Published" },
            ],
    },
    toc,
    sections,
    related: {
      chapter: "RELATED",
      title: "Continue in the same register.",
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

export { toSummary as articleToSummary };
