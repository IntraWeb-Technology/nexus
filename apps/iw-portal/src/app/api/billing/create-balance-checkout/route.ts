import { billingAppOrigin } from '@/lib/billing/app-origin'
import { ensureStripeCustomerForPortalClient } from '@/lib/stripe/ensure-stripe-customer'
import { getStripe } from '@/lib/stripe/server'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Client, Invoice } from '@/lib/supabase/types'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export const maxDuration = 60

const MIN_AMOUNT_CENTS = 50

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let projectId: string | undefined
  try {
    const body = (await request.json()) as { project_id?: string }
    projectId = typeof body.project_id === 'string' ? body.project_id : undefined
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!projectId) return NextResponse.json({ error: 'project_id required' }, { status: 400 })

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
  if (cErr || !clientRow) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  const client = clientRow as Client

  const { data: project, error: pErr } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('client_id', client.id)
    .maybeSingle()
  if (pErr || !project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const { data: openRows, error: iErr } = await supabase
    .from('invoices')
    .select('*')
    .eq('project_id', project.id)
    .in('status', ['pending', 'overdue'])
    .order('due_date', { ascending: true, nullsFirst: false })
  if (iErr) return NextResponse.json({ error: 'Could not load invoices' }, { status: 500 })

  const open = (openRows ?? []) as Invoice[]
  if (open.length === 0) {
    return NextResponse.json({ error: 'No open invoices payable in Stripe' }, { status: 400 })
  }

  const total = open.reduce((s, inv) => s + inv.amount_cents, 0)
  if (total < MIN_AMOUNT_CENTS) {
    return NextResponse.json({ error: 'Amount below Stripe minimum' }, { status: 400 })
  }

  const MAX = 40
  if (open.length > MAX) {
    return NextResponse.json(
      { error: `Too many open invoices (${open.length}). Pay up to ${MAX} at a time, or pay individually.` },
      { status: 400 },
    )
  }

  const primaryProjectId = project.id
  const currency = (open[0]!.currency ?? 'usd').toLowerCase()
  const base = billingAppOrigin()

  const metadata: Record<string, string> = {
    bulk_checkout: 'true',
    invoice_count: String(open.length),
    project_id: primaryProjectId,
    client_id: client.id,
    project_slug: project.slug ?? '',
  }
  open.forEach((inv, i) => {
    metadata[`inv_${i}`] = inv.id
  })

  const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    mode: 'payment',
    line_items: open.map((inv) => ({
      price_data: {
        currency,
        product_data: {
          name: `Invoice ${inv.invoice_number}`,
          description: inv.description.slice(0, 450),
        },
        unit_amount: inv.amount_cents,
      },
      quantity: 1,
    })),
    metadata,
    success_url: `${base}/billing?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/billing?canceled=1`,
  }

  let stripeCustomerId: string
  try {
    ;({ stripeCustomerId } = await ensureStripeCustomerForPortalClient(stripe, supabase, client))
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not set up Stripe billing profile'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
  sessionParams.customer = stripeCustomerId

  const session = await stripe.checkout.sessions.create(sessionParams)
  return NextResponse.json({ url: session.url })
}
