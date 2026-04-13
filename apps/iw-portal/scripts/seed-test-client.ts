/**
 * Test client seed — full portal data for QA (messages, docs, invoices, notifications, etc.).
 *
 * Run from `apps/iw-portal` or `pnpm --filter @repo/iw-portal seed:test` from repo root:
 *   pnpm seed:test
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in `.env.local`
 * Optional: CLERK_SECRET_KEY — if set, links `clerk_user_id` to the Clerk user for testuser@gmail.com
 *           when that user exists; otherwise uses a HubSpot-style placeholder until they sign up.
 *
 * HubSpot: replace HUBSPOT_CONTACT_ID / HUBSPOT_DEAL_PRIMARY with IDs from your portal (or set env vars).
 */
import { config } from 'dotenv'
import { createClerkClient } from '@clerk/backend'
import { createClient } from '@supabase/supabase-js'
import { invoicesForPlan } from '../src/lib/invoice-templates'
import { milestonesForPlan } from '../src/lib/milestones-templates'
import { exitIfPortalSchemaMissing } from './lib/supabase-schema-check'
import { iwPortalEnvLocalPath, resolveMonorepoRoot } from './lib/repo-root'

config({ path: iwPortalEnvLocalPath(resolveMonorepoRoot(import.meta.url)) })
config()

const TEST_EMAIL = 'testuser@gmail.com'
const TEST_NAME = 'Test User'
const TEST_PHONE = '+15555550100'
const TEST_COMPANY = 'Test Co (HubSpot QA)'

/** Default placeholders — swap for real HubSpot IDs from your deals/contact */
const HUBSPOT_CONTACT_ID =
  process.env.HUBSPOT_TEST_CONTACT_ID ?? '999888777666'
const HUBSPOT_DEAL_PRIMARY =
  process.env.HUBSPOT_TEST_DEAL_ID ?? '999888777101'
/** Logged in activity only (second deal in your HubSpot pipeline) */
const HUBSPOT_DEAL_SECONDARY_NOTE = '999888777102'

const PROJECT_SLUG = 'test-hubspot-growth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const service = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !service) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const sb = createClient(supabaseUrl, service, { auth: { persistSession: false } })

async function resolveClerkUserId(): Promise<string> {
  const sk = process.env.CLERK_SECRET_KEY
  if (!sk) {
    console.warn(
      '[seed:test] No CLERK_SECRET_KEY — using placeholder clerk_user_id. After testuser@gmail.com signs up, run again or UPDATE clients SET clerk_user_id = <Clerk user id>.',
    )
    return `provision:hs:${HUBSPOT_CONTACT_ID}`
  }
  const clerk = createClerkClient({ secretKey: sk })
  const res = await clerk.users.getUserList({ emailAddress: [TEST_EMAIL] })
  const id = res.data[0]?.id
  if (id) {
    console.log('[seed:test] Linked Clerk user id:', id)
    return id
  }
  console.warn(
    `[seed:test] No Clerk user for ${TEST_EMAIL} — using placeholder. Sign up first, then re-run.`,
  )
  return `provision:hs:${HUBSPOT_CONTACT_ID}`
}

