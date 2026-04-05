import { InvoicePayButton } from '@/components/portal/InvoicePayButton'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Invoice, InvoiceStatus } from '@/lib/supabase/types'

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function statusVariant(s: InvoiceStatus): 'green' | 'amber' | 'red' | 'gray' {
  if (s === 'paid') return 'green'
  if (s === 'pending') return 'amber'
  if (s === 'overdue') return 'red'
  return 'gray'
}

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        title="No invoices"
        description="Invoices will show here as they are issued."
      />
    )
  }
  return (
    <div className="overflow-x-auto rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-[var(--iw-border)] text-[var(--iw-text-3)]">
          <tr>
            <th className="p-3 iw-label">Invoice</th>
            <th className="p-3 iw-label">Description</th>
            <th className="p-3 iw-label">Date</th>
            <th className="p-3 iw-label">Amount</th>
            <th className="p-3 iw-label">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-[var(--iw-border)] last:border-0">
              <td className="p-3 iw-mono text-[var(--iw-text)]">{inv.invoice_number}</td>
              <td className="p-3 text-[var(--iw-text-2)]">{inv.description}</td>
              <td className="p-3 text-[var(--iw-text-2)]">
                {new Date(inv.created_at).toLocaleDateString()}
              </td>
              <td className="p-3 text-[var(--iw-text)]">{money(inv.amount_cents)}</td>
              <td className="p-3">
                <Badge variant={statusVariant(inv.status)}>{inv.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
