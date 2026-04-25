-- IntraWeb OS — staff admin console, production support tables, and RLS.
-- Clerk remains the identity provider. Supabase stores authorization state.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.staff_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE,
  email text NOT NULL,
  display_name text,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'ops', 'support', 'viewer')),
  is_active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_users_clerk_user_id_idx ON public.staff_users (clerk_user_id);
CREATE INDEX IF NOT EXISTS staff_users_active_idx ON public.staff_users (is_active) WHERE is_active;

CREATE TABLE IF NOT EXISTS public.staff_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_staff_id uuid REFERENCES public.staff_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  metadata jsonb NOT NULL DEFAULT '{}',
  ip inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_audit_log_actor_idx ON public.staff_audit_log (actor_staff_id);
CREATE INDEX IF NOT EXISTS staff_audit_log_resource_idx ON public.staff_audit_log (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS staff_audit_log_created_idx ON public.staff_audit_log (created_at DESC);

CREATE TABLE IF NOT EXISTS public.client_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  clerk_user_id text NOT NULL,
  email text NOT NULL,
  display_name text,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'billing', 'approver', 'viewer')),
  is_active boolean NOT NULL DEFAULT true,
  invited_by_staff_id uuid REFERENCES public.staff_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, clerk_user_id)
);

CREATE INDEX IF NOT EXISTS client_members_client_idx ON public.client_members (client_id);
CREATE INDEX IF NOT EXISTS client_members_clerk_idx ON public.client_members (clerk_user_id);

CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  clerk_user_id text NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'billing', 'approver', 'viewer')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, clerk_user_id)
);

CREATE INDEX IF NOT EXISTS project_members_project_idx ON public.project_members (project_id);
CREATE INDEX IF NOT EXISTS project_members_clerk_idx ON public.project_members (clerk_user_id);

CREATE TABLE IF NOT EXISTS public.staff_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'ops', 'support', 'viewer')),
  token_hash text NOT NULL UNIQUE,
  invited_by_staff_id uuid REFERENCES public.staff_users(id) ON DELETE SET NULL,
  clerk_user_id text,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_invites_email_idx ON public.staff_invites (lower(email));

CREATE TABLE IF NOT EXISTS public.client_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'billing', 'approver', 'viewer')),
  token_hash text NOT NULL UNIQUE,
  invited_by_staff_id uuid REFERENCES public.staff_users(id) ON DELETE SET NULL,
  invited_by_client_member_id uuid REFERENCES public.client_members(id) ON DELETE SET NULL,
  clerk_user_id text,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_invites_client_idx ON public.client_invites (client_id);
CREATE INDEX IF NOT EXISTS client_invites_email_idx ON public.client_invites (lower(email));

CREATE TABLE IF NOT EXISTS public.client_internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_by_staff_id uuid REFERENCES public.staff_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_internal_notes_client_idx ON public.client_internal_notes (client_id);

CREATE TABLE IF NOT EXISTS public.project_internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_by_staff_id uuid REFERENCES public.staff_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_internal_notes_project_idx ON public.project_internal_notes (project_id);

CREATE TABLE IF NOT EXISTS public.document_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  actor_clerk_user_id text,
  actor_staff_id uuid REFERENCES public.staff_users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('view', 'download', 'sign', 'upload')),
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS document_access_log_document_idx ON public.document_access_log (document_id);
CREATE INDEX IF NOT EXISTS document_access_log_project_idx ON public.document_access_log (project_id);

CREATE TABLE IF NOT EXISTS public.integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider IN ('clerk', 'hubspot', 'stripe', 'n8n', 'system')),
  external_event_id text,
  event_type text NOT NULL,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed', 'replayed', 'ignored')),
  payload jsonb NOT NULL DEFAULT '{}',
  payload_hash text,
  attempts int NOT NULL DEFAULT 0,
  next_retry_at timestamptz,
  last_error text,
  processed_at timestamptz,
  replayed_at timestamptz,
  replayed_by_staff_id uuid REFERENCES public.staff_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS integration_events_provider_status_idx ON public.integration_events (provider, status);
CREATE INDEX IF NOT EXISTS integration_events_created_idx ON public.integration_events (created_at DESC);

