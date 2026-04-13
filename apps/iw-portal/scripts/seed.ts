/**
 * Development seed — run from `apps/iw-portal` (or `pnpm --filter @repo/iw-portal seed` from repo root):
 *   pnpm seed
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in `.env.local`
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { milestonesForPlan } from '../src/lib/milestones-templates'
import { invoicesForPlan } from '../src/lib/invoice-templates'
import { exitIfPortalSchemaMissing } from './lib/supabase-schema-check'
import { iwPortalEnvLocalPath, resolveMonorepoRoot } from './lib/repo-root'

config({ path: iwPortalEnvLocalPath(resolveMonorepoRoot(import.meta.url)) })
config()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const service = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !service) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const sb = createClient(url, service, { auth: { persistSession: false } })

async function main() {
  await exitIfPortalSchemaMissing(sb, url!)

  await sb.from('clients').delete().eq('clerk_user_id', 'seed_user_justin')

  const { data: client, error: cErr } = await sb
    .from('clients')
    .insert({
      clerk_user_id: 'seed_user_justin',
      name: 'Justin Fatzer',
      email: 'jfatzer1@gmail.com',
      phone: '+19168028745',
      hubspot_contact_id: '465446632129',
    })
    .select('id')
    .single()
  if (cErr || !client) throw cErr ?? new Error('client')

  const { data: project, error: pErr } = await sb
    .from('projects')
    .insert({
      client_id: client.id,
      slug: 'build-01',
      plan: 'starter',
      status: 'build',
      progress_pct: 40,
      start_date: '2026-04-03',
      hubspot_deal_id: 'hs_deal_placeholder',
    })
    .select('id')
    .single()
  if (pErr || !project) throw pErr ?? new Error('project')

  const seeds = milestonesForPlan('starter')
  const milestoneRows = seeds.map((m, i) => ({
    project_id: project.id,
    title: m.title,
    description: null as string | null,
    status:
      i === 0 || i === 1 ? ('done' as const) : i === 2 ? ('active' as const) : ('pending' as const),
    phase: m.phase,
    completed_at:
      i === 0 || i === 1 ? '2026-04-03T00:00:00.000Z' : (null as string | null),
    estimated_at: null as string | null,
    sort_order: m.sort_order,
  }))
  await sb.from('milestones').insert(milestoneRows)

  await sb.from('messages').insert([
    {
      project_id: project.id,
      sender_type: 'staff',
      sender_name: 'John — IntraWeb Technologies',
      body:
        'Hey Justin — welcome aboard. Your onboarding document is in the Documents tab. Review it and let me know if anything needs adjusting before we move into the build phase.',
      read: false,
      created_at: '2026-04-03T10:14:00.000Z',
    },
    {
      project_id: project.id,
      sender_type: 'client',
      sender_name: 'Justin Fatzer',
      body: 'Looks good — ready to move forward.',
      read: true,
      created_at: '2026-04-03T11:02:00.000Z',
    },
    {
      project_id: project.id,
      sender_type: 'staff',
      sender_name: 'John — IntraWeb Technologies',
      body:
        'Logged a call for us. Want to jump on a quick call this week to walk through the automation architecture before I start building?',
      read: false,
      created_at: '2026-04-04T13:47:00.000Z',
    },
  ])

  await sb.from('documents').insert([
    {
      project_id: project.id,
      name: 'IntraWeb OS Onboarding — build-01.pdf',
      file_url: 'https://placeholder.intrawebtech.com/docs/onboarding.pdf',
      file_size_kb: 1229,
      requires_signature: false,
      signed: false,
      created_at: '2026-04-03T00:00:00.000Z',
    },
    {
      project_id: project.id,
      name: 'Scope of Work — Starter Automation.pdf',
      file_url: 'https://placeholder.intrawebtech.com/docs/sow.pdf',
      file_size_kb: 819,
      requires_signature: false,
      signed: false,
      created_at: '2026-04-03T00:00:00.000Z',
    },
    {
      project_id: project.id,
      name: 'IntraWeb Starter — Service Agreement.pdf',
      file_url: 'https://placeholder.intrawebtech.com/docs/agreement.pdf',
      file_size_kb: null,
      requires_signature: true,
      signed: false,
      created_at: '2026-04-03T00:00:00.000Z',
    },
  ])

  const inv = invoicesForPlan('starter')
  await sb.from('invoices').insert(
    inv.map((i) => ({
      project_id: project.id,
      invoice_number: i.invoice_number,
      description: i.description,
      amount_cents: i.amount_cents,
      status: i.status,
      sku: i.sku,
      due_date: null,
      paid_at: i.status === 'paid' ? '2026-04-03T00:00:00.000Z' : null,
      created_at: '2026-04-03T00:00:00.000Z',
    })),
  )

  await sb.from('activity_log').insert([
    {
      project_id: project.id,
      type: 'task',
      label: 'Follow-up task created',
      detail: 'Call logged Apr 4 — John waiting to connect',
      created_at: '2026-04-04T12:00:00.000Z',
    },
    {
      project_id: project.id,
      type: 'system',
      label: 'Contact status updated',
      detail: 'HubSpot lead status: New Lead',
      created_at: '2026-04-04T12:00:00.000Z',
    },
    {
      project_id: project.id,
      type: 'payment',
      label: 'Deposit received: $1,000',
      detail: 'IW-AS-SETUP — Starter setup deposit',
      created_at: '2026-04-03T12:00:00.000Z',
    },
    {
      project_id: project.id,
      type: 'document',
      label: 'Onboarding document delivered',
      detail: 'IntraWeb OS Onboarding PDF sent',
      created_at: '2026-04-03T12:00:00.000Z',
    },
    {
      project_id: project.id,
      type: 'milestone',
      label: 'Kickoff call completed',
      detail: 'Discovery & scoping — Apr 3, 2026',
      created_at: '2026-04-03T12:00:00.000Z',
    },
    {
      project_id: project.id,
      type: 'system',
      label: 'Contact created',
      detail: 'Source: offline (direct referral)',
      created_at: '2026-04-03T12:00:00.000Z',
    },
  ])

  await sb.from('notifications').insert([
    {
      project_id: project.id,
      type: 'action_required',
      title: 'Follow-up needed',
      body: 'John logged a call Apr 4 and is waiting to connect. Reply in Messages.',
      read: false,
      created_at: '2026-04-04T12:00:00.000Z',
    },
    {
      project_id: project.id,
      type: 'message',
      title: 'New message from John Schibelli',
      body: 'Apr 4, 1:47pm — Logged a call for us...',
      read: false,
      created_at: '2026-04-04T13:47:00.000Z',
    },
  ])

  await sb.from('notification_preferences').insert({
    client_id: client.id,
    email_notifications: true,
    message_alerts: true,
    invoice_reminders: true,
    document_uploads: false,
  })

  console.log('Seed complete. client_id=', client.id, 'project_id=', project.id)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
