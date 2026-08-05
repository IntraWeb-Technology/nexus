/**
 * Pull workflows from a remote n8n instance via the **HTTP Public API** and write JSON
 * under `packages/n8n-workflows/_synced-from-n8n/`.
 *
 * By default lists only workflows in the IntraWeb OS n8n project (`o5dYIcHW2mxs82d6`).
 * Set `N8N_WORKFLOWS_PROJECT_ID=all` or `N8N_WORKFLOWS_PROJECT_ID=` to list the whole instance.
 *
 * To overwrite curated files under `packages/n8n-workflows/` (matched by workflow id), use:
 *   pnpm --filter @repo/n8n-workflows sync:n8n:package
 *
 * Cursor can also use MCP servers **`user-n8n-mcp-api`** / **`user-n8n-mcp-workflows`** (from your
 * IDE MCP config — not the repo’s `.mcp.json`, which may only list Supabase). Those tools are
 * great for search, validate, and one-off `n8n_get_workflow` in chat; **bulk export to disk** is
 * what this script is for (stable in CI and does not depend on the agent).
 *
 * Env: loads `apps/iw-site-q2/.env.local`, then `apps/iw-portal/.env.local`, then repo root `.env.local`
 * (first assignment wins for duplicate keys). Typical n8n keys:
 *   N8N_API_URL  — e.g. https://n8n.intrawebtech.com (no /api/v1 suffix)
 *   N8N_API_KEY  — Settings → API in n8n (header X-N8N-API-KEY)
 *   N8N_WORKFLOWS_PROJECT_ID — optional; default IntraWeb OS project; use `all` for no filter
 *
 * Run from repo root:
 *   pnpm --filter @repo/n8n-workflows pull:n8n
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  PKG_ROOT,
  baseUrl,
  effectiveProjectId,
  getWorkflow,
  listAllWorkflowIds,
  loadEnvLocal,
} from './lib/n8n-env.mjs'

const OUT_DIR = join(PKG_ROOT, '_synced-from-n8n')

function sanitizeFilePart(name) {
  return String(name || 'workflow')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
}

async function main() {
  loadEnvLocal()
  const apiKey = (process.env.N8N_API_KEY || '').trim()
  const root = baseUrl()
  if (!root) {
    console.error('Missing N8N_API_URL (or N8N_BASE_URL). Set in apps/*/ .env.local — see .env.example.')
    process.exit(1)
  }
  if (!apiKey) {
    console.error('Missing N8N_API_KEY. Create an API key in n8n (Settings → API) and add to apps/iw-portal/.env.local.')
    process.exit(1)
  }

  const projectId = effectiveProjectId()
  const apiRoot = `${root}/api/v1`
  console.log('Listing workflows from', apiRoot, projectId ? `(projectId=${projectId})` : '(no project filter)')

  const list = await listAllWorkflowIds(apiRoot, apiKey, projectId)
  if (!list.length) {
    console.log('No workflows returned (empty instance or no access).')
  }

  mkdirSync(OUT_DIR, { recursive: true })
  const manifest = {
    syncedAt: new Date().toISOString(),
    source: root,
    projectId: projectId || null,
    count: 0,
    files: [],
  }

  for (const { id, name } of list) {
    const full = await getWorkflow(apiRoot, apiKey, id)
    const safe = sanitizeFilePart(name)
    const fileName = `${safe} __ ${id}.json`
    const outPath = join(OUT_DIR, fileName)
    const json = JSON.stringify(full, null, 2)
    writeFileSync(outPath, json, 'utf8')
    manifest.files.push({ id, name, file: fileName })
    manifest.count++
    console.log('  wrote', fileName)
  }

  writeFileSync(join(OUT_DIR, '_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
  console.log('Done.', manifest.count, 'workflow(s) →', OUT_DIR)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
