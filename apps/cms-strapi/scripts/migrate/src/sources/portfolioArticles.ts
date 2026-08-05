import { assertSourceDirExists, paths, HASHNODE_HOST, PERSONAL_DOMAIN } from "../config";
import { listMarkdownFiles, parseMarkdownFile } from "../lib/frontmatter";
import { normalizeSlug } from "../lib/slug";
import { normalizeDate } from "../lib/dates";
import { deriveExcerpt, splitTagString, stripHashnodeLeadingSlash } from "../lib/text";
import { detectStrongIntrawebMarketing } from "../lib/siteAssignment";
import type { ArticlePlan, SourceCounts } from "../types";

/** Shape A: mirrors the Hashnode export frontmatter (same cuid-named files
 * exist in `hashnode-schibelli`; used as a fallback/backup source). */
interface HashnodeMirrorFrontmatter {
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

/** Shape B: hand-authored portfolio-native posts (no Hashnode origin). */
interface PortfolioNativeFrontmatter {
  title?: string;
  slug?: string;
  subtitle?: string;
  coverImage?: string;
  publishedAt?: string;
  isPublished?: boolean;
  tags?: Array<{ name: string; slug: string }>;
  metaTags?: { title?: string; description?: string; image?: string };
}

export function extractPortfolioArticles(): { plans: ArticlePlan[]; counts: SourceCounts } {
  const dir = paths.legacyPortfolioBlogDir;
  const counts: SourceCounts = { filesScanned: 0, itemsExtracted: 0, duplicatesSkipped: 0 };
  if (!assertSourceDirExists("Legacy portfolio-os blog", dir)) return { plans: [], counts };

  const files = listMarkdownFiles(dir, [".md"]);
  counts.filesScanned = files.length;

  const plans: ArticlePlan[] = [];
  for (const filePath of files) {
    const parsedFile = parseMarkdownFile<Record<string, unknown>>(filePath);
    const rawData = parsedFile.data;
    if (!rawData.title || !parsedFile.content) continue;

    const isHashnodeMirrorShape = typeof rawData.cuid === "string" && rawData.cuid.length > 0;
    const content = isHashnodeMirrorShape
      ? stripHashnodeLeadingSlash(parsedFile.content)
      : parsedFile.content;

    if (isHashnodeMirrorShape) {
      const data = rawData as HashnodeMirrorFrontmatter;
      const slug = normalizeSlug(data.slug || data.title!);
      const reviewFlags: string[] = [];
      if (detectStrongIntrawebMarketing(data.title!, content)) {
        reviewFlags.push("possible-intraweb-marketing-mention");
      }
      plans.push({
        title: data.title!,
        slug,
        excerpt: data.seoDescription || deriveExcerpt(content),
        body: content,
        contentFormat: "markdown",
        sites: ["personal"],
        tagSlugs: splitTagString(data.tags),
        authorName: "John Schibelli",
        featuredImageUrl: data.cover,
        ogImageUrl: data.ogImage,
        originalSource: "portfolio-markdown",
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
    } else {
      const data = rawData as PortfolioNativeFrontmatter;
      const slug = normalizeSlug(data.slug || data.title!);
      const reviewFlags: string[] = [];
      if (detectStrongIntrawebMarketing(data.title!, content)) {
        reviewFlags.push("possible-intraweb-marketing-mention");
      }
      plans.push({
        title: data.title!,
        slug,
        excerpt: data.subtitle || data.metaTags?.description || deriveExcerpt(content),
        body: content,
        contentFormat: "markdown",
        sites: ["personal"],
        tagSlugs: (data.tags ?? []).map((t) => t.name || t.slug).filter(Boolean),
        authorName: "John Schibelli",
        featuredImageUrl: data.coverImage,
        originalSource: "portfolio-markdown",
        canonicalUrl: `${PERSONAL_DOMAIN}/blog/${slug}`,
        publishedDate: normalizeDate(data.publishedAt),
        featured: false,
        seoMetaTitle: data.metaTags?.title || data.title,
        seoMetaDescription: data.metaTags?.description,
        shouldPublish: data.isPublished !== false,
        sourceFile: filePath,
        reviewFlags,
      });
    }
    counts.itemsExtracted += 1;
  }

  return { plans, counts };
}
