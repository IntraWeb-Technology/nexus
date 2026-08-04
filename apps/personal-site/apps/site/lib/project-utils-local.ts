/**
 * Local project data from `data/projects` (no Strapi).
 * Used as soft-fail fallback by `strapi-content` / `project-utils`.
 */

import { ProjectMeta } from '../data/projects/types';
import { tendrilo } from '../data/projects/tendrilo';
import { schibelliSite } from '../data/projects/schibelli-site';
import { synaplyai } from '../data/projects/synaplyai';
import { ecommerceShopifyChatbot } from '../data/projects/ecommerce-shopify-chatbot';
import { intraweb } from '../data/projects/intraweb';

const allProjects: ProjectMeta[] = [
  tendrilo,
  schibelliSite,
  synaplyai,
  ecommerceShopifyChatbot,
  intraweb,
];

export async function getAllProjects(): Promise<ProjectMeta[]> {
  return allProjects;
}

export async function getProjectBySlug(
  slug: string,
): Promise<ProjectMeta | null> {
  return allProjects.find((project) => project.slug === slug) || null;
}

export async function getFeaturedProjects(): Promise<ProjectMeta[]> {
  return allProjects.filter((project) => project.featured === true);
}
