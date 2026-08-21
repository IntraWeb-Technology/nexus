import { homepageFixture } from "@/content/homepage";
import { aboutFixture } from "@/content/about";
import { contactFixture } from "@/content/contact";
import { workFixture } from "@/content/work";
import { articlesIndexFixture, articleBySlug } from "@/content/articles";
import { docsIndexFixture, docBySlug } from "@/content/docs";
import { getCaseStudy, caseStudyBySlug } from "@/content/case-studies";
import { siteChrome } from "@/content/chrome";
import { assembleArticleDetail, assembleArticlesIndex } from "@/lib/strapi/assemble-article";
import { assembleDocDetail, assembleDocsIndex } from "@/lib/strapi/assemble-doc";
import { ATLAS_SITE_KEY, getAtlasStrapiClient } from "@/lib/strapi/client";
import { AtlasContentError } from "@/lib/strapi/errors";
import { mergePreviewOptions } from "@/lib/strapi/preview";
import { usesStrapiFor } from "@/lib/strapi/source";

export type ContentOptions = {
  preview?: boolean;
};

export { siteChrome };

async function withStrapi<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AtlasContentError) throw error;
    throw new AtlasContentError("STRAPI_UNAVAILABLE", "Strapi request failed", {
      cause: error,
    });
  }
}

function requestOptions(options?: ContentOptions) {
  return options?.preview ? { preview: true as const } : undefined;
}

/**
 * Atlas v1: Homepage is code-managed (committed fixture). Strapi outage must not
 * block this route.
 */
export async function getHomepageContent(_options?: ContentOptions) {
  return homepageFixture;
}

/**
 * Atlas v1: Work index is code-managed (committed fixture + production assets).
 */
export async function getWorkContent(_options?: ContentOptions) {
  return workFixture;
}

/**
 * Atlas v1: Case studies are code-managed art-directed pages.
 */
export async function getCaseStudyContent(
  slug: string,
  _options?: ContentOptions,
): Promise<(typeof caseStudyBySlug)[string] | null> {
  return getCaseStudy(slug) ?? null;
}

export async function getCaseStudySlugs(
  _options?: ContentOptions,
): Promise<string[]> {
  return Object.keys(caseStudyBySlug);
}

/**
 * Atlas v1: About is code-managed.
 */
export async function getAboutContent(_options?: ContentOptions) {
  return aboutFixture;
}

/**
 * Atlas v1: Contact is code-managed.
 */
export async function getContactContent(_options?: ContentOptions) {
  return contactFixture;
}

async function fetchWritingArticles(options?: ContentOptions) {
  const client = getAtlasStrapiClient();
  const req = requestOptions(options);
  const result = await withStrapi(() =>
    client.getArticles(ATLAS_SITE_KEY, {
      pageSize: 100,
      sort: "publishedDate:desc",
      filters: { surface: { $eq: "writing" } },
      ...req,
    }),
  );
  return result.items;
}

async function fetchDocumentationArticles(options?: ContentOptions) {
  const client = getAtlasStrapiClient();
  const req = requestOptions(options);
  const result = await withStrapi(() =>
    client.getArticles(ATLAS_SITE_KEY, {
      pageSize: 100,
      sort: "updatedDate:desc",
      filters: { surface: { $eq: "documentation" } },
      ...req,
    }),
  );
  return result.items;
}

export async function getArticlesIndexContent(options?: ContentOptions) {
  options = await mergePreviewOptions(options);
  if (!usesStrapiFor("cms")) {
    return articlesIndexFixture;
  }

  const articles = await fetchWritingArticles(options);
  return assembleArticlesIndex(articles);
}

export async function getArticleContent(slug: string, options?: ContentOptions) {
  options = await mergePreviewOptions(options);
  if (!usesStrapiFor("cms")) {
    return articleBySlug[slug] ?? null;
  }

  const client = getAtlasStrapiClient();
  const [article, allWriting] = await Promise.all([
    withStrapi(() =>
      client.getArticleBySlug(ATLAS_SITE_KEY, slug, requestOptions(options)),
    ),
    fetchWritingArticles(options),
  ]);

  if (!article || article.surface !== "writing") return null;
  return assembleArticleDetail(article, allWriting);
}

export async function getArticleSlugs(options?: ContentOptions): Promise<string[]> {
  options = await mergePreviewOptions(options);
  if (!usesStrapiFor("cms")) {
    return Object.keys(articleBySlug);
  }

  const articles = await fetchWritingArticles(options);
  return articles.map((a) => a.slug);
}

/**
 * Documentation handbook pages remain CMS Article records (surface=documentation)
 * when Strapi mode is active — same fail-closed contract as writing articles.
 */
export async function getDocsIndexContent(options?: ContentOptions) {
  options = await mergePreviewOptions(options);
  if (!usesStrapiFor("cms")) {
    return docsIndexFixture;
  }

  const articles = await fetchDocumentationArticles(options);
  return assembleDocsIndex(articles);
}

export async function getDocContent(slug: string, options?: ContentOptions) {
  options = await mergePreviewOptions(options);
  if (!usesStrapiFor("cms")) {
    return docBySlug[slug] ?? null;
  }

  const client = getAtlasStrapiClient();
  const [article, allDocs] = await Promise.all([
    withStrapi(() =>
      client.getArticleBySlug(ATLAS_SITE_KEY, slug, requestOptions(options)),
    ),
    fetchDocumentationArticles(options),
  ]);

  if (!article || article.surface !== "documentation") return null;
  return assembleDocDetail(article, allDocs);
}

export async function getDocSlugs(options?: ContentOptions): Promise<string[]> {
  options = await mergePreviewOptions(options);
  if (!usesStrapiFor("cms")) {
    return Object.keys(docBySlug);
  }

  const articles = await fetchDocumentationArticles(options);
  return articles.map((a) => a.slug);
}
