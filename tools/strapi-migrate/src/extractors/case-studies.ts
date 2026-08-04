import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { assignSites, normalizeDate, normalizeSlug } from "../normalize.js";
import type { NormalizedRecord, ReviewItem } from "../types.js";

export interface CaseStudyExtractResult {
  records: NormalizedRecord[];
  reviewQueue: ReviewItem[];
}

function listMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => path.join(dir, f))
    .sort();
}

export function extractCaseStudies(caseStudiesDir: string): CaseStudyExtractResult {
  const reviewQueue: ReviewItem[] = [];
  const records: NormalizedRecord[] = [];

  for (const filePath of listMdxFiles(caseStudiesDir)) {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);

    const slug = normalizeSlug(
      String(data.slug ?? path.basename(filePath, path.extname(filePath))),
    );
    const title = String(data.title ?? slug);
    const client = data.client != null ? String(data.client) : undefined;

    const assignment = assignSites({
      type: "case-study",
      slug,
      title,
      id: slug,
      client,
    });

    if (assignment.ambiguous) {
      reviewQueue.push({
        reason: "case-study-ambiguous-site",
        type: "case-study",
        slug,
        title,
        sourcePath: filePath,
        suggestedSiteKeys: assignment.siteKeys,
        notes: assignment.reason,
      });
    }

    const tags = Array.isArray(data.tags)
      ? data.tags.map((t) => String(t))
      : undefined;
    const technologies = Array.isArray(data.technologies)
      ? data.technologies.map((t) => String(t))
      : undefined;

    records.push({
      type: "case-study",
      upsertKey: `case-study:slug:${slug}`,
      slug,
      title,
      siteKeys: assignment.siteKeys,
      publishedAt: normalizeDate(data.publishedAt),
      excerpt: data.excerpt != null ? String(data.excerpt) : undefined,
      body: content.trim(),
      coverUrl: data.coverImage != null ? String(data.coverImage) : undefined,
      tags,
      technologies,
      status: data.status != null ? String(data.status) : undefined,
      sourcePath: filePath,
      sourceKind: "portfolio-case-study",
      payload: {
        visibility: data.visibility,
        featured: data.featured,
        client,
        industry: data.industry,
        duration: data.duration,
        teamSize: data.teamSize,
        challenges: data.challenges,
        solution: data.solution,
        results: data.results,
        metrics: data.metrics,
        lessonsLearned: data.lessonsLearned,
        nextSteps: data.nextSteps,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        category: data.category,
        author: data.author,
      },
    });
  }

  return { records, reviewQueue };
}
