/**
 * Push migrations to self-hosted Supabase (Hostinger VPS pooler).
 * Loads `SELF_HOSTED_DATABASE_URL` or `POSTGRES_URL_NON_POOLING` from `.env.local`.
 *
 * Prereq: SSH tunnel (local dev):
 *   ssh -L 15432:127.0.0.1:15432 root@187.77.0.115
 */
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { iwPortalEnvLocalPath, resolveMonorepoRoot } from '../lib/repo-root.js'

config({ path: iwPortalEnvLocalPath(resolveMonorepoRoot(import.meta.url)) })

const portalRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const dbUrl =
  process.env.SELF_HOSTED_DATABASE_URL?.trim() ||
  process.env.POSTGRES_URL_NON_POOLING?.trim() ||
  process.env.POSTGRES_URL?.trim()

if (!dbUrl) {
  console.error(
    'Missing SELF_HOSTED_DATABASE_URL or POSTGRES_URL_NON_POOLING in apps/iw-portal/.env.local',
  )
  process.exit(1)
}

const tenant = process.env.POOLER_TENANT_ID?.trim()
if (tenant && !dbUrl.includes(`postgres.${tenant}`)) {
  console.warn(
    `Warning: POOLER_TENANT_ID=${tenant} but connection URL uses a different tenant segment.`,
  )
  console.warn('VPS default is often your-tenant-id — match .env.local to /root/supabase-project/.env')
}

console.error('[db-push:self-hosted] pushing migrations via pooler (ensure SSH tunnel is open on :15432)')
const result = spawnSync('pnpm', ['exec', 'supabase', 'db', 'push', '--db-url', dbUrl], {
  stdio: 'inherit',
  shell: true,
  cwd: portalRoot,
})

process.exit(result.status ?? 1)
