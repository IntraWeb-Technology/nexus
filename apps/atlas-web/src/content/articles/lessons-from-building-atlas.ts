import { buildArticleDetail } from "@/content/articles/build-detail";
import { articleSummaries } from "@/content/articles/summaries";

const summary = articleSummaries.find(
  (a) => a.slug === "lessons-from-building-atlas",
)!;

export const lessonsFromBuildingAtlasArticle = buildArticleDetail(summary, {
  title: "What held up — and what we rewrote.",
  paragraphs: [
    "Shipping Atlas as an editorial engineering publication forced hard cuts: frozen ownership boundaries, fixture-first routes, and a design system that refuses marketing chrome. The pieces that held were the ones with a second consumer and a named contract.",
    "What we rewrote was anything that looked clever in week one and opaque in week six — generic section registries, speculative adapters, and content models that tried to design the page from the CMS.",
  ],
});
