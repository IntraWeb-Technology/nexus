/**
 * Push one curated workflow JSON to n8n using the `id` inside the file.
 *
 *   node packages/n8n-workflows/scripts/push-local-workflow.mjs <path-to-workflow.json>
 *
 * Requires N8N_API_URL (or N8N_BASE_URL) + N8N_API_KEY (see .env.example; loadEnvLocal reads repo .env.local).
 *
 * After a successful PUT, if any Code node’s `jsCode` contains the IntraWeb email shell marker
 * `data-iw-email-shell`, we assert the graph no longer uses legacy horizontal shell padding. That
 * catches n8n 2.x cases where the UI draft `nodes` blob drifted from `activeVersion` (emails still
 * showed `8px 32px 40px` / `28px 32px 12px` until a full PUT from git).
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { baseUrl, loadEnvLocal } from './lib/n8n-env.mjs'

/** Legacy shell paddings (horizontal 32px); must stay out of Prepare Email / wrapEmail. */
const LEGACY_SHELL_PADDING = ['8px 32px 40px', '28px 32px 12px', '20px 32px 28px']

function codeNodesBlob(nodes) {
  if (!Array.isArray(nodes)) return ''
  return nodes
    .filter((n) => n?.type === 'n8n-nodes-base.code' && typeof n?.parameters?.jsCode === 'string')
    .map((n) => n.parameters.jsCode)
    .join('\n')
}

/** n8n 2.x can briefly diverge `nodes` vs `activeVersion.nodes`; both must match for sends. */
function assertIntraWebEmailShellNodes(workflowResponse) {
  const sections = [
    ['nodes', workflowResponse?.nodes],
    ['activeVersion.nodes', workflowResponse?.activeVersion?.nodes],
  ]
  for (const [label, nodes] of sections) {
    const codeBlob = codeNodesBlob(nodes)
    if (!codeBlob.includes('data-iw-email-shell')) continue
    const found = LEGACY_SHELL_PADDING.filter((s) => codeBlob.includes(s))
    if (found.length) {
      throw new Error(
        `Push response \`${label}\` still contains legacy email shell padding: ${found.join(', ')}. ` +
          'Re-open the workflow in n8n or re-run inject + push from git.',
      )
    }
  }
}

function pickSettings(obj) {
  if (!obj || typeof obj !== 'object') return {}
  // Public API rejects many UI-only settings (callerPolicy, availableInMCP, binaryMode, …).
  const keys = [
    'executionOrder',
    'errorWorkflow',
    'timezone',
    'saveExecutionProgress',
    'saveManualExecutions',
    'saveDataErrorExecution',
    'saveDataSuccessExecution',
    'executionTimeout',
  ]
  const out = {}
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k]
  }
  return out
}

const rel = process.argv[2]
if (!rel) {
  console.error('Usage: node scripts/push-local-workflow.mjs <path-to-workflow.json>')
  process.exit(1)
}

loadEnvLocal()
const root = baseUrl()
const apiKey = (process.env.N8N_API_KEY || '').trim()
if (!root) {
  console.error('Missing N8N_API_URL or N8N_BASE_URL.')
  process.exit(1)
}
if (!apiKey) {
  console.error('Missing N8N_API_KEY.')
  process.exit(1)
}

const abs = resolve(process.cwd(), rel)
const wf = JSON.parse(readFileSync(abs, 'utf8'))
const id = wf?.id
if (!id || typeof id !== 'string') {
  console.error('Workflow JSON missing string id:', abs)
  process.exit(1)
}

const body = JSON.stringify({
  name: wf.name,
  nodes: wf.nodes,
  connections: wf.connections,
  settings: pickSettings(wf.settings || {}),
  staticData: wf.staticData ?? null,
  pinData: wf.pinData ?? {},
})

const url = `${root}/api/v1/workflows/${encodeURIComponent(id)}`
const res = await fetch(url, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': apiKey,
  },
  body,
})
const text = await res.text()
console.log(res.status, id, wf.name)
if (!res.ok) {
  console.error(text.slice(0, 2000))
  process.exit(1)
}
let parsed
try {
  parsed = JSON.parse(text)
} catch {
  console.error('Non-JSON response from n8n:', text.slice(0, 500))
  process.exit(1)
}
try {
  assertIntraWebEmailShellNodes(parsed)
} catch (e) {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
}
console.log('OK', parsed.id, parsed.name, parsed.updatedAt || '')
