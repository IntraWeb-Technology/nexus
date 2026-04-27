import { billingAppOrigin } from '@/lib/billing/app-origin'
import { pickActiveProjectForPortal } from '@/lib/data/portal'
import { ensureStripeCustomerForPortalClient } from '@/lib/stripe/ensure-stripe-customer'
import {
  findMaintenancePackageById,
  getMaintenancePackagesFromEnv,
  maintenancePackageEligibleForPlanSlug,
  normalizeMaintenancePlanSlug,
} from '@/lib/stripe/maintenance-packages'
import { getStripe } from '@/lib/stripe/server'
import { createServerSupabaseForUser } from '@/lib/supabase/server'
import type { Client, Project } from '@/lib/supabase/types'
import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const maxDuration = 60

const PROJECT_COOKIE = 'iw_portal_project_slug'

export async function POST(request: Request) {
  let packageId: string | undefined
  try {
    const body = (await request.json()) as { package_id?: string }
    packageId = body.package_id
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!packageId || typeof packageId !== 'string') {
    return NextResponse.json({ error: 'package_id required' }, { status: 400 })
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

  const { data: clientRow, error: cErr } = await supabase
    .from('clients')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle()
  if (cErr || !clientRow) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  const client = clientRow as Client

  const { data: projectRows, error: pErr } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', client.id)
  if (pErr || !projectRows?.length) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const cookieStore = await cookies()
  const preferredSlug = cookieStore.get(PROJECT_COOKIE)?.value
  const project = pickActiveProjectForPortal(projectRows as Project[], preferredSlug)

  const packages = getMaintenancePackagesFromEnv()
  const pkg = findMaintenancePackageById(packages, packageId)
  if (!pkg) {
    return NextResponse.json({ error: 'Unknown or unavailable maintenance package' }, { status: 400 })
  }

  const planSlug = normalizeMaintenancePlanSlug(project.portal_plan_slug ?? null)
  if (!maintenancePackageEligibleForPlanSlug(pkg, planSlug)) {
    return NextResponse.json({ error: 'Unknown or unavailable maintenance package' }, { status: 400 })
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
      {
        error:
          'This project already has an active maintenance subscription. Use Billing portal to manage or cancel it first.',
      },
      { status: 409 },
    )
  }

  let base: string
  try {
    base = billingAppOrigin()
  } catch {
    return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL is not configured' }, { status: 503 })
  }

  const meta = {
    portal_checkout: 'maintenance',
    billing_kind: 'recurring_maintenance',
    maintenance_package_id: pkg.id,
    project_id: project.id,
    client_id: client.id,
    project_slug: project.slug ?? '',
    hubspot_deal_id: project.hubspot_deal_id ?? '',
  } as const

  const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    mode: 'subscription',
    line_items: [{ price: pkg.price_id, quantity: 1 }],
    metadata: { ...meta },
    subscription_data: {
      metadata: { ...meta },
    },
    success_url: `${base}/billing?subscribed=1&session_id={CHECKOUT_SESSION_ID}`,
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
