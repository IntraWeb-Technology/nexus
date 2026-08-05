/**
 * Push whitelisted @repo/iw-portal environment variables from `.env.local` to the
 * linked Vercel project. Idempotent: `vercel env add --force` overwrites in place.
 *
 * Targets:
 * - **Production** — all keys.
 * - **Preview** — for each Git branch in `VERCEL_SYNC_PREVIEW_GIT_BRANCHES` (default
 *   `development`). Vercel requires a branch for Preview; `main` is invalid if it is
 *   the production branch.
 * - Skips the Vercel **"development"** environment (the one for `vercel dev`): this
 *   project rejects `--sensitive` for that target; use `.env.local` for local dev.
 *
 * From repo root:
 *   pnpm --filter @repo/iw-portal vercel:align-env
 *   pnpm --filter @repo/ops vercel:align-env
 * Optional: `VERCEL_SYNC_PREVIEW_GIT_BRANCHES=development,issue/foo` (comma-separated).
 * `VERCEL_ALIGN_PRODUCTION_ONLY=0` — include Preview branch targets too. Default is
 * production-only to keep Vercel rows minimal.
 *
 * Values are passed on **stdin** (not `--value`) for long keys on Windows. Uses
 * `shell: true` so `npx` resolves like in an interactive shell.
 */
import { config } from 'dotenv'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { applyIwPortalEnvValidation } from '../env/iw-portal-env-check.js'
import { resolveMonorepoRoot, iwPortalEnvLocalPath } from '../repo/repo-root.js'
import { PORTAL_ENV_KEYS } from './vercel-kv-list.js'

const root = resolveMonorepoRoot(import.meta.url)
config({ path: iwPortalEnvLocalPath(root) })
applyIwPortalEnvValidation('report', 'vercel:align-env')
const appDir = path.join(root, 'apps', 'iw-portal')

const PRODUCTION_ONLY =
  process.env.VERCEL_ALIGN_PRODUCTION_ONLY !== '0' && process.env.VERCEL_ALIGN_PRODUCTION_ONLY !== 'false'

const PREVIEW_GIT_BRANCHES = (process.env.VERCEL_SYNC_PREVIEW_GIT_BRANCHES || 'development')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const SKIP = new Set(['VERCEL_OIDC_TOKEN'])

function vercelSensitiveFlag(name: string): string[] {
  if (name.startsWith('NEXT_PUBLIC_')) return []
  return ['--sensitive']
}

function addToVercel(name: string, value: string, args: string[]) {
  const r = spawnSync('npx', ['-y', 'vercel', 'env', 'add', name, ...args, '--yes', '--force'], {
    cwd: appDir,
    input: value,
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true,
  })
  if (r.error || (typeof r.status === 'number' && r.status !== 0)) {
    process.exitCode = 1
    console.error(
      `Failed: vercel env add for ${name} [${args.join(' ')}]${r.error ? ` (${r.error.message})` : r.status != null && r.status !== 0 ? ` (exit ${r.status})` : ''}. If the project is not linked, run: cd apps/iw-portal && npx vercel link`,
    )
  }
}

function main() {
  for (const key of PORTAL_ENV_KEYS) {
    if (SKIP.has(key)) continue
    const v = process.env[key as keyof NodeJS.ProcessEnv]
    if (v === undefined || v === '') {
      console.log(`[skip] ${key} (empty or unset in .env.local)`)
      continue
    }
    const sens = vercelSensitiveFlag(key)

    console.log(`[vercel] ${key} -> production (redacted)`)
    addToVercel(key, v, ['production', ...sens])

    if (!PRODUCTION_ONLY) {
      for (const branch of PREVIEW_GIT_BRANCHES) {
        console.log(`[vercel] ${key} -> preview/${branch} (redacted)`)
        addToVercel(key, v, ['preview', branch, ...sens])
      }
    }
  }
  if (process.exitCode) process.exit(1)
  const tip = PRODUCTION_ONLY
    ? ' (production only; no Preview rows)'
    : '. Tip: pnpm vercel:prune-dev-env removes old Development targets; use VERCEL_ALIGN_PRODUCTION_ONLY=1 to skip Preview on future syncs'
  console.log(`Done. Redeploy for new env to take effect.${tip}`)
}

main()
