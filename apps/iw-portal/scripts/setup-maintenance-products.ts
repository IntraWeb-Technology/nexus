import { config } from 'dotenv'
import Stripe from 'stripe'
import { iwPortalEnvLocalPath, resolveMonorepoRoot } from './lib/repo-root'

config({ path: iwPortalEnvLocalPath(resolveMonorepoRoot(import.meta.url)) })
config()

type TierSeed = {
  tier: 'essential' | 'standard' | 'premium'
  productName: string
  monthlyUnitAmount: number
  annualUnitAmount: number
}

const SEEDS: TierSeed[] = [
  { tier: 'essential', productName: 'Maintenance Essential', monthlyUnitAmount: 49900, annualUnitAmount: 499000 },
  { tier: 'standard', productName: 'Maintenance Standard', monthlyUnitAmount: 99900, annualUnitAmount: 999000 },
  { tier: 'premium', productName: 'Maintenance Premium', monthlyUnitAmount: 199900, annualUnitAmount: 1999000 },
]

async function ensureProduct(stripe: Stripe, seed: TierSeed): Promise<Stripe.Product> {
  const list = await stripe.products.search({ query: `name:'${seed.productName}'`, limit: 1 })
  if (list.data[0]) return list.data[0]

  return stripe.products.create({
    name: seed.productName,
    metadata: { maintenance_tier: seed.tier },
  })
}

async function ensurePrice(
  stripe: Stripe,
  productId: string,
  lookupKey: string,
  interval: 'month' | 'year',
  amount: number,
) {
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1, active: true })
  if (existing.data[0]) {
    return existing.data[0]
  }

  return stripe.prices.create({
    product: productId,
    currency: 'usd',
    unit_amount: amount,
    recurring: { interval },
    lookup_key: lookupKey,
    transfer_lookup_key: true,
    metadata: { maintenance_lookup_key: lookupKey },
  })
}

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim()
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is required')
  }

  const stripe = new Stripe(secretKey, { typescript: true })

  for (const seed of SEEDS) {
    const product = await ensureProduct(stripe, seed)
    const monthlyLookup = `maintenance_${seed.tier}_monthly`
    const annualLookup = `maintenance_${seed.tier}_annual`

    const monthly = await ensurePrice(
      stripe,
      product.id,
      monthlyLookup,
      'month',
      seed.monthlyUnitAmount,
    )
    const annual = await ensurePrice(stripe, product.id, annualLookup, 'year', seed.annualUnitAmount)

    console.log(
      [
        `tier=${seed.tier}`,
        `product=${product.id}`,
        `monthly=${monthly.id}(${monthlyLookup})`,
        `annual=${annual.id}(${annualLookup})`,
      ].join(' '),
    )
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
