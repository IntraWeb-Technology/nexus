/**
 * Creates HubSpot **deal** properties mirrored from Stripe subscription sync (n8n workflow).
 *
 * Prerequisites:
 *   - HUBSPOT_PRIVATE_APP_TOKEN with scopes: crm.schemas.deals.write (and read)
 *
 * Run from apps/iw-portal:
 *   pnpm hubspot:ensure-subscription-deal-properties
 *
 * Safe to re-run: existing properties get label PATCH only (same pattern as change-order script).
 */
import { config } from 'dotenv'
import { iwPortalEnvLocalPath, resolveMonorepoRoot } from '../lib/repo-root'

config({ path: iwPortalEnvLocalPath(resolveMonorepoRoot(import.meta.url)) })

const HUBSPOT_API = 'https://api.hubapi.com'
const TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN
const GROUP = 'dealinformation'

const BOOLEAN_PROPERTY_OPTIONS = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
]

type PropInput = Record<string, unknown>

const PROPERTIES: PropInput[] = [
  {
    name: 'stripe_subscription_id',
    label: 'Stripe subscription ID',
    type: 'string',
    fieldType: 'text',
    groupName: GROUP,
  },
  {
    name: 'iw_subscription_status',
    label: 'Subscription status (Stripe)',
    type: 'string',
    fieldType: 'text',
    groupName: GROUP,
  },
  {
    name: 'iw_current_period_start',
    label: 'Current period start (ISO)',
    type: 'string',
    fieldType: 'text',
    groupName: GROUP,
  },
  {
    name: 'iw_current_period_end',
    label: 'Current period end (ISO)',
    type: 'string',
    fieldType: 'text',
    groupName: GROUP,
  },
  {
    name: 'iw_cancel_at_period_end',
    label: 'Cancel at period end',
    type: 'bool',
    fieldType: 'booleancheckbox',
    groupName: GROUP,
    options: BOOLEAN_PROPERTY_OPTIONS,
  },
  {
    name: 'iw_latest_invoice_id',
    label: 'Latest Stripe invoice ID',
    type: 'string',
    fieldType: 'text',
    groupName: GROUP,
  },
  {
    name: 'iw_last_invoice_status',
    label: 'Last invoice status (mirror)',
    type: 'string',
    fieldType: 'text',
    groupName: GROUP,
  },
  {
    name: 'iw_last_invoice_amount',
    label: 'Last invoice amount',
    type: 'number',
    fieldType: 'number',
    groupName: GROUP,
  },
  {
    name: 'iw_next_billing_date',
    label: 'Next billing date (ISO)',
    type: 'string',
    fieldType: 'text',
    groupName: GROUP,
  },
]

async function patchPropertyLabel(body: PropInput) {
  const name = String(body.name)
  const label = String(body.label)
  const res = await fetch(`${HUBSPOT_API}/crm/v3/properties/deals/${encodeURIComponent(name)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ label }),
  })
  if (res.ok) return { ok: true as const }
  const errText = await res.text()
  return { ok: false as const, status: res.status, errText }
}

async function createProperty(body: PropInput) {
  const res = await fetch(`${HUBSPOT_API}/crm/v3/properties/deals`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (res.ok) return { ok: true as const, name: body.name }
  const errText = await res.text()
  if (res.status === 409 || errText.includes('already exists')) {
    const patched = await patchPropertyLabel(body)
    if (!patched.ok) {
      return {
        ok: false as const,
        name: body.name,
        status: patched.status,
        errText: `exists but label PATCH failed: ${patched.errText.slice(0, 400)}`,
      }
    }
    return { ok: true as const, name: body.name, existed: true, relabeled: true as const }
  }
  return { ok: false as const, name: body.name, status: res.status, errText }
}

async function main() {
  if (!TOKEN) {
    console.error('Set HUBSPOT_PRIVATE_APP_TOKEN in .env.local')
    process.exit(1)
  }
  console.log(`Creating ${PROPERTIES.length} deal properties (group: ${GROUP})...`)
  for (const p of PROPERTIES) {
    const r = await createProperty(p)
    if (!r.ok) {
      console.error(`FAIL ${String(r.name)} HTTP ${r.status}: ${r.errText.slice(0, 500)}`)
      process.exit(1)
    }
    console.log(
      `  ${'relabeled' in r && r.relabeled ? 'label-updated' : 'ok'}  ${String(r.name)}`,
    )
  }
  console.log('\nThen re-run: pnpm exec tsx scripts/verify-stripe-subscription-sync.ts')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
