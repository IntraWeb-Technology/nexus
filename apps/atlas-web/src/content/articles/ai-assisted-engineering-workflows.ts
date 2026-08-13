/**
 * Fixture B — shorter engineering / editorial article.
 * Proves concise writing without empty stubs or over-designed chrome.
 */

import {
  ATLAS_DEFAULT_AUTHOR,
  type ArticleDetail,
} from "@/content/article";
import {
  articleSummaries,
  toNavLink,
} from "@/content/articles/summaries";

const self = articleSummaries.find(
  (a) => a.slug === "ai-assisted-engineering-workflows",
)!;
const featured = articleSummaries[0]!;
const migrating = articleSummaries[3]!;
const turborepo = articleSummaries[5]!;
const lessons = articleSummaries[2]!;

export const aiAssistedWorkflowsArticle: ArticleDetail = {
  site: { key: "personal", name: "Atlas" },
  seo: {
    title: self.title,
    description: self.excerpt,
  },
  article: {
    id: self.id,
    slug: self.slug,
    title: self.title,
    excerpt: self.excerpt,
    publishedDate: self.publishedDate,
    topic: self.topic,
    readingTime: self.readingTime,
    type: self.type,
    status: "Published",
    featured: false,
    contentFormat: "blocks",
  },
  header: {
    chapter: "ARTICLE",
    title: self.title,
    dek: self.excerpt,
    author: ATLAS_DEFAULT_AUTHOR,
    meta: [
      { label: "DATE", value: self.publishedDate },
      { label: "TOPIC", value: self.topic },
      { label: "READING", value: self.readingTime },
    ],
  },
  toc: [
    { id: "bound", label: "01 Bound the task", href: "#bound" },
    { id: "review", label: "02 Keep review human", href: "#review" },
  ],
  sections: [
    {
      id: "bound",
      chapter: "01 · BOUND THE TASK",
      title: "Agents draft. Humans decide.",
      paragraphs: [
        "AI assistance is useful when the task is bounded: scaffolding tests, renaming across a package, summarizing a diff. It invents when the task is architectural — inventing packages, inventing registries, inventing tone.",
        "Atlas keeps the acceptance criteria outside the model. Fixtures, Figma, and the Build Manifest remain the contract. The agent proposes; the publication still has to be true.",
      ],
      paragraphsTablet: [
        "AI assistance helps when the task is bounded. It invents when the task is architectural.",
        "Fixtures, Figma, and the Build Manifest remain the contract. The agent proposes; the publication still has to be true.",
      ],
      callout: {
        variant: "warning",
        title: "Do not outsource judgment",
        body: "If an agent cannot cite the Manifest or an approved composition, the suggestion is a draft — not a decision.",
        bodyCompact:
          "If an agent cannot cite the Manifest or an approved composition, treat it as a draft.",
      },
    },
    {
      id: "review",
      chapter: "02 · KEEP REVIEW HUMAN",
      title: "Review stays on the critical path.",
      paragraphs: [
        "Short notes like this one still need editorial discipline: one claim, one tradeoff, and a clear place in the chronological stream. Documentation owns procedures. Articles owns the decision record and the working note.",
      ],
      paragraphsTablet: [
        "Short notes still need discipline: one claim, one tradeoff, and a clear place in the chronological stream.",
      ],
    },
  ],
  related: {
    chapter: "RELATED",
    title: "Continue in the same register.",
    items: [toNavLink(featured), toNavLink(lessons), toNavLink(turborepo)],
  },
  prevNext: {
    previous: toNavLink(turborepo),
    next: toNavLink(migrating),
  },
  contact: {
    chapter: "CONTACT",
    title: "A conversation, not a pitch.",
    body: "Qualified questions about architecture, delivery, or Atlas systems. Expectation-setting over funnel language.",
    bodyCompact:
      "Qualified questions about architecture, delivery, or Atlas systems.",
    cta: { label: "Start a conversation", href: "/contact" },
    workLink: { label: "or browse Work →", href: "/work" },
  },
};
