import {
  triggerInvoicePaid,
  triggerStripeCatalogCheckout,
  triggerStripeSubscriptionSync,
} from '@/lib/n8n/client'
import {
  buildStripeCatalogCheckoutPayload,
  shouldForwardCatalogPayment,
} from '@/lib/stripe/catalog-checkout-n8n'
import { recordIntegrationEvent } from '@/lib/integrations/events'
import { getStripe, getStripeWebhookSecret } from '@/lib/stripe/server'
import { createServiceSupabase } from '@/lib/supabase/server'
import type { Invoice, SubscriptionStatus } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

async function markOneInvoicePaid(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
  invoice: Invoice,
  projectId: string,
  clientId: string | undefined,
  opts?: { skipCustomerSync?: boolean },
) {
  if (invoice.status === 'paid') return

  const paidAt = new Date().toISOString()
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null

  const { error: upErr } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: paidAt,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq('id', invoice.id)
    .eq('project_id', projectId)
  if (upErr) {
    console.error('[stripe webhook] invoice update failed', upErr)
    return
  }

  if (
    !opts?.skipCustomerSync &&
    clientId &&
    typeof session.customer === 'string' &&
    session.customer
  ) {
    await supabase.from('clients').update({ stripe_customer_id: session.customer }).eq('id', clientId)
  }

  const { data: project } = await supabase.from('projects').select('slug').eq('id', projectId).maybeSingle()

  await supabase.from('activity_log').insert({
    project_id: projectId,
    type: 'payment',
    label: 'Invoice paid (Stripe)',
    detail: `${invoice.invoice_number} — session ${session.id}`,
  })

  await supabase.from('notifications').insert({
    project_id: projectId,
    type: 'invoice',
    title: 'Payment received',
    body: `Invoice ${invoice.invoice_number} was paid.`,
    read: false,
  })

  if (project?.slug) {
    await triggerInvoicePaid({
      project_slug: project.slug,
      invoice_number: invoice.invoice_number,
      amount_cents: invoice.amount_cents,
      stripe_checkout_session_id: session.id,
    })
  }
}

async function markBulkInvoicesPaidFromSession(session: Stripe.Checkout.Session) {
  if (session.metadata?.bulk_checkout !== 'true') return false

  const projectId = session.metadata?.project_id
  const clientId = session.metadata?.client_id
  const count = Number.parseInt(session.metadata?.invoice_count ?? '0', 10)
  if (!projectId || !Number.isFinite(count) || count < 1) {
    console.warn('[stripe webhook] bulk checkout missing metadata', session.id)
    return true
  }

  const ids: string[] = []
  for (let i = 0; i < count; i++) {
    const v = session.metadata?.[`inv_${i}`]
    if (typeof v === 'string' && v.length > 0) ids.push(v)
  }
  if (ids.length === 0) {
    console.warn('[stripe webhook] bulk checkout no invoice ids', session.id)
    return true
  }

  const supabase = createServiceSupabase()
  for (const invoiceId of ids) {
    const { data: inv, error: fetchErr } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('project_id', projectId)
      .maybeSingle()
    if (fetchErr || !inv) {
      console.error('[stripe webhook] bulk invoice not found', invoiceId, fetchErr)
      continue
    }
    await markOneInvoicePaid(supabase, session, inv as Invoice, projectId, clientId, {
      skipCustomerSync: true,
    })
  }
  if (clientId && typeof session.customer === 'string' && session.customer) {
    await supabase.from('clients').update({ stripe_customer_id: session.customer }).eq('id', clientId)
  }
  return true
}

async function markInvoicePaidFromSession(session: Stripe.Checkout.Session) {
  const invoiceId = session.metadata?.invoice_id
  const projectId = session.metadata?.project_id
  const clientId = session.metadata?.client_id
  if (!invoiceId || !projectId) {
    console.warn('[stripe webhook] missing metadata on session', session.id)
    return
  }

  const supabase = createServiceSupabase()
  const { data: inv, error: fetchErr } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('project_id', projectId)
    .maybeSingle()
  if (fetchErr || !inv) {
    console.error('[stripe webhook] invoice not found', invoiceId, fetchErr)
    return
  }

  await markOneInvoicePaid(supabase, session, inv as Invoice, projectId, clientId)
}

type StripeResolvedProject = {
  project_id: string
  project_slug: string | null
  client_id: string
  hubspot_deal_id: string | null
}

