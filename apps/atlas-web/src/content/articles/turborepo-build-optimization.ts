import { buildArticleDetail } from "@/content/articles/build-detail";
import { articleSummaries } from "@/content/articles/summaries";

const summary = articleSummaries.find(
  (a) => a.slug === "turborepo-build-optimization",
)!;

export const turborepoBuildOptimizationArticle = buildArticleDetail(summary, {
  title: "Affected graphs stay honest.",
  paragraphs: [
    "Turborepo only helps when the graph tells the truth. Atlas keeps package boundaries real, remote cache disciplined, and CI filtered to affected work — an Atlas change must not force unrelated apps to build.",
    "Optimization without honesty is theater. Remote cache hits that skip required checks are not wins.",
  ],
});
