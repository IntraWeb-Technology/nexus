import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatInvoiceDate } from '@/lib/billing/format'
import { getPortalBundle } from '@/lib/data/portal'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Invoice } from '@/lib/supabase/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function statusVariant(s: Invoice['status']): 'green' | 'amber' | 'red' | 'gray' {
  if (s === 'paid') return 'green'
  if (s === 'pending') return 'amber'
  if (s === 'overdue') return 'red'
  return 'gray'
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}) {
  const { invoiceId } = await params
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />

  const { data: inv, error } = await supabase.from('invoices').select('*').eq('id', invoiceId).maybeSingle()
  if (error || !inv) notFound()
  const invoice = inv as Invoice
  if (invoice.project_id !== bundle.project.id) notFound()

  const issued = new Date(invoice.created_at)
  const due = invoice.due_date ? new Date(`${invoice.due_date}T12:00:00`) : null

  return (
    <div className="iw-animate-slide-up mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/billing#invoice-history"
          className="text-sm font-medium text-[#14b8a6] transition-colors hover:text-[var(--accent-bright)]"
        >
          ← Back to billing
        </Link>
        <a
          href={`/api/billing/invoices/${invoice.id}/pdf`}
          className="text-sm font-medium text-[#14b8a6] transition-colors hover:text-[var(--accent-bright)]"
        >
          Download PDF
        </a>
      </div>
      <header className="border-b border-[var(--iw-border)] pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="iw-mono text-2xl font-semibold tracking-tight text-[var(--iw-text-primary)]">
            {invoice.invoice_number}
          </h1>
          <Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge>
        </div>
        <p className="mt-3 text-sm text-[var(--iw-text-secondary)]">Project {bundle.project.slug}</p>
      </header>
      <div className="space-y-4 rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-surface-elevated)] p-5 shadow-[var(--iw-shadow-1)]">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--iw-text-muted)]">Description</p>
          <p className="mt-1 text-sm text-[var(--iw-text-primary)]">{invoice.description || 'Service invoice'}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--iw-text-muted)]">Issued</p>
            <p className="mt-1 text-sm text-[var(--iw-text-primary)]">{formatInvoiceDate(issued)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--iw-text-muted)]">Due</p>
            <p className="mt-1 text-sm text-[var(--iw-text-primary)]">
              {due ? formatInvoiceDate(due) : '—'}
            </p>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--iw-text-muted)]">Amount</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--iw-text-primary)]">
            {formatCurrency(invoice.amount_cents, invoice.currency ?? 'usd')}
          </p>
        </div>
      </div>
    </div>
  )
}
