import type { Article } from "@repo/strapi-client";
import {
  ATLAS_DEFAULT_AUTHOR,
  type ArticleAuthor,
  type ArticleDetail,
  type ArticleFeaturedMedia,
  type ArticleNavLink,
  type ArticlesIndexFixture,
  type ArticleSummary,
} from "@/content/article";
import {
  ATLAS_SITE,
  buildArticleToc,
  mapArticleTopic,
  mapEditorialType,
  mapPublishingSections,
} from "@/lib/strapi/assemble-shared";

function toAuthor(article: Article): ArticleAuthor {
  const name = article.author?.name?.trim() || ATLAS_DEFAULT_AUTHOR.name;
  const portraitSrc =
    article.author?.avatar?.url || ATLAS_DEFAULT_AUTHOR.portraitSrc;
  const portraitAlt =
    article.author?.avatar?.alternativeText?.trim() ||
    `Portrait of ${name}`;
  return { name, portraitSrc, portraitAlt };
}

function toFeaturedMedia(
  article: Article,
): ArticleFeaturedMedia | undefined {
  if (!article.featuredImage?.url) return undefined;
  return {
    src: article.featuredImage.url,
    alt:
      article.featuredImage.alternativeText?.trim() ||
      `${article.title} featured image`,
    width: article.featuredImage.width ?? undefined,
    height: article.featuredImage.height ?? undefined,
  };
}

function withoutStatusMeta(
  items: Array<{ label: string; value: string }>,
) {
  return items.filter((item) => item.label.toUpperCase() !== "STATUS");
}

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
  const featuredSource =
    articles.find((a) => a.slug === featuredArticle.slug) ?? articles[0]!;
  const featuredImage = toFeaturedMedia(featuredSource) ?? {
    src: "/images/articles/featured-rsc.png",
    alt: `${featuredArticle.title} featured image`,
    width: 1420,
    height: 840,
  };

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
      author: toAuthor(featuredSource),
      image: featuredImage,
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
      cta: { label: "Start a conversation", href: "/contact" },
      workLink: { label: "or browse Work →", href: "/work" },
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
  const defaultMeta = [
    { label: "DATE", value: article.publishedDate ?? "" },
    { label: "TOPIC", value: summary.topic },
    { label: "READING", value: article.readingTime ?? "" },
  ];

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
      author: toAuthor(article),
      meta: withoutStatusMeta(
        article.headerMeta.length > 0 ? article.headerMeta : defaultMeta,
      ),
      featuredImage: toFeaturedMedia(article),
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
      workLink: bridge?.workLink ?? {
        label: "or browse Work →",
        href: "/work",
      },
    },
  };
}

export { toSummary as articleToSummary };
