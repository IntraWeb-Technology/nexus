/**
 * Article fixture registry. UI pages resolve by slug; unknown → notFound().
 */

import type { ArticleDetail } from "@/content/article";
import { articlesIndexFixture } from "@/content/articles/index-fixture";
import { aiAssistedWorkflowsArticle } from "@/content/articles/ai-assisted-engineering-workflows";
import { lessonsFromBuildingAtlasArticle } from "@/content/articles/lessons-from-building-atlas";
import { migratingContentfulToStrapiArticle } from "@/content/articles/migrating-from-contentful-to-strapi";
import { playwrightAtScaleArticle } from "@/content/articles/playwright-at-scale";
import { articleSummaries } from "@/content/articles/summaries";
import { turborepoBuildOptimizationArticle } from "@/content/articles/turborepo-build-optimization";
import { whyWeChoseRscArticle } from "@/content/articles/why-we-chose-react-server-components";

export { articlesIndexFixture, articleSummaries };

export const articleBySlug: Record<string, ArticleDetail> = {
  "why-we-chose-react-server-components": whyWeChoseRscArticle,
  "playwright-at-scale": playwrightAtScaleArticle,
  "lessons-from-building-atlas": lessonsFromBuildingAtlasArticle,
  "migrating-from-contentful-to-strapi": migratingContentfulToStrapiArticle,
  "ai-assisted-engineering-workflows": aiAssistedWorkflowsArticle,
  "turborepo-build-optimization": turborepoBuildOptimizationArticle,
};

export function getArticle(slug: string): ArticleDetail | undefined {
  return articleBySlug[slug];
}
