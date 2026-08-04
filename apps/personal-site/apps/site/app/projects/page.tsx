import { getAllProjects } from '../../lib/project-utils';
import ProjectsPageClientWrapper from './projects-client';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  // Strapi when enabled + data exists, else data/projects
  const projects = await getAllProjects();
  return <ProjectsPageClientWrapper initialProjects={projects} />;
}
