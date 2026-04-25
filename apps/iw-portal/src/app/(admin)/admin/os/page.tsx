import { AdminPageHeader, EmptyState, formatDate } from '@/components/admin/AdminPrimitives'
import { getOsCommandCenter } from '@/lib/admin/queries'

export default async function AdminOsPage() {
  const os = await getOsCommandCenter()
  return (
    <div className="iw-page">
      <AdminPageHeader title="OS data" description="Operational Supabase tables that replaced sheet-backed workflows." />
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="iw-card">
          <h2 className="iw-card-title">Automation log</h2>
          {os.automation.length ? os.automation.map((row) => (
            <p key={row.id} className="mt-3 border-t border-[var(--hairline)] pt-3 text-sm first:border-0 first:pt-0">
              <b>{row.workflow_name}</b> · {row.event_type} · {row.status} · {formatDate(row.logged_at)}
            </p>
          )) : <EmptyState>No automation log rows exist.</EmptyState>}
        </section>
        <section className="iw-card">
          <h2 className="iw-card-title">Contracts / proposals queue</h2>
          {os.queue.length ? os.queue.map((row) => (
            <p key={row.id} className="mt-3 border-t border-[var(--hairline)] pt-3 text-sm first:border-0 first:pt-0">
              <b>{row.client_name || row.company || 'Unknown'}</b> · {row.queue_type} · {row.status}
            </p>
          )) : <EmptyState>No contract/proposal queue rows exist.</EmptyState>}
        </section>
        <section className="iw-card xl:col-span-2">
          <h2 className="iw-card-title">Deals sheet replacement</h2>
          {os.deals.length ? (
            <div className="mt-4 overflow-hidden rounded-lg border border-[var(--hairline)]">
              <table className="iw-table">
                <thead><tr><th>Deal</th><th>Company</th><th>Tier</th><th>HubSpot</th><th>Updated</th></tr></thead>
                <tbody>
                  {os.deals.map((deal) => (
                    <tr key={deal.id}>
                      <td>{deal.deal_name || 'Untitled'}</td>
                      <td>{deal.company || 'Not set'}</td>
                      <td>{deal.tier || 'Not set'}</td>
                      <td className="iw-mono text-xs">{deal.hubspot_deal_id || 'Missing'}</td>
                      <td>{formatDate(deal.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState>No OS deals rows exist.</EmptyState>}
        </section>
      </div>
    </div>
  )
}
