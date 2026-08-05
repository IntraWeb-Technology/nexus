/**
 * Creates the HubSpot Marketing form for contractual change orders via API.
 *
 * Prerequisites:
 *   - Run `pnpm hubspot:ensure-co-properties` first (contact properties must exist).
 *   - HUBSPOT_PRIVATE_APP_TOKEN with scope: **forms** (Marketing Forms).
 *
 * Run from apps/iw-portal (or `pnpm --filter @repo/iw-portal hubspot:ensure-co-form`):
 *   pnpm hubspot:ensure-co-form
 *
 * To update an existing form by id instead, use:
 *   pnpm hubspot:update-co-form
 *
 * API reference: https://developers.hubspot.com/docs/api-reference/marketing/forms/v3/post-marketing-v3-forms
 */
import { buildChangeOrderFormCreateBody } from './change-order-form-fields'
import { config } from 'dotenv'
import { iwPortalEnvLocalPath, resolveMonorepoRoot } from '../lib/repo-root'

config({ path: iwPortalEnvLocalPath(resolveMonorepoRoot(import.meta.url)) })

const HUBSPOT_API = 'https://api.hubapi.com'
const TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN

async function main() {
  if (!TOKEN) {
    console.error('Set HUBSPOT_PRIVATE_APP_TOKEN in .env.local')
    process.exit(1)
  }

  const body = buildChangeOrderFormCreateBody()
  const res = await fetch(`${HUBSPOT_API}/marketing/v3/forms`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  if (!res.ok) {
    console.error(`HTTP ${res.status}:`, text.slice(0, 2000))
    process.exit(1)
  }

  let parsed: { id?: string; name?: string }
  try {
    parsed = JSON.parse(text) as { id?: string; name?: string }
  } catch {
    console.error('Unexpected response:', text.slice(0, 500))
    process.exit(1)
  }

  console.log('Created HubSpot form:', parsed.name ?? body.name)
  console.log('')
  console.log('Set in .env / Vercel:')
  console.log('  HUBSPOT_CHANGE_ORDER_FORM_GUID=' + (parsed.id ?? '(missing id in response)'))
  console.log('')
  console.log('Embed / admin URL: open the form in HubSpot Marketing → Forms to review and publish if required.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
