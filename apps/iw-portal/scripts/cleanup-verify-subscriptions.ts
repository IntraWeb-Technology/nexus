/**
 * Removes subscription rows created by verify-stripe-subscription-sync.ts (stripe_subscription_id prefix sub_verify_).
 *
 *   pnpm exec tsx scripts/cleanup-verify-subscriptions.ts
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { iwPortalEnvLocalPath, resolveMonorepoRoot } from './lib/repo-root'
import { resolveSupabaseScriptEnv } from '@repo/env/supabase-script-env'

config({ path: iwPortalEnvLocalPath(resolveMonorepoRoot(import.meta.url)) })
config()

async function main() {
  let url: string
  let key: string
  try {
    const env = resolveSupabaseScriptEnv()
    url = env.url
    key = env.serviceRoleKey
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e))
    process.exit(1)
  }

  const sb = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await sb
    .from('subscriptions')
    .delete()
    .like('stripe_subscription_id', 'sub_verify_%')
    .select('stripe_subscription_id')

  if (error) {
    console.error('[supabase] delete failed:', error.message)
    process.exit(1)
  }
  const n = data?.length ?? 0
  console.log(n === 0 ? 'No sub_verify_* rows to remove.' : `Removed ${n} row(s).`)
  if (data && data.length > 0) console.log(data.map((r) => r.stripe_subscription_id).join('\n'))
}

main()
