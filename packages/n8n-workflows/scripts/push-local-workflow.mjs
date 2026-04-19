/**
 * Push one curated workflow JSON to n8n using the `id` inside the file.
 *
 *   node packages/n8n-workflows/scripts/push-local-workflow.mjs <path-to-workflow.json>
 *
 * Requires N8N_API_URL (or N8N_BASE_URL) + N8N_API_KEY (see .env.example; loadEnvLocal reads repo .env.local).
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { baseUrl, loadEnvLocal } from './lib/n8n-env.mjs'

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
try {
  const j = JSON.parse(text)
  console.log('OK', j.id, j.name, j.updatedAt || '')
} catch {
  console.log(text.slice(0, 500))
}
