import { homepageFixture } from "@/content/homepage";
import { aboutFixture } from "@/content/about";
import { contactFixture } from "@/content/contact";
import { workFixture } from "@/content/work";
import { articlesIndexFixture, articleBySlug } from "@/content/articles";
import { docsIndexFixture, docBySlug } from "@/content/docs";
import { getCaseStudy, caseStudyBySlug } from "@/content/case-studies";
import { siteChrome } from "@/content/chrome";
import { assembleAbout } from "@/lib/strapi/assemble-about";
import { assembleArticleDetail, assembleArticlesIndex } from "@/lib/strapi/assemble-article";
import { assembleCaseStudy } from "@/lib/strapi/assemble-case";
import { assembleContact } from "@/lib/strapi/assemble-contact";
import { assembleDocDetail, assembleDocsIndex } from "@/lib/strapi/assemble-doc";
import {
  assembleHomepage,
  requireHomePage,
} from "@/lib/strapi/assemble-home";
import { assembleWork, requireWorkPage } from "@/lib/strapi/assemble-work";
import { ATLAS_SITE_KEY, getAtlasStrapiClient } from "@/lib/strapi/client";
import { AtlasContentError } from "@/lib/strapi/errors";
import { resolveContentSource } from "@/lib/strapi/source";

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

export async function getHomepageContent(options?: ContentOptions) {
  if (resolveContentSource() === "fixture") {
    return homepageFixture;
  }

  const client = getAtlasStrapiClient();
  const req = requestOptions(options);
  const [home, projects] = await Promise.all([
    withStrapi(() => client.getHomePage(ATLAS_SITE_KEY, req)),
    withStrapi(() =>
      client.getProjects(ATLAS_SITE_KEY, { pageSize: 100, ...req }),
    ),
  ]);

  return assembleHomepage(requireHomePage(home), projects.items);
}

export async function getWorkContent(options?: ContentOptions) {
  if (resolveContentSource() === "fixture") {
    return workFixture;
  }

  const client = getAtlasStrapiClient();
  const req = requestOptions(options);
  const [work, projects, caseStudies] = await Promise.all([
    withStrapi(() => client.getWorkPage(ATLAS_SITE_KEY, req)),
    withStrapi(() =>
      client.getProjects(ATLAS_SITE_KEY, {
        pageSize: 100,
        sort: "sortOrder:asc",
        ...req,
      }),
    ),
    withStrapi(() =>
      client.getCaseStudies(ATLAS_SITE_KEY, { pageSize: 100, ...req }),
    ),
  ]);

  const caseStudySlugs = new Set(caseStudies.items.map((item) => item.slug));

  return assembleWork(requireWorkPage(work), projects.items, caseStudySlugs);
}

export async function getCaseStudyContent(
  slug: string,
  options?: ContentOptions,
): Promise<ReturnType<typeof assembleCaseStudy> | null> {
  if (resolveContentSource() === "fixture") {
    return getCaseStudy(slug) ?? null;
  }

  const client = getAtlasStrapiClient();
  const study = await withStrapi(() =>
    client.getCaseStudyBySlug(ATLAS_SITE_KEY, slug, requestOptions(options)),
  );
  if (!study) return null;
  return assembleCaseStudy(study);
}

export async function getCaseStudySlugs(): Promise<string[]> {
  if (resolveContentSource() === "fixture") {
    return Object.keys(caseStudyBySlug);
  }

  const client = getAtlasStrapiClient();
  const result = await withStrapi(() =>
    client.getCaseStudies(ATLAS_SITE_KEY, { pageSize: 100 }),
  );
  return result.items.map((item) => item.slug);
}

export async function getAboutContent(options?: ContentOptions) {
  if (resolveContentSource() === "fixture") {
    return aboutFixture;
  }

  const client = getAtlasStrapiClient();
  const about = await withStrapi(() =>
    client.getAboutPage(ATLAS_SITE_KEY, requestOptions(options)),
  );
  if (!about) {
    throw new AtlasContentError(
      "SINGLETON_MISSING",
      "About page singleton missing for site key personal",
    );
  }
  return assembleAbout(about);
}

export async function getContactContent(options?: ContentOptions) {
  if (resolveContentSource() === "fixture") {
    return contactFixture;
  }

  const client = getAtlasStrapiClient();
  const contact = await withStrapi(() =>
    client.getContactPage(ATLAS_SITE_KEY, requestOptions(options)),
  );
  if (!contact) {
    throw new AtlasContentError(
      "SINGLETON_MISSING",
      "Contact page singleton missing for site key personal",
    );
  }
  return assembleContact(contact);
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
  if (resolveContentSource() === "fixture") {
    return articlesIndexFixture;
  }

  const articles = await fetchWritingArticles(options);
  return assembleArticlesIndex(articles);
}

export async function getArticleContent(slug: string, options?: ContentOptions) {
  if (resolveContentSource() === "fixture") {
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

export async function getArticleSlugs(): Promise<string[]> {
  if (resolveContentSource() === "fixture") {
    return Object.keys(articleBySlug);
  }

  const articles = await fetchWritingArticles();
  return articles.map((a) => a.slug);
}

export async function getDocsIndexContent(options?: ContentOptions) {
  if (resolveContentSource() === "fixture") {
    return docsIndexFixture;
  }

  const articles = await fetchDocumentationArticles(options);
  return assembleDocsIndex(articles);
}

export async function getDocContent(slug: string, options?: ContentOptions) {
  if (resolveContentSource() === "fixture") {
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

export async function getDocSlugs(): Promise<string[]> {
  if (resolveContentSource() === "fixture") {
    return Object.keys(docBySlug);
  }

  const articles = await fetchDocumentationArticles();
  return articles.map((a) => a.slug);
}
