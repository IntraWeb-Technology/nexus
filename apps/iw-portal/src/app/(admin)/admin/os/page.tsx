import { AdminPageHeader, EmptyState, formatDate } from '@/components/admin/AdminPrimitives'
import { getOsCommandCenter } from '@/lib/admin/queries'

export default async function AdminOsPage() {
  const os = await getOsCommandCenter()
  const proposalDecisions = os.queue
    .filter((row) => row.queue_type === 'proposal')
    .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
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
          <h2 className="iw-card-title">Client proposal decisions</h2>
          {proposalDecisions.length ? proposalDecisions.map((row) => (
            <div key={row.id} className="mt-3 rounded-lg border border-[var(--hairline)] p-3 first:mt-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm">
                  <b>{row.client_name || row.company || 'Unknown client'}</b>
                  {row.hubspot_deal_id ? (
                    <span className="iw-mono text-xs text-[var(--iw-text-3)]"> · deal {row.hubspot_deal_id}</span>
                  ) : null}
                </p>
                <span className={row.status === 'approved' ? 'iw-chip iw-chip-green' : row.status === 'rejected' ? 'iw-chip iw-chip-orange' : 'iw-chip iw-chip-teal'}>
                  {row.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--iw-text-3)]">Updated {formatDate(row.updated_at)}</p>
              {row.proposal_status_detail ? (
                <p className="mt-2 text-sm text-[var(--iw-text-2)]">{row.proposal_status_detail}</p>
              ) : (
                <p className="mt-2 text-sm text-[var(--iw-text-3)]">No client decision detail recorded yet.</p>
              )}
            </div>
          )) : <EmptyState>No proposal decisions have been captured in PostgreSQL yet.</EmptyState>}
        </section>
        <section className="iw-card xl:col-span-2">
          <h2 className="iw-card-title">Proposal lifecycle activity</h2>
          {os.proposalActivity.length ? os.proposalActivity.map((row) => (
            <div key={row.id} className="mt-3 border-t border-[var(--hairline)] pt-3 text-sm first:border-0 first:pt-0">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  <b>{row.label}</b>
                  {row.projects?.slug ? <> · {row.projects.slug}</> : null}
                  {row.projects?.clients?.name ? <> · {row.projects.clients.name}</> : null}
                </p>
                <span className="text-xs text-[var(--iw-text-3)]">{formatDate(row.created_at)}</span>
              </div>
              {row.detail ? (
                <p className="mt-1 text-xs text-[var(--iw-text-3)]">{row.detail}</p>
              ) : null}
            </div>
          )) : <EmptyState>No proposal lifecycle activity exists.</EmptyState>}
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
