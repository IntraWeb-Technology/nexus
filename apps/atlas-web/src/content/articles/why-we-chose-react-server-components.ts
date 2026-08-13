/**
 * Featured article fixture — proves editorial publishing primitives for M5/M6.
 */

import {
  ATLAS_DEFAULT_AUTHOR,
  type ArticleDetail,
} from "@/content/article";
import {
  articleSummaries,
  toNavLink,
} from "@/content/articles/summaries";

const self = articleSummaries[0]!;
const playwright = articleSummaries[1]!;
const lessons = articleSummaries[2]!;
const migrating = articleSummaries[3]!;
const turborepo = articleSummaries[5]!;

export const whyWeChoseRscArticle: ArticleDetail = {
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
    featured: true,
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
    featuredImage: {
      src: "/images/articles/featured-rsc.png",
      alt: "Network infrastructure cables — featured article atmosphere",
      caption:
        "Featured image · Network infrastructure sets the atmosphere; diagrams stay in the article body.",
      width: 1420,
      height: 840,
    },
  },
  toc: [
    { id: "context", label: "01 Context", href: "#context" },
    { id: "decision", label: "02 Decision", href: "#decision" },
    { id: "evidence", label: "03 Evidence", href: "#evidence" },
    { id: "what-followed", label: "04 What followed", href: "#what-followed" },
  ],
  sections: [
    {
      id: "context",
      chapter: "01 · CONTEXT",
      title: "The publication needed a server-first reading path.",
      paragraphs: [
        "Atlas is an engineering publication, not a marketing site. The homepage, Work index, and case studies must ship as readable documents with inspectable evidence — not client-hydrated brochure shells. We needed a rendering model that kept prose fast, kept data boundaries explicit, and still allowed interactive islands where the product required them.",
        "React Server Components were evaluated against a conventional CSR/SSR mix. The question was not novelty. It was whether the default composition model matched how Atlas content is authored, cached, and verified.",
      ],
      paragraphsTablet: [
        "Atlas is an engineering publication, not a marketing site. Routes must ship as readable documents with inspectable evidence — not client-hydrated brochure shells.",
        "RSC was evaluated against a conventional CSR/SSR mix. The question was whether the default composition model matched how Atlas content is authored, cached, and verified.",
      ],
    },
    {
      id: "figure-rsc",
      chapter: "",
      title: "",
      paragraphs: [],
      figure: {
        alt: "Request path diagram for an Atlas article — server composition, cache tags, streamed HTML",
        label: "FIG · request → RSC tree → cache tags → streamed HTML",
        labelCompact: "FIG · request → RSC → cache → HTML",
        caption:
          "Fig. 1 — Request path for an Atlas article: server composition, tagged cache entries, and the client islands that remain interactive.",
        captionCompact:
          "Fig. 1 — Request path for an Atlas article: server composition, tagged cache entries, and remaining client islands.",
        composed: "rsc-request-path",
      },
    },
    {
      id: "decision",
      chapter: "02 · DECISION",
      title: "Adopt RSC as the default for editorial routes.",
      paragraphs: [
        "Editorial routes render on the server by default. Client components are introduced only for navigation chrome that must measure scroll, contact forms, and other explicit interaction. Content fixtures remain serializable. The case-study and article templates share the same reading measure.",
      ],
      paragraphsTablet: [
        "Editorial routes render on the server by default. Client components are introduced only for scroll measurement, forms, and other explicit interaction. Fixtures stay serializable.",
      ],
      callout: {
        variant: "tradeoff",
        title: "What we accepted",
        body: "RSC reduces accidental client state, but it tightens the contract between data loaders and UI composition. Team fluency and fixture discipline matter more than framework slogans.",
        bodyCompact:
          "RSC reduces accidental client state, but tightens the contract between data loaders and UI composition.",
      },
    },
    {
      id: "evidence",
      chapter: "03 · EVIDENCE",
      title: "The template stays serializable.",
      paragraphs: [
        "Article pages load fixture (and later CMS) data on the server. Interactive chrome stays narrow. The code below is the shape we keep honest in review — not a framework tutorial.",
      ],
      paragraphsTablet: [
        "Article pages load fixture data on the server. Interactive chrome stays narrow.",
      ],
      code: {
        language: "TYPESCRIPT",
        caption: "Listing 1 — Article route composition (fixture-backed).",
        captionCompact: "Listing 1 — Article route composition.",
        code: `export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug)
  return <ArticleTemplate article={article} />
}`,
      },
      terminal: {
        caption: "Listing 2 — Affected CI proof for the Articles surface.",
        captionCompact: "Listing 2 — Affected CI proof.",
        lines: [
          "> pnpm --filter atlas-web test:e2e -- articles",
          "✓  articles.index.spec.ts",
          "✓  articles.detail.spec.ts",
          "✓  8 passed",
        ],
      },
    },
    {
      id: "what-followed",
      chapter: "04 · WHAT FOLLOWED",
      title: "Shared primitives, separate IA.",
      paragraphs: [
        "Articles and Documentation can share Callout, CodeBlock, Figure, TerminalBlock, EvidenceBlock, and table primitives. They must not share information architecture. Articles remains chronological engineering writing. Documentation remains the handbook of categories, procedures, and ADRs.",
        "Related reading and previous/next navigation stay derived from the fixture registry — not hardcoded presentation. Dead links are treated as defects. Cache tags stay explicit in the loader contract so invalidation remains inspectable.",
      ],
      paragraphsTablet: [
        "Articles and Documentation can share publishing primitives — not information architecture.",
        "Related and previous/next stay fixture-derived. Cache tags stay explicit in the loader contract.",
      ],
      code: {
        language: "YAML",
        caption:
          "Listing 3 — Cache tags kept explicit in the article loader contract.",
        captionCompact: "Listing 3 — Explicit cache tags for article loaders.",
        code: `article:
  tags:
    - site:personal
    - collection:article
    - slug:why-we-chose-react-server-components
  revalidate: false`,
      },
    },
  ],
  related: {
    chapter: "RELATED",
    title: "Continue in the same register.",
    items: [toNavLink(lessons), toNavLink(migrating), toNavLink(turborepo)],
  },
  prevNext: {
    previous: toNavLink(playwright),
    next: toNavLink(lessons),
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
