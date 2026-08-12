/**
 * Helper — build a concise article detail from a summary.
 * Full publishing primitives live on the featured RSC fixture; others stay readable stubs.
 */

import type { ArticleDetail, ArticleSummary } from "@/content/article";
import {
  articleSummaries,
  toNavLink,
} from "@/content/articles/summaries";

const contact = {
  chapter: "CONTACT",
  title: "A conversation, not a pitch.",
  body: "Qualified questions about architecture, delivery, or Atlas systems. Expectation-setting over funnel language.",
  bodyCompact:
    "Qualified questions about architecture, delivery, or Atlas systems.",
  cta: { label: "Start a conversation", href: "/contact" as const },
  workLink: { label: "or browse Work →", href: "/work" as const },
};

function neighbors(slug: string) {
  const index = articleSummaries.findIndex((a) => a.slug === slug);
  const previous =
    index >= 0 && index < articleSummaries.length - 1
      ? toNavLink(articleSummaries[index + 1]!)
      : null;
  const next = index > 0 ? toNavLink(articleSummaries[index - 1]!) : null;
  return { previous, next };
}

function relatedFor(summary: ArticleSummary) {
  return articleSummaries
    .filter((a) => a.slug !== summary.slug)
    .slice(0, 3)
    .map(toNavLink);
}

export function buildArticleDetail(
  summary: ArticleSummary,
  body: {
    title: string;
    paragraphs: string[];
  },
): ArticleDetail {
  const { previous, next } = neighbors(summary.slug);

  return {
    site: { key: "personal", name: "Atlas" },
    seo: {
      title: summary.title,
      description: summary.excerpt,
    },
    article: {
      id: summary.id,
      slug: summary.slug,
      title: summary.title,
      excerpt: summary.excerpt,
      excerptCompact: summary.excerptCompact,
      publishedDate: summary.publishedDate,
      topic: summary.topic,
      readingTime: summary.readingTime,
      type: summary.type,
      status: "Published",
      featured: summary.featured,
      contentFormat: "blocks",
    },
    header: {
      chapter: "ARTICLE",
      title: summary.title,
      dek: summary.excerpt,
      dekCompact: summary.excerptCompact,
      meta: [
        { label: "DATE", value: summary.publishedDate },
        { label: "TOPIC", value: summary.topic },
        { label: "READING", value: summary.readingTime },
        { label: "STATUS", value: "Published" },
      ],
    },
    toc: [
      { id: "context", label: "01 Context", href: "#context" },
      { id: "notes", label: "02 Notes", href: "#notes" },
    ],
    sections: [
      {
        id: "context",
        chapter: "01 · CONTEXT",
        title: body.title,
        paragraphs: body.paragraphs,
      },
      {
        id: "notes",
        chapter: "02 · NOTES",
        title: "Keep Articles distinct from Documentation.",
        paragraphs: [
          "This note belongs in the chronological engineering stream. Procedures, ADRs, and handbook categories remain Documentation — same editorial primitives, separate information architecture.",
        ],
      },
    ],
    related: {
      chapter: "RELATED",
      title: "Continue in the same register.",
      items: relatedFor(summary),
    },
    prevNext: { previous, next },
    contact,
  };
}
