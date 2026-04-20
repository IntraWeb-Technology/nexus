/**
 * Migrates checked-in n8n workflow JSON from googleSheets to postgres (Supabase os_* tables).
 * Run from repo: node packages/n8n-workflows/scripts/os-sheets-migrate.mjs
 *
 * Cutover (production): apply Supabase migration `008_os_tables.sql` → deploy iw-portal → import
 * updated workflows into n8n and bind credential **Supabase OS Postgres** (pooler URL + SSL).
 * Optional historical rows: export Sheets to CSV and `COPY` / manual INSERT into `os_*`.
 * Internal read API: GET `/api/internal/os/...` on iw-portal with header `x-intrawebtech-secret: WEBHOOK_SECRET`.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const wfRoot = path.join(__dirname, '..')

/** Placeholder; replace with your n8n Postgres credential id/name after import (e.g. Supabase IW-Portal). */
const PG = {
  id: 'OS_SUPABASE_POSTGRES',
  name: 'Supabase OS Postgres',
}

function pg(id, name, pos, query, extra = {}) {
  return {
    parameters: { operation: 'executeQuery', query, options: {} },
    id,
    name,
    type: 'n8n-nodes-base.postgres',
    typeVersion: 2.5,
    position: pos,
    credentials: { postgres: { ...PG } },
    ...extra,
  }
}

