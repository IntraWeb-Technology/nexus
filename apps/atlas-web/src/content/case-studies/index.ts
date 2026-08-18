/**
 * Case study fixture registry. Add entries here when a second study ships.
 * UI pages resolve by slug; unknown → notFound().
 */

import type { CaseStudyFixture } from "@/content/case-study";
import { portfolioOsCaseStudy } from "@/content/case-studies/portfolio-os";

export const caseStudyBySlug: Record<string, CaseStudyFixture> = {
  "portfolio-os": portfolioOsCaseStudy,
};

export function getCaseStudy(slug: string): CaseStudyFixture | undefined {
  return caseStudyBySlug[slug];
}

/** Slugs with an implemented `/work/[slug]` case-study route. */
export function listCaseStudySlugs(): string[] {
  return Object.keys(caseStudyBySlug);
}

/** Returns `/work/[slug]` only when a case study is implemented. */
export function caseStudyHrefForSlug(slug: string): string | undefined {
  return slug in caseStudyBySlug ? `/work/${slug}` : undefined;
}
