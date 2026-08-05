import type { BillingUiInvoice } from '@/lib/billing/billing-ui-serialize'

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function buildInvoicesCsv(rows: BillingUiInvoice[]): string {
  const header = ['Invoice', 'Phase', 'Kind', 'Description', 'Status', 'Issued', 'Due', 'Amount cents', 'Currency']
  const lines = [header.join(',')]
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.invoiceNumber),
        csvEscape(r.billingPhase ?? ''),
        csvEscape(r.billingKind),
        csvEscape(r.description),
        csvEscape(r.status),
        csvEscape(r.issuedAt),
        csvEscape(r.dueAt ?? ''),
        String(r.amountCents),
        csvEscape(r.currency),
      ].join(','),
    )
  }
  return lines.join('\n')
}

export function downloadCsvText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
