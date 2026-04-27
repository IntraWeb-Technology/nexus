/**
 * Replace HubSpot line-item batch read with per-ID GET + IF + expand.
 * Run: node packages/n8n-workflows/scripts/patch-proposal-line-item-get.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const wfPath = resolve(__dirname, '../03_sales/SYS 03 — Proposal and Contract Delivery.json')

const LI_PROPS =
  'name,description,tier,hs_sku,hs_name,amount,price,quantity,discount,hs_discount_percentage,hs_total_discount,hs_pre_discount_amount,recurringbillingfrequency,hs_recurring_billing_period,hs_recurring_billing_number_of_payments,hs_recurring_billing_terms,hs_product_type,hs_url,hs_line_item_currency_code,createdate,hs_lastmodifieddate'

const getUrl = `={{ 'https://api.hubapi.com/crm/v3/objects/line_items/' + encodeURIComponent($json.lineItemId) + '?properties=' + encodeURIComponent('${LI_PROPS}') + '&archived=false' }}`

const expandNode = {
  parameters: {
    jsCode:
      "const ids = ($json.lineItemIds || []).map(String).filter(Boolean);\nreturn ids.map((lineItemId) => ({ json: { lineItemId } }));",
  },
  id: 'sys05-expand-line-item-ids',
  name: 'Expand Line Item IDs',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [3008, -1040],
}

const creds = { hubspotAppToken: { id: 'volH6pGD5psvPC7a', name: 'HubSpot App Token account' } }

const newFetchParams = {
  method: 'GET',
  url: getUrl,
  authentication: 'predefinedCredentialType',
  nodeCredentialType: 'hubspotAppToken',
  options: {
    timeout: 60000,
  },
}

function patchNodes(nodes) {
  if (!Array.isArray(nodes)) return
  const hasExpand = nodes.some((n) => n.id === 'sys05-expand-line-item-ids')
  const idx = nodes.findIndex((n) => n.id === 'sys05-pick-associated-line-items')
  if (idx === -1) {
    throw new Error('Could not find Pick Associated Line Items')
  }
  if (!hasExpand) {
    nodes.splice(idx + 1, 0, { ...expandNode })
  }
  for (const n of nodes) {
    if (n.id === 'sys05-fetch-associated-line-items' && n.parameters) {
      n.parameters = { ...newFetchParams }
      n.credentials = creds
      n.onError = 'continueRegularOutput'
    }
  }
}

function patchConnections(connections) {
  if (!connections) return
  connections['Pick Associated Line Items'] = {
    main: [
      [
        { node: 'Has Associated Line Items?', type: 'main', index: 0 },
      ],
    ],
  }
  connections['Has Associated Line Items?'] = {
    main: [
      [{ node: 'Expand Line Item IDs', type: 'main', index: 0 }],
      [{ node: 'Pick Associated Contact', type: 'main', index: 0 }],
    ],
  }
  connections['Expand Line Item IDs'] = {
    main: [
      [
        { node: 'Fetch Associated Line Items', type: 'main', index: 0 },
      ],
    ],
  }
  connections['Fetch Associated Line Items'] = {
    main: [
      [
        { node: 'Pick Associated Contact', type: 'main', index: 0 },
      ],
    ],
  }
}

const raw = readFileSync(wfPath, 'utf8')
const wf = JSON.parse(raw)

patchNodes(wf.nodes)
patchConnections(wf.connections)
if (wf.activeVersion) {
  patchNodes(wf.activeVersion.nodes)
  patchConnections(wf.activeVersion.connections)
}

writeFileSync(wfPath, JSON.stringify(wf, null, 2) + '\n', 'utf8')
console.log('Patched', wfPath)
