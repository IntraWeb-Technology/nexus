/**
 * Applies Supabase SQL migrations for the client portal (same DB as NEXT_PUBLIC_SUPABASE_URL).
 *
 * - If `public.clients` does not exist, applies `001_initial.sql` (fresh project).
 * - Always applies incremental migrations through `007_change_orders_cancelled.sql`
 *   (idempotent — safe to re-run).
 * - Optional demo `002_notes.sql` when PORTAL_APPLY_NOTES_DEMO=true.
 *
 * Requires in .env.local:
 *   POSTGRES_URL_NON_POOLING (or POSTGRES_URL) — use the Supabase direct (5432) connection string.
 *
 * Run from clerk-nextjs:
 *   pnpm exec tsx scripts/apply-portal-schema-postgres.ts
 */
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

const conn =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_URL
if (!conn) {
  console.error(
    'Set POSTGRES_URL_NON_POOLING (direct db, port 5432) in .env.local — pooler URLs often break DDL.',
  )
  process.exit(1)
}

const migrationsDir = join(process.cwd(), '..', 'supabase', 'migrations')

function readMigration(filename: string): string {
  return readFileSync(join(migrationsDir, filename), 'utf8')
}

async function main() {
  const prevTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  const client = new Client({
    connectionString: conn,
    ssl: { rejectUnauthorized: false },
  })
  try {
    await client.connect()

    const { rows: reg } = await client.query(`SELECT to_regclass('public.clients') AS c`)
    const hasCore = Boolean(reg[0]?.c)

    if (!hasCore) {
      console.log('Applying 001_initial.sql (new database)...')
      await client.query(readMigration('001_initial.sql'))
      console.log('Applied: 001_initial.sql')
    } else {
      console.log('Skipping 001_initial.sql — public.clients already exists')
    }

    if (process.env.PORTAL_APPLY_NOTES_DEMO === 'true') {
      const { rows: n } = await client.query(`SELECT to_regclass('public.notes') AS t`)
      if (!n[0]?.t) {
        console.log('Applying 002_notes.sql (demo notes table)...')
        await client.query(readMigration('002_notes.sql'))
        console.log('Applied: 002_notes.sql')
      } else {
        console.log('Skipping 002_notes.sql — public.notes already exists')
      }
    }

    const incremental = [
      '003_stripe_columns.sql',
      '004_hubspot_invoice_id.sql',
      '005_client_portal_features.sql',
      '006_change_order_contract.sql',
      '007_change_orders_cancelled.sql',
    ] as const
    for (const name of incremental) {
      console.log('Applying', name, '...')
      await client.query(readMigration(name))
      console.log('Applied:', name)
    }

    console.log('\nDone. Next steps:')
    console.log('  • Supabase → Authentication: ensure Clerk third-party JWT or custom JWT matches Clerk template "supabase" (claim sub = Clerk user id).')
    console.log('  • Storage → buckets "client-uploads" (005) and "change-order-packets" (006) should exist.')
    console.log('  • Seed data: pnpm seed (from clerk-nextjs, with SUPABASE_SERVICE_ROLE_KEY).')
  } finally {
    await client.end().catch(() => {})
    if (prevTls === undefined) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED
    else process.env.NODE_TLS_REJECT_UNAUTHORIZED = prevTls
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
