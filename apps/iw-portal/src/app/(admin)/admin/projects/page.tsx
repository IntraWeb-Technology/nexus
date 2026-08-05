import { AdminPageHeader, EmptyState, formatDate } from '@/components/admin/AdminPrimitives'
import { getAdminProjects } from '@/lib/admin/queries'

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects()
  return (
    <div className="iw-page">
      <AdminPageHeader title="Projects" description="All live project rows with client and HubSpot mapping status." />
      <section className="iw-card overflow-hidden p-0">
        {projects.length ? (
          <table className="iw-table">
            <thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Progress</th><th>Plan</th><th>HubSpot deal</th><th>Launch</th></tr></thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="iw-mono">{project.slug}</td>
                  <td>{project.clients?.name || project.client_id}</td>
                  <td><span className="iw-chip iw-chip-teal">{project.status}</span></td>
                  <td>{project.progress_pct}%</td>
                  <td>{project.plan}</td>
                  <td className="iw-mono text-xs">{project.hubspot_deal_id || 'Missing'}</td>
                  <td>{formatDate(project.estimated_launch)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="p-4"><EmptyState>No projects exist yet.</EmptyState></div>}
      </section>
    </div>
  )
}
