/**
 * Soft-fail Strapi content resolvers for site key `personal`.
 * Always return usable local data when CMS is down, empty, or disabled.
 */

import { draftMode } from 'next/headers';
import type { ProjectMeta } from '../data/projects/types';
import {
  getLocalBlogPostBySlug,
  getLocalBlogPosts,
  getLocalBlogSlugs,
  type LocalBlogPost,
} from './local-blog-loader';
import {
  getAllCaseStudies as getMdxCaseStudies,
  getCaseStudyBySlug as getMdxCaseStudyBySlug,
  type MDXCaseStudy,
} from './mdx-case-study-loader';
import {
  getAllProjects as getLocalProjects,
  getProjectBySlug as getLocalProjectBySlug,
} from './project-utils-local';
import {
  getStrapiClient,
  type StrapiArticle,
  type StrapiCaseStudy,
  type StrapiProject,
} from './strapi';

export type UnifiedPost = LocalBlogPost;

async function isPreviewEnabled(): Promise<boolean> {
  try {
    const draft = await draftMode();
    return draft.isEnabled;
  } catch {
    return false;
  }
}

function articleToPost(article: StrapiArticle): UnifiedPost {
  const markdown =
    article.contentFormat === 'html' ? undefined : article.body ?? undefined;
  const html =
    article.contentFormat === 'html' ? article.body ?? undefined : undefined;
  const body = article.body ?? '';
  const words = body.trim().split(/\s+/).filter(Boolean).length;

  return {
    id: article.documentId,
    title: article.title,
    brief: article.excerpt || '',
    slug: article.slug,
    publishedAt: article.publishedDate || new Date(0).toISOString(),
    updatedAt: article.updatedDate || undefined,
    coverImage: article.featuredImageUrl
      ? { url: article.featuredImageUrl }
      : undefined,
    author: { name: article.authorName || 'John Schibelli' },
    tags: article.tags,
    content: { markdown, html },
    readTimeInMinutes: Math.max(1, Math.ceil(words / 200) || 1),
    featured: article.featured,
  };
}

function projectToMeta(project: StrapiProject): ProjectMeta {
  const categoryMap: Record<string, ProjectMeta['category']> = {
    'web-app': 'web-app',
    'mobile-app': 'mobile-app',
    'desktop-app': 'desktop-app',
    api: 'api',
    library: 'library',
    other: 'other',
  };
  const projectType = (project.projectType || 'other').toLowerCase();
  const category = categoryMap[projectType] || 'other';

  return {
    id: project.documentId,
    title: project.name,
    slug: project.slug,
    description: project.summary || project.description || '',
    image: project.featuredImageUrl || '/assets/hero/hero-image.webp',
    tags: project.technologies,
    liveUrl: project.liveUrl || undefined,
    githubUrl: project.repositoryUrl || undefined,
    documentationUrl: project.documentationUrl || undefined,
    caseStudyUrl: `/case-studies/${project.slug}`,
    featured: project.featured,
    status: project.status || 'completed',
    startDate: project.startDate || undefined,
    endDate: project.endDate || undefined,
    technologies: project.technologies,
    category,
  };
}

function caseStudyToMdx(cs: StrapiCaseStudy): MDXCaseStudy {
  const sections = [
    cs.summary ? `## Summary\n\n${cs.summary}` : '',
    cs.challenge ? `## Challenge\n\n${cs.challenge}` : '',
    cs.solution ? `## Solution\n\n${cs.solution}` : '',
    cs.results ? `## Results\n\n${cs.results}` : '',
  ].filter(Boolean);

  return {
    meta: {
      title: cs.title,
      slug: cs.slug,
      excerpt: cs.summary || undefined,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      publishedAt: cs.publishedAt || undefined,
      featured: true,
      client: cs.clientName || undefined,
      technologies: cs.technologies,
      challenges: cs.challenge || undefined,
      solution: cs.solution || undefined,
      results: cs.results || undefined,
      coverImage: cs.featuredImageUrl || undefined,
      tags: cs.technologies,
      author: { name: 'John Schibelli' },
    },
    content: sections.join('\n\n') || cs.summary || '',
  };
}

