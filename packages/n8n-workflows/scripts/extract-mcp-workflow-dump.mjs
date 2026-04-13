/**
 * One-off: read MCP tool output JSON (wrapper { success, data }) and write `data` as workflow JSON.
 * Usage: node scripts/extract-mcp-workflow-dump.mjs <path-to-agent-tools-json.txt>
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const src = process.argv[2]
if (!src) {
  console.error('Usage: node scripts/extract-mcp-workflow-dump.mjs <mcp-json-file>')
  process.exit(1)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const PKG = join(__dirname, '..')
const OUT_DIR = join(PKG, '_synced-from-n8n')

const j = JSON.parse(readFileSync(src, 'utf8'))
const d = j.data
if (!d?.id) {
  console.error('Expected { success, data } with data.id')
  process.exit(1)
}

const safe = String(d.name || 'workflow')
  .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
  .trim()
  .slice(0, 120)
const out = join(OUT_DIR, `${safe} __ ${d.id}.json`)
mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(out, JSON.stringify(d, null, 2), 'utf8')
console.log('Wrote', out)
