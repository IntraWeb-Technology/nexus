import { AdminPageHeader, EmptyState, formatDate } from '@/components/admin/AdminPrimitives'
import { updateChangeOrderStatus } from '@/lib/admin/actions'
import { getAdminChangeOrders } from '@/lib/admin/queries'

export default async function AdminChangeOrdersPage() {
  const rows = await getAdminChangeOrders()
  return (
    <div className="iw-page">
      <AdminPageHeader title="Change orders" description="Review live change-order requests and write audited status updates." />
      <div className="space-y-4">
        {rows.length ? rows.map((row) => (
          <section key={row.id} className="iw-card">
            <div className="iw-card-head">
              <div>
                <h2 className="iw-card-title">{row.title}</h2>
                <p className="mt-1 text-sm text-[var(--iw-text-2)]">
                  {row.projects?.clients?.name || 'Unknown client'} · {row.projects?.slug || row.project_id} · {formatDate(row.created_at)}
                </p>
              </div>
              <span className="iw-chip iw-chip-orange">{row.status}</span>
            </div>
            <p className="text-sm text-[var(--iw-text-2)]">{row.description}</p>
            <form action={updateChangeOrderStatus} className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_auto]">
              <input type="hidden" name="id" value={row.id} />
              <select name="status" defaultValue={row.status} className="rounded-[var(--radius-ctrl)] border border-[var(--hairline)] bg-[var(--bg-2)] px-3 py-2 text-sm">
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </select>
              <input name="staff_notes" defaultValue={row.staff_notes ?? ''} placeholder="Staff notes" className="rounded-[var(--radius-ctrl)] border border-[var(--hairline)] bg-[var(--bg-2)] px-3 py-2 text-sm" />
              <button className="rounded-[var(--radius-ctrl)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white" type="submit">
                Save
              </button>
            </form>
          </section>
        )) : <EmptyState>No change orders exist yet.</EmptyState>}
      </div>
    </div>
  )
}
