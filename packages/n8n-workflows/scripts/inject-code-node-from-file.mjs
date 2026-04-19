/**
 * Set an n8n workflow Code node's parameters.jsCode from a local .js file.
 *
 * Usage:
 *   node packages/n8n-workflows/scripts/inject-code-node-from-file.mjs \
 *     "packages/n8n-workflows/03_sales/SYS 03 — Proposal and Contract Delivery.json" \
 *     "Prep PDF Input" \
 *     "packages/n8n-workflows/03_sales/_proposal-gen-pdf-prep.js"
 */
import fs from 'node:fs'
import path from 'node:path'

const workflowPath = process.argv[2]
const nodeName = process.argv[3]
const jsPath = process.argv[4]

if (!workflowPath || !nodeName || !jsPath) {
  console.error(
    'Usage: node inject-code-node-from-file.mjs <workflow.json> <node name> <source.js>',
  )
  process.exit(1)
}

const absWf = path.resolve(workflowPath)
const absJs = path.resolve(jsPath)
const wf = JSON.parse(fs.readFileSync(absWf, 'utf8'))
const code = fs.readFileSync(absJs, 'utf8')

function patchNodes(nodes) {
  if (!Array.isArray(nodes)) return 0
  let count = 0
  for (const node of nodes) {
    if (node.name === nodeName && node.parameters) {
      node.parameters.jsCode = code
      count += 1
    }
  }
  return count
}

let patched = patchNodes(wf.nodes)
if (wf.activeVersion?.nodes) patched += patchNodes(wf.activeVersion.nodes)

if (patched === 0) {
  console.error('Node not found:', nodeName)
  process.exit(1)
}

fs.writeFileSync(absWf, JSON.stringify(wf, null, 2) + '\n', 'utf8')
console.log('Updated', patched, '×', nodeName, 'in', absWf, '←', absJs)
