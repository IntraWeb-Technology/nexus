import type Stripe from 'stripe'

export type PortalCardSummary = {
  brand: string
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
}

function cardFromPm(pm: Stripe.PaymentMethod | string | null | undefined): PortalCardSummary | null {
  if (!pm || typeof pm === 'string') return null
  if (pm.type !== 'card' || !pm.card) return null
  const c = pm.card
  return {
    brand: (c.display_brand || c.brand || 'card').toUpperCase(),
    last4: c.last4 || '0000',
    expiryMonth: c.exp_month,
    expiryYear: c.exp_year,
    isDefault: true,
  }
}

export async function fetchDefaultCardSummary(
  stripe: Stripe,
  customerId: string,
): Promise<PortalCardSummary | null> {
  const customer = await stripe.customers.retrieve(customerId, {
    expand: ['invoice_settings.default_payment_method'],
  })
  if (customer.deleted) return null

  const expanded = customer.invoice_settings?.default_payment_method
  const fromDefault = cardFromPm(expanded)
  if (fromDefault) return fromDefault

  const list = await stripe.paymentMethods.list({ customer: customerId, type: 'card', limit: 1 })
  const first = list.data[0]
  const summary = cardFromPm(first)
  if (summary) return { ...summary, isDefault: true }
  return null
}
