/**
 * Creates HubSpot contact properties for the contractual change order form.
 *
 * Prerequisites:
 *   - HUBSPOT_PRIVATE_APP_TOKEN with scopes: crm.schemas.contacts.write (and read)
 *   - Optionally forms scope on the same app if you later automate form creation
 *
 * Run from clerk-nextjs:
 *   pnpm hubspot:ensure-co-properties
 *
 * Re-run after label changes: existing properties get PATCHed so HubSpot UI labels update (new
 * activity timeline rows use the current label; very old activities may still show prior text).
 *
 * Then in HubSpot: Marketing → Forms → Create form → add fields mapped 1:1 to these
 * internal names (plus Email). Publish and set HUBSPOT_CHANGE_ORDER_FORM_GUID in .env.
 */
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const HUBSPOT_API = 'https://api.hubapi.com'
const TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN
const GROUP = 'contactinformation'

/** HubSpot requires bool properties to declare true/false options. */
const BOOLEAN_PROPERTY_OPTIONS = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
]

type PropInput = Record<string, unknown>

const PROPERTIES: PropInput[] = [
  {
    name: 'iw_co_title',
    label: 'Title',
    type: 'string',
    fieldType: 'text',
    groupName: GROUP,
  },
  {
    name: 'iw_co_master_agreement_reference',
    label: 'Master agreement / SOW reference',
    type: 'string',
    fieldType: 'text',
    groupName: GROUP,
  },
  {
    name: 'iw_co_current_scope_summary',
    label: 'Current scope summary',
    type: 'string',
    fieldType: 'textarea',
    groupName: GROUP,
  },
  {
    name: 'iw_co_requested_scope_detail',
    label: 'Requested scope / change',
    type: 'string',
    fieldType: 'textarea',
    groupName: GROUP,
  },
  {
    name: 'iw_co_business_rationale',
    label: 'Business rationale',
    type: 'string',
    fieldType: 'textarea',
    groupName: GROUP,
  },
  {
    name: 'iw_co_schedule_impact',
    label: 'Schedule impact',
    type: 'string',
    fieldType: 'textarea',
    groupName: GROUP,
  },
  {
    name: 'iw_co_cost_impact_type',
    label: 'Cost impact type',
    type: 'enumeration',
    fieldType: 'select',
    groupName: GROUP,
    options: [
      { label: 'No change', value: 'none' },
      { label: 'Increase', value: 'increase' },
      { label: 'Decrease', value: 'decrease' },
      { label: 'TBD', value: 'tbd' },
    ],
  },
  {
    name: 'iw_co_cost_impact_description',
    label: 'Cost impact description',
    type: 'string',
    fieldType: 'textarea',
    groupName: GROUP,
  },
  {
    name: 'iw_co_proposed_effective_date',
    label: 'Proposed effective date',
    type: 'date',
    fieldType: 'date',
    groupName: GROUP,
  },
  {
    name: 'iw_co_authorized_signer_name',
    label: 'Authorized signer name',
    type: 'string',
    fieldType: 'text',
    groupName: GROUP,
  },
  {
    name: 'iw_co_authorized_signer_title',
    label: 'Authorized signer title',
    type: 'string',
    fieldType: 'text',
    groupName: GROUP,
  },
  {
    name: 'iw_co_ack_accuracy',
    label: 'Ack: accuracy',
    type: 'bool',
    fieldType: 'booleancheckbox',
    groupName: GROUP,
    options: BOOLEAN_PROPERTY_OPTIONS,
  },
  {
    name: 'iw_co_ack_authority',
    label: 'Ack: authority',
    type: 'bool',
    fieldType: 'booleancheckbox',
    groupName: GROUP,
    options: BOOLEAN_PROPERTY_OPTIONS,
  },
  {
    name: 'iw_co_ack_written_supersedes_verbal',
    label: 'Ack: written change orders',
    type: 'bool',
    fieldType: 'booleancheckbox',
    groupName: GROUP,
    options: BOOLEAN_PROPERTY_OPTIONS,
  },
  {
    name: 'iw_co_ack_electronic_records',
    label: 'Ack: electronic records',
    type: 'bool',
    fieldType: 'booleancheckbox',
    groupName: GROUP,
    options: BOOLEAN_PROPERTY_OPTIONS,
  },
  {
    name: 'iw_co_portal_reference',
    label: 'Portal reference',
    type: 'string',
    fieldType: 'text',
    groupName: GROUP,
  },
]

async function patchPropertyLabel(body: PropInput) {
  const name = String(body.name)
  const label = String(body.label)
  const res = await fetch(`${HUBSPOT_API}/crm/v3/properties/contacts/${encodeURIComponent(name)}`, {
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
  const res = await fetch(`${HUBSPOT_API}/crm/v3/properties/contacts`, {
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
  console.log(`Creating ${PROPERTIES.length} contact properties (group: ${GROUP})...`)
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
  console.log('\nNext: Marketing form — pick one:')
  console.log('  • New form: pnpm hubspot:ensure-co-form')
  console.log('  • Existing form: HUBSPOT_CHANGE_ORDER_FORM_GUID=<guid> pnpm hubspot:update-co-form')
  console.log('(Both require private app scope **forms**.)')
  console.log('Set HUBSPOT_CHANGE_ORDER_FORM_GUID in .env from HubSpot → Forms → form details.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
