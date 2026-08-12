import { buildArticleDetail } from "@/content/articles/build-detail";
import { articleSummaries } from "@/content/articles/summaries";

const summary = articleSummaries.find((a) => a.slug === "playwright-at-scale")!;

export const playwrightAtScaleArticle = buildArticleDetail(summary, {
  title: "Fixtures before assertions.",
  paragraphs: [
    "Playwright only pays off when the suite encodes product truth. Atlas treats fixtures as the contract: routes render from typed content, assertions name the editorial landmarks, and CI artifacts must prove the journey before a release is called green.",
    "Flake triage starts with isolation — shared auth state, network boundaries, and screenshot baselines that match the 1440 / 768 / 390 compositions — not with retrying until the noise goes quiet.",
  ],
});