async function resolveProjectForStripeCustomer(
  supabase: SupabaseClient,
  stripeCustomerId: string | null,
): Promise<StripeResolvedProject | null> {
  if (!stripeCustomerId) return null
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle()
  if (!client?.id) return null

  const { data: project } = await supabase
    .from('projects')
    .select('id, slug, hubspot_deal_id')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!project?.id) return null
  return {
    project_id: project.id,
    project_slug: project.slug ?? null,
    client_id: client.id,
    hubspot_deal_id: project.hubspot_deal_id ?? null,
  }
}

/** Prefer subscription metadata from portal maintenance checkout (correct project when client has many). */
async function resolveProjectForStripeSubscription(
  supabase: SupabaseClient,
  sub: Stripe.Subscription,
): Promise<StripeResolvedProject | null> {
  const meta = sub.metadata ?? {}
  const projectId = typeof meta.project_id === 'string' ? meta.project_id.trim() : ''
  const clientId = typeof meta.client_id === 'string' ? meta.client_id.trim() : ''
  if (projectId && clientId) {
    const { data: project } = await supabase
      .from('projects')
      .select('id, slug, hubspot_deal_id, client_id')
      .eq('id', projectId)
      .maybeSingle()
    if (project && project.client_id === clientId) {
      return {
        project_id: project.id,
        project_slug: project.slug ?? null,
        client_id: project.client_id,
        hubspot_deal_id: project.hubspot_deal_id ?? null,
      }
    }
  }
  const stripeCustomerId =
    typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null
  return resolveProjectForStripeCustomer(supabase, stripeCustomerId)
}

async function syncStripeCustomerFromCheckoutSession(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
) {
  const clientId = session.metadata?.client_id?.trim()
  const customer = session.customer
  if (!clientId || typeof customer !== 'string' || !customer) return
  await supabase.from('clients').update({ stripe_customer_id: customer }).eq('id', clientId)
}

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

