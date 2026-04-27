import { maintenanceLookupKey, type MaintenanceTier } from '@/config/maintenance-features'
import { getStripe } from '@/lib/stripe/server'
import type Stripe from 'stripe'

export type MaintenancePricesResult =
  | { ok: true; prices: { monthly: Stripe.Price; annual: Stripe.Price } }
  | { ok: false; reason: string }

function selectRecurringPrice(
  prices: Stripe.Price[],
  lookupKey: string,
  interval: 'month' | 'year',
): Stripe.Price | null {
  return (
    prices.find((price) => {
      const currentLookup = price.lookup_key ?? null
      return currentLookup === lookupKey && price.type === 'recurring' && price.recurring?.interval === interval
    }) ?? null
  )
}

export async function getMaintenancePrices(tier: MaintenanceTier): Promise<MaintenancePricesResult> {
  try {
    const stripe = getStripe()
    const monthlyLookupKey = maintenanceLookupKey(tier, 'monthly')
    const annualLookupKey = maintenanceLookupKey(tier, 'annual')

    const list = await stripe.prices.list({
      lookup_keys: [monthlyLookupKey, annualLookupKey],
      active: true,
      expand: ['data.product'],
      limit: 10,
    })

    const monthly = selectRecurringPrice(list.data, monthlyLookupKey, 'month')
    const annual = selectRecurringPrice(list.data, annualLookupKey, 'year')
    if (!monthly || !annual) {
      return { ok: false, reason: `Missing Stripe prices for tier "${tier}".` }
    }

    return { ok: true, prices: { monthly, annual } }
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'Could not load Stripe maintenance prices.',
    }
  }
}
