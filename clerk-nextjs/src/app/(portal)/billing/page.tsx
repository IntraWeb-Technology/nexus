import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { BillingBody, BillingWithHubSpot } from '@/components/portal/BillingWithHubSpot'
import { HubSpotGate } from '@/components/portal/HubSpotGate'
import { getPortalBundle } from '@/lib/data/portal'
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
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('project_id', bundle.project.id)
    .order('created_at', { ascending: true })
  const supabaseInvoices = (data ?? []) as Invoice[]
  const paidQuery = q.paid === '1'
  const canceledQuery = q.canceled === '1'

  return (
    <div className="space-y-6">
      <h1>Billing</h1>
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
          hubspotDealId={bundle.project.hubspot_deal_id}
          hubspotContactId={bundle.client.hubspot_contact_id}
          paidQuery={paidQuery}
          canceledQuery={canceledQuery}
        />
      </HubSpotGate>
    </div>
  )
}
