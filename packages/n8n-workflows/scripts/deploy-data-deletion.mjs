/**
 * Deploy SYS 05 — Data Deletion Handler to n8n (build JSON then PUT workflow).
 * Run: node packages/n8n-workflows/scripts/deploy-data-deletion.mjs
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

execSync('node packages/n8n-workflows/scripts/build-data-deletion-workflow.mjs', {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '../../..'),
})

const workflowPath = path.resolve(
  __dirname,
  '../05_client-success/SYS 05 — Data Deletion Handler.json',
)

if (!fs.existsSync(workflowPath)) {
  console.error('Workflow file missing after build:', workflowPath)
  process.exit(1)
}

console.log('Built workflow at', workflowPath)
console.log('Import or sync this workflow in n8n (same process as deploy-email-unsubscribe.mjs).')
