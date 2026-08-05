import { AdminPageHeader, EmptyState } from '@/components/admin/AdminPrimitives'
import { getDataHealth } from '@/lib/admin/queries'

export default async function AdminDataHealthPage() {
  const data = await getDataHealth()
  const hasFindings =
    data.persisted.length ||
    data.clientsMissingClerk.length ||
    data.projectsMissingHubspot.length ||
    data.invoicesMissingRefs.length

  return (
    <div className="iw-page">
      <AdminPageHeader title="Data health" description="Live checks for missing mappings and integration references." />
      {!hasFindings ? <EmptyState>No live data-health findings are currently detected.</EmptyState> : null}
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="iw-card">
          <h2 className="iw-card-title">Persisted findings</h2>
          {data.persisted.length ? data.persisted.map((row) => (
            <p key={row.id} className="mt-3 border-t border-[var(--hairline)] pt-3 text-sm first:border-0 first:pt-0">
              <span className="iw-chip iw-chip-orange mr-2">{row.severity}</span>{row.message}
            </p>
          )) : <EmptyState>No persisted health findings.</EmptyState>}
        </section>
        <section className="iw-card">
          <h2 className="iw-card-title">Projects missing HubSpot deal</h2>
          {data.projectsMissingHubspot.length ? data.projectsMissingHubspot.map((row) => (
            <p key={row.id} className="mt-3 border-t border-[var(--hairline)] pt-3 text-sm first:border-0 first:pt-0">{row.slug}</p>
          )) : <EmptyState>All visible projects have HubSpot deal IDs.</EmptyState>}
        </section>
        <section className="iw-card">
          <h2 className="iw-card-title">Invoices missing references</h2>
          {data.invoicesMissingRefs.length ? data.invoicesMissingRefs.map((row) => (
            <p key={row.id} className="mt-3 border-t border-[var(--hairline)] pt-3 text-sm first:border-0 first:pt-0">{row.invoice_number} · {row.status}</p>
          )) : <EmptyState>All visible invoices have integration references.</EmptyState>}
        </section>
        <section className="iw-card">
          <h2 className="iw-card-title">Clients missing Clerk</h2>
          {data.clientsMissingClerk.length ? data.clientsMissingClerk.map((row) => (
            <p key={row.id} className="mt-3 border-t border-[var(--hairline)] pt-3 text-sm first:border-0 first:pt-0">{row.name} · {row.email}</p>
          )) : <EmptyState>All visible clients have Clerk mappings.</EmptyState>}
        </section>
      </div>
    </div>
  )
}