/**
 * Blog posts: Strapi → local markdown (may be empty in this nexus copy).
 * Callers may add a tertiary Hashnode fallback via `content-api`.
 */
export async function resolveBlogPosts(limit = 25): Promise<UnifiedPost[]> {
  const client = getStrapiClient();
  if (client) {
    try {
      const preview = await isPreviewEnabled();
      const articles = await client.getArticles(limit, { preview });
      if (articles.length > 0) return articles.map(articleToPost);
    } catch (error) {
      console.warn(
        '[Strapi] getArticles failed, falling back to local blog:',
        error instanceof Error ? error.message : error,
      );
    }
  }
  return getLocalBlogPosts(limit);
}

export async function resolveBlogPostBySlug(
  slug: string,
): Promise<UnifiedPost | null> {
  const client = getStrapiClient();
  if (client) {
    try {
      const preview = await isPreviewEnabled();
      const article = await client.getArticleBySlug(slug, { preview });
      if (article) return articleToPost(article);
    } catch (error) {
      console.warn(
        `[Strapi] getArticleBySlug(${slug}) failed, falling back to local:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
  return getLocalBlogPostBySlug(slug);
}

export async function resolveBlogSlugs(): Promise<string[]> {
  const posts = await resolveBlogPosts(100);
  if (posts.length > 0) return posts.map((p) => p.slug);
  return getLocalBlogSlugs();
}

/** Projects: Strapi → `data/projects` via local helpers. */
export async function resolveProjects(): Promise<ProjectMeta[]> {
  const client = getStrapiClient();
  if (client) {
    try {
      const preview = await isPreviewEnabled();
      const projects = await client.getProjects(50, { preview });
      if (projects.length > 0) return projects.map(projectToMeta);
    } catch (error) {
      console.warn(
        '[Strapi] getProjects failed, falling back to data/projects:',
        error instanceof Error ? error.message : error,
      );
    }
  }
  return getLocalProjects();
}

export async function resolveProjectBySlug(
  slug: string,
): Promise<ProjectMeta | null> {
  const client = getStrapiClient();
  if (client) {
    try {
      const preview = await isPreviewEnabled();
      const project = await client.getProjectBySlug(slug, { preview });
      if (project) return projectToMeta(project);
    } catch (error) {
      console.warn(
        `[Strapi] getProjectBySlug(${slug}) failed, falling back to local:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
  return getLocalProjectBySlug(slug);
}

/** Case studies: Strapi → MDX loader under content/case-studies. */
export async function resolveCaseStudies(): Promise<MDXCaseStudy[]> {
  const client = getStrapiClient();
  if (client) {
    try {
      const preview = await isPreviewEnabled();
      const items = await client.getCaseStudies(50, { preview });
      if (items.length > 0) return items.map(caseStudyToMdx);
    } catch (error) {
      console.warn(
        '[Strapi] getCaseStudies failed, falling back to MDX:',
        error instanceof Error ? error.message : error,
      );
    }
  }
  return getMdxCaseStudies();
}

export async function resolveCaseStudyBySlug(
  slug: string,
): Promise<MDXCaseStudy | null> {
  const client = getStrapiClient();
  if (client) {
    try {
      const preview = await isPreviewEnabled();
      const item = await client.getCaseStudyBySlug(slug, { preview });
      if (item) return caseStudyToMdx(item);
    } catch (error) {
      console.warn(
        `[Strapi] getCaseStudyBySlug(${slug}) failed, falling back to MDX:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  const byFile = await getMdxCaseStudyBySlug(slug);
  if (byFile) return byFile;

  // Filename may differ from frontmatter / URL slug (e.g. tendril.mdx)
  const all = await getMdxCaseStudies();
  return (
    all.find(
      (study) =>
        study.meta.slug === slug ||
        study.meta.slug === slug.replace(/-case-study$/, ''),
    ) ?? null
  );
}
