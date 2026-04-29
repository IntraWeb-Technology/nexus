/**
 * Inline `_proposal-claude-prep.js` into SYS 03 Prep Claude Prompt nodes (top-level + activeVersion).
 * Run from repo root: node packages/n8n-workflows/scripts/sync-proposal-claude-prep.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const wfPath = resolve(__dirname, '../03_sales/SYS 03 — Proposal and Contract Delivery.json')
const jsPath = resolve(__dirname, '../03_sales/_proposal-claude-prep.js')

const wf = JSON.parse(readFileSync(wfPath, 'utf8'))
const jsCode = readFileSync(jsPath, 'utf8')

function patchNodes(nodes) {
  let n = 0
  if (!Array.isArray(nodes)) return n
  for (const node of nodes) {
    if (node.id === 'sys05-claude-prep') {
      node.parameters = node.parameters || {}
      node.parameters.jsCode = jsCode
      n++
    }
  }
  return n
}

let total = patchNodes(wf.nodes)
if (wf.activeVersion?.nodes) {
  total += patchNodes(wf.activeVersion.nodes)
}

console.log(`Updated Prep Claude Prompt (sys05-claude-prep): ${total} node(s)`)
writeFileSync(wfPath, `${JSON.stringify(wf, null, 2)}\n`)
