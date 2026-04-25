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
  'pull-from-n8n.mjs',
)

const result = spawnSync(process.execPath, [canonicalScript], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env,
})

process.exit(result.status ?? 1)

