import type { SupabaseClient } from '@supabase/supabase-js'

export type LinkPlaceholderResult = 'linked' | 'not_found' | 'conflict' | 'noop_already'

function isPlaceholderClerkId(id: string): boolean {
  return id.startsWith('provision:')
}

/**
 * After HubSpot/n8n `provision_client`, `clients.clerk_user_id` is often a placeholder
 * (`provision:hs:<hubspot_contact_id>`). When the real Clerk user appears, call this to
 * swap in `user_…` so the portal layout can load. Prefer `hubspot_contact_id` when n8n
 * has it; otherwise match by `email` on placeholder rows only.
 */
export async function linkPlaceholderClientToClerkUser(
  supabase: SupabaseClient,
  input: { clerkUserId: string; email?: string; hubspotContactId?: string },
): Promise<LinkPlaceholderResult> {
  const clerkUserId = input.clerkUserId.trim()
  if (!clerkUserId.startsWith('user_')) return 'conflict'

  const { data: already } = await supabase
    .from('clients')
    .select('id, clerk_user_id')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle()
  if (already) return 'noop_already'

  const hs = input.hubspotContactId?.trim()
  const email = input.email?.trim()
  if (!hs && !email) return 'not_found'

  let q = supabase.from('clients').select('id, clerk_user_id').like('clerk_user_id', 'provision:%')
  if (hs) {
    q = q.eq('hubspot_contact_id', hs)
  } else if (email) {
    q = q.ilike('email', email)
  }

  const { data: candidates, error } = await q.order('created_at', { ascending: false }).limit(3)
  if (error || !candidates?.length) return 'not_found'

  const row = candidates[0]
  if (!row || !isPlaceholderClerkId(row.clerk_user_id)) return 'not_found'

  const { error: upErr } = await supabase.from('clients').update({ clerk_user_id: clerkUserId }).eq('id', row.id)
  if (upErr) {
    console.error('[link-hubspot-provisioned-clerk] update', upErr)
    return 'conflict'
  }
  return 'linked'
}
