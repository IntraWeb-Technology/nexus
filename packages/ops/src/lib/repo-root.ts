import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Walk up from a file URL until `pnpm-workspace.yaml` is found (monorepo root). */
export function resolveMonorepoRoot(fromFileUrl: string): string {
  let dir = path.dirname(fileURLToPath(fromFileUrl))
  for (let i = 0; i < 12; i++) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  throw new Error('Could not locate monorepo root (pnpm-workspace.yaml)')
}

/** Path to `apps/iw-portal/.env.local` (secrets for portal scripts). */
export function iwPortalEnvLocalPath(root: string): string {
  return path.join(root, 'apps', 'iw-portal', '.env.local')
}
