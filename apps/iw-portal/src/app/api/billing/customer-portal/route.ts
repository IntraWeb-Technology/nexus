import { billingAppOrigin } from '@/lib/billing/app-origin'
import { ensureStripeCustomerForPortalClient } from '@/lib/stripe/ensure-stripe-customer'
import { getStripe } from '@/lib/stripe/server'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Client } from '@/lib/supabase/types'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let stripe: ReturnType<typeof getStripe>
  try {
    stripe = getStripe()
  } catch {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const supabase = await createServerSupabaseForUser()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { data: clientRow, error: cErr } = await supabase
    .from('clients')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle()
  if (cErr || !clientRow) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }
  const client = clientRow as Client

  let customerId: string
  try {
    ;({ stripeCustomerId: customerId } = await ensureStripeCustomerForPortalClient(stripe, supabase, client))
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not set up Stripe billing profile'
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  const base = billingAppOrigin()
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${base}/billing`,
    })
    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a portal URL' }, { status: 502 })
    }
    return NextResponse.json({ url: session.url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Stripe billing portal error'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
