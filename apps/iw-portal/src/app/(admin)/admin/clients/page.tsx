import { AdminPageHeader, EmptyState, formatDate } from '@/components/admin/AdminPrimitives'
import { getAdminClients } from '@/lib/admin/queries'
import Link from 'next/link'

export default async function AdminClientsPage() {
  const { clients, projectCounts } = await getAdminClients()
  const counts = new Map(projectCounts.map((row) => [row.clientId, row.count]))

  return (
    <div className="iw-page">
      <AdminPageHeader
        title="Clients"
        description="Live client records with HubSpot, Stripe, and project mapping visibility."
      />
      <section className="iw-card overflow-hidden p-0">
        {clients.length ? (
          <table className="iw-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Company</th>
                <th>Projects</th>
                <th>HubSpot</th>
                <th>Stripe</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <Link className="font-medium text-[var(--accent-bright)]" href={`/admin/clients/${client.id}`}>
                      {client.name}
                    </Link>
                  </td>
                  <td>{client.email}</td>
                  <td>{client.company || 'Not set'}</td>
                  <td>{counts.get(client.id) ?? 0}</td>
                  <td className="iw-mono text-xs">{client.hubspot_contact_id || 'Missing'}</td>
                  <td className="iw-mono text-xs">{client.stripe_customer_id || 'Missing'}</td>
                  <td>{formatDate(client.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4">
            <EmptyState>No clients exist in Supabase yet.</EmptyState>
          </div>
        )}
      </section>
    </div>
  )
}