CREATE TABLE IF NOT EXISTS public.data_health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_key text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  resource_type text NOT NULL,
  resource_id text,
  message text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS data_health_checks_open_idx ON public.data_health_checks (severity, created_at DESC) WHERE resolved_at IS NULL;

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment text NOT NULL DEFAULT 'production',
  flag_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_by_staff_id uuid REFERENCES public.staff_users(id) ON DELETE SET NULL,
  updated_by_staff_id uuid REFERENCES public.staff_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (environment, flag_key)
);

-- Staff helpers. SECURITY DEFINER avoids recursive RLS checks on staff tables.
CREATE OR REPLACE FUNCTION public.staff_id_for_user()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.staff_users
  WHERE clerk_user_id = public.current_clerk_user_id()
    AND is_active
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.staff_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.staff_users
  WHERE clerk_user_id = public.current_clerk_user_id()
    AND is_active
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.staff_id_for_user() IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.staff_role() = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.can_staff_mutate()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.staff_role() IN ('admin', 'ops', 'support');
$$;

-- Expand existing client helper functions so invited client members work with existing policies.
CREATE OR REPLACE FUNCTION public.client_ids_for_user()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.clients WHERE clerk_user_id = public.current_clerk_user_id()
  UNION
  SELECT cm.client_id
  FROM public.client_members cm
  WHERE cm.clerk_user_id = public.current_clerk_user_id()
    AND cm.is_active;
$$;

CREATE OR REPLACE FUNCTION public.project_ids_for_user()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id
  FROM public.projects p
  WHERE p.client_id IN (SELECT public.client_ids_for_user())
  UNION
  SELECT pm.project_id
  FROM public.project_members pm
  WHERE pm.clerk_user_id = public.current_clerk_user_id()
    AND pm.is_active;
$$;

-- Enable RLS on new tables.
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- New table policies.
DROP POLICY IF EXISTS staff_users_select_self_or_admin ON public.staff_users;
CREATE POLICY staff_users_select_self_or_admin ON public.staff_users
  FOR SELECT USING (public.is_staff() OR clerk_user_id = public.current_clerk_user_id());

DROP POLICY IF EXISTS staff_users_update_admin ON public.staff_users;
CREATE POLICY staff_users_update_admin ON public.staff_users
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS staff_users_insert_admin ON public.staff_users;
CREATE POLICY staff_users_insert_admin ON public.staff_users
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS staff_audit_log_select_staff ON public.staff_audit_log;
CREATE POLICY staff_audit_log_select_staff ON public.staff_audit_log
  FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS staff_audit_log_insert_staff ON public.staff_audit_log;
CREATE POLICY staff_audit_log_insert_staff ON public.staff_audit_log
  FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS client_members_select_staff_or_same_client ON public.client_members;
CREATE POLICY client_members_select_staff_or_same_client ON public.client_members
  FOR SELECT USING (public.is_staff() OR client_id IN (SELECT public.client_ids_for_user()));

DROP POLICY IF EXISTS client_members_mutate_staff ON public.client_members;
CREATE POLICY client_members_mutate_staff ON public.client_members
  FOR ALL USING (public.can_staff_mutate()) WITH CHECK (public.can_staff_mutate());

DROP POLICY IF EXISTS project_members_select_staff_or_project ON public.project_members;
CREATE POLICY project_members_select_staff_or_project ON public.project_members
  FOR SELECT USING (public.is_staff() OR project_id IN (SELECT public.project_ids_for_user()));

DROP POLICY IF EXISTS project_members_mutate_staff ON public.project_members;
CREATE POLICY project_members_mutate_staff ON public.project_members
  FOR ALL USING (public.can_staff_mutate()) WITH CHECK (public.can_staff_mutate());

DROP POLICY IF EXISTS staff_invites_admin_all ON public.staff_invites;
CREATE POLICY staff_invites_admin_all ON public.staff_invites
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS client_invites_staff_all ON public.client_invites;
CREATE POLICY client_invites_staff_all ON public.client_invites
  FOR ALL USING (public.can_staff_mutate()) WITH CHECK (public.can_staff_mutate());

DROP POLICY IF EXISTS client_internal_notes_staff_all ON public.client_internal_notes;
CREATE POLICY client_internal_notes_staff_all ON public.client_internal_notes
  FOR ALL USING (public.is_staff()) WITH CHECK (public.can_staff_mutate());

