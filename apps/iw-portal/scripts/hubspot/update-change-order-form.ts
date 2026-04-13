/**
 * PATCH an existing HubSpot Marketing form to use the contractual change-order field layout.
 *
 *   pnpm hubspot:update-co-form
 *   HUBSPOT_CHANGE_ORDER_FORM_GUID=... pnpm hubspot:update-co-form
 *
 * Default form id (your manual form): 6525e2b8-34a1-4961-9f6f-e1b78c166689
 *
 * Requires HUBSPOT_PRIVATE_APP_TOKEN with **forms** scope.
 */
import {
  buildChangeOrderFormFieldGroups,
  CHANGE_ORDER_FORM_NAME,
} from './change-order-form-fields'
import { config } from 'dotenv'
import { iwPortalEnvLocalPath, resolveMonorepoRoot } from '../lib/repo-root'

config({ path: iwPortalEnvLocalPath(resolveMonorepoRoot(import.meta.url)) })

const HUBSPOT_API = 'https://api.hubapi.com'
const TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN
const DEFAULT_FORM_ID = '6525e2b8-34a1-4961-9f6f-e1b78c166689'

async function main() {
  if (!TOKEN) {
    console.error('Set HUBSPOT_PRIVATE_APP_TOKEN in .env.local')
    process.exit(1)
  }

  const formId =
    process.argv[2]?.trim() ||
    process.env.HUBSPOT_CHANGE_ORDER_FORM_GUID?.trim() ||
    DEFAULT_FORM_ID

  const patchBody = {
    name: CHANGE_ORDER_FORM_NAME,
    fieldGroups: buildChangeOrderFormFieldGroups(),
  }

  const res = await fetch(`${HUBSPOT_API}/marketing/v3/forms/${encodeURIComponent(formId)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(patchBody),
  })

  const text = await res.text()
  if (!res.ok) {
    console.error(`HTTP ${res.status}:`, text.slice(0, 2500))
    process.exit(1)
  }

  try {
    const parsed = JSON.parse(text) as { id?: string; name?: string }
    console.log('Updated form:', parsed.id ?? formId)
    console.log('Name:', parsed.name ?? patchBody.name)
  } catch {
    console.log('Response:', text.slice(0, 500))
  }

  console.log('')
  console.log('Set in .env if not already:')
  console.log(`  HUBSPOT_CHANGE_ORDER_FORM_GUID=${formId}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
