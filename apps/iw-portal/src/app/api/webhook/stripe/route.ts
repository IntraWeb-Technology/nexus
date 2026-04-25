import { triggerInvoicePaid, triggerStripeCatalogCheckout } from '@/lib/n8n/client'
import {
  buildStripeCatalogCheckoutPayload,
  shouldForwardCatalogPayment,
} from '@/lib/stripe/catalog-checkout-n8n'
import { getStripe, getStripeWebhookSecret } from '@/lib/stripe/server'
import { createServiceSupabase } from '@/lib/supabase/server'
import type { Invoice } from '@/lib/supabase/types'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

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

  const invoice = inv as Invoice
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

  if (clientId && typeof session.customer === 'string' && session.customer) {
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
    triggerInvoicePaid({
      project_slug: project.slug,
      invoice_number: invoice.invoice_number,
      amount_cents: invoice.amount_cents,
      stripe_checkout_session_id: session.id,
    })
  }
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
    console.error('[stripe webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === 'payment' && session.payment_status === 'paid') {
        await markInvoicePaidFromSession(session)
      }
      if (shouldForwardCatalogPayment(session)) {
        triggerStripeCatalogCheckout(buildStripeCatalogCheckoutPayload(session))
      }
    }
  } catch (e) {
    console.error('[stripe webhook] handler error', e)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
