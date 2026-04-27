/**
 * Controlled smoke test: Supabase subscriptions upsert + n8n HubSpot mirror webhook.
 * Mirrors POST /api/webhook/stripe subscription handler (without Stripe signature).
 *
 * Requires apps/iw-portal/.env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, WEBHOOK_SECRET
 * Optional: N8N_BASE_URL (default https://n8n.intrawebtech.com)
 * Optional: VERIFY_PROJECT_SLUG — project to attach the test subscription to
 * Optional: VERIFY_HUBSPOT_DEAL_ID — numeric HubSpot deal id for the n8n PATCH (overrides DB value)
 *
 * HubSpot deal ids are numeric. Placeholders like hs_deal_placeholder are skipped unless overridden.
 *
 *   pnpm exec tsx scripts/verify-stripe-subscription-sync.ts
 *   pnpm exec tsx scripts/cleanup-verify-subscriptions.ts
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { iwPortalEnvLocalPath, resolveMonorepoRoot } from './lib/repo-root'
import { resolveSupabaseScriptEnv } from './lib/supabase-env'

config({ path: iwPortalEnvLocalPath(resolveMonorepoRoot(import.meta.url)) })
config()

const n8nBase = process.env.N8N_BASE_URL?.replace(/\/$/, '') || 'https://n8n.intrawebtech.com'

function isNumericHubSpotDealId(v: string | null | undefined): boolean {
  if (v == null || typeof v !== 'string') return false
  return /^\d+$/.test(v.trim())
}

async function main() {
  const secret = process.env.WEBHOOK_SECRET?.trim()
  if (!secret) {
    console.error('Missing WEBHOOK_SECRET in .env.local')
    process.exit(1)
  }

  let url: string
  let key: string
  try {
    const env = resolveSupabaseScriptEnv()
    url = env.url
    key = env.serviceRoleKey
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e))
    process.exit(1)
  }

  const sb = createClient(url, key, { auth: { persistSession: false } })
  const slugOverride = process.env.VERIFY_PROJECT_SLUG?.trim()
  const dealOverride = process.env.VERIFY_HUBSPOT_DEAL_ID?.trim()

  let row: {
    id: string
    slug: string | null
    hubspot_deal_id: string | null
    client_id: string
  } | null = null

  if (slugOverride) {
    const { data, error } = await sb
      .from('projects')
      .select('id, slug, hubspot_deal_id, client_id')
      .eq('slug', slugOverride)
      .maybeSingle()
    if (error || !data?.client_id) {
      console.error(error?.message ?? `No project with slug "${slugOverride}".`)
      process.exit(1)
    }
    row = data
  } else {
    const { data: rows, error } = await sb
      .from('projects')
      .select('id, slug, hubspot_deal_id, client_id')
      .not('hubspot_deal_id', 'is', null)
      .limit(80)
    if (error) {
      console.error(error.message)
      process.exit(1)
    }
    row = rows?.find((r) => isNumericHubSpotDealId(r.hubspot_deal_id)) ?? null
  }

  if (!row?.id || !row.client_id) {
    console.error(
      'No suitable project: need a row with a numeric hubspot_deal_id, or set VERIFY_PROJECT_SLUG and VERIFY_HUBSPOT_DEAL_ID.',
    )
    process.exit(1)
  }

  const hubspotDealId = dealOverride ?? row.hubspot_deal_id
  if (!isNumericHubSpotDealId(hubspotDealId)) {
    console.error(
      `hubspot_deal_id must be numeric for HubSpot API (got: ${hubspotDealId ?? 'null'}). Set VERIFY_HUBSPOT_DEAL_ID.`,
    )
    process.exit(1)
  }

  const ts = Date.now()
  const stripeSubId = `sub_verify_${ts}`
  const stripeCustomerId = `cus_verify_${ts}`
  const periodStart = new Date().toISOString()
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { error: upErr } = await sb.from('subscriptions').upsert(
    {
      project_id: row.id,
      client_id: row.client_id,
      stripe_subscription_id: stripeSubId,
      stripe_customer_id: stripeCustomerId,
      status: 'active',
      price_id: 'price_verify_test',
      product_id: 'prod_verify_test',
      currency: 'usd',
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      canceled_at: null,
      latest_stripe_invoice_id: `in_verify_${ts}`,
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_subscription_id' },
  )

  if (upErr) {
    console.error('[supabase] subscriptions upsert failed:', upErr.message)
    console.error('If the table is missing, apply migration 014_stripe_subscriptions.sql')
    process.exit(1)
  }

  const payload = {
    event: 'stripe_subscription_sync' as const,
    stripe_event_id: `evt_verify_${ts}`,
    stripe_subscription_id: stripeSubId,
    stripe_customer_id: stripeCustomerId,
    status: 'active' as const,
    cancel_at_period_end: false,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    latest_invoice_id: `in_verify_${ts}`,
    currency: 'usd',
    amount_cents: 9900,
    price_id: 'price_verify_test',
    product_id: 'prod_verify_test',
    project_slug: row.slug ?? null,
    hubspot_deal_id: hubspotDealId,
  }

  const hookUrl = `${n8nBase}/webhook/portal-stripe-subscription-sync`
  console.log('Supabase: upserted subscription', stripeSubId, 'for project', row.slug)
  console.log('HubSpot deal (PATCH):', hubspotDealId)
  console.log('n8n POST', hookUrl)

  const res = await fetch(hookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-intrawebtech-secret': secret },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  })
  const text = await res.text()
  console.log('n8n response:', res.status, text)

  const { data: readBack } = await sb
    .from('subscriptions')
    .select('stripe_subscription_id, status, project_id, current_period_end')
    .eq('stripe_subscription_id', stripeSubId)
    .maybeSingle()

  console.log('Supabase read-back:', JSON.stringify(readBack, null, 2))
  console.log('\nCleanup: pnpm exec tsx scripts/cleanup-verify-subscriptions.ts')
  console.log(
    `  or: delete from public.subscriptions where stripe_subscription_id = '${stripeSubId}';`,
  )
  if (!res.ok) process.exit(1)
}

main()
