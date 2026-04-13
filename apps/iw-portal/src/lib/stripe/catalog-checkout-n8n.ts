import type { StripeCatalogCheckoutPayload, StripeCatalogDiscountSummary } from '@/lib/n8n/webhooks'
import type Stripe from 'stripe'

export function isPortalInvoiceCheckout(session: Stripe.Checkout.Session): boolean {
  return Boolean(session.metadata?.invoice_id && session.metadata?.project_id)
}

export function looksLikeCatalogStripeCheckout(session: Stripe.Checkout.Session): boolean {
  const m = session.metadata ?? {}
  return Boolean(session.payment_link || m.sku || m.type)
}

/** Completed checkout suitable for catalog forwarding (payment or subscription link). */
export function catalogCheckoutPaymentSucceeded(session: Stripe.Checkout.Session): boolean {
  if (session.status !== 'complete') return false
  if (session.mode === 'payment') return session.payment_status === 'paid'
  if (session.mode === 'subscription') return true
  return false
}

export function shouldForwardCatalogPayment(session: Stripe.Checkout.Session): boolean {
  if (!catalogCheckoutPaymentSucceeded(session)) return false
  if (isPortalInvoiceCheckout(session)) return false
  return looksLikeCatalogStripeCheckout(session)
}

function buildMetadata(session: Stripe.Checkout.Session): Record<string, string> {
  const raw = session.metadata ?? {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw)) {
    if (v != null) out[k] = String(v)
  }
  return out
}

function firstId(ref: string | { id?: string } | null | undefined): string | null {
  if (!ref) return null
  if (typeof ref === 'string') return ref
  return ref.id ?? null
}

function buildDiscountSummary(session: Stripe.Checkout.Session): StripeCatalogDiscountSummary | null {
  const amountDiscount = session.total_details?.amount_discount ?? null
  const list = session.discounts
  let promotionCodeId: string | null = null
  let couponId: string | null = null
  if (list?.length) {
    const d0 = list[0] as { promotion_code?: unknown; coupon?: unknown; deleted?: boolean } | undefined
    if (d0 && !d0.deleted) {
      promotionCodeId = firstId(d0.promotion_code as string | { id?: string } | null | undefined)
      couponId = firstId(d0.coupon as string | { id?: string } | null | undefined)
    }
  }
  if (amountDiscount == null && !promotionCodeId && !couponId) return null
  return {
    amount_discount_cents: amountDiscount,
    promotion_code_id: promotionCodeId,
    coupon_id: couponId,
  }
}

export function buildStripeCatalogCheckoutPayload(session: Stripe.Checkout.Session): StripeCatalogCheckoutPayload {
  const pi = session.payment_intent
  const paymentIntentId = typeof pi === 'string' ? pi : pi?.id ?? null
  const pl = session.payment_link
  const paymentLinkId = typeof pl === 'string' ? pl : pl?.id ?? null
  const sub = session.subscription
  const subscriptionId = typeof sub === 'string' ? sub : sub?.id ?? null

  const email =
    session.customer_details?.email?.trim() ||
    (typeof session.customer_email === 'string' ? session.customer_email.trim() : '') ||
    null

  const discounts = buildDiscountSummary(session)

  return {
    event: 'stripe_catalog_checkout_completed',
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: paymentIntentId,
    stripe_payment_link_id: paymentLinkId,
    stripe_subscription_id: subscriptionId,
    mode: session.mode === 'subscription' ? 'subscription' : 'payment',
    amount_total: session.amount_total,
    currency: session.currency ?? null,
    customer_email: email,
    metadata: buildMetadata(session),
    ...(discounts ? { discounts } : {}),
  }
}
