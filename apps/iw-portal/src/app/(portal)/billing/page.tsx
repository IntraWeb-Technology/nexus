import { PortalDataUnavailable } from '@/components/portal/PortalDataUnavailable'
import { syncHubspotCrmInvoicesToProject } from '@/lib/billing/sync-hubspot-crm-to-supabase'
import {
  billingRowsToUiInvoices,
  computeBillingMetrics,
} from '@/lib/billing/billing-ui-serialize'
import { getPortalBundle } from '@/lib/data/portal'
import { isHubSpotConfigured } from '@/lib/hubspot/config'
import { fetchHubSpotBillingInvoices } from '@/lib/hubspot/invoices'
import { fetchDefaultCardSummary } from '@/lib/stripe/default-payment-method'
import {
  getMaintenancePackagesFromEnv,
  maintenancePackagesForPortal,
} from '@/lib/stripe/maintenance-packages'
import { getStripe } from '@/lib/stripe/server'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Invoice, SubscriptionRow } from '@/lib/supabase/types'
import { BillingAlertBanner, buildBillingAlertMessage } from './_components/billing-alert-banner'
import { BillingDetailsCard } from './_components/billing-details-card'
import { BillingHeader } from './_components/billing-header'
import { BillingQueryAlerts } from './_components/billing-query-alerts'
import { BillingStats } from './_components/billing-stats'
import { InvoicesSection } from './_components/invoices-section'
import { PaymentMethodCard } from './_components/payment-method-card'

type BillingPageProps = {
  searchParams?: Promise<{ paid?: string; canceled?: string; subscribed?: string }>
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const q = searchParams ? await searchParams : {}
  const bundle = await getPortalBundle()
  const supabase = await createServerSupabaseForUser()
  if (!bundle || !supabase) return <PortalDataUnavailable />
  const paidQuery = q.paid === '1'
  const canceledQuery = q.canceled === '1'
  const subscribedQuery = q.subscribed === '1'

  const maintenancePackages = maintenancePackagesForPortal(getMaintenancePackagesFromEnv())

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
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('project_id', bundle.project.id)
    .order('updated_at', { ascending: false })
    .limit(1)
  const latestSubscription = ((subData ?? [])[0] ?? null) as SubscriptionRow | null

  // Supabase is the single source of truth for dashboard rendering.
  // HubSpot is used only as an upstream sync source.
  const uiInvoices = billingRowsToUiInvoices(
    supabaseInvoices.map((invoice) => ({ source: 'supabase' as const, invoice })),
  )
  const metrics = computeBillingMetrics(uiInvoices)
  const currency = (uiInvoices[0]?.currency ?? 'usd').toLowerCase()

  let paymentMethod: Awaited<ReturnType<typeof fetchDefaultCardSummary>> = null
  const stripeCustomerId = bundle.client.stripe_customer_id?.trim()
  if (stripeCustomerId) {
    try {
      const stripe = getStripe()
      paymentMethod = await fetchDefaultCardSummary(stripe, stripeCustomerId)
    } catch {
      paymentMethod = null
    }
  }

  const alert = buildBillingAlertMessage(metrics, currency)

  const billingDetails = {
    companyName: bundle.client.company?.trim() || bundle.client.name,
    email: bundle.client.email,
    addressLine1: 'Postal address is not stored in the portal yet.',
    addressLine2: undefined as string | undefined,
    city: '',
    state: '',
    postalCode: '',
    country: '',
    taxId: null as string | null,
    currency: currency.toUpperCase(),
  }

  return (
    <div className="iw-animate-slide-up space-y-8">
      <BillingQueryAlerts
        paidQuery={paidQuery}
        canceledQuery={canceledQuery}
        subscribedQuery={subscribedQuery}
      />
      <BillingHeader
        projectSlug={bundle.project.slug}
        projectId={bundle.project.id}
        currency={currency}
        metrics={metrics}
        invoices={uiInvoices}
      />
      {alert ? <BillingAlertBanner variant={alert.variant} message={alert.message} /> : null}

      {uiInvoices.length > 0 ? <BillingStats metrics={metrics} currency={currency} /> : null}

      <PaymentMethodCard paymentMethod={paymentMethod} hasStripeCustomer={Boolean(stripeCustomerId)} />

      <InvoicesSection
        invoices={uiInvoices}
        projectSlug={bundle.project.slug}
        subscription={latestSubscription}
        maintenancePackages={maintenancePackages}
      />

      <BillingDetailsCard {...billingDetails} />
    </div>
  )
}
