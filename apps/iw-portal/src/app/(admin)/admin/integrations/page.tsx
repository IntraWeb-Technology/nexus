import { AdminPageHeader, EmptyState, formatDate } from '@/components/admin/AdminPrimitives'
import { markIntegrationEventReplayed } from '@/lib/admin/actions'
import { getIntegrationEvents } from '@/lib/admin/queries'

export default async function AdminIntegrationsPage() {
  const events = await getIntegrationEvents()
  return (
    <div className="iw-page">
      <AdminPageHeader title="Integrations" description="Webhook and integration events with failure visibility and audited replay marking." />
      <section className="iw-card overflow-hidden p-0">
        {events.length ? (
          <table className="iw-table">
            <thead><tr><th>Provider</th><th>Event</th><th>Status</th><th>Error</th><th>Created</th><th>Action</th></tr></thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.provider}</td>
                  <td>{event.event_type}</td>
                  <td><span className={event.status === 'failed' ? 'iw-chip iw-chip-red' : 'iw-chip'}>{event.status}</span></td>
                  <td className="max-w-md">{event.last_error || 'None'}</td>
                  <td>{formatDate(event.created_at)}</td>
                  <td>
                    {event.status === 'failed' ? (
                      <form action={markIntegrationEventReplayed}>
                        <input type="hidden" name="id" value={event.id} />
                        <button className="iw-chip iw-chip-orange" type="submit">Mark replayed</button>
                      </form>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="p-4"><EmptyState>No integration events have been recorded yet.</EmptyState></div>}
      </section>
    </div>
  )
}
