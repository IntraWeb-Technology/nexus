import { assertSourceDirExists, paths, PERSONAL_DOMAIN } from "../config";
import { listMarkdownFiles, parseMarkdownFile } from "../lib/frontmatter";
import { normalizeSlug } from "../lib/slug";
import { deriveExcerpt } from "../lib/text";
import { isIntrawebSlug } from "../lib/siteAssignment";
import type { CaseStudyPlan, SiteKey, SourceCounts } from "../types";

interface CaseStudyFrontmatter {
  title?: string;
  slug?: string;
  excerpt?: string;
  status?: string; // PUBLISHED | DRAFT
  visibility?: string; // PUBLIC | PRIVATE
  publishedAt?: string;
  featured?: boolean;
  client?: string;
  industry?: string;
  duration?: string;
  teamSize?: string;
  technologies?: string[];
  challenges?: string;
  solution?: string;
  results?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  category?: string;
}

interface SplitBody {
  challenge?: string;
  solution?: string;
  results?: string;
  fullySplit: boolean;
}

const CHALLENGE_HEADING = /problem|challenge/i;
const SOLUTION_HEADING = /solution|approach|implementation|architecture/i;
const RESULTS_HEADING = /result|outcome|impact/i;

/** Best-effort split of an MDX body into Challenge/Solution/Results using
 * heading keywords. If we can't confidently find all three, the caller falls
 * back to the short frontmatter fields and flags the item for manual review. */
function splitCaseStudyBody(body: string): SplitBody {
  const headingRegex = /^#{1,3}\s+(.*)$/gm;
  const matches = [...body.matchAll(headingRegex)];
  if (!matches.length) return { fullySplit: false };

  const sections: Array<{ heading: string; start: number; end: number }> = matches.map(
    (m, i) => ({
      heading: m[1],
      start: m.index! + m[0].length,
      end: i + 1 < matches.length ? matches[i + 1].index! : body.length,
    })
  );

  const result: SplitBody = { fullySplit: false };
  for (const section of sections) {
    const text = body.slice(section.start, section.end).trim();
    if (!result.challenge && CHALLENGE_HEADING.test(section.heading)) result.challenge = text;
    else if (!result.solution && SOLUTION_HEADING.test(section.heading)) result.solution = text;
    else if (!result.results && RESULTS_HEADING.test(section.heading)) result.results = text;
  }
  result.fullySplit = Boolean(result.challenge && result.solution && result.results);
  return result;
}

export function extractCaseStudies(): { plans: CaseStudyPlan[]; counts: SourceCounts } {
  const dir = paths.legacyCaseStudiesDir;
  const counts: SourceCounts = { filesScanned: 0, itemsExtracted: 0, duplicatesSkipped: 0 };
  if (!assertSourceDirExists("Legacy case studies", dir)) return { plans: [], counts };

  const files = listMarkdownFiles(dir, [".mdx", ".md"]);
  counts.filesScanned = files.length;

  const seenSlugs = new Set<string>();
  const plans: CaseStudyPlan[] = [];

  for (const filePath of files) {
    const { data, content } = parseMarkdownFile<CaseStudyFrontmatter>(filePath);
    if (!data.title) continue;

    const slug = normalizeSlug(data.slug || data.title);
    if (seenSlugs.has(slug)) {
      counts.duplicatesSkipped += 1;
      continue; // legacy dir listing surfaced the same file multiple times
    }
    seenSlugs.add(slug);

    const split = splitCaseStudyBody(content);
    const reviewFlags: string[] = [];
    if (!split.fullySplit) reviewFlags.push("case-study-body-not-split");

    const sites: SiteKey[] = isIntrawebSlug(slug) ? ["personal", "intraweb"] : ["personal"];

    plans.push({
      title: data.title,
      slug,
      clientName: data.client,
      summary: data.excerpt || deriveExcerpt(content),
      challenge: split.challenge || data.challenges || "",
      solution: split.solution || data.solution || content,
      results: split.results || data.results || "",
      technologyNames: data.technologies ?? [],
      relatedProjectSlug: isIntrawebSlug(slug) ? "intraweb" : undefined,
      featuredImageUrl: data.coverImage,
      sites,
      seoMetaTitle: data.seoTitle || data.title,
      seoMetaDescription: data.seoDescription,
      canonicalUrl: `${PERSONAL_DOMAIN}/case-studies/${slug}`,
      shouldPublish: (data.status || "").toUpperCase() === "PUBLISHED",
      originalSource: "portfolio-mdx",
      sourceFile: filePath,
      reviewFlags,
    });
    counts.itemsExtracted += 1;
  }

  return { plans, counts };
}
