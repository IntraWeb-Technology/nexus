import { AdminPageHeader, EmptyState, formatDate } from '@/components/admin/AdminPrimitives'
import { getOperationsQueue } from '@/lib/admin/queries'

export default async function AdminOperationsPage() {
  const queue = await getOperationsQueue()
  return (
    <div className="iw-page">
      <AdminPageHeader
        title="Operations queue"
        description="Projects and approvals that need operational attention based on live project, milestone, and change-order rows."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="iw-card">
          <h2 className="iw-card-title">Projects with risk signals</h2>
          {queue.projects.length ? (
            <ul className="mt-4 space-y-3">
              {queue.projects.map((project) => (
                <li key={project.id} className="rounded-lg border border-[var(--hairline)] p-3">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium">{project.slug}</span>
                    <span className="iw-chip">{project.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--iw-text-2)]">
                    {project.clients?.name || 'Unknown client'} · Launch {formatDate(project.estimated_launch)} · HubSpot {project.hubspot_deal_id || 'missing'}
                  </p>
                </li>
              ))}
            </ul>
          ) : <EmptyState>No project risk signals are currently detected.</EmptyState>}
        </section>
        <section className="iw-card">
          <h2 className="iw-card-title">Pending change orders</h2>
          {queue.changeOrders.length ? (
            <ul className="mt-4 space-y-3">
              {queue.changeOrders.map((row) => (
                <li key={row.id} className="rounded-lg border border-[var(--hairline)] p-3">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium">{row.title}</span>
                    <span className="iw-chip iw-chip-orange">{row.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--iw-text-2)]">{row.description}</p>
                </li>
              ))}
            </ul>
          ) : <EmptyState>No pending change orders are in the queue.</EmptyState>}
        </section>
      </div>
    </div>
  )
}
