/**
 * Smoke-test POST /api/webhook/n8n with action add_invoice.
 * Requires: .env.local with WEBHOOK_SECRET, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Requires: Next dev (or start) on localhost — tries ports 3000, 3001, 3002.
 *
 *   pnpm exec tsx scripts/test-n8n-add-invoice.ts
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { applyIwPortalEnvValidation } from './lib/iw-portal-env-check'
import { iwPortalEnvLocalPath, resolveMonorepoRoot } from './lib/repo-root'
import { resolveSupabaseScriptEnv } from './lib/supabase-env'

config({ path: iwPortalEnvLocalPath(resolveMonorepoRoot(import.meta.url)) })
config()
applyIwPortalEnvValidation('report', 'test-n8n-add-invoice')

let url: string
let key: string
try {
  const env = resolveSupabaseScriptEnv()
  url = env.url
  key = env.serviceRoleKey
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
const secret = process.env.WEBHOOK_SECRET

async function main() {
  if (!url || !key || !secret) {
    console.error('Missing WEBHOOK_SECRET in .env.local')
    process.exit(1)
  }

  const sb = createClient(url, key, { auth: { persistSession: false } })

  const { data: byDeal } = await sb
    .from('projects')
    .select('id, slug, hubspot_deal_id')
    .not('hubspot_deal_id', 'is', null)
    .limit(1)
    .maybeSingle()

  const { data: anyProj } = await sb.from('projects').select('id, slug, hubspot_deal_id').limit(1).maybeSingle()

  const inv = `E2E-${Date.now()}`
  let body: Record<string, unknown>

  if (byDeal?.hubspot_deal_id) {
    body = {
      action: 'add_invoice',
      hubspot_deal_id: byDeal.hubspot_deal_id,
      data: {
        invoice_number: inv,
        description: 'Automated n8n add_invoice test (hubspot_deal_id)',
        amount_cents: 5000,
        status: 'pending',
        hubspot_invoice_id: `n8n-e2e-${Date.now()}`,
        currency: 'usd',
      },
    }
    console.log('Target: hubspot_deal_id → project slug', byDeal.slug)
  } else if (anyProj?.slug) {
    body = {
      action: 'add_invoice',
      project_slug: anyProj.slug,
      data: {
        invoice_number: inv,
        description: 'Automated n8n add_invoice test (project_slug)',
        amount_cents: 5000,
        status: 'pending',
      },
    }
    console.log('Target: project_slug', anyProj.slug, '(no hubspot_deal_id on projects — use slug path)')
  } else {
    console.error('No rows in public.projects. Run pnpm seed or pnpm seed:test first.')
    process.exit(1)
  }

  const ports = [3000, 3001, 3002]
  let lastErr: string | null = null

  for (const port of ports) {
    const endpoint = `http://127.0.0.1:${port}/api/webhook/n8n`
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-intrawebtech-secret': secret,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
      })
      const text = await res.text()
      if (res.ok) {
        console.log(`SUCCESS via ${endpoint}`)
        console.log('Response:', res.status, text)
        return
      }
      lastErr = `${endpoint} → ${res.status} ${text}`
      if (res.status === 404) continue
      console.error(lastErr)
      process.exit(1)
    } catch (e) {
      lastErr = `${endpoint} → ${e instanceof Error ? e.message : String(e)}`
    }
  }

  console.error('Could not reach Next.js on ports', ports.join(', '))
  console.error(lastErr)
  console.error('Start the app: pnpm dev')
  process.exit(1)
}

main()
