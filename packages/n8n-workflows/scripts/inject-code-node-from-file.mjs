/**
 * Inject Code node jsCode from file, optionally prefixing shared HMAC helper.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.resolve(__dirname, '..')

const workflowPath = process.argv[2]
const nodeName = process.argv[3]
const jsPath = process.argv[4]
const withHmac = process.argv[5] === '--with-hmac'

if (!workflowPath || !nodeName || !jsPath) {
  console.error(
    'Usage: node inject-code-node-from-file.mjs <workflow.json> <node name> <source.js> [--with-hmac]',
  )
  process.exit(1)
}

const absWf = path.resolve(workflowPath)
const absJs = path.resolve(jsPath)
let code = fs.readFileSync(absJs, 'utf8')
if (withHmac) {
  const hmac = fs.readFileSync(path.join(PKG, '_shared/_hmac-sha256-hex.js'), 'utf8')
  code = `${hmac}\n${code}`
}

const wf = JSON.parse(fs.readFileSync(absWf, 'utf8'))

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

fs.writeFileSync(absWf, `${JSON.stringify(wf, null, 2)}\n`, 'utf8')
console.log('Updated', patched, '×', nodeName, 'in', absWf, '←', absJs)
