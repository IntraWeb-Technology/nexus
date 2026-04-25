import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..', '..', '..')
const canonicalScript = path.join(
  repoRoot,
  'packages',
  'n8n-workflows',
  'scripts',
  'push-local-workflow.mjs',
)

const legacyId = process.argv[2]
const file = process.argv[3]
if (!legacyId || !file) {
  console.error('Usage: node scripts/push-single-workflow.mjs <workflowId> <path-to-json>')
  process.exit(1)
}

const fileAbs = path.resolve(process.cwd(), file)
const doc = JSON.parse(readFileSync(fileAbs, 'utf8'))
if (String(doc?.id ?? '') !== String(legacyId)) {
  console.error(
    `workflowId mismatch: CLI id=${legacyId}, JSON id=${String(doc?.id ?? '(missing)')}. ` +
      'Use the canonical file id to prevent accidental wrong-target updates.',
  )
  process.exit(1)
}

const fileForCanonical = path.relative(repoRoot, fileAbs).replaceAll('\\', '/')
const result = spawnSync(process.execPath, [canonicalScript, fileForCanonical], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env,
})

process.exit(result.status ?? 1)