async function upsertSubscriptionFromStripe(
  supabase: SupabaseClient,
  sub: Stripe.Subscription,
  eventId: string,
) {
  const stripeCustomerId =
    typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null
  const resolved = await resolveProjectForStripeSubscription(supabase, sub)
  if (!resolved) {
    console.warn('[stripe webhook] subscription without mapped project', sub.id, stripeCustomerId)
    return
  }
  const item = sub.items.data[0]
  const priceId = item?.price?.id ?? null
  const productId = item?.price?.product
    ? typeof item.price.product === 'string'
      ? item.price.product
      : item.price.product.id
    : null
  const currency = item?.price?.currency ?? null
  const latestInvoiceId =
    typeof sub.latest_invoice === 'string' ? sub.latest_invoice : sub.latest_invoice?.id ?? null
  const status = normalizeSubscriptionStatus(sub.status)
  const periodStartUnix =
    item?.current_period_start ??
    ((sub as unknown as { current_period_start?: number }).current_period_start ?? null)
  const periodEndUnix =
    item?.current_period_end ??
    ((sub as unknown as { current_period_end?: number }).current_period_end ?? null)
  const currentPeriodStart = toIso(periodStartUnix ?? null)
  const currentPeriodEnd = toIso(periodEndUnix ?? null)
  const canceledAt = toIso(sub.canceled_at ?? null)

  await supabase.from('subscriptions').upsert(
    {
      project_id: resolved.project_id,
      client_id: resolved.client_id,
      stripe_subscription_id: sub.id,
      stripe_customer_id: stripeCustomerId,
      status,
      price_id: priceId,
      product_id: productId,
      currency,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: Boolean(sub.cancel_at_period_end),
      canceled_at: canceledAt,
      latest_stripe_invoice_id: latestInvoiceId,
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_subscription_id' },
  )

  await triggerStripeSubscriptionSync({
    event: 'stripe_subscription_sync',
    stripe_event_id: eventId,
    stripe_subscription_id: sub.id,
    stripe_customer_id: stripeCustomerId,
    status,
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    latest_invoice_id: latestInvoiceId,
    currency,
    amount_cents: item?.price?.unit_amount ?? null,
    price_id: priceId,
    product_id: productId,
    project_slug: resolved.project_slug,
    hubspot_deal_id: resolved.hubspot_deal_id,
  })
}

async function resolveProjectForStripeRecurringInvoice(
  supabase: SupabaseClient,
  stripeSubscriptionId: string | null,
  stripeCustomerId: string | null,
): Promise<StripeResolvedProject | null> {
  if (stripeSubscriptionId) {
    const { data: row } = await supabase
      .from('subscriptions')
      .select('project_id, client_id')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .maybeSingle()
    if (row?.project_id && row.client_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('id, slug, hubspot_deal_id, client_id')
        .eq('id', row.project_id)
        .maybeSingle()
      if (project && project.client_id === row.client_id) {
        return {
          project_id: project.id,
          project_slug: project.slug ?? null,
          client_id: row.client_id,
          hubspot_deal_id: project.hubspot_deal_id ?? null,
        }
      }
    }
  }
  return resolveProjectForStripeCustomer(supabase, stripeCustomerId)
}

async function upsertRecurringInvoiceFromStripeInvoice(
  supabase: SupabaseClient,
  inv: Stripe.Invoice,
) {
  const rawSub = (inv as unknown as { subscription?: string | { id?: string } | null }).subscription
  const subscriptionId =
    typeof rawSub === 'string' ? rawSub : rawSub && typeof rawSub === 'object' ? rawSub.id ?? null : null
  if (!subscriptionId) return
  const stripeCustomerId =
    typeof inv.customer === 'string' ? inv.customer : inv.customer?.id ?? null
  const resolved = await resolveProjectForStripeRecurringInvoice(
    supabase,
    subscriptionId,
    stripeCustomerId,
  )
  if (!resolved) return

  const invoiceNumber = inv.number || `STRIPE-${inv.id.slice(-8)}`
  const dueDate =
    inv.due_date != null ? new Date(inv.due_date * 1000).toISOString().slice(0, 10) : null
  const periodStart =
    inv.period_start != null ? new Date(inv.period_start * 1000).toISOString().slice(0, 10) : null
  const periodEnd =
    inv.period_end != null ? new Date(inv.period_end * 1000).toISOString().slice(0, 10) : null
  const paidFlag = Boolean((inv as unknown as { paid?: boolean }).paid)
  const status = paidFlag
    ? 'paid'
    : inv.status === 'open'
      ? 'pending'
      : inv.status === 'uncollectible'
        ? 'overdue'
        : 'pending'
  const amountCents = inv.amount_due ?? inv.amount_remaining ?? inv.amount_paid ?? 0
  const currency = inv.currency ? String(inv.currency).toLowerCase() : 'usd'

  await supabase.from('invoices').upsert(
    {
      project_id: resolved.project_id,
      invoice_number: invoiceNumber,
      description: 'Monthly maintenance subscription invoice',
      amount_cents: Math.max(0, amountCents),
      status,
      due_date: dueDate,
      paid_at: inv.status_transitions?.paid_at ? new Date(inv.status_transitions.paid_at * 1000).toISOString() : null,
      currency,
      billing_phase: 'maintenance',
      billing_kind: 'recurring_maintenance',
      external_source: 'stripe',
      external_object_id: inv.id,
      service_period_start: periodStart,
      service_period_end: periodEnd,
      maintenance_group_key: subscriptionId,
    },
    { onConflict: 'external_source,external_object_id' },
  )
}

export async function POST(request: Request) {
  let stripe: ReturnType<typeof getStripe>
  let secret: string
  try {
    stripe = getStripe()
    secret = getStripeWebhookSecret()
  } catch (e) {
    console.error('[stripe webhook]', e)
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const raw = await request.text()
  const sig = request.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret)
  } catch (err) {
    await recordIntegrationEvent({
      provider: 'stripe',
      eventType: 'signature.invalid',
      status: 'failed',
      lastError: err instanceof Error ? err.message : 'Invalid signature',
    })
    console.error('[stripe webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  await recordIntegrationEvent({
    provider: 'stripe',
    eventType: event.type,
    externalEventId: event.id,
    status: 'received',
    payload: event.data.object,
  })

  try {
    const supabase = createServiceSupabase()
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === 'subscription') {
        await syncStripeCustomerFromCheckoutSession(supabase, session)
      }
      if (session.mode === 'payment' && session.payment_status === 'paid') {
        const bulk = await markBulkInvoicesPaidFromSession(session)
        if (!bulk) await markInvoicePaidFromSession(session)
      }
      if (shouldForwardCatalogPayment(session)) {
        await triggerStripeCatalogCheckout(buildStripeCatalogCheckoutPayload(session))
      }
    }
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      await upsertSubscriptionFromStripe(supabase, event.data.object as Stripe.Subscription, event.id)
    }
    if (event.type === 'invoice.paid' || event.type === 'invoice.payment_failed') {
      await upsertRecurringInvoiceFromStripeInvoice(supabase, event.data.object as Stripe.Invoice)
    }
  } catch (e) {
    await recordIntegrationEvent({
      provider: 'stripe',
      eventType: event.type,
      externalEventId: event.id,
      status: 'failed',
      payload: event.data.object,
      lastError: e instanceof Error ? e.message : 'Stripe webhook handler failed',
    })
    console.error('[stripe webhook] handler error', e)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
