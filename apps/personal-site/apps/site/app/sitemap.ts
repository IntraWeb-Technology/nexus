import { MetadataRoute } from 'next';
import { getAllProjects } from '../lib/project-utils';
import { resolveCaseStudies } from '../lib/strapi-content';
import { fetchPosts } from '../lib/content-api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://johnschibelli.dev';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  let projectPages: MetadataRoute.Sitemap = [];
  try {
    const projects = await getAllProjects();
    projectPages = projects.map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      lastModified: new Date(project.endDate || project.startDate || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching projects for sitemap:', error);
  }

  let caseStudyPages: MetadataRoute.Sitemap = [];
  try {
    const caseStudies = await resolveCaseStudies();
    caseStudyPages = caseStudies
      .filter(
        (caseStudy) =>
          caseStudy.meta.status === 'PUBLISHED' ||
          (!caseStudy.meta.status && caseStudy.meta.publishedAt),
      )
      .map((caseStudy) => ({
        url: `${baseUrl}/case-studies/${caseStudy.meta.slug}`,
        lastModified: new Date(caseStudy.meta.publishedAt || Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
  } catch (error) {
    console.error('Error fetching case studies for sitemap:', error);
  }

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await fetchPosts(50);
    blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  return [...staticPages, ...projectPages, ...caseStudyPages, ...blogPages];
}
