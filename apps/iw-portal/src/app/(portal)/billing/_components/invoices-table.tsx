'use client'

import type { BillingUiInvoice } from '@/lib/billing/billing-ui-serialize'
import { InvoiceRow } from './invoice-row'

export function InvoicesTable({ rows, projectSlug }: { rows: BillingUiInvoice[]; projectSlug: string }) {
  return (
    <div className="overflow-x-auto rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-surface-elevated)] shadow-[var(--iw-shadow-1)]">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--iw-border)] text-[11px] font-medium uppercase tracking-wide text-[var(--iw-text-muted)]">
            <th className="px-3 py-2 sm:px-4">Invoice</th>
            <th className="px-3 py-2 sm:px-4">Status</th>
            <th className="hidden px-3 py-2 sm:table-cell sm:px-4">Issued</th>
            <th className="hidden px-3 py-2 sm:table-cell sm:px-4">Due</th>
            <th className="px-3 py-2 text-right sm:px-4">Amount</th>
            <th className="w-24 px-2 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <InvoiceRow key={row.id} row={row} projectSlug={projectSlug} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
