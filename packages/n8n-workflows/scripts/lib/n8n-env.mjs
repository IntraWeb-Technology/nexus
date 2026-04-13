/**
 * Shared env loading and n8n Public API helpers for workflow scripts.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const SCRIPTS_DIR = join(__dirname, '..')
export const PKG_ROOT = join(__dirname, '..', '..')
export const REPO_ROOT = join(PKG_ROOT, '..', '..')

/** IntraWeb OS n8n project (matches `meta.projectId` in committed workflow JSON). */
export const DEFAULT_N8N_WORKFLOWS_PROJECT_ID = 'o5dYIcHW2mxs82d6'

export function loadOneEnvFile(p) {
  if (!existsSync(p)) return
  const text = readFileSync(p, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (!key) continue
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

export function loadEnvLocal() {
  loadOneEnvFile(join(REPO_ROOT, 'apps', 'iw-site', '.env.local'))
  loadOneEnvFile(join(REPO_ROOT, 'apps', 'iw-portal', '.env.local'))
  loadOneEnvFile(join(REPO_ROOT, '.env.local'))
}

export function baseUrl() {
  const raw = (process.env.N8N_API_URL || process.env.N8N_BASE_URL || '').trim().replace(/\/$/, '')
  return raw
}

/**
 * When unset, defaults to IntraWeb OS project. Set `N8N_WORKFLOWS_PROJECT_ID=all` or empty
 * string to list every workflow the API key can see.
 */
export function effectiveProjectId() {
  if (process.env.N8N_WORKFLOWS_PROJECT_ID === undefined) {
    return DEFAULT_N8N_WORKFLOWS_PROJECT_ID
  }
  const v = String(process.env.N8N_WORKFLOWS_PROJECT_ID).trim()
  if (!v || v.toLowerCase() === 'all') return null
  return v
}

export async function fetchJson(url, apiKey) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'X-N8N-API-KEY': apiKey,
    },
  })
  const text = await res.text()
  let body
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = { raw: text }
  }
  if (!res.ok) {
    const msg = body?.message || body?.error || text || res.statusText
    throw new Error(`${res.status} ${url}: ${msg}`)
  }
  return body
}

export async function listAllWorkflowIds(apiRoot, apiKey, projectId) {
  const ids = []
  let cursor
  do {
    const q = new URLSearchParams({ limit: '100' })
    if (cursor) q.set('cursor', cursor)
    if (projectId) q.set('projectId', projectId)
    const url = `${apiRoot}/workflows?${q}`
    const page = await fetchJson(url, apiKey)
    const rows = Array.isArray(page?.data) ? page.data : Array.isArray(page) ? page : []
    for (const row of rows) {
      if (row?.id) ids.push({ id: row.id, name: row.name })
    }
    cursor = page?.nextCursor || null
  } while (cursor)
  return ids
}

export async function getWorkflow(apiRoot, apiKey, id) {
  return fetchJson(`${apiRoot}/workflows/${id}`, apiKey)
}
