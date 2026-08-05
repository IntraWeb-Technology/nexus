/**
 * One-shot deploy: CONFIG + SYS 05 reactivation anti-spam patch.
 * Uses N8N_API_KEY from env or ~/.cursor/mcp.json (n8n-mcp-api server).
 */
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadEnvLocal, baseUrl, loadOneEnvFile } from './lib/n8n-env.mjs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PKG_ROOT = join(__dirname, '..')

function loadKeyFromMcp() {
  const p = join(homedir(), '.cursor', 'mcp.json')
  if (!existsSync(p)) return ''
  const j = JSON.parse(readFileSync(p, 'utf8'))
  for (const v of Object.values(j.mcpServers || {})) {
    const key = v?.env?.N8N_API_KEY
    if (typeof key === 'string' && key.trim()) return key.trim()
  }
  return ''
}

function pickSettings(obj) {
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
    if (obj?.[k] !== undefined) out[k] = obj[k]
  }
  return out
}

async function push(rel, apiKey, root) {
  const abs = resolve(PKG_ROOT, rel)
  const wf = JSON.parse(readFileSync(abs, 'utf8'))
  if (wf.activeVersion && Array.isArray(wf.nodes) && wf.connections) {
    wf.activeVersion.nodes = structuredClone(wf.nodes)
    wf.activeVersion.connections = structuredClone(wf.connections)
  }

  const url = `${root}/api/v1/workflows/${encodeURIComponent(wf.id)}`
  const body = JSON.stringify({
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: pickSettings(wf.settings || {}),
    staticData: wf.staticData ?? null,
    pinData: wf.pinData ?? {},
  })

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': apiKey,
    },
    body,
  })
  const text = await res.text()
  console.log('PUT', res.status, wf.id, wf.name)
  if (!res.ok) {
    console.error(text.slice(0, 2000))
    process.exit(1)
  }

  const act = await fetch(`${url}/activate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': apiKey,
    },
    body: '{}',
  })
  const actText = await act.text()
  console.log('ACTIVATE', act.status, wf.id)
  if (!act.ok) {
    console.error(actText.slice(0, 1000))
    process.exit(1)
  }
}

loadEnvLocal()
// Root-level portal env used on this machine
const portalRootEnv = join(PKG_ROOT, '..', '..', '.env.iw-portal.local')
if (existsSync(portalRootEnv)) {
  loadOneEnvFile(portalRootEnv)
}

const root = baseUrl()
const apiKey = (process.env.N8N_API_KEY || loadKeyFromMcp()).trim()
if (!root) {
  console.error('Missing N8N_API_URL or N8N_BASE_URL')
  process.exit(1)
}
if (!apiKey) {
  console.error('Missing N8N_API_KEY')
  process.exit(1)
}

await push('_config/CONFIG — Global Settings.json', apiKey, root)
await push('05_client-success/SYS 05 — Referral and Reactivation Engine.json', apiKey, root)
await push('_subworkflows/SW — Send Email via Resend.json', apiKey, root)
console.log('Deploy complete.')
