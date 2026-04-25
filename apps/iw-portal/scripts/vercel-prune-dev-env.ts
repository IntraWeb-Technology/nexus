/**
 * Remove each portal env var from the Vercel **"development"** target only (the one used
 * by `vercel dev` in the cloud dashboard). This collapses the old "Preview, Development"
 * rows and drops redundant Development copies so you are left with Production + your
 * branch-scoped Preview (e.g. Preview `development` branch) from `vercel:align-env`.
 *
 * Idempotent: ignores "not found" (already removed). Does **not** delete Production
 * or Preview; does **not** remove unrelated variables (recaptcha, stack, etc.).
 *
 *   pnpm vercel:prune-dev-env
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { resolveMonorepoRoot, iwPortalEnvLocalPath } from './lib/repo-root'
import { PORTAL_ENV_KEYS } from './vercel-kv-list'

const root = resolveMonorepoRoot(import.meta.url)
const appDir = path.join(root, 'apps', 'iw-portal')

function rmDevelopment(name: string) {
  const r = spawnSync('npx', ['-y', 'vercel', 'env', 'rm', name, 'development', '-y'], {
    cwd: appDir,
    encoding: 'utf-8',
    shell: true,
  })
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`
  if (r.status === 0) {
    console.log(`[removed] ${name} (development target)`)
    return
  }
  if (/env_not_found|was not found|not found/i.test(out)) {
    console.log(`[skip] ${name} (no development target)`)
    return
  }
  console.error(`[fail] ${name} — ${out.slice(0, 400) || r.status}`)
  process.exitCode = 1
}

function main() {
  for (const key of PORTAL_ENV_KEYS) {
    rmDevelopment(key)
  }
  if (process.exitCode) process.exit(1)
  console.log('Done. Run `vercel env ls` to confirm row count.')
}

main()
