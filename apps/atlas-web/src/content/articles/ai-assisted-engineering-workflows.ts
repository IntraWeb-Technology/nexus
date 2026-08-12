import { buildArticleDetail } from "@/content/articles/build-detail";
import { articleSummaries } from "@/content/articles/summaries";

const summary = articleSummaries.find(
  (a) => a.slug === "ai-assisted-engineering-workflows",
)!;

export const aiAssistedWorkflowsArticle = buildArticleDetail(summary, {
  title: "Agents draft. Humans decide.",
  paragraphs: [
    "AI assistance is useful when the task is bounded: scaffolding tests, renaming across a package, summarizing a diff. It invents when the task is architectural — inventing packages, inventing registries, inventing tone.",
    "Atlas keeps review human. Agents propose; fixtures, Figma, and the Build Manifest remain the acceptance criteria.",
  ],
});
