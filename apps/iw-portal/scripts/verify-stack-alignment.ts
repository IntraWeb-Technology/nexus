/**
 * Read-only checks: Supabase URL vs JWT ref vs Postgres host, os_* visibility, HubSpot + Clerk reachability.
 * Run: pnpm exec tsx scripts/verify-stack-alignment.ts (from apps/iw-portal)
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { Client } from 'pg'
import { applyIwPortalEnvValidation } from './lib/iw-portal-env-check'
import { iwPortalEnvLocalPath, resolveMonorepoRoot } from './lib/repo-root'
import { resolveSupabaseScriptEnv } from './lib/supabase-env'

config({ path: iwPortalEnvLocalPath(resolveMonorepoRoot(import.meta.url)) })
applyIwPortalEnvValidation('strict')

function refFromSupabaseUrl(url: string | undefined): string | null {
  if (!url) return null
  try {
    const h = new URL(url).hostname
    const m = h.match(/^([a-z0-9]+)\.supabase\.co$/i)
    return m ? m[1] : null
  } catch {
    return null
  }
}

function refFromJwt(jwt: string | undefined): string | null {
  if (!jwt || jwt.split('.').length < 2) return null
  try {
    const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString('utf8')) as {
      ref?: string
    }
    return payload.ref ?? null
  } catch {
    return null
  }
}

function refFromPostgresHost(host: string | undefined): string | null {
  if (!host) return null
  const m = host.match(/^db\.([a-z0-9]+)\.supabase\.co$/i)
  return m ? m[1] : null
}

async function main() {
  let url: string
  let service: string
  try {
    const env = resolveSupabaseScriptEnv()
    url = env.url
    service = env.serviceRoleKey
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
  const pgUrl = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL
  const hubToken = process.env.HUBSPOT_PRIVATE_APP_TOKEN
  const clerkSecret = process.env.CLERK_SECRET_KEY

  const urlRef = refFromSupabaseUrl(url)
  const jwtRef = refFromJwt(service)
  const hostRef = refFromPostgresHost(process.env.POSTGRES_HOST)

  console.log('--- Supabase project ref alignment ---')
  console.log('Supabase API URL ref:', urlRef ?? '(missing URL)')
  console.log('JWT "ref" (service role):     ', jwtRef ?? '(missing or invalid JWT)')
  console.log('POSTGRES_HOST ref:            ', hostRef ?? '(missing host)')
  const aligned = urlRef && jwtRef && hostRef && urlRef === jwtRef && urlRef === hostRef
  console.log(aligned ? 'OK: all three match.' : 'MISMATCH: fix .env.local so URL, JWT, and POSTGRES_* use the same Supabase project.')

  if (!pgUrl) {
    console.log('\n--- Postgres os_* tables ---')
    console.log('SKIP: no POSTGRES_URL_NON_POOLING')
  } else {
    const prevTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    const c = new Client({ connectionString: pgUrl, ssl: { rejectUnauthorized: false } })
    try {
      await c.connect()
      const { rows } = await c.query<{ n: string }>(
        `select string_agg(table_name, ', ' order by table_name) as n
         from information_schema.tables
         where table_schema = 'public' and table_name like 'os%'`,
      )
      const list = rows[0]?.n ?? ''
      const count = list ? list.split(', ').length : 0
      console.log('\n--- Postgres os_* tables ---')
      console.log('Count:', count)
      if (count) console.log('Tables:', list)
      else console.log('No os_* tables on this database (run 008_os_tables.sql on this project).')
    } finally {
      await c.end().catch(() => {})
      if (prevTls === undefined) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED
      else process.env.NODE_TLS_REJECT_UNAUTHORIZED = prevTls
    }
  }

  if (url && service) {
    const sb = createClient(url, service, { auth: { persistSession: false } })
    const { error, count } = await sb.from('os_deals_sheet').select('*', { count: 'exact', head: true })
    console.log('\n--- PostgREST (service role) os_deals_sheet ---')
    if (error) console.log('Error:', error.message)
    else console.log('OK: head count =', count ?? 0)
  }

  if (hubToken) {
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/deals?limit=1', {
      headers: { Authorization: `Bearer ${hubToken}` },
    })
    console.log('\n--- HubSpot CRM ---')
    console.log(res.ok ? 'OK: deals API reachable.' : `FAIL: HTTP ${res.status}`)
  } else {
    console.log('\n--- HubSpot CRM ---')
    console.log('SKIP: HUBSPOT_PRIVATE_APP_TOKEN unset')
  }

  if (clerkSecret) {
    const res = await fetch('https://api.clerk.com/v1/instance', {
      headers: { Authorization: `Bearer ${clerkSecret}` },
    })
    console.log('\n--- Clerk ---')
    console.log(res.ok ? 'OK: instance API reachable.' : `FAIL: HTTP ${res.status}`)
  } else {
    console.log('\n--- Clerk ---')
    console.log('SKIP: CLERK_SECRET_KEY unset')
  }

  console.log('\n--- n8n workflows (repo) ---')
  console.log('OS Postgres nodes use credential name "Supabase OS Postgres" — bind in n8n to the same DB as portal os_* tables.')

  if (!aligned) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
