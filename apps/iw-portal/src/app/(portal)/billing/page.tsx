import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { BillingBody, BillingWithHubSpot } from '@/components/portal/BillingWithHubSpot'
import { HubSpotGate } from '@/components/portal/HubSpotGate'
import { syncHubspotCrmInvoicesToProject } from '@/lib/billing/sync-hubspot-crm-to-supabase'
import { getPortalBundle } from '@/lib/data/portal'
import { isHubSpotConfigured } from '@/lib/hubspot/config'
import { fetchHubSpotBillingInvoices } from '@/lib/hubspot/invoices'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Invoice } from '@/lib/supabase/types'

type BillingPageProps = {
  searchParams?: Promise<{ paid?: string; canceled?: string }>
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const q = searchParams ? await searchParams : {}
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />
  const paidQuery = q.paid === '1'
  const canceledQuery = q.canceled === '1'

  const hubspotCrmInvoices =
    isHubSpotConfigured() && (bundle.project.hubspot_deal_id || bundle.client.hubspot_contact_id)
      ? await fetchHubSpotBillingInvoices({
          hubspotDealId: bundle.project.hubspot_deal_id,
          hubspotContactId: bundle.client.hubspot_contact_id,
        })
      : []

  if (hubspotCrmInvoices.length > 0) {
    await syncHubspotCrmInvoicesToProject(bundle.project.id, hubspotCrmInvoices)
  }

  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('project_id', bundle.project.id)
    .order('created_at', { ascending: true })
  const supabaseInvoices = (data ?? []) as Invoice[]

  return (
    <div className="iw-animate-slide-up space-y-8">
      <header className="border-b border-[var(--iw-border)] pb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--iw-text)] md:text-[1.75rem]">
          Billing
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--iw-text-2)] md:text-[15px]">
          Invoices and payments for{' '}
          <span className="iw-mono font-medium text-[var(--iw-text)]">{bundle.project.slug}</span>. Totals include
          synced records from your account where applicable.
        </p>
      </header>
      <HubSpotGate
        fallback={
          <BillingBody
            supabaseInvoices={supabaseInvoices}
            hubspotInvoices={[]}
            paidQuery={paidQuery}
            canceledQuery={canceledQuery}
          />
        }
      >
        <BillingWithHubSpot
          supabaseInvoices={supabaseInvoices}
          hubspotCrmInvoices={hubspotCrmInvoices}
          paidQuery={paidQuery}
          canceledQuery={canceledQuery}
        />
      </HubSpotGate>
    </div>
  )
}
