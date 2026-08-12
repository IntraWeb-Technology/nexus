import { buildArticleDetail } from "@/content/articles/build-detail";
import { articleSummaries } from "@/content/articles/summaries";

const summary = articleSummaries.find(
  (a) => a.slug === "migrating-from-contentful-to-strapi",
)!;

export const migratingContentfulToStrapiArticle = buildArticleDetail(summary, {
  title: "Boundaries before field mapping.",
  paragraphs: [
    "Moving from Contentful to Strapi was not a field-for-field port. Atlas needed site isolation, draft safety, and a domain model the UI could consume without importing CMS DTOs into sections.",
    "The migration order mattered: freeze the editorial routes on fixtures, extend the shared article schema carefully, then map — never the reverse.",
  ],
});
