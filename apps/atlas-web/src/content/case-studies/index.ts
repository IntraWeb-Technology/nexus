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
