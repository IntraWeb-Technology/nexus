/**
 * Helper — shared contact + neighbor wiring for documentation details.
 */

import type { DocDetail, DocSummary } from "@/content/doc";
import {
  docSummaries,
  toDocNavLink,
} from "@/content/docs/summaries";

export const docContact = {
  chapter: "CONTACT",
  title: "A conversation, not a pitch.",
  body: "Qualified questions about the handbook, architecture, or Atlas systems. Expectation-setting over funnel language.",
  bodyCompact:
    "Qualified questions about the handbook, architecture, or Atlas systems.",
  cta: { label: "Start a conversation", href: "/contact" as const },
  workLink: { label: "or browse Work →", href: "/work" as const },
};

export function neighbors(slug: string) {
  const index = docSummaries.findIndex((d) => d.slug === slug);
  const previous =
    index > 0 ? toDocNavLink(docSummaries[index - 1]!) : null;
  const next =
    index >= 0 && index < docSummaries.length - 1
      ? toDocNavLink(docSummaries[index + 1]!)
      : null;
  return { previous, next };
}

export function relatedFor(summary: DocSummary) {
  return docSummaries
    .filter((d) => d.slug !== summary.slug)
    .slice(0, 3)
    .map(toDocNavLink);
}

export function docHeaderMeta(summary: DocSummary) {
  return [
    { label: "UPDATED", value: summary.updatedDate },
    { label: "CATEGORY", value: summary.category },
    { label: "READING", value: summary.readingTime },
    { label: "STATUS", value: "Published" },
  ];
}

export function baseDocShell(
  summary: DocSummary,
  seo?: { title?: string; description?: string },
): Pick<
  DocDetail,
  "site" | "seo" | "document" | "header" | "related" | "prevNext" | "contact"
> {
  const { previous, next } = neighbors(summary.slug);
  return {
    site: { key: "personal", name: "Atlas" },
    seo: {
      title: seo?.title ?? summary.title,
      description: seo?.description ?? summary.excerpt,
    },
    document: {
      id: summary.id,
      slug: summary.slug,
      title: summary.title,
      excerpt: summary.excerpt,
      excerptCompact: summary.excerptCompact,
      updatedDate: summary.updatedDate,
      category: summary.category,
      readingTime: summary.readingTime,
      kind: summary.kind,
      status: "Published",
      contentFormat: "blocks",
    },
    header: {
      chapter: "DOCUMENTATION",
      title: summary.title,
      dek: summary.excerpt,
      dekCompact: summary.excerptCompact,
      meta: docHeaderMeta(summary),
    },
    related: {
      chapter: "RELATED",
      title: "Continue in the handbook.",
      items: relatedFor(summary),
    },
    prevNext: { previous, next },
    contact: docContact,
  };
}
