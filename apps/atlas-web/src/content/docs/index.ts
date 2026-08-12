/**
 * Documentation fixture registry. UI pages resolve by slug; unknown → notFound().
 */

import type { DocDetail } from "@/content/doc";
import { atlasArchitectureDoc } from "@/content/docs/atlas-architecture";
import { designSystemDoc } from "@/content/docs/design-system";
import { editorialSystemDoc } from "@/content/docs/editorial-system";
import { frontendArchitectureDoc } from "@/content/docs/frontend-architecture";
import { docsIndexFixture } from "@/content/docs/index-fixture";
import { docSummaries } from "@/content/docs/summaries";
import { testingStrategyDoc } from "@/content/docs/testing-strategy";

export { docsIndexFixture, docSummaries };

export const docBySlug: Record<string, DocDetail> = {
  "atlas-architecture": atlasArchitectureDoc,
  "editorial-system": editorialSystemDoc,
  "design-system": designSystemDoc,
  "frontend-architecture": frontendArchitectureDoc,
  "testing-strategy": testingStrategyDoc,
};

export function getDoc(slug: string): DocDetail | undefined {
  return docBySlug[slug];
}

/** Resolve catch-all segments to a single fixture slug for v1. */
export function slugFromParams(slug: string[] | undefined): string | null {
  if (!slug || slug.length === 0) return null;
  return slug.join("/");
}
