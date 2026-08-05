import { assertSourceDirExists, paths, HASHNODE_HOST } from "../config";
import { listMarkdownFiles, parseMarkdownFile } from "../lib/frontmatter";
import { normalizeSlug } from "../lib/slug";
import { normalizeDate } from "../lib/dates";
import { deriveExcerpt, splitTagString, stripHashnodeLeadingSlash } from "../lib/text";
import { detectStrongIntrawebMarketing } from "../lib/siteAssignment";
import type { ArticlePlan, SourceCounts } from "../types";

interface HashnodeFrontmatter {
  title?: string;
  seoTitle?: string;
  seoDescription?: string;
  datePublished?: string;
  cuid?: string;
  slug?: string;
  cover?: string;
  ogImage?: string;
  tags?: string;
}

export function extractHashnodeArticles(): { plans: ArticlePlan[]; counts: SourceCounts } {
  const dir = paths.hashnodeMirrorDir;
  const counts: SourceCounts = { filesScanned: 0, itemsExtracted: 0, duplicatesSkipped: 0 };
  if (!assertSourceDirExists("Hashnode mirror", dir)) return { plans: [], counts };

  const files = listMarkdownFiles(dir, [".md"]);
  counts.filesScanned = files.length;

  const plans: ArticlePlan[] = [];
  for (const filePath of files) {
    const parsed = parseMarkdownFile<HashnodeFrontmatter>(filePath);
    const data = parsed.data;
    const content = stripHashnodeLeadingSlash(parsed.content);
    if (!data.title || !content) {
      // Missing required fields — surfaced as a validation issue by the validator, not here.
      continue;
    }

    const slug = normalizeSlug(data.slug || data.title);
    const reviewFlags: string[] = [];
    if (detectStrongIntrawebMarketing(data.title, content)) {
      reviewFlags.push("possible-intraweb-marketing-mention");
    }

    plans.push({
      title: data.title,
      slug,
      excerpt: data.seoDescription || deriveExcerpt(content),
      body: content,
      contentFormat: "markdown",
      sites: ["personal"],
      tagSlugs: splitTagString(data.tags),
      authorName: "John Schibelli",
      featuredImageUrl: data.cover,
      ogImageUrl: data.ogImage,
      originalSource: "hashnode",
      originalUrl: `https://${HASHNODE_HOST}/${slug}`,
      canonicalUrl: `https://${HASHNODE_HOST}/${slug}`,
      hashnodeId: data.cuid,
      hashnodePublication: HASHNODE_HOST,
      publishedDate: normalizeDate(data.datePublished),
      featured: false,
      seoMetaTitle: data.seoTitle || data.title,
      seoMetaDescription: data.seoDescription,
      shouldPublish: true,
      sourceFile: filePath,
      reviewFlags,
    });
    counts.itemsExtracted += 1;
  }

  return { plans, counts };
}