function transformNode(n, rel) {
  if (n.type !== 'n8n-nodes-base.googleSheets') return n

  const op = n.parameters?.operation || 'read'
  const name = n.name
  const id = n.id
  const pos = n.position
  const retry = {}
  if (n.retryOnFail) retry.retryOnFail = n.retryOnFail
  if (n.maxTries) retry.maxTries = n.maxTries
  if (n.waitBetweenTries) retry.waitBetweenTries = n.waitBetweenTries

  // --- SW already migrated in repo ---
  if (name === 'Append to Log' && n.type === 'n8n-nodes-base.googleSheets') {
    return pg(id, name, pos, '={{ $json._sql }}', retry)
  }

  // SYS 08
  if (rel.includes('SYS 08') && name === 'Query Revenue') {
    return pg(
      id,
      name,
      pos,
      `SELECT month_key AS "Month", invoiced::text AS "Invoiced", collected::text AS "Collected", outstanding::text AS "Outstanding", overdue::text AS "Overdue" FROM public.os_revenue_monthly ORDER BY month_key`,
      retry,
    )
  }

  // SYS 07
  if (rel.includes('SYS 07')) {
    if (name === 'Append to Pipeline') {
      return pg(
        id,
        name,
        pos,
        `={{ "INSERT INTO public.os_pipeline_snapshots (deal_name, stage, value, close_date, days_in_stage, owner) VALUES ('" + String($json.dealName||'').replace(/'/g,"''") + "','" + String($json.stage||'').replace(/'/g,"''") + "'," + (Number($json.value)||0) + ",'" + String($json.closeDate||'').replace(/'/g,"''") + "'," + (Number($json.daysInStage)||0) + ",'" + String($json.owner||'').replace(/'/g,"''") + "');" }}`,
        retry,
      )
    }
    if (name === 'Append to Leads') {
      return pg(
        id,
        name,
        pos,
        `={{ "INSERT INTO public.os_leads (source_kind, name, company, industry, source, lead_score, status) VALUES ('hubspot_webhook','" + String($json.name||'').replace(/'/g,"''") + "','" + String($json.company||'').replace(/'/g,"''") + "','" + String($json.industry||'').replace(/'/g,"''") + "','" + String($json.source||'').replace(/'/g,"''") + "'," + (Number($json.leadScore)||0) + ",'" + String($json.status||'').replace(/'/g,"''") + "');" }}`,
        retry,
      )
    }
    if (name === 'Update Summary Tab') {
      return pg(
        id,
        name,
        pos,
        `={{ "INSERT INTO public.os_summary_metrics (metric, value_text, last_updated) VALUES ('" + String($json.Metric||'').replace(/'/g,"''") + "','" + String($json.Value??'').replace(/'/g,"''") + "', now()) ON CONFLICT (metric) DO UPDATE SET value_text = EXCLUDED.value_text, last_updated = EXCLUDED.last_updated;" }}`,
        retry,
      )
    }
  }

  // SYS 06
  if (rel.includes('SYS 06') && op === 'append') {
    return pg(
      id,
      name,
      pos,
      `={{ "INSERT INTO public.os_linkedin_pipeline (hashtags, date_generated, news_hook, full_post, suggested_link, status, scheduled_time, post_notes) VALUES ('" + String($json.hashtags||'').replace(/'/g,"''") + "', now(),'" + String($json.newsHook||'').replace(/'/g,"''") + "','" + String($json.fullPost||'').replace(/'/g,"''") + "','" + String($json.suggestedLink||'').replace(/'/g,"''") + "','" + String($json.status||'').replace(/'/g,"''") + "','" + String($json.scheduledTime||'').replace(/'/g,"''") + "','" + String($json.postNotes||'').replace(/'/g,"''") + "');" }}`,
      retry,
    )
  }

  // SYS 05 — single Clients tab upsert per deal
  if (rel.includes('SYS 05') && name === 'Update Clients Tab') {
    return pg(
      id,
      name,
      pos,
      `={{ "INSERT INTO public.os_client_success_clients (hubspot_deal_id, client_name, tier, mrr, start_date, last_activity, health_score) VALUES ('" + String($json.dealId||'').replace(/'/g,"''") + "','" + String($json.clientName||'').replace(/'/g,"''") + "','" + String($json.tier||'').replace(/'/g,"''") + "','','','" + String($json.lastContactDate||'').replace(/'/g,"''") + "','" + String($json.healthScore??'').replace(/'/g,"''") + "') ON CONFLICT (hubspot_deal_id) DO UPDATE SET client_name = EXCLUDED.client_name, tier = EXCLUDED.tier, last_activity = EXCLUDED.last_activity, health_score = EXCLUDED.health_score, updated_at = now();" }}`,
      retry,
    )
  }

  // SYS 01 Website — Deals appendOrUpdate + Deals append
  if (rel.includes('Website Form Lead Intake')) {
    if (name === 'Append or update row in sheet') {
      return pg(
        id,
        name,
        pos,
        `={{ "INSERT INTO public.os_deals_sheet (hubspot_deal_id, deal_name, company, industry, tier, lead_score, hubspot_contact_id, hubspot_company_id, sheet_timestamp) VALUES ('" + String($('Build CRM Context').first().json.dealId||'').replace(/'/g,"''") + "','" + String($('Build CRM Context').first().json.dealName||'').replace(/'/g,"''") + "','" + String($('Build CRM Context').first().json.company||'').replace(/'/g,"''") + "','" + String($('Build CRM Context').first().json.industry||'').replace(/'/g,"''") + "','" + String($('Build CRM Context').first().json.tier||'').replace(/'/g,"''") + "','','" + String($('Build CRM Context').first().json.contactId||'').replace(/'/g,"''") + "','', now()) ON CONFLICT (hubspot_deal_id) DO UPDATE SET deal_name = EXCLUDED.deal_name, company = EXCLUDED.company, industry = EXCLUDED.industry, tier = EXCLUDED.tier, lead_score = EXCLUDED.lead_score, hubspot_contact_id = EXCLUDED.hubspot_contact_id, hubspot_company_id = EXCLUDED.hubspot_company_id, sheet_timestamp = EXCLUDED.sheet_timestamp, updated_at = now();" }}`,
        retry,
      )
    }
    if (name === 'Append to Deals Tab') {
      return pg(
        id,
        name,
        pos,
        `={{ "INSERT INTO public.os_deals_sheet (hubspot_deal_id, deal_name, company, industry, tier, lead_score, hubspot_contact_id, hubspot_company_id, sheet_timestamp) SELECT '" + String($('Build CRM Context').first().json.dealId||'').replace(/'/g,"''") + "','" + String($('Build CRM Context').first().json.dealName||'').replace(/'/g,"''") + "','" + String($('Build CRM Context').first().json.company||'').replace(/'/g,"''") + "','" + String($('Build CRM Context').first().json.industry||'').replace(/'/g,"''") + "','" + String($('Build CRM Context').first().json.tier||'').replace(/'/g,"''") + "','','" + String($('Build CRM Context').first().json.contactId||'').replace(/'/g,"''") + "','', now() WHERE NOT EXISTS (SELECT 1 FROM public.os_deals_sheet d WHERE d.hubspot_deal_id = '" + String($('Build CRM Context').first().json.dealId||'').replace(/'/g,"''") + "');" }}`,
        retry,
      )
    }
  }

  // SYS 01 Lead Sourcing
  if (rel.includes('Lead Sourcing Machine')) {
    if (name === 'Read Leads Sheet') {
      return pg(
        id,
        name,
        pos,
        `SELECT place_id AS "Place ID", place_id AS placeId, name, company, industry, source, lead_score::text AS "Lead Score", status, website, email, phone, address FROM public.os_leads WHERE source_kind = 'google_maps_scraper' ORDER BY occurred_at DESC`,
        n.onError ? { onError: n.onError } : {},
      )
    }
    if (name === 'Append to Leads') {
      return pg(
        id,
        name,
        pos,
        `={{ "INSERT INTO public.os_leads (source_kind, occurred_at, name, company, industry, source, lead_score, status, place_id, website, email, phone, address) VALUES ('google_maps_scraper', now()::timestamptz, '" + String($json.name||'').replace(/'/g,"''") + "','" + String($json.company||'').replace(/'/g,"''") + "','" + String($json.industry||'').replace(/'/g,"''") + "','" + String($json.source||'').replace(/'/g,"''") + "'," + (Number($json.leadScore)||0) + ",'" + String($json.status||'').replace(/'/g,"''") + "','" + String($json.placeId||'').replace(/'/g,"''") + "','" + String($json.website||'').replace(/'/g,"''") + "','" + String($json.email||'').replace(/'/g,"''") + "','" + String($json.phone||'').replace(/'/g,"''") + "','" + String($json.address||'').replace(/'/g,"''") + "');" }}`,
        retry,
      )
    }
    if (name === 'Append to Contacts Tab') {
      return pg(
        id,
        name,
        pos,
        `={{ "INSERT INTO public.os_sheet_contacts (name, email, phone, company, industry, source, lead_score, hubspot_contact_id) VALUES ('" + String((($json.firstName||'') + ' ' + ($json.lastName||'')).trim() || String($json.company||'')).replace(/'/g,"''") + "','" + String($json.email||'').replace(/'/g,"''") + "','" + String($json.phone||'').replace(/'/g,"''") + "','" + String($json.company||'').replace(/'/g,"''") + "','" + String($json.industry||'').replace(/'/g,"''") + "','" + String($json.source||'').replace(/'/g,"''") + "','" + String($json.leadScore||'').replace(/'/g,"''") + "','" + String($json.contactId||'').replace(/'/g,"''") + "');" }}`,
        retry,
      )
    }
    if (name === 'Append to Companies Tab') {
      return pg(
        id,
        name,
        pos,
        `={{ "INSERT INTO public.os_sheet_companies (company_name, industry, phone, website, address, hubspot_company_id, company_owner, city, state_region, country_region, last_activity_at) VALUES ('" + String($('Gather CRM IDs').first().json.company||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.industry||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.phone||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.website||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.address||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.companyId||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.companyOwner||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.city||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.state||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.countryRegion||'').replace(/'/g,"''") + "',NULL);" }}`,
        retry,
      )
    }
    if (name === 'Append to Deals Tab') {
      return pg(
        id,
        name,
        pos,
        `={{ "INSERT INTO public.os_deals_sheet (hubspot_deal_id, deal_name, company, industry, tier, lead_score, hubspot_contact_id, hubspot_company_id, sheet_timestamp) VALUES ('" + String($('Gather CRM IDs').first().json.dealId||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.company||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.company||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.industry||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.tier||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.leadScore||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.contactId||'').replace(/'/g,"''") + "','" + String($('Gather CRM IDs').first().json.companyId||'').replace(/'/g,"''") + "', now());" }}`,
        retry,
      )
    }
  }

  // Pre-Call Diagnostic Brief — always one row so downstream IF still runs
  if (rel.includes('Pre-Call Diagnostic Brief') && name === '🔍 Check Form Submitted') {
    return pg(
      id,
      name,
      pos,
      `={{ "SELECT COALESCE((SELECT email FROM public.os_pre_call_intake WHERE lower(trim(email)) = lower(trim('" + String($('📋 Parse Booking Data').first().json.email||'').replace(/'/g,"''") + "')) ORDER BY submitted_at DESC LIMIT 1), '') AS email;" }}`,
      retry,
    )
  }

  // Default: leave unchanged but warn
  console.warn('UNMAPPED googleSheets:', rel, name, op)
  return n
}

