import { auth } from '@clerk/nextjs/server'
import { getStripe } from '@/lib/stripe/server'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Invoice } from '@/lib/supabase/types'
import { NextResponse } from 'next/server'

export const maxDuration = 60

const MIN_AMOUNT_CENTS = 50

function appOrigin(): string {
  const u = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (!u) {
    throw new Error('NEXT_PUBLIC_APP_URL is not set — required for Stripe redirect URLs')
  }
  return u.replace(/\/$/, '')
}

export async function POST(request: Request) {
  let invoiceId: string | undefined
  try {
    const body = (await request.json()) as { invoice_id?: string }
    invoiceId = body.invoice_id
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!invoiceId || typeof invoiceId !== 'string') {
    return NextResponse.json({ error: 'invoice_id required' }, { status: 400 })
  }

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

  const { data: client, error: cErr } = await supabase
    .from('clients')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle()
  if (cErr || !client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const { data: project, error: pErr } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (pErr || !project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const { data: inv, error: iErr } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('project_id', project.id)
    .maybeSingle()
  if (iErr || !inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const invoice = inv as Invoice
  if (invoice.status !== 'pending' && invoice.status !== 'overdue') {
    return NextResponse.json({ error: 'Invoice is not payable' }, { status: 400 })
  }
  if (invoice.amount_cents < MIN_AMOUNT_CENTS) {
    return NextResponse.json({ error: 'Amount below Stripe minimum' }, { status: 400 })
  }

  const currency = (invoice.currency ?? 'usd').toLowerCase()
  const base = appOrigin()

  const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `Invoice ${invoice.invoice_number}`,
            description: invoice.description.slice(0, 500),
          },
          unit_amount: invoice.amount_cents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      invoice_id: invoice.id,
      project_id: project.id,
      client_id: client.id,
      invoice_number: invoice.invoice_number,
      project_slug: project.slug,
      hubspot_deal_id: project.hubspot_deal_id ?? '',
    },
    success_url: `${base}/billing?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/billing?canceled=1`,
  }

  if (client.stripe_customer_id) {
    sessionParams.customer = client.stripe_customer_id
  } else {
    sessionParams.customer_email = client.email
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  await supabase
    .from('invoices')
    .update({ stripe_checkout_session_id: session.id })
    .eq('id', invoice.id)

  return NextResponse.json({ url: session.url })
}
