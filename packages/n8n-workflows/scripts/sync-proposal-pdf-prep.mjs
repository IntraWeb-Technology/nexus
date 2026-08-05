/**
 * Inline `_proposal-gen-pdf-prep.js` into SYS 03 Prep PDF Input nodes + pdf generate options.
 * Run from repo root: node packages/n8n-workflows/scripts/sync-proposal-pdf-prep.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const wfPath = resolve(__dirname, '../03_sales/SYS 03 — Proposal and Contract Delivery.json')
const jsPath = resolve(__dirname, '../03_sales/_proposal-gen-pdf-prep.js')

const wf = JSON.parse(readFileSync(wfPath, 'utf8'))
const jsCode = readFileSync(jsPath, 'utf8')

/**
 * margin 0px lets Letter + CSS @page in the HTML control insets. Use '0px' (not '0') — html2pdf.fly.dev
 * validates margin.* as length strings and returns 422 for bare "0".
 */
const pdfJsonBody =
  "={{ JSON.stringify({ html: $json.html, printBackground: true, preferCSSPageSize: true, margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }, format: 'Letter' }) }}"

let prep = 0
let pdf = 0
for (const node of wf.nodes) {
  if (node.id === 'sys05-pdf-prep') {
    node.parameters = node.parameters || {}
    node.parameters.jsCode = jsCode
    prep++
  }
  if (node.id === 'sys05-pdf') {
    node.parameters = node.parameters || {}
    node.parameters.jsonBody = pdfJsonBody
    pdf++
  }
}

console.log(`Updated Prep PDF Input (sys05-pdf-prep): ${prep}, Call PDF Service (sys05-pdf): ${pdf}`)
writeFileSync(wfPath, `${JSON.stringify(wf, null, 2)}\n`)
