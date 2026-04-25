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
import { mergeProvisionedClientsByEmailIntoClerkUser } from '../src/lib/data/link-hubspot-provisioned-clerk'
import { requireHubSpotToken } from '../src/lib/hubspot/config'
import { config } from 'dotenv'
import { createClerkClient } from '@clerk/backend'
import { createClient } from '@supabase/supabase-js'
import { iwPortalEnvLocalPath, resolveMonorepoRoot } from './lib/repo-root'
import { resolveSupabaseScriptEnv } from './lib/supabase-env'

config({ path: iwPortalEnvLocalPath(resolveMonorepoRoot(import.meta.url)) })

const EMAIL = 'jschibelli@gmail.com'
const PROJECT_SLUG = 'jschibelli-portal-2026'
const HUBSPOT_API = 'https://api.hubapi.com'

function hubspotToken(): string {
  return requireHubSpotToken()
}

async function fetchHubSpotJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${hubspotToken()}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    throw new Error(`HubSpot request failed: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

async function resolveHubSpotContactId(): Promise<string> {
  if (process.env.HUBSPOT_JSCHIBELLI_CONTACT_ID) return process.env.HUBSPOT_JSCHIBELLI_CONTACT_ID

  const data = await fetchHubSpotJson<{
    results?: Array<{ id: string }>
  }>(`${HUBSPOT_API}/crm/v3/objects/contacts/search`, {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: EMAIL }] }],
      properties: ['email', 'hs_object_id'],
      limit: 1,
    }),
  })

  const id = data.results?.[0]?.id
  if (!id) {
    throw new Error(`No HubSpot contact found for ${EMAIL}`)
  }
  return id
}

async function resolveHubSpotDealId(contactId: string): Promise<string | null> {
  if (process.env.HUBSPOT_JSCHIBELLI_DEAL_ID) return process.env.HUBSPOT_JSCHIBELLI_DEAL_ID

  const data = await fetchHubSpotJson<{
    results?: Array<{ toObjectId?: number | string }>
  }>(`${HUBSPOT_API}/crm/v4/objects/contacts/${encodeURIComponent(contactId)}/associations/deals?limit=500`)

  const id = data.results?.[0]?.toObjectId
  return id != null ? String(id) : null
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

  const hubspotContact = await resolveHubSpotContactId()
  const hubspotDeal = await resolveHubSpotDealId(hubspotContact)

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

  const merged = await mergeProvisionedClientsByEmailIntoClerkUser(sb, {
    clerkUserId,
    email: EMAIL,
  })
  if (merged === 'merged') {
    console.log('Merged HubSpot placeholder client(s) into this Clerk user by email.')
  }

  const { data: existingBySlug } = await sb
    .from('projects')
    .select('id')
    .eq('client_id', client.id)
    .eq('slug', PROJECT_SLUG)
    .maybeSingle()

  let existing = existingBySlug
  if (!existing?.id) {
    const { data: fallback } = await sb
      .from('projects')
      .select('id')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    existing = fallback
  }

  let projectId: string
  if (existing?.id) {
    const { error: updateErr } = await sb
      .from('projects')
      .update({
        slug: PROJECT_SLUG,
        hubspot_deal_id: hubspotDeal,
      })
      .eq('id', existing.id)
    if (updateErr) {
      console.error('projects update failed:', updateErr.message ?? updateErr)
      process.exit(1)
    }
    projectId = existing.id
  } else {
    let resolved: string | undefined

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

    if (!pErr && project?.id) {
      resolved = project.id
    } else if (pErr?.code === '23505') {
      const { data: globalRow } = await sb
        .from('projects')
        .select('id, client_id')
        .eq('slug', PROJECT_SLUG)
        .maybeSingle()
      if (globalRow?.id) {
        const { data: owner } = await sb
          .from('clients')
          .select('id, clerk_user_id, email')
          .eq('id', globalRow.client_id)
          .maybeSingle()
        const ownerClerk = owner?.clerk_user_id ?? ''
        const ownerEmail = (owner?.email ?? '').trim().toLowerCase()
        const samePersonEmail = ownerEmail === EMAIL.trim().toLowerCase()
        const canReparent =
          owner &&
          owner.id !== client.id &&
          (ownerClerk.startsWith('provision:') || samePersonEmail)
        if (canReparent) {
          const { error: repErr } = await sb
            .from('projects')
            .update({
              client_id: client.id,
              hubspot_deal_id: hubspotDeal,
            })
            .eq('id', globalRow.id)
          if (!repErr) {
            resolved = globalRow.id
            console.log('Reparented project with this slug onto your Clerk-linked client (same email).')
            const { count: left } = await sb
              .from('projects')
              .select('*', { count: 'exact', head: true })
              .eq('client_id', owner.id)
            if ((left ?? 0) === 0) {
              await sb.from('clients').delete().eq('id', owner.id)
            }
          }
        }
      }
    }

    if (!resolved) {
      if (pErr?.code === '23505') {
        console.error('Slug conflict — change PROJECT_SLUG in script or delete existing project row.')
      }
      console.error('projects insert failed:', pErr?.message ?? pErr)
      process.exit(1)
    }
    projectId = resolved
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
    .eq('project_id', projectId)

  if ((count ?? 0) === 0) {
    await sb.from('milestones').insert([
      {
        project_id: projectId,
        title: 'Discovery & scoping',
        description: null,
        status: 'done',
        phase: 'discovery',
        completed_at: new Date().toISOString(),
        estimated_at: null,
        sort_order: 1,
      },
      {
        project_id: projectId,
        title: 'Onboarding & setup',
        description: null,
        status: 'active',
        phase: 'onboarding',
        completed_at: null,
        estimated_at: null,
        sort_order: 2,
      },
      {
        project_id: projectId,
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
  console.log('  project_id:', projectId)
  console.log('  slug:', PROJECT_SLUG)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