async function main() {
  await exitIfPortalSchemaMissing(sb, supabaseUrl!)

  const clerkUserId = await resolveClerkUserId()

  const { data: bySlug } = await sb.from('projects').select('client_id').eq('slug', PROJECT_SLUG).maybeSingle()
  if (bySlug?.client_id) {
    await sb.from('clients').delete().eq('id', bySlug.client_id)
    console.log('[seed:test] Removed existing data for slug', PROJECT_SLUG)
  }

  const { data: byEmail } = await sb.from('clients').select('id').eq('email', TEST_EMAIL).maybeSingle()
  if (byEmail?.id) {
    await sb.from('clients').delete().eq('id', byEmail.id)
    console.log('[seed:test] Removed existing client for', TEST_EMAIL)
  }

  const { data: client, error: cErr } = await sb
    .from('clients')
    .insert({
      clerk_user_id: clerkUserId,
      name: TEST_NAME,
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      company: TEST_COMPANY,
      hubspot_contact_id: HUBSPOT_CONTACT_ID,
    })
    .select('id')
    .single()
  if (cErr || !client) throw cErr ?? new Error('client insert failed')

  const { data: project, error: pErr } = await sb
    .from('projects')
    .insert({
      client_id: client.id,
      slug: PROJECT_SLUG,
      plan: 'growth',
      status: 'build',
      progress_pct: 55,
      start_date: '2026-03-15',
      estimated_launch: '2026-06-01',
      hubspot_deal_id: HUBSPOT_DEAL_PRIMARY,
    })
    .select('id')
    .single()
  if (pErr || !project) throw pErr ?? new Error('project insert failed')

  const plan = 'growth' as const
  const seeds = milestonesForPlan(plan)
  const milestoneRows = seeds.map((m, i) => ({
    project_id: project.id,
    title: m.title,
    description: null as string | null,
    status:
      i < 3 ? ('done' as const) : i === 3 || i === 4 ? ('active' as const) : ('pending' as const),
    phase: m.phase,
    completed_at:
      i < 3 ? '2026-03-20T15:00:00.000Z' : (null as string | null),
    estimated_at: i >= 3 && i <= 5 ? '2026-04-15T12:00:00.000Z' : (null as string | null),
    sort_order: m.sort_order,
  }))
  await sb.from('milestones').insert(milestoneRows)

  await sb.from('messages').insert([
    {
      project_id: project.id,
      sender_type: 'staff',
      sender_name: 'John — IntraWeb Technologies',
      body:
        'Welcome to the Growth build. I’ve synced your HubSpot deals — primary deal is on file; we can reference the second deal for the add-on scope when you’re ready.',
      read: false,
      created_at: '2026-04-01T10:00:00.000Z',
    },
    {
      project_id: project.id,
      sender_type: 'client',
      sender_name: TEST_NAME,
      body: 'Great — we have two open deals in HubSpot; use the main one for billing.',
      read: true,
      created_at: '2026-04-01T11:30:00.000Z',
    },
    {
      project_id: project.id,
      sender_type: 'staff',
      sender_name: 'John — IntraWeb Technologies',
      body:
        'Please upload brand assets in Documents when you can — blocks the integration milestone.',
      read: false,
      created_at: '2026-04-04T14:00:00.000Z',
    },
    {
      project_id: project.id,
      sender_type: 'staff',
      sender_name: 'IntraWeb Bot',
      body: 'HubSpot deal stage updated to Proposal Sent (test pipeline).',
      read: true,
      created_at: '2026-04-03T09:00:00.000Z',
    },
  ])

  await sb.from('documents').insert([
    {
      project_id: project.id,
      name: 'Growth — Statement of Work.pdf',
      file_url: 'https://placeholder.intrawebtech.com/docs/test-sow-growth.pdf',
      file_size_kb: 2100,
      requires_signature: true,
      signed: false,
      created_at: '2026-03-16T00:00:00.000Z',
    },
    {
      project_id: project.id,
      name: 'Brand questionnaire (completed).pdf',
      file_url: 'https://placeholder.intrawebtech.com/docs/test-brand-q.pdf',
      file_size_kb: 450,
      requires_signature: false,
      signed: false,
      created_at: '2026-03-18T00:00:00.000Z',
    },
    {
      project_id: project.id,
      name: 'HubSpot — deal export (sample).csv',
      file_url: 'https://placeholder.intrawebtech.com/docs/test-deals.csv',
      file_size_kb: 12,
      requires_signature: false,
      signed: false,
      created_at: '2026-04-02T00:00:00.000Z',
    },
  ])

  const inv = invoicesForPlan(plan)
  await sb.from('invoices').insert(
    inv.map((i) => ({
      project_id: project.id,
      invoice_number: i.invoice_number,
      description: i.description,
      amount_cents: i.amount_cents,
      status: i.status,
      sku: i.sku,
      due_date: i.status === 'pending' ? '2026-05-01' : null,
      paid_at: i.status === 'paid' ? '2026-03-20T00:00:00.000Z' : null,
      created_at: '2026-03-20T00:00:00.000Z',
    })),
  )

  await sb.from('invoices').insert({
    project_id: project.id,
    invoice_number: 'INV-004',
    description: 'Prior period balance — overdue (test)',
    amount_cents: 25_000,
    status: 'overdue',
    sku: 'IW-TEST-OVD',
    due_date: '2026-03-01',
    paid_at: null,
    created_at: '2026-02-15T00:00:00.000Z',
  })

  await sb.from('activity_log').insert([
    {
      project_id: project.id,
      type: 'deal',
      label: 'HubSpot deal linked',
      detail: `Primary deal ${HUBSPOT_DEAL_PRIMARY}; secondary deal ${HUBSPOT_DEAL_SECONDARY_NOTE} noted for add-on scope.`,
      created_at: '2026-04-01T12:00:00.000Z',
    },
    {
      project_id: project.id,
      type: 'payment',
      label: 'Growth deposit received',
      detail: 'IW-AG-SETUP — $2,000',
      created_at: '2026-03-20T12:00:00.000Z',
    },
    {
      project_id: project.id,
      type: 'document',
      label: 'SOW delivered',
      detail: 'Growth — Statement of Work.pdf',
      created_at: '2026-03-16T12:00:00.000Z',
    },
    {
      project_id: project.id,
      type: 'task',
      label: 'Follow-up: brand assets',
      detail: 'Waiting on client upload',
      created_at: '2026-04-04T12:00:00.000Z',
    },
    {
      project_id: project.id,
      type: 'system',
      label: 'Contact synced from HubSpot',
      detail: `Contact ID ${HUBSPOT_CONTACT_ID}`,
      created_at: '2026-03-15T12:00:00.000Z',
    },
  ])

  await sb.from('notifications').insert([
    {
      project_id: project.id,
      type: 'action_required',
      title: 'Sign the Statement of Work',
      body: 'Open Documents and complete signature on Growth — Statement of Work.pdf.',
      read: false,
      created_at: '2026-04-04T10:00:00.000Z',
    },
    {
      project_id: project.id,
      type: 'message',
      title: 'Unread message from IntraWeb',
      body: 'Please upload brand assets — blocks the integration milestone.',
      read: false,
      created_at: '2026-04-04T14:00:00.000Z',
    },
    {
      project_id: project.id,
      type: 'invoice',
      title: 'Invoice pending',
      body: 'INV-002 — Go-live balance is due May 1.',
      read: false,
      created_at: '2026-04-03T09:00:00.000Z',
    },
    {
      project_id: project.id,
      type: 'milestone',
      title: 'Milestone active',
      body: 'Integration build is in progress.',
      read: true,
      created_at: '2026-04-02T09:00:00.000Z',
    },
    {
      project_id: project.id,
      type: 'document',
      title: 'New document',
      body: 'HubSpot — deal export (sample).csv added.',
      read: true,
      created_at: '2026-04-02T11:00:00.000Z',
    },
  ])

  await sb.from('notification_preferences').insert({
    client_id: client.id,
    email_notifications: true,
    message_alerts: true,
    invoice_reminders: true,
    document_uploads: true,
  })

  console.log('')
  console.log('Test client seed complete.')
  console.log('  email:', TEST_EMAIL)
  console.log('  clerk_user_id:', clerkUserId)
  console.log('  hubspot_contact_id:', HUBSPOT_CONTACT_ID)
  console.log('  hubspot_deal_id (project):', HUBSPOT_DEAL_PRIMARY)
  console.log('  project slug:', PROJECT_SLUG)
  console.log('  client_id:', client.id, ' project_id:', project.id)
  console.log('')
  console.log('Sign in as testuser@gmail.com in Clerk (or update clients.clerk_user_id after signup).')
  console.log('Override HubSpot IDs: HUBSPOT_TEST_CONTACT_ID, HUBSPOT_TEST_DEAL_ID')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
