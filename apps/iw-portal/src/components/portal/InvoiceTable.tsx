import { InvoicePayButton } from '@/components/portal/InvoicePayButton'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { BillingInvoiceRow } from '@/lib/billing/types'
import type { InvoiceStatus } from '@/lib/supabase/types'

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function statusVariant(s: InvoiceStatus): 'green' | 'amber' | 'red' | 'gray' {
  if (s === 'paid') return 'green'
  if (s === 'pending') return 'amber'
  if (s === 'overdue') return 'red'
  return 'gray'
}

const payLinkClass =
  'inline-flex items-center justify-center rounded-[var(--iw-radius-control)] border border-[var(--iw-border-2)] bg-[var(--iw-slate-2)] px-3 py-1.5 text-xs font-semibold text-[var(--iw-teal-light)] transition-[background-color,border-color,box-shadow,color] duration-300 hover:border-[var(--iw-teal)]/50 hover:bg-[var(--iw-slate-3)] hover:shadow-[var(--iw-shadow-1)]'

const mobileCardClass =
  'rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4 shadow-[var(--iw-shadow-1)] transition-[box-shadow,border-color] duration-300 hover:shadow-[var(--iw-shadow-2)]'

export function InvoiceTable({ rows }: { rows: BillingInvoiceRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No invoices"
        description="Issued invoices and payments will appear here as they are posted."
      />
    )
  }

  return (
    <>
      <div className="iw-enter-stagger space-y-3 md:hidden">
        {rows.map((row) => {
          if (row.source === 'supabase') {
            const inv = row.invoice
            return (
              <div key={inv.id} className={mobileCardClass}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="iw-mono text-sm font-medium text-[var(--iw-text)]">{inv.invoice_number}</p>
                    <p className="mt-1 text-sm text-[var(--iw-text-2)]">{inv.description}</p>
                  </div>
                  <Badge variant={statusVariant(inv.status)}>{inv.status}</Badge>
                </div>
                <p className="mt-3 text-xl font-semibold tabular-nums text-[var(--iw-text)]">
                  {money(inv.amount_cents)}
                </p>
                <p className="mt-2 text-xs text-[var(--iw-text-3)]">
                  {new Date(inv.created_at).toLocaleDateString()}
                </p>
                {inv.status === 'pending' || inv.status === 'overdue' ? (
                  <div className="mt-4">
                    <InvoicePayButton invoiceId={inv.id} />
                  </div>
                ) : null}
              </div>
            )
          }
          return (
            <div key={`hs-${row.hubspotId}`} className={mobileCardClass}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="iw-mono text-sm font-medium text-[var(--iw-text)]">{row.invoice_number}</p>
                  <p className="mt-1 text-sm text-[var(--iw-text-2)]">{row.description}</p>
                </div>
                <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
              </div>
              <p className="mt-3 text-xl font-semibold tabular-nums text-[var(--iw-text)]">
                {money(row.amount_cents)}
              </p>
              <p className="mt-2 text-xs text-[var(--iw-text-3)]">
                {new Date(row.created_at).toLocaleDateString()}
              </p>
              {row.payUrl ? (
                <div className="mt-4">
                  <a href={row.payUrl} target="_blank" rel="noopener noreferrer" className={payLinkClass}>
                    View / pay
                  </a>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="hidden overflow-hidden rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] shadow-[var(--iw-shadow-1)] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-[var(--iw-border)] bg-[var(--iw-slate-2)]/80 text-[var(--iw-text-3)]">
              <tr>
                <th className="p-3 iw-label">Invoice</th>
                <th className="p-3 iw-label">Description</th>
                <th className="p-3 iw-label">Date</th>
                <th className="p-3 iw-label">Amount</th>
                <th className="p-3 iw-label">Status</th>
                <th className="p-3 iw-label"> </th>
              </tr>
            </thead>
            <tbody className="iw-enter-stagger">
              {rows.map((row) => {
                if (row.source === 'supabase') {
                  const inv = row.invoice
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-[var(--iw-border)] transition-[background-color] duration-200 last:border-0 hover:bg-[var(--iw-slate-2)]/50"
                    >
                      <td className="p-3 iw-mono font-medium text-[var(--iw-text)]">{inv.invoice_number}</td>
                      <td className="p-3 text-[var(--iw-text-2)]">{inv.description}</td>
                      <td className="p-3 tabular-nums text-[var(--iw-text-2)]">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-medium tabular-nums text-[var(--iw-text)]">
                        {money(inv.amount_cents)}
                      </td>
                      <td className="p-3">
                        <Badge variant={statusVariant(inv.status)}>{inv.status}</Badge>
                      </td>
                      <td className="p-3">
                        {inv.status === 'pending' || inv.status === 'overdue' ? (
                          <InvoicePayButton invoiceId={inv.id} />
                        ) : null}
                      </td>
                    </tr>
                  )
                }
                return (
                  <tr
                    key={`hs-${row.hubspotId}`}
                    className="border-b border-[var(--iw-border)] transition-[background-color] duration-200 last:border-0 hover:bg-[var(--iw-slate-2)]/50"
                  >
                    <td className="p-3 iw-mono font-medium text-[var(--iw-text)]">{row.invoice_number}</td>
                    <td className="p-3 text-[var(--iw-text-2)]">{row.description}</td>
                    <td className="p-3 tabular-nums text-[var(--iw-text-2)]">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-medium tabular-nums text-[var(--iw-text)]">{money(row.amount_cents)}</td>
                    <td className="p-3">
                      <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                    </td>
                    <td className="p-3">
                      {row.payUrl ? (
                        <a href={row.payUrl} target="_blank" rel="noopener noreferrer" className={payLinkClass}>
                          View / pay
                        </a>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
