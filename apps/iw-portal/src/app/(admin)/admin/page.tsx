import { AdminPageHeader, EmptyState, StatTile, formatDate } from '@/components/admin/AdminPrimitives'
import { getAdminOverview } from '@/lib/admin/queries'
import Link from 'next/link'

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview()

  return (
    <div className="iw-page">
      <AdminPageHeader
        title="Admin overview"
        description="Live operational status from Supabase-backed portal and OS tables."
      />

      <section className="iw-grid mb-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-5">
        <StatTile label="Clients" value={overview.counts.clients} />
        <StatTile label="Projects" value={overview.counts.projects} />
        <StatTile label="Pending COs" value={overview.counts.pendingChangeOrders} />
        <StatTile label="Unpaid invoices" value={overview.counts.unpaidInvoices} />
        <StatTile label="Failed integrations" value={overview.counts.failedIntegrations} />
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="iw-card">
          <div className="iw-card-head">
            <h2 className="iw-card-title">Recent client messages</h2>
            <Link className="iw-chip" href="/admin/messages">
              Triage
            </Link>
          </div>
          {overview.recentMessages.length ? (
            <ul className="space-y-3">
              {overview.recentMessages.map((message) => (
                <li key={message.id} className="border-t border-[var(--hairline)] pt-3 first:border-0 first:pt-0">
                  <p className="text-sm font-medium text-[var(--iw-text)]">{message.sender_name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--iw-text-2)]">{message.body}</p>
                  <p className="mt-1 text-xs text-[var(--iw-text-3)]">{formatDate(message.created_at)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No client messages are waiting in the live message table.</EmptyState>
          )}
        </section>

        <section className="iw-card">
          <div className="iw-card-head">
            <h2 className="iw-card-title">Failed integrations</h2>
            <Link className="iw-chip iw-chip-red" href="/admin/integrations">
              Review
            </Link>
          </div>
          {overview.failedIntegrations.length ? (
            <ul className="space-y-3">
              {overview.failedIntegrations.map((event) => (
                <li key={event.id} className="border-t border-[var(--hairline)] pt-3 first:border-0 first:pt-0">
                  <p className="text-sm font-medium text-[var(--iw-text)]">{event.provider} / {event.event_type}</p>
                  <p className="mt-1 text-sm text-[var(--iw-text-2)]">{event.last_error || 'No error details stored.'}</p>
                  <p className="mt-1 text-xs text-[var(--iw-text-3)]">{formatDate(event.created_at)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No failed integration events are currently stored.</EmptyState>
          )}
        </section>

        <section className="iw-card">
          <div className="iw-card-head">
            <h2 className="iw-card-title">Automation log</h2>
            <Link className="iw-chip" href="/admin/os">
              OS data
            </Link>
          </div>
          {overview.automationEvents.length ? (
            <ul className="space-y-3">
              {overview.automationEvents.map((event) => (
                <li key={event.id} className="border-t border-[var(--hairline)] pt-3 first:border-0 first:pt-0">
                  <p className="text-sm font-medium text-[var(--iw-text)]">{event.workflow_name}</p>
                  <p className="mt-1 text-sm text-[var(--iw-text-2)]">{event.event_type} · {event.status}</p>
                  <p className="mt-1 text-xs text-[var(--iw-text-3)]">{formatDate(event.logged_at)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No automation events are present in `os_automation_log`.</EmptyState>
          )}
        </section>
      </div>

      <section className="iw-card mt-4">
        <div className="iw-card-head">
          <h2 className="iw-card-title">Recent proposal decisions</h2>
          <Link className="iw-chip" href="/admin/os">
            Open OS data
          </Link>
        </div>
        {overview.proposalDecisions.length ? (
          <ul className="space-y-3">
            {overview.proposalDecisions.map((decision) => (
              <li key={decision.id} className="border-t border-[var(--hairline)] pt-3 first:border-0 first:pt-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-[var(--iw-text)]">
                    {decision.client_name || decision.company || 'Unknown client'}
                    {decision.hubspot_deal_id ? (
                      <span className="iw-mono text-xs text-[var(--iw-text-3)]"> · deal {decision.hubspot_deal_id}</span>
                    ) : null}
                  </p>
                  <span className={decision.status.toLowerCase() === 'approved'
                    ? 'iw-chip iw-chip-green'
                    : decision.status.toLowerCase() === 'rejected'
                      ? 'iw-chip iw-chip-orange'
                      : 'iw-chip'}>
                    {decision.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--iw-text-3)]">{formatDate(decision.updated_at)}</p>
                <p className="mt-1 text-sm text-[var(--iw-text-2)]">
                  {decision.proposal_status_detail || 'No decision detail recorded.'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>No approved or rejected proposals have been captured yet.</EmptyState>
        )}
      </section>
    </div>
  )
}
