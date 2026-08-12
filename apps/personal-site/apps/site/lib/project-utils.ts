import { ProjectMeta } from '../data/projects/types';
import {
  resolveProjectBySlug,
  resolveProjects,
} from './strapi-content';
import {
  getAllProjects as getLocalProjects,
  getFeaturedProjects as getLocalFeaturedProjects,
  getProjectBySlug as getLocalProjectBySlug,
} from './project-utils-local';

/**
 * Get all projects (Strapi when enabled + data exists, else data/projects).
 */
export async function getAllProjects(): Promise<ProjectMeta[]> {
  try {
    return await resolveProjects();
  } catch {
    return getLocalProjects();
  }
}

/**
 * Get a project by its slug
 */
export async function getProjectBySlug(
  slug: string,
): Promise<ProjectMeta | null> {
  try {
    return await resolveProjectBySlug(slug);
  } catch {
    return getLocalProjectBySlug(slug);
  }
}

/**
 * Get featured projects
 */
export async function getFeaturedProjects(): Promise<ProjectMeta[]> {
  const projects = await getAllProjects();
  const featured = projects.filter((project) => project.featured === true);
  if (featured.length > 0) return featured;
  return getLocalFeaturedProjects();
}

/**
 * Get projects by status
 */
export async function getProjectsByStatus(
  status: ProjectMeta['status'],
): Promise<ProjectMeta[]> {
  const projects = await getAllProjects();
  return projects.filter((project) => project.status === status);
}

/**
 * Get projects by category
 */
export async function getProjectsByCategory(
  category: ProjectMeta['category'],
): Promise<ProjectMeta[]> {
  const projects = await getAllProjects();
  return projects.filter((project) => project.category === category);
}

/**
 * Get projects by tag
 */
export async function getProjectsByTag(tag: string): Promise<ProjectMeta[]> {
  const projects = await getAllProjects();
  return projects.filter((project) =>
    project.tags.some((projectTag) =>
      projectTag.toLowerCase().includes(tag.toLowerCase()),
    ),
  );
}

/**
 * Get all unique tags from all projects
 */
export async function getAllProjectTags(): Promise<string[]> {
  const projects = await getAllProjects();
  const allTags = projects.flatMap((project) => project.tags);
  return Array.from(new Set(allTags)).sort();
}

/**
 * Get all unique categories from all projects
 */
export async function getAllProjectCategories(): Promise<
  ProjectMeta['category'][]
> {
  const projects = await getAllProjects();
  const allCategories = projects.map((project) => project.category);
  return Array.from(new Set(allCategories));
}

/**
 * Search projects by title, description, or tags
 */
export async function searchProjects(query: string): Promise<ProjectMeta[]> {
  const lowercaseQuery = query.toLowerCase();
  const projects = await getAllProjects();

  return projects.filter(
    (project) =>
      project.title.toLowerCase().includes(lowercaseQuery) ||
      project.description.toLowerCase().includes(lowercaseQuery) ||
      project.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
      project.technologies.some((tech) =>
        tech.toLowerCase().includes(lowercaseQuery),
      ),
  );
}
