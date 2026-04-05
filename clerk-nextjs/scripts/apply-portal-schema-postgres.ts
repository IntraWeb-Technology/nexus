/**
 * Applies supabase/migrations/001_initial.sql using POSTGRES_URL_NON_POOLING from .env.local
 * (targets whatever Supabase project that connection string points to — usually same as NEXT_PUBLIC_SUPABASE_URL).
 *
 * Run: pnpm exec tsx scripts/apply-portal-schema-postgres.ts
 */
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

const conn =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL
if (!conn) {
  console.error('Set POSTGRES_URL_NON_POOLING (or POSTGRES_URL) in .env.local')
  process.exit(1)
}

const sqlPath = join(process.cwd(), '..', 'supabase', 'migrations', '001_initial.sql')
const sql = readFileSync(sqlPath, 'utf8')

async function main() {
  // Supabase uses managed TLS; Node may reject the chain unless we opt out for this script only.
  const prevTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  const client = new Client({
    connectionString: conn,
    ssl: { rejectUnauthorized: false },
  })
  try {
    await client.connect()
    await client.query(sql)
    console.log('Applied:', sqlPath)
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
