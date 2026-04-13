import type { SupabaseClient } from '@supabase/supabase-js'

export type LinkPlaceholderResult = 'linked' | 'not_found' | 'conflict' | 'noop_already'

export type MergeProvisionedClientsResult = 'merged' | 'noop'

function isPlaceholderClerkId(id: string): boolean {
  return id.startsWith('provision:')
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
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

/**
 * When auto-provision created `clients` with a real `user_…` id first, HubSpot/n8n may still
 * have a separate placeholder row (`provision:…`) with the same email and the real project
 * (e.g. `jschibelli-portal-2026`). Move all projects onto the Clerk-linked client, copy
 * `hubspot_contact_id` if missing, then delete the placeholder row (prefs cascade).
 */
export async function mergeProvisionedClientsByEmailIntoClerkUser(
  supabase: SupabaseClient,
  input: { clerkUserId: string; email: string },
): Promise<MergeProvisionedClientsResult> {
  const clerkUserId = input.clerkUserId.trim()
  const email = normalizeEmail(input.email)
  if (!clerkUserId.startsWith('user_') || !email) return 'noop'

  const { data: real, error: realErr } = await supabase
    .from('clients')
    .select('id, hubspot_contact_id')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle()
  if (realErr || !real) return 'noop'

  const { data: placeholders, error: phErr } = await supabase
    .from('clients')
    .select('id, hubspot_contact_id')
    .ilike('email', email)
    .like('clerk_user_id', 'provision:%')
    .neq('id', real.id)

  if (phErr || !placeholders?.length) return 'noop'

  let mergedAny = false
  let hubspotOnReal = real.hubspot_contact_id

  for (const ph of placeholders) {
    const { error: moveErr } = await supabase.from('projects').update({ client_id: real.id }).eq('client_id', ph.id)
    if (moveErr) {
      console.error('[link-hubspot-provisioned-clerk] merge move projects', moveErr)
      continue
    }
    mergedAny = true

    const phHs = ph.hubspot_contact_id?.trim()
    if (!hubspotOnReal?.trim() && phHs) {
      hubspotOnReal = phHs
      const { error: hsErr } = await supabase
        .from('clients')
        .update({ hubspot_contact_id: phHs })
        .eq('id', real.id)
      if (hsErr) console.error('[link-hubspot-provisioned-clerk] merge hubspot_contact_id', hsErr)
    }

    const { error: delErr } = await supabase.from('clients').delete().eq('id', ph.id)
    if (delErr) console.error('[link-hubspot-provisioned-clerk] merge delete placeholder', delErr)
  }

  return mergedAny ? 'merged' : 'noop'
}
