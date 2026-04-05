/**
 * Upserts clients + projects for jschibelli@gmail.com into the Supabase project
 * from .env.local (must match NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
 *
 * HubSpot: set hubspot_contact_id / hubspot_deal_id via env when you have real IDs.
 *   HUBSPOT_JSCHIBELLI_CONTACT_ID=...
 *   HUBSPOT_JSCHIBELLI_DEAL_ID=...
 *
 * Run: pnpm exec tsx scripts/upsert-jschibelli-portal.ts
 */
import { config } from 'dotenv'
import { createClerkClient } from '@clerk/backend'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const EMAIL = 'jschibelli@gmail.com'
const PROJECT_SLUG = 'jschibelli-portal-2026'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const sk = process.env.CLERK_SECRET_KEY
  if (!sk) {
    console.error('Missing CLERK_SECRET_KEY')
    process.exit(1)
  }

  const clerk = createClerkClient({ secretKey: sk })
  const res = await clerk.users.getUserList({ emailAddress: [EMAIL] })
  const clerkUserId = res.data[0]?.id
  if (!clerkUserId) {
    console.error(`No Clerk user found for ${EMAIL}`)
    process.exit(1)
  }

  const hubspotContact =
    process.env.HUBSPOT_JSCHIBELLI_CONTACT_ID ?? 'hubspot_contact_jschibelli'
  const hubspotDeal = process.env.HUBSPOT_JSCHIBELLI_DEAL_ID ?? 'hubspot_deal_jschibelli'

  const sb = createClient(url, service, { auth: { persistSession: false } })

  const { data: client, error: cErr } = await sb
    .from('clients')
    .upsert(
      {
        clerk_user_id: clerkUserId,
        name: 'John Schibelli',
        email: EMAIL,
        phone: null,
        company: 'IntraWeb Technologies',
        hubspot_contact_id: hubspotContact,
      },
      { onConflict: 'clerk_user_id' },
    )
    .select('id')
    .single()

  if (cErr || !client) {
    console.error('clients upsert failed:', cErr?.message ?? cErr)
    process.exit(1)
  }

  const { data: existing } = await sb
    .from('projects')
    .select('id')
    .eq('client_id', client.id)
    .limit(1)
    .maybeSingle()

  if (existing?.id) {
    console.log('Project already exists for client. client_id=', client.id, 'project_id=', existing.id)
    console.log('Supabase URL:', url)
    console.log('Done.')
    return
  }

  const { data: project, error: pErr } = await sb
    .from('projects')
    .insert({
      client_id: client.id,
      slug: PROJECT_SLUG,
      plan: 'growth',
      status: 'build',
      progress_pct: 45,
      start_date: new Date().toISOString().slice(0, 10),
      estimated_launch: null,
      hubspot_deal_id: hubspotDeal,
    })
    .select('id')
    .single()

  if (pErr || !project) {
    if (pErr?.code === '23505') {
      console.error('Slug conflict — change PROJECT_SLUG in script or delete existing project row.')
    }
    console.error('projects insert failed:', pErr?.message ?? pErr)
    process.exit(1)
  }

  await sb.from('notification_preferences').upsert(
    {
      client_id: client.id,
      email_notifications: true,
      message_alerts: true,
      invoice_reminders: true,
      document_uploads: true,
    },
    { onConflict: 'client_id' },
  )

  const { count } = await sb
    .from('milestones')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', project.id)

  if ((count ?? 0) === 0) {
    await sb.from('milestones').insert([
      {
        project_id: project.id,
        title: 'Discovery & scoping',
        description: null,
        status: 'done',
        phase: 'discovery',
        completed_at: new Date().toISOString(),
        estimated_at: null,
        sort_order: 1,
      },
      {
        project_id: project.id,
        title: 'Onboarding & setup',
        description: null,
        status: 'active',
        phase: 'onboarding',
        completed_at: null,
        estimated_at: null,
        sort_order: 2,
      },
      {
        project_id: project.id,
        title: 'Integration build',
        description: null,
        status: 'pending',
        phase: 'build',
        completed_at: null,
        estimated_at: null,
        sort_order: 3,
      },
    ])
  }

  console.log('Upsert OK.')
  console.log('  Supabase:', url)
  console.log('  clerk_user_id:', clerkUserId)
  console.log('  client_id:', client.id)
  console.log('  project_id:', project.id)
  console.log('  slug:', PROJECT_SLUG)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
