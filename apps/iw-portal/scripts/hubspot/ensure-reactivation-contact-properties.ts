/**
 * Creates HubSpot contact property used by SYS 05 reactivation cooldown.
 *
 * Run: pnpm --filter @repo/iw-portal hubspot:ensure-reactivation-contact-properties
 */
import { config } from 'dotenv'
import { iwPortalEnvLocalPath, resolveMonorepoRoot } from '../lib/repo-root'

config({ path: iwPortalEnvLocalPath(resolveMonorepoRoot(import.meta.url)) })

const HUBSPOT_API = 'https://api.hubapi.com'
const TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN

const PROPERTIES = [
  {
    name: 'last_reactivation_sent_date',
    label: 'Last reactivation sent date',
    type: 'date',
    fieldType: 'date',
    groupName: 'contactinformation',
    description:
      'Set by SYS 05 — Referral & Reactivation Engine after a reactivation email is sent. Used for cooldown.',
  },
  {
    name: 'email_opt_out',
    label: 'Email opt out',
    type: 'enumeration',
    fieldType: 'booleancheckbox',
    groupName: 'contactinformation',
    options: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' },
    ],
    description:
      'Set when a contact unsubscribes via email link (SYS 05 — Email Unsubscribe Handler). Blocks marketing/reactivation sends.',
  },
] as const

async function ensureProperty(property: (typeof PROPERTIES)[number]) {
  const res = await fetch(`${HUBSPOT_API}/crm/v3/properties/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(property),
  })

  if (res.ok) {
    console.log(`ok  ${property.name}`)
    return
  }

  const errText = await res.text()
  if (res.status === 409 || errText.includes('already exists')) {
    console.log(`exists  ${property.name}`)
    return
  }

  console.error(`FAIL ${property.name} HTTP ${res.status}: ${errText.slice(0, 500)}`)
  process.exit(1)
}

async function main() {
  if (!TOKEN) {
    console.error('Set HUBSPOT_PRIVATE_APP_TOKEN in .env.iw-portal.local')
    process.exit(1)
  }

  for (const property of PROPERTIES) {
    await ensureProperty(property)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
