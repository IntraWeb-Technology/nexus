import { AdminPageHeader, EmptyState, formatDate } from '@/components/admin/AdminPrimitives'
import { getMessageTriage } from '@/lib/admin/queries'

export default async function AdminMessagesPage() {
  const messages = await getMessageTriage()
  return (
    <div className="iw-page">
      <AdminPageHeader title="Message triage" description="Unread and recent client-originated messages across all projects." />
      <section className="iw-card overflow-hidden p-0">
        {messages.length ? (
          <table className="iw-table">
            <thead><tr><th>Client</th><th>Project</th><th>Sender</th><th>Message</th><th>Received</th></tr></thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td>{message.projects?.clients?.name || 'Unknown'}</td>
                  <td className="iw-mono">{message.projects?.slug || message.project_id}</td>
                  <td>{message.sender_name}</td>
                  <td className="max-w-xl">{message.body}</td>
                  <td>{formatDate(message.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="p-4"><EmptyState>No client messages are ready for triage.</EmptyState></div>}
      </section>
    </div>
  )
}