function processFile(rel) {
  const fp = path.join(wfRoot, rel)
  if (!fs.existsSync(fp)) {
    console.warn('skip missing', rel)
    return
  }
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'))

  const apply = (nodes) => {
    if (!Array.isArray(nodes)) return
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      if (n.type !== 'n8n-nodes-base.googleSheets') continue
      const out = transformNode(n, rel)
      if (out === n) continue
      nodes[i] = out
    }
  }

  apply(data.nodes)
  if (data.activeVersion?.nodes) apply(data.activeVersion.nodes)

  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log('OK', rel)
}

const files = [
  path.join('08_command-center', 'SYS 08 — Google Chat Command Center.json'),
  path.join('07_reporting', 'SYS 07 — Internal Reporting Dashboard.json'),
  path.join('06_content', 'SYS 06 — LinkedIn Content Pipeline.json'),
  path.join('01_lead-generation', 'SYS 01 — Website Form Lead Intake.json'),
  path.join('01_lead-generation', 'SYS 01 — Lead Sourcing Machine.json'),
  path.join('05_client-success', 'SYS 05 — Client Health Monitoring.json'),
  path.join('03_sales', 'SYS 03 — Pre-Call Diagnostic Brief.json'),
]

for (const f of files) processFile(f)

console.log('Pass 1 done. Extend script for remaining workflows or run again after adding cases.')
