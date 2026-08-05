import { triggerStripeSubscriptionSync } from '@/lib/n8n/client'
import { getStripe } from '@/lib/stripe/server'
import { createServiceSupabase } from '@/lib/supabase/server'
import type { SubscriptionStatus } from '@/lib/supabase/types'
import { validateIntrawebSecret } from '@/lib/webhooks/secret'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { z } from 'zod'

const syncBodySchema = z
  .object({
    subscriptionId: z.string().trim().min(1),
    projectId: z.string().trim().min(1).optional(),
    clientId: z.string().trim().min(1).optional(),
  })
  .refine((value) => (value.projectId ? Boolean(value.clientId) : true), {
    message: 'clientId is required when projectId is provided',
    path: ['clientId'],
  })

function toIso(ts: number | null | undefined): string | null {
  if (!ts) return null
  return new Date(ts * 1000).toISOString()
}

function normalizeSubscriptionStatus(raw: string): SubscriptionStatus {
  const s = raw as SubscriptionStatus
  const allowed: SubscriptionStatus[] = [
    'active',
    'trialing',
    'past_due',
    'canceled',
    'unpaid',
    'incomplete',
    'incomplete_expired',
  ]
  return allowed.includes(s) ? s : 'incomplete'
}

type ResolvedProject = {
  projectId: string
  projectSlug: string | null
  clientId: string
  hubspotDealId: string | null
}

async function resolveProjectFromSubscription(
  supabase: ReturnType<typeof createServiceSupabase>,
  subscription: Stripe.Subscription,
  overrides?: { projectId?: string; clientId?: string },
): Promise<ResolvedProject | null> {
  if (overrides?.projectId && overrides.clientId) {
    const { data: project } = await supabase
      .from('projects')
      .select('id, slug, client_id, hubspot_deal_id')
      .eq('id', overrides.projectId)
      .maybeSingle()
    if (project?.client_id === overrides.clientId) {
      return {
        projectId: project.id,
        projectSlug: project.slug ?? null,
        clientId: project.client_id,
        hubspotDealId: project.hubspot_deal_id ?? null,
      }
    }
    return null
  }

  const meta = subscription.metadata ?? {}
  const metaProjectId = typeof meta.project_id === 'string' ? meta.project_id.trim() : ''
  const metaClientId = typeof meta.client_id === 'string' ? meta.client_id.trim() : ''
  if (metaProjectId && metaClientId) {
    const { data: project } = await supabase
      .from('projects')
      .select('id, slug, client_id, hubspot_deal_id')
      .eq('id', metaProjectId)
      .maybeSingle()
    if (project?.client_id === metaClientId) {
      return {
        projectId: project.id,
        projectSlug: project.slug ?? null,
        clientId: project.client_id,
        hubspotDealId: project.hubspot_deal_id ?? null,
      }
    }
  }

  const stripeCustomerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id ?? null
  if (!stripeCustomerId) return null

  const { data: clients } = await supabase
    .from('clients')
    .select('id, created_at')
    .eq('stripe_customer_id', stripeCustomerId)
    .order('created_at', { ascending: false })
    .limit(1)
  const client = clients?.[0] ?? null
  if (!client?.id) return null

  const { data: project } = await supabase
    .from('projects')
    .select('id, slug, client_id, hubspot_deal_id')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!project?.id) return null

  return {
    projectId: project.id,
    projectSlug: project.slug ?? null,
    clientId: project.client_id,
    hubspotDealId: project.hubspot_deal_id ?? null,
  }
}

export async function POST(request: Request) {
  if (!validateIntrawebSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: z.infer<typeof syncBodySchema>
  try {
    body = syncBodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  let stripe: ReturnType<typeof getStripe>
  try {
    stripe = getStripe()
  } catch {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const supabase = createServiceSupabase()

  let subscription: Stripe.Subscription
  try {
    subscription = await stripe.subscriptions.retrieve(body.subscriptionId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Subscription fetch failed'
    return NextResponse.json({ error: message }, { status: 404 })
  }

  const resolved = await resolveProjectFromSubscription(supabase, subscription, {
    projectId: body.projectId,
    clientId: body.clientId,
  })
  if (!resolved) {
    return NextResponse.json(
      {
        error: 'Unable to map subscription to a portal project',
        details: {
          stripeCustomerId:
            typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id ?? null,
          metadataProjectId: subscription.metadata?.project_id ?? null,
          metadataClientId: subscription.metadata?.client_id ?? null,
        },
      },
      { status: 409 },
    )
  }

  const stripeCustomerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id ?? null
  const item = subscription.items.data[0]
  const priceId = item?.price?.id ?? null
  const productId = item?.price?.product
    ? typeof item.price.product === 'string'
      ? item.price.product
      : item.price.product.id
    : null
  const currency = item?.price?.currency ?? null
  const latestInvoiceId =
    typeof subscription.latest_invoice === 'string'
      ? subscription.latest_invoice
      : subscription.latest_invoice?.id ?? null
  const status = normalizeSubscriptionStatus(subscription.status)
  const periodStartUnix =
    item?.current_period_start ??
    ((subscription as unknown as { current_period_start?: number }).current_period_start ?? null)
  const periodEndUnix =
    item?.current_period_end ??
    ((subscription as unknown as { current_period_end?: number }).current_period_end ?? null)
  const currentPeriodStart = toIso(periodStartUnix ?? null)
  const currentPeriodEnd = toIso(periodEndUnix ?? null)
  const canceledAt = toIso(subscription.canceled_at ?? null)

  const { error: upsertError } = await supabase.from('subscriptions').upsert(
    {
      project_id: resolved.projectId,
      client_id: resolved.clientId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: stripeCustomerId,
      status,
      price_id: priceId,
      product_id: productId,
      currency,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
      canceled_at: canceledAt,
      latest_stripe_invoice_id: latestInvoiceId,
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_subscription_id' },
  )
  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  await triggerStripeSubscriptionSync({
    event: 'stripe_subscription_sync',
    stripe_event_id: `manual-sync-${Date.now()}`,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: stripeCustomerId,
    status,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    latest_invoice_id: latestInvoiceId,
    currency,
    amount_cents: item?.price?.unit_amount ?? null,
    price_id: priceId,
    product_id: productId,
    project_slug: resolved.projectSlug,
    hubspot_deal_id: resolved.hubspotDealId,
  })

  return NextResponse.json({
    ok: true,
    mapped: resolved,
    subscription: {
      id: subscription.id,
      stripeCustomerId,
      status,
      priceId,
    },
  })
}