DROP POLICY IF EXISTS project_internal_notes_staff_all ON public.project_internal_notes;
CREATE POLICY project_internal_notes_staff_all ON public.project_internal_notes
  FOR ALL USING (public.is_staff()) WITH CHECK (public.can_staff_mutate());

DROP POLICY IF EXISTS document_access_log_select_staff_or_project ON public.document_access_log;
CREATE POLICY document_access_log_select_staff_or_project ON public.document_access_log
  FOR SELECT USING (public.is_staff() OR project_id IN (SELECT public.project_ids_for_user()));

DROP POLICY IF EXISTS document_access_log_insert_allowed ON public.document_access_log;
CREATE POLICY document_access_log_insert_allowed ON public.document_access_log
  FOR INSERT WITH CHECK (public.is_staff() OR project_id IN (SELECT public.project_ids_for_user()));

DROP POLICY IF EXISTS integration_events_select_staff ON public.integration_events;
CREATE POLICY integration_events_select_staff ON public.integration_events
  FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS integration_events_mutate_staff ON public.integration_events;
CREATE POLICY integration_events_mutate_staff ON public.integration_events
  FOR ALL USING (public.can_staff_mutate()) WITH CHECK (public.can_staff_mutate());

DROP POLICY IF EXISTS data_health_checks_select_staff ON public.data_health_checks;
CREATE POLICY data_health_checks_select_staff ON public.data_health_checks
  FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS data_health_checks_mutate_staff ON public.data_health_checks;
CREATE POLICY data_health_checks_mutate_staff ON public.data_health_checks
  FOR ALL USING (public.can_staff_mutate()) WITH CHECK (public.can_staff_mutate());

DROP POLICY IF EXISTS feature_flags_select_staff ON public.feature_flags;
CREATE POLICY feature_flags_select_staff ON public.feature_flags
  FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS feature_flags_mutate_admin ON public.feature_flags;
CREATE POLICY feature_flags_mutate_admin ON public.feature_flags
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Staff policies on existing portal tables. Existing client policies remain in place.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clients','projects','milestones','messages','documents','invoices','activity_log',
    'notifications','notification_preferences','milestone_approvals','change_orders'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_staff_select', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (public.is_staff())', t || '_staff_select', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_staff_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (public.can_staff_mutate())', t || '_staff_insert', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_staff_update', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE USING (public.can_staff_mutate()) WITH CHECK (public.can_staff_mutate())', t || '_staff_update', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_staff_delete', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE USING (public.is_admin())', t || '_staff_delete', t);
  END LOOP;
END $$;

-- Staff read access for operational OS tables.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'os_automation_log','os_deals_sheet','os_leads','os_sheet_contacts','os_sheet_companies',
    'os_contracts_queue','os_client_success_clients','os_linkedin_pipeline','os_pipeline_snapshots',
    'os_summary_metrics','os_revenue_monthly','os_pre_call_intake'
  ]
  LOOP
    IF to_regclass(format('public.%I', t)) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_staff_select', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (public.is_staff())', t || '_staff_select', t);
    END IF;
  END LOOP;
END $$;

-- Staff access to private uploaded documents.
DROP POLICY IF EXISTS client_uploads_select_staff ON storage.objects;
CREATE POLICY client_uploads_select_staff ON storage.objects
  FOR SELECT USING (bucket_id = 'client-uploads' AND public.is_staff());

DROP POLICY IF EXISTS client_uploads_insert_staff ON storage.objects;
CREATE POLICY client_uploads_insert_staff ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'client-uploads' AND public.can_staff_mutate());

DROP POLICY IF EXISTS client_uploads_delete_admin ON storage.objects;
CREATE POLICY client_uploads_delete_admin ON storage.objects
  FOR DELETE USING (bucket_id = 'client-uploads' AND public.is_admin());

-- Explicit grants for PostgREST roles; RLS still decides row-level access.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'staff_users','staff_audit_log','client_members','project_members','staff_invites',
    'client_invites','client_internal_notes','project_internal_notes','document_access_log',
    'integration_events','data_health_checks','feature_flags'
  ]
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated, service_role', t);
  END LOOP;
END $$;
