import { createClerkClient } from '@clerk/backend'
import { invoicesForPlan } from '@/lib/invoice-templates'
import {
  linkPlaceholderClientToClerkUser,
  mergeProvisionedClientsByEmailIntoClerkUser,
} from '@/lib/data/link-hubspot-provisioned-clerk'
import { milestonesForPlan } from '@/lib/milestones-templates'
import { createServiceSupabase } from '@/lib/supabase/server'
import type { Plan } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'

const DEFAULT_PLAN: Plan = 'starter'

export function isPortalAutoProvisionEnabled(): boolean {
  const v = process.env.PORTAL_AUTO_PROVISION_SIGNUPS?.toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}

/** Parse Clerk `user.*` webhook payloads (snake_case fields per Clerk). */
export function parseClerkWebhookUser(
  data: Record<string, unknown>,
): { userId: string; email: string; name: string } | null {
  const userId = typeof data.id === 'string' ? data.id : ''
  if (!userId.startsWith('user_')) return null

  const primaryId =
    (typeof data.primary_email_address_id === 'string' ? data.primary_email_address_id : '') ||
    (typeof data.primaryEmailAddressId === 'string' ? data.primaryEmailAddressId : '')
  const raw = data.email_addresses ?? data.emailAddresses
  type Row = { id?: string; email_address?: string }
  const list: Row[] = Array.isArray(raw) ? (raw as Row[]) : []
  const email =
    list.find((e) => e.id === primaryId)?.email_address ??
    list.find((e) => typeof e.email_address === 'string')?.email_address
  if (!email || typeof email !== 'string') return null

  const fn =
    (typeof data.first_name === 'string' ? data.first_name : '') ||
    (typeof data.firstName === 'string' ? data.firstName : '')
  const ln =
    (typeof data.last_name === 'string' ? data.last_name : '') ||
    (typeof data.lastName === 'string' ? data.lastName : '')
  const name = `${fn} ${ln}`.trim() || email.split('@')[0] || 'Client'

  return { userId, email, name }
}

/**
 * When auto-provision is on, ensures a `clients` row (and starter project) exists for this
 * Clerk user by calling the Clerk API + inserting via service role. Used by the Clerk
 * webhook on `session.created` and as a fallback on the first portal request if webhooks
 * were not delivered or configured.
 */
export async function ensureSelfSignupProvisionForClerkUser(userId: string): Promise<void> {
  if (!isPortalAutoProvisionEnabled() || !userId.startsWith('user_')) return
  const sk = process.env.CLERK_SECRET_KEY
  if (!sk) return
  try {
    const supabase = createServiceSupabase()
    const clerk = createClerkClient({ secretKey: sk })
    const user = await clerk.users.getUser(userId)
    const primaryId = user.primaryEmailAddressId
    const email =
      user.emailAddresses.find((e) => e.id === primaryId)?.emailAddress ??
      user.emailAddresses[0]?.emailAddress
    if (!email) return
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      email.split('@')[0] ||
      'Client'

    await linkPlaceholderClientToClerkUser(supabase, { clerkUserId: userId, email })

    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('clerk_user_id', userId)
      .maybeSingle()
    if (existing) {
      await mergeProvisionedClientsByEmailIntoClerkUser(supabase, { clerkUserId: userId, email })
      return
    }

    await provisionSelfSignupCustomer(supabase, { userId, email, name })
  } catch (e) {
    console.error('[provision-self-signup] ensureSelfSignupProvisionForClerkUser', e)
  }
}

function projectSlugForClerkUser(userId: string): string {
  return `cl-${userId.replace(/^user_/, '')}`.slice(0, 200)
}

/**
 * Creates `clients` + `projects` + starter milestones/invoices/preferences when enabled.
 * Idempotent per `clerk_user_id`. Uses service-role Supabase (bypasses RLS).
 */
export async function provisionSelfSignupCustomer(
  supabase: SupabaseClient,
  input: { userId: string; email: string; name: string },
): Promise<'created' | 'exists' | 'skipped' | 'error'> {
  if (!isPortalAutoProvisionEnabled()) return 'skipped'

  const { userId, email, name } = input

  const linkRes = await linkPlaceholderClientToClerkUser(supabase, { clerkUserId: userId, email })
  if (linkRes === 'linked') return 'created'

  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle()
  if (existing) {
    await mergeProvisionedClientsByEmailIntoClerkUser(supabase, { clerkUserId: userId, email })
    return 'exists'
  }

  const slug = projectSlugForClerkUser(userId)
  const { data: slugTaken } = await supabase.from('projects').select('id').eq('slug', slug).maybeSingle()
  if (slugTaken) {
    console.error('[provision-self-signup] slug collision', slug)
    return 'error'
  }

  const start = new Date().toISOString().slice(0, 10)

  const { data: client, error: cErr } = await supabase
    .from('clients')
    .insert({
      clerk_user_id: userId,
      name,
      email,
      phone: null,
      company: null,
      hubspot_contact_id: null,
    })
    .select('id')
    .single()

  if (cErr || !client) {
    console.error('[provision-self-signup] client insert', cErr)
    return 'error'
  }

  const { data: project, error: pErr } = await supabase
    .from('projects')
    .insert({
      client_id: client.id,
      slug,
      plan: DEFAULT_PLAN,
      status: 'onboarding',
      progress_pct: 5,
      start_date: start,
      estimated_launch: null,
      hubspot_deal_id: null,
    })
    .select('id')
    .single()

  if (pErr || !project) {
    console.error('[provision-self-signup] project insert', pErr)
    await supabase.from('clients').delete().eq('id', client.id)
    return 'error'
  }

  const seeds = milestonesForPlan(DEFAULT_PLAN)
  const milestoneRows = seeds.map((m, i) => ({
    project_id: project.id,
    title: m.title,
    description: null as string | null,
    status: i === 0 ? ('active' as const) : ('pending' as const),
    phase: m.phase,
    completed_at: null as string | null,
    estimated_at: null as string | null,
    sort_order: m.sort_order,
  }))
  const { error: mErr } = await supabase.from('milestones').insert(milestoneRows)
  if (mErr) {
    console.error('[provision-self-signup] milestones', mErr)
    await supabase.from('clients').delete().eq('id', client.id)
    return 'error'
  }

  const invSeeds = invoicesForPlan(DEFAULT_PLAN)
  const { error: invErr } = await supabase.from('invoices').insert(
    invSeeds.map((inv) => ({
      project_id: project.id,
      invoice_number: inv.invoice_number,
      description: inv.description,
      amount_cents: inv.amount_cents,
      status: inv.status,
      sku: inv.sku,
      due_date: null,
      paid_at: inv.status === 'paid' ? new Date().toISOString() : null,
    })),
  )
  if (invErr) {
    console.error('[provision-self-signup] invoices', invErr)
    await supabase.from('clients').delete().eq('id', client.id)
    return 'error'
  }

  const { error: prefErr } = await supabase.from('notification_preferences').insert({
    client_id: client.id,
    email_notifications: true,
    message_alerts: true,
    invoice_reminders: true,
    document_uploads: false,
  })
  if (prefErr) {
    console.error('[provision-self-signup] notification_preferences', prefErr)
    await supabase.from('clients').delete().eq('id', client.id)
    return 'error'
  }

  return 'created'
}
