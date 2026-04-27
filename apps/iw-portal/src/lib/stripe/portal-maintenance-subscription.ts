import type { SubscriptionRow } from '@/lib/supabase/types'
import type Stripe from 'stripe'

type PortalSubscriptionContext = {
  projectId: string
  projectHubspotDealId: string | null | undefined
  clientId: string
  clientEmail: string
  clientStripeCustomerId: string | null | undefined
}

function toIso(ts: number | null | undefined): string | null {
  if (!ts) return null
  return new Date(ts * 1000).toISOString()
}

function toSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionRow['status'] {
  const allowed: SubscriptionRow['status'][] = [
    'active',
    'trialing',
    'past_due',
    'canceled',
    'unpaid',
    'incomplete',
    'incomplete_expired',
  ]
  return allowed.includes(status as SubscriptionRow['status']) ? (status as SubscriptionRow['status']) : 'incomplete'
}

function subscriptionPriority(
  sub: Stripe.Subscription,
  context: PortalSubscriptionContext,
): number {
  const projectMeta = sub.metadata?.project_id?.trim()
  const dealMeta = sub.metadata?.hubspot_deal_id?.trim()
  if (projectMeta && projectMeta === context.projectId) return 100
  if (context.projectHubspotDealId && dealMeta && dealMeta === context.projectHubspotDealId) return 80
  if (sub.status === 'active') return 60
  if (sub.status === 'trialing') return 50
  return 10
}

function mapStripeSubscriptionToRow(
  sub: Stripe.Subscription,
  context: PortalSubscriptionContext,
  stripeCustomerId: string | null,
): SubscriptionRow {
  const item = sub.items.data[0]
  const priceId = item?.price?.id ?? null
  const productId = item?.price?.product
    ? typeof item.price.product === 'string'
      ? item.price.product
      : item.price.product.id
    : null
  const latestInvoiceId =
    typeof sub.latest_invoice === 'string' ? sub.latest_invoice : sub.latest_invoice?.id ?? null
  const periodStartUnix =
    item?.current_period_start ??
    ((sub as unknown as { current_period_start?: number }).current_period_start ?? null)
  const periodEndUnix =
    item?.current_period_end ??
    ((sub as unknown as { current_period_end?: number }).current_period_end ?? null)
  const now = new Date().toISOString()
  return {
    id: `stripe_${sub.id}`,
    project_id: context.projectId,
    client_id: context.clientId,
    stripe_subscription_id: sub.id,
    stripe_customer_id: stripeCustomerId,
    status: toSubscriptionStatus(sub.status),
    price_id: priceId,
    product_id: productId,
    currency: item?.price?.currency ?? null,
    current_period_start: toIso(periodStartUnix ?? null),
    current_period_end: toIso(periodEndUnix ?? null),
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    canceled_at: toIso(sub.canceled_at ?? null),
    latest_stripe_invoice_id: latestInvoiceId,
    last_synced_at: now,
    created_at: now,
    updated_at: now,
  }
}

export async function resolvePortalMaintenanceSubscriptionFromStripe(
  stripe: Stripe,
  context: PortalSubscriptionContext,
): Promise<SubscriptionRow | null> {
  const customerIds = new Set<string>()
  if (context.clientStripeCustomerId?.trim()) {
    customerIds.add(context.clientStripeCustomerId.trim())
  }

  const email = context.clientEmail.trim().toLowerCase()
  if (email) {
    const customersByEmail = await stripe.customers.list({ email, limit: 10 })
    for (const customer of customersByEmail.data) {
      if (!('deleted' in customer) && customer.id) customerIds.add(customer.id)
    }
  }

  if (customerIds.size === 0) return null

  let best: { sub: Stripe.Subscription; customerId: string; score: number } | null = null
  for (const customerId of customerIds) {
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 50 })
    for (const sub of subscriptions.data) {
      const score = subscriptionPriority(sub, context)
      if (!best || score > best.score || (score === best.score && sub.created > best.sub.created)) {
        best = { sub, customerId, score }
      }
    }
  }

  if (!best) return null
  return mapStripeSubscriptionToRow(best.sub, context, best.customerId)
}
