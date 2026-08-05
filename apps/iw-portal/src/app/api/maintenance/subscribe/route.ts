import { maintenanceLookupKey, type MaintenanceTier } from '@/config/maintenance-features'
import { billingAppOrigin } from '@/lib/billing/app-origin'
import { getMaintenanceTierForDeal } from '@/lib/hubspot/deal-tier'
import { ensureStripeCustomerForPortalClient } from '@/lib/stripe/ensure-stripe-customer'
import { getStripe } from '@/lib/stripe/server'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Client, Project } from '@/lib/supabase/types'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 60

const subscribeBodySchema = z.object({
  dealId: z.string().trim().min(1),
  tier: z.enum(['essential', 'standard', 'premium']),
  cadence: z.enum(['monthly', 'annual']),
})

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let parsedBody: z.infer<typeof subscribeBodySchema>
  try {
    parsedBody = subscribeBodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  let stripe: ReturnType<typeof getStripe>
  try {
    stripe = getStripe()
  } catch {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { data: clientRow, error: clientErr } = await supabase
    .from('clients')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle()
  if (clientErr || !clientRow) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  const client = clientRow as Client

  const { data: projectRow, error: projectErr } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', client.id)
    .eq('hubspot_deal_id', parsedBody.dealId)
    .maybeSingle()
  if (projectErr || !projectRow) {
    return NextResponse.json({ error: 'Project not found for this deal' }, { status: 404 })
  }
  const project = projectRow as Project

  const resolvedTier = getMaintenanceTierForDeal(project.hubspot_deal_id, project.portal_plan_slug ?? null)
  if (!resolvedTier || resolvedTier !== parsedBody.tier) {
    return NextResponse.json({ error: 'Tier mismatch for this deal' }, { status: 409 })
  }

  const { data: activeSub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('project_id', project.id)
    .in('status', ['active', 'trialing'])
    .limit(1)
    .maybeSingle()
  if (activeSub) {
    return NextResponse.json(
      { error: 'This project already has an active maintenance subscription.' },
      { status: 409 },
    )
  }

  const lookupKey = maintenanceLookupKey(parsedBody.tier as MaintenanceTier, parsedBody.cadence)
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  })
  const selectedPrice = prices.data[0]
  if (!selectedPrice?.id) {
    return NextResponse.json({ error: 'Pricing temporarily unavailable' }, { status: 503 })
  }

  let origin: string
  try {
    origin = billingAppOrigin()
  } catch {
    return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL is not configured' }, { status: 503 })
  }

  let stripeCustomerId: string
  try {
    ;({ stripeCustomerId } = await ensureStripeCustomerForPortalClient(stripe, supabase, client))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not set up Stripe billing profile'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const metadata = {
    portal_checkout: 'maintenance',
    billing_kind: 'recurring_maintenance',
    maintenance_tier: parsedBody.tier,
    maintenance_cadence: parsedBody.cadence,
    maintenance_lookup_key: lookupKey,
    project_id: project.id,
    client_id: client.id,
    project_slug: project.slug ?? '',
    hubspot_deal_id: project.hubspot_deal_id ?? '',
  } as const

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [{ price: selectedPrice.id, quantity: 1 }],
    metadata,
    subscription_data: { metadata },
    success_url: `${origin}/billing?subscribed=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/billing?canceled=1`,
  })

  return NextResponse.json({ url: session.url })
}
