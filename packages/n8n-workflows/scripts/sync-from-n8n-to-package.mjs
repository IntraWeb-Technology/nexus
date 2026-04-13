/**
 * Pull workflows from n8n (scoped to `N8N_WORKFLOWS_PROJECT_ID`, default IntraWeb OS project)
 * and overwrite matching JSON files under `packages/n8n-workflows/` by **workflow id**.
 *
 * Does not write to `_synced-from-n8n/` — use `pnpm --filter @repo/n8n-workflows pull:n8n` for a full dump.
 *
 * Run from repo root:
 *   pnpm --filter @repo/n8n-workflows sync:n8n:package
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import {
  PKG_ROOT,
  baseUrl,
  effectiveProjectId,
  getWorkflow,
  listAllWorkflowIds,
  loadEnvLocal,
} from './lib/n8n-env.mjs'

const SKIP_DIR = new Set(['_synced-from-n8n', 'node_modules', 'dist'])

function walkJsonFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walkJsonFiles(p, out)
    else if (name.endsWith('.json')) out.push(p)
  }
  return out
}

function buildIdToPaths() {
  const files = walkJsonFiles(PKG_ROOT)
  const idToPaths = new Map()
  for (const abs of files) {
    let doc
    try {
      doc = JSON.parse(readFileSync(abs, 'utf8'))
    } catch {
      continue
    }
    const id = doc?.id
    if (typeof id !== 'string' || !id) continue
    const list = idToPaths.get(id) || []
    list.push(abs)
    idToPaths.set(id, list)
  }
  for (const [id, paths] of idToPaths) {
    if (paths.length > 1) {
      console.warn('Duplicate workflow id in package (all will be updated):', id)
    }
  }
  return idToPaths
}

async function main() {
  loadEnvLocal()
  const apiKey = (process.env.N8N_API_KEY || '').trim()
  const root = baseUrl()
  if (!root) {
    console.error('Missing N8N_API_URL (or N8N_BASE_URL).')
    process.exit(1)
  }
  if (!apiKey) {
    console.error('Missing N8N_API_KEY.')
    process.exit(1)
  }

  const projectId = effectiveProjectId()
  const apiRoot = `${root}/api/v1`
  console.log('Listing workflows from', apiRoot, projectId ? `(projectId=${projectId})` : '(no project filter)')

  const idToPaths = buildIdToPaths()
  console.log('Indexed', idToPaths.size, 'workflow id(s) under packages/n8n-workflows')

  const list = await listAllWorkflowIds(apiRoot, apiKey, projectId)
  if (!list.length) {
    console.log('No workflows returned.')
    return
  }

  let updated = 0
  const unmatched = []

  for (const { id, name } of list) {
    const targets = idToPaths.get(id)
    const full = await getWorkflow(apiRoot, apiKey, id)
    if (!targets?.length) {
      unmatched.push({ id, name })
      continue
    }
    const json = JSON.stringify(full, null, 2)
    for (const target of targets) {
      writeFileSync(target, json, 'utf8')
      updated++
      console.log('  updated', relative(PKG_ROOT, target))
    }
  }

  console.log('Done.', updated, 'file(s) updated.')
  if (unmatched.length) {
    console.log(
      unmatched.length,
      'remote workflow(s) had no matching file in the package (by id). Use pull:n8n to dump them under _synced-from-n8n/.',
    )
    for (const u of unmatched.slice(0, 20)) {
      console.log('  -', u.name, u.id)
    }
    if (unmatched.length > 20) console.log('  …', unmatched.length - 20, 'more')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
