import { AdminPageHeader, EmptyState, formatDate, money } from '@/components/admin/AdminPrimitives'
import { getClient360 } from '@/lib/admin/queries'
import { notFound } from 'next/navigation'

export default async function AdminClient360Page({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  const data = await getClient360(clientId)
  if (!data.client) notFound()

  const balance = data.invoices
    .filter((invoice) => invoice.status !== 'paid' && invoice.status !== 'void')
    .reduce((sum, invoice) => sum + invoice.amount_cents, 0)

  return (
    <div className="iw-page">
      <AdminPageHeader
        title={data.client.name}
        description="Client 360 view: projects, contacts, billing, documents, messages, health, notes, and audit history."
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="iw-card">
          <h2 className="iw-card-title">Profile</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="iw-label">Email</dt><dd>{data.client.email}</dd></div>
            <div><dt className="iw-label">Company</dt><dd>{data.client.company || 'Not set'}</dd></div>
            <div><dt className="iw-label">HubSpot contact</dt><dd className="iw-mono">{data.client.hubspot_contact_id || 'Missing'}</dd></div>
            <div><dt className="iw-label">Stripe customer</dt><dd className="iw-mono">{data.client.stripe_customer_id || 'Missing'}</dd></div>
            <div><dt className="iw-label">Outstanding balance</dt><dd>{money(balance)}</dd></div>
            <div><dt className="iw-label">Created</dt><dd>{formatDate(data.client.created_at)}</dd></div>
          </dl>
        </section>

        <section className="iw-card">
          <h2 className="iw-card-title">Data health</h2>
          <div className="mt-4 space-y-2">
            {!data.client.hubspot_contact_id ? <span className="iw-chip iw-chip-orange">Missing HubSpot contact</span> : null}
            {!data.client.stripe_customer_id ? <span className="iw-chip iw-chip-orange">Missing Stripe customer</span> : null}
            {data.health.map((row) => (
              <span key={row.id} className="iw-chip iw-chip-red">{row.message}</span>
            ))}
            {data.client.hubspot_contact_id && data.client.stripe_customer_id && !data.health.length ? (
              <span className="iw-chip iw-chip-green">No open health findings</span>
            ) : null}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className="iw-card">
          <h2 className="iw-card-title">Projects</h2>
          {data.projects.length ? (
            <ul className="mt-4 space-y-3">
              {data.projects.map((project) => (
                <li key={project.id} className="rounded-lg border border-[var(--hairline)] p-3">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium">{project.slug}</span>
                    <span className="iw-chip iw-chip-teal">{project.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--iw-text-2)]">{project.progress_pct}% progress · HubSpot deal {project.hubspot_deal_id || 'missing'}</p>
                </li>
              ))}
            </ul>
          ) : <EmptyState>No projects are linked to this client.</EmptyState>}
        </section>

        <section className="iw-card">
          <h2 className="iw-card-title">Members</h2>
          {data.members.length ? (
            <ul className="mt-4 space-y-3">
              {data.members.map((member) => (
                <li key={member.id} className="flex justify-between gap-3 border-t border-[var(--hairline)] pt-3 first:border-0 first:pt-0">
                  <span>{member.email}</span>
                  <span className="iw-chip">{member.role}</span>
                </li>
              ))}
            </ul>
          ) : <EmptyState>No additional client members have been invited.</EmptyState>}
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <section className="iw-card">
          <h2 className="iw-card-title">Recent messages</h2>
          {data.messages.length ? data.messages.slice(0, 8).map((message) => (
            <p key={message.id} className="mt-3 border-t border-[var(--hairline)] pt-3 text-sm first:border-0 first:pt-0">
              <b>{message.sender_name}</b>: {message.body}
            </p>
          )) : <EmptyState>No messages for this client.</EmptyState>}
        </section>
        <section className="iw-card">
          <h2 className="iw-card-title">Documents</h2>
          {data.documents.length ? data.documents.slice(0, 8).map((doc) => (
            <p key={doc.id} className="mt-3 border-t border-[var(--hairline)] pt-3 text-sm first:border-0 first:pt-0">
              {doc.name} · {doc.signed ? 'signed' : 'unsigned'}
            </p>
          )) : <EmptyState>No documents for this client.</EmptyState>}
        </section>
        <section className="iw-card">
          <h2 className="iw-card-title">Internal notes</h2>
          {data.notes.length ? data.notes.slice(0, 8).map((note) => (
            <p key={note.id} className="mt-3 border-t border-[var(--hairline)] pt-3 text-sm first:border-0 first:pt-0">
              {note.body}
            </p>
          )) : <EmptyState>No staff-only internal notes yet.</EmptyState>}
        </section>
      </div>
    </div>
  )
}
