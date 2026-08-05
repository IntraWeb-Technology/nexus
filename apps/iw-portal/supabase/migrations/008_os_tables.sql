-- IntraWeb OS operational data (replaces master Google Sheet tabs for n8n + portal).
-- Access: service_role / Postgres connection from n8n; portal server uses createServiceSupabase().
-- RLS enabled with no policies for authenticated/anon => deny via API; service role bypasses RLS.

-- Automations Log
CREATE TABLE public.os_automation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logged_at timestamptz NOT NULL DEFAULT now(),
  workflow_name text NOT NULL,
  contact_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  event_type text NOT NULL,
  status text NOT NULL DEFAULT 'success',
  notes text NOT NULL DEFAULT '',
  hubspot_deal_id text,
  hubspot_contact_id text
);

CREATE INDEX os_automation_log_logged_at_idx ON public.os_automation_log (logged_at DESC);
CREATE INDEX os_automation_log_event_type_idx ON public.os_automation_log (event_type);
CREATE INDEX os_automation_log_hubspot_deal_idx ON public.os_automation_log (hubspot_deal_id);

-- Deals tab (website intake upsert + lead sourcing append)
CREATE TABLE public.os_deals_sheet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hubspot_deal_id text UNIQUE,
  deal_name text,
  company text,
  industry text,
  tier text,
  lead_score text,
  hubspot_contact_id text,
  hubspot_company_id text,
  sheet_timestamp timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX os_deals_sheet_contact_idx ON public.os_deals_sheet (hubspot_contact_id);

-- Leads tab (maps scraper + SYS 07 reporting)
CREATE TABLE public.os_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_kind text NOT NULL DEFAULT 'google_maps_scraper',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  name text,
  company text,
  industry text,
  source text,
  lead_score numeric,
  status text,
  place_id text,
  website text,
  email text,
  phone text,
  address text,
  hubspot_contact_id text,
  hubspot_deal_id text
);

CREATE INDEX os_leads_place_id_idx ON public.os_leads (place_id) WHERE place_id IS NOT NULL AND place_id <> '';
CREATE INDEX os_leads_occurred_at_idx ON public.os_leads (occurred_at DESC);

-- Contacts / Companies tabs from lead sourcing
CREATE TABLE public.os_sheet_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  name text,
  email text,
  phone text,
  company text,
  industry text,
  source text,
  lead_score text,
  hubspot_contact_id text
);

CREATE TABLE public.os_sheet_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  company_name text,
  industry text,
  phone text,
  website text,
  address text,
  hubspot_company_id text
);

-- Contracts + Proposals queues (human approval in DB / portal)
CREATE TABLE public.os_contracts_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_type text NOT NULL CHECK (queue_type IN ('contract', 'proposal')),
  hubspot_deal_id text,
  queue_date date,
  client_name text,
  company text,
  industry text,
  deal_value text,
  tier text,
  contact_email text,
  pain_points text,
  drive_link text,
  status text NOT NULL DEFAULT 'Pending Review',
  proposal_status_detail text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hubspot_deal_id, queue_type)
);

CREATE INDEX os_contracts_queue_client_idx ON public.os_contracts_queue (client_name);
CREATE INDEX os_contracts_queue_status_idx ON public.os_contracts_queue (status);
CREATE INDEX os_contracts_queue_type_idx ON public.os_contracts_queue (queue_type);

-- Client success roster (ex-sheet Clients tab)
CREATE TABLE public.os_client_success_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hubspot_deal_id text UNIQUE,
  client_name text NOT NULL,
  tier text,
  mrr text,
  start_date text,
  last_activity text,
  health_score text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX os_client_success_clients_name_idx ON public.os_client_success_clients (client_name);

-- LinkedIn pipeline
CREATE TABLE public.os_linkedin_pipeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hashtags text,
  date_generated timestamptz,
  news_hook text,
  full_post text,
  suggested_link text,
  status text,
  scheduled_time text,
  post_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Pipeline snapshots (deal stage reporting)
CREATE TABLE public.os_pipeline_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  captured_at timestamptz NOT NULL DEFAULT now(),
  deal_name text,
  stage text,
  value numeric,
  close_date text,
  days_in_stage int,
  owner text
);

CREATE INDEX os_pipeline_snapshots_captured_idx ON public.os_pipeline_snapshots (captured_at DESC);

-- Summary metrics (replaces Summary tab row updates)
CREATE TABLE public.os_summary_metrics (
  metric text PRIMARY KEY,
  value_text text,
  last_updated timestamptz NOT NULL DEFAULT now()
);

-- Revenue tab (SYS 08 command center)
CREATE TABLE public.os_revenue_monthly (
  month_key text PRIMARY KEY,
  invoiced numeric,
  collected numeric,
  outstanding numeric,
  overdue numeric,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Pre-call intake (replaces external intake sheet read)
CREATE TABLE public.os_pre_call_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX os_pre_call_intake_email_lower_idx ON public.os_pre_call_intake (lower(email));
CREATE INDEX os_pre_call_intake_submitted_idx ON public.os_pre_call_intake (submitted_at DESC);

-- RLS: block anon/authenticated JWT; service_role still bypasses
ALTER TABLE public.os_automation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_deals_sheet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_sheet_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_sheet_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_contracts_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_client_success_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_linkedin_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_pipeline_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_summary_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_revenue_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_pre_call_intake ENABLE ROW LEVEL SECURITY;

-- Explicit grants for PostgREST roles (RLS still blocks without policies).
-- Direct Postgres (n8n) uses the database owner role and bypasses RLS.
DO $$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY[
    'os_automation_log','os_deals_sheet','os_leads','os_sheet_contacts','os_sheet_companies',
    'os_contracts_queue','os_client_success_clients','os_linkedin_pipeline','os_pipeline_snapshots',
    'os_summary_metrics','os_revenue_monthly','os_pre_call_intake'
  ]
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon, authenticated, service_role', r);
  END LOOP;
END $$;
