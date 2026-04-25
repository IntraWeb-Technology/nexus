import { AdminPageHeader, EmptyState, formatDate, money } from '@/components/admin/AdminPrimitives'
import { getBillingReconciliation } from '@/lib/admin/queries'

export default async function AdminBillingPage() {
  const invoices = await getBillingReconciliation()
  return (
    <div className="iw-page">
      <AdminPageHeader title="Billing reconciliation" description="Compare Supabase invoice state with HubSpot and Stripe references." />
      <section className="iw-card overflow-hidden p-0">
        {invoices.length ? (
          <table className="iw-table">
            <thead><tr><th>Invoice</th><th>Client</th><th>Project</th><th>Amount</th><th>Status</th><th>Stripe</th><th>HubSpot invoice</th><th>Due</th></tr></thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="iw-mono">{invoice.invoice_number}</td>
                  <td>{invoice.projects?.clients?.name || 'Unknown'}</td>
                  <td className="iw-mono">{invoice.projects?.slug || invoice.project_id}</td>
                  <td>{money(invoice.amount_cents)}</td>
                  <td><span className={invoice.status === 'paid' ? 'iw-chip iw-chip-green' : 'iw-chip iw-chip-orange'}>{invoice.status}</span></td>
                  <td className="iw-mono text-xs">{invoice.stripe_checkout_session_id || invoice.projects?.clients?.stripe_customer_id || 'Missing'}</td>
                  <td className="iw-mono text-xs">{invoice.hubspot_invoice_id || 'Missing'}</td>
                  <td>{formatDate(invoice.due_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="p-4"><EmptyState>No invoices exist in Supabase yet.</EmptyState></div>}
      </section>
    </div>
  )
}
