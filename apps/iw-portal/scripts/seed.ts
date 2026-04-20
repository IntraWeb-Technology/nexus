/**
 * Development seed — run from `apps/iw-portal` (or `pnpm --filter @repo/iw-portal seed` from repo root):
 *   pnpm seed
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in `.env.local`
 * Also seeds `public.os_*` tables (after migration `008_os_tables.sql`). Apply schema first:
 *   pnpm exec tsx scripts/apply-portal-schema-postgres.ts
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { milestonesForPlan } from '../src/lib/milestones-templates'
import { invoicesForPlan } from '../src/lib/invoice-templates'
import { exitIfOsSchemaMissing, exitIfPortalSchemaMissing } from './lib/supabase-schema-check'
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

/** Matches portal seed project — OS rows tie here for internal API demos. */
const SEED_HUBSPOT_DEAL_ID = 'hs_deal_placeholder'
const SEED_HUBSPOT_CONTACT_ID = '465446632129'
const SEED_HUBSPOT_COMPANY_ID = 'seed_company_demo_001'

async function seedOsOperationalData() {
  await exitIfOsSchemaMissing(sb, url!)

  await sb.from('os_automation_log').delete().eq('hubspot_deal_id', SEED_HUBSPOT_DEAL_ID)
  await sb.from('os_contracts_queue').delete().eq('hubspot_deal_id', SEED_HUBSPOT_DEAL_ID)
  await sb.from('os_client_success_clients').delete().eq('hubspot_deal_id', SEED_HUBSPOT_DEAL_ID)
  await sb.from('os_deals_sheet').delete().eq('hubspot_deal_id', SEED_HUBSPOT_DEAL_ID)
  await sb.from('os_leads').delete().eq('hubspot_deal_id', SEED_HUBSPOT_DEAL_ID)
  await sb.from('os_sheet_contacts').delete().eq('hubspot_contact_id', SEED_HUBSPOT_CONTACT_ID)
  await sb.from('os_sheet_companies').delete().eq('hubspot_company_id', SEED_HUBSPOT_COMPANY_ID)
  await sb.from('os_linkedin_pipeline').delete().eq('status', 'seed_demo')
  await sb.from('os_pipeline_snapshots').delete().eq('deal_name', 'SeedCo — Demo HVAC')
  await sb.from('os_pre_call_intake').delete().eq('email', 'seed-precall@intrawebtech.local')

  const seedMetrics = ['seed_open_deals', 'seed_pipeline_value', 'seed_active_clients']
  for (const m of seedMetrics) {
    await sb.from('os_summary_metrics').delete().eq('metric', m)
  }
  const seedMonths = ['2026-01', '2026-02', '2026-03']
  for (const mk of seedMonths) {
    await sb.from('os_revenue_monthly').delete().eq('month_key', mk)
  }

  const { error: logErr } = await sb.from('os_automation_log').insert([
    {
      workflow_name: 'SYS 01 — Website Form Lead Intake',
      contact_name: 'Justin Fatzer',
      phone: '+19168028745',
      event_type: 'website_form_intake',
      status: 'success',
      notes: 'SEED: contact intake demo row',
      hubspot_deal_id: SEED_HUBSPOT_DEAL_ID,
      hubspot_contact_id: SEED_HUBSPOT_CONTACT_ID,
      logged_at: '2026-04-03T12:00:00.000Z',
    },
    {
      workflow_name: 'SYS 03 — Contract Generation',
      contact_name: 'Portal seed',
      phone: '',
      event_type: 'contract_queued',
      status: 'success',
      notes: 'SEED: queue smoke test',
      hubspot_deal_id: SEED_HUBSPOT_DEAL_ID,
      hubspot_contact_id: SEED_HUBSPOT_CONTACT_ID,
      logged_at: '2026-04-04T15:00:00.000Z',
    },
  ])
  if (logErr) throw logErr

  const { error: dealsErr } = await sb.from('os_deals_sheet').insert({
    hubspot_deal_id: SEED_HUBSPOT_DEAL_ID,
    deal_name: 'Justin Fatzer - Website',
    company: 'SeedCo HVAC',
    industry: 'HVAC',
    tier: 'starter',
    lead_score: '7',
    hubspot_contact_id: SEED_HUBSPOT_CONTACT_ID,
    hubspot_company_id: SEED_HUBSPOT_COMPANY_ID,
    sheet_timestamp: '2026-04-03T12:00:00.000Z',
  })
  if (dealsErr) throw dealsErr

  const { error: leadsErr } = await sb.from('os_leads').insert([
    {
      source_kind: 'google_maps_scraper',
      name: 'SeedCo HVAC',
      company: 'SeedCo HVAC',
      industry: 'HVAC',
      source: 'google_maps_scraper',
      lead_score: 6,
      status: 'warm',
      place_id: 'ChIJSEED_DEMO_PLACE_ID_001',
      website: 'https://example-seed-hvac.test',
      email: 'seed-lead-maps@intrawebtech.local',
      phone: '+15555550100',
      address: '1 Seed St, Newark, NJ',
      hubspot_contact_id: SEED_HUBSPOT_CONTACT_ID,
      hubspot_deal_id: SEED_HUBSPOT_DEAL_ID,
      occurred_at: '2026-04-02T10:00:00.000Z',
    },
    {
      source_kind: 'hubspot_webhook',
      name: 'Webhook Lead',
      company: 'SeedCo HVAC',
      industry: 'HVAC',
      source: 'HubSpot',
      lead_score: 5,
      status: 'new',
      hubspot_deal_id: SEED_HUBSPOT_DEAL_ID,
      occurred_at: '2026-04-03T11:00:00.000Z',
    },
  ])
  if (leadsErr) throw leadsErr

  const { error: scErr } = await sb.from('os_sheet_contacts').insert({
    name: 'Justin Fatzer',
    email: 'jfatzer1@gmail.com',
    phone: '+19168028745',
    company: 'SeedCo HVAC',
    industry: 'HVAC',
    source: 'seed',
    lead_score: '7',
    hubspot_contact_id: SEED_HUBSPOT_CONTACT_ID,
  })
  if (scErr) throw scErr

  const { error: scoErr } = await sb.from('os_sheet_companies').insert({
    company_name: 'SeedCo HVAC',
    industry: 'HVAC',
    phone: '+15555550100',
    website: 'https://example-seed-hvac.test',
    address: '1 Seed St, Newark, NJ',
    hubspot_company_id: SEED_HUBSPOT_COMPANY_ID,
    company_owner: 'Seed Owner',
    city: 'Newark',
    state_region: 'New Jersey',
    country_region: 'United States',
  })
  if (scoErr) throw scoErr

  const { error: cqErr } = await sb.from('os_contracts_queue').insert([
    {
      queue_type: 'contract',
      hubspot_deal_id: SEED_HUBSPOT_DEAL_ID,
      queue_date: '2026-04-04',
      client_name: 'Justin Fatzer',
      company: 'SeedCo HVAC',
      industry: 'HVAC',
      deal_value: '10000',
      tier: 'starter',
      contact_email: 'jfatzer1@gmail.com',
      drive_link: 'https://drive.google.com/file/d/SEED_CONTRACT_FILE/view',
      status: 'Pending Review',
    },
    {
      queue_type: 'proposal',
      hubspot_deal_id: SEED_HUBSPOT_DEAL_ID,
      queue_date: '2026-04-04',
      client_name: 'Justin Fatzer',
      company: 'SeedCo HVAC',
      industry: 'HVAC',
      deal_value: '10000',
      tier: 'starter',
      contact_email: 'jfatzer1@gmail.com',
      status: 'Pending Review',
      proposal_status_detail: 'Pending Review | $10000 | starter | jfatzer1@gmail.com',
    },
  ])
  if (cqErr) throw cqErr

  const { error: csErr } = await sb.from('os_client_success_clients').insert({
    hubspot_deal_id: SEED_HUBSPOT_DEAL_ID,
    client_name: 'Justin Fatzer / SeedCo HVAC',
    tier: 'starter',
    mrr: '300',
    start_date: '2026-04-03',
    last_activity: '2026-04-04',
    health_score: '8',
  })
  if (csErr) throw csErr

  const { error: liErr } = await sb.from('os_linkedin_pipeline').insert({
    hashtags: '#HVAC #AI #Ops',
    date_generated: '2026-04-05T09:00:00.000Z',
    news_hook: 'SEED: Mid-market ops teams are automating intake — demo post',
    full_post: 'SEED demo body for LinkedIn pipeline row.',
    suggested_link: 'https://example.com/news/seed',
    status: 'seed_demo',
    scheduled_time: '',
    post_notes: 'SEED: generated by portal seed script',
  })
  if (liErr) throw liErr

  const { error: pipeErr } = await sb.from('os_pipeline_snapshots').insert([
    {
      captured_at: '2026-04-05T08:00:00.000Z',
      deal_name: 'SeedCo — Demo HVAC',
      stage: 'proposal',
      value: 10000,
      close_date: '2026-05-01',
      days_in_stage: 3,
      owner: 'John',
    },
    {
      captured_at: '2026-04-05T08:05:00.000Z',
      deal_name: 'Other Seed Deal',
      stage: 'qualifiedtobuy',
      value: 5000,
      close_date: '2026-06-01',
      days_in_stage: 10,
      owner: 'John',
    },
  ])
  if (pipeErr) throw pipeErr

  const { error: smErr } = await sb.from('os_summary_metrics').insert([
    { metric: 'seed_open_deals', value_text: '12', last_updated: '2026-04-05T08:00:00.000Z' },
    { metric: 'seed_pipeline_value', value_text: '240000', last_updated: '2026-04-05T08:00:00.000Z' },
    { metric: 'seed_active_clients', value_text: '8', last_updated: '2026-04-05T08:00:00.000Z' },
  ])
  if (smErr) throw smErr

  const { error: revErr } = await sb.from('os_revenue_monthly').insert([
    { month_key: '2026-01', invoiced: 42000, collected: 38000, outstanding: 4000, overdue: 0 },
    { month_key: '2026-02', invoiced: 45000, collected: 40000, outstanding: 5000, overdue: 1000 },
    { month_key: '2026-03', invoiced: 48000, collected: 45000, outstanding: 2500, overdue: 500 },
  ])
  if (revErr) throw revErr

  const preCallPayload = {
    'What is your company revenue model?': 'Project + recurring service',
    'How many employees or contractors are on your team?': '24',
    'Where does your team lose the most time each week?': 'Scheduling and follow-ups',
    'Have you tried AI tools before? What happened?': 'Tried ChatGPT for emails; inconsistent',
    'What would a win look like 90 days from now?': 'Automated intake + CRM hygiene',
    'What is your current tech stack?': 'HubSpot, Google Workspace, QuickBooks',
  }
  const { error: pcErr } = await sb.from('os_pre_call_intake').insert({
    email: 'seed-precall@intrawebtech.local',
    payload: preCallPayload,
    submitted_at: '2026-04-04T18:00:00.000Z',
  })
  if (pcErr) throw pcErr

  console.log('OS tables seed complete (deal', SEED_HUBSPOT_DEAL_ID, ')')
}

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

  await seedOsOperationalData()

  console.log('Seed complete. client_id=', client.id, 'project_id=', project.id)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
