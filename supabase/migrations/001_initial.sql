-- IntraWeb OS Client Portal — initial schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- clients
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  hubspot_contact_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  plan text NOT NULL CHECK (plan IN ('starter','growth','custom')),
  status text NOT NULL CHECK (status IN ('onboarding','build','qa','launch','retainer','paused')),
  progress_pct int NOT NULL DEFAULT 0,
  start_date date,
  estimated_launch date,
  hubspot_deal_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX projects_client_id_idx ON public.projects(client_id);
CREATE INDEX projects_hubspot_deal_id_idx ON public.projects(hubspot_deal_id);

-- milestones
CREATE TABLE public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('done','active','pending')),
  phase text NOT NULL,
  completed_at timestamptz,
  estimated_at timestamptz,
  sort_order int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX milestones_project_id_idx ON public.milestones(project_id);

-- messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('staff','client')),
  sender_name text NOT NULL,
  body text NOT NULL,
  read bool NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_project_id_idx ON public.messages(project_id);

-- documents
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_url text NOT NULL,
  file_size_kb int,
  requires_signature bool NOT NULL DEFAULT false,
  signed bool NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX documents_project_id_idx ON public.documents(project_id);

-- invoices
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  description text NOT NULL,
  amount_cents int NOT NULL,
  status text NOT NULL CHECK (status IN ('paid','pending','overdue','void')),
  sku text,
  due_date date,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invoices_project_id_idx ON public.invoices(project_id);

-- activity_log
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type text NOT NULL,
  label text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX activity_log_project_id_idx ON public.activity_log(project_id);
CREATE INDEX activity_log_created_at_idx ON public.activity_log(created_at DESC);

-- notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  read bool NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_project_id_idx ON public.notifications(project_id);

-- notification_preferences
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  email_notifications bool NOT NULL DEFAULT true,
  message_alerts bool NOT NULL DEFAULT true,
  invoice_reminders bool NOT NULL DEFAULT true,
  document_uploads bool NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Realtime: replica identity for filtered subscriptions
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Helper: current Clerk user id from JWT (configure Clerk JWT template "supabase" in Supabase)
CREATE OR REPLACE FUNCTION public.current_clerk_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((auth.jwt()->>'sub'), '');
$$;

CREATE OR REPLACE FUNCTION public.client_ids_for_user()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.clients WHERE clerk_user_id = public.current_clerk_user_id();
$$;

CREATE OR REPLACE FUNCTION public.project_ids_for_user()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id FROM public.projects p
  JOIN public.clients c ON c.id = p.client_id
  WHERE c.clerk_user_id = public.current_clerk_user_id();
$$;

-- clients
CREATE POLICY clients_select_own ON public.clients
  FOR SELECT USING (clerk_user_id = public.current_clerk_user_id());
CREATE POLICY clients_update_own ON public.clients
  FOR UPDATE USING (clerk_user_id = public.current_clerk_user_id());

-- projects
CREATE POLICY projects_select_own ON public.projects
  FOR SELECT USING (client_id IN (SELECT public.client_ids_for_user()));
CREATE POLICY projects_update_own ON public.projects
  FOR UPDATE USING (client_id IN (SELECT public.client_ids_for_user()));

-- milestones
CREATE POLICY milestones_select_own ON public.milestones
  FOR SELECT USING (project_id IN (SELECT public.project_ids_for_user()));
CREATE POLICY milestones_update_own ON public.milestones
  FOR UPDATE USING (project_id IN (SELECT public.project_ids_for_user()));

-- messages
CREATE POLICY messages_select_own ON public.messages
  FOR SELECT USING (project_id IN (SELECT public.project_ids_for_user()));
CREATE POLICY messages_insert_own ON public.messages
  FOR INSERT WITH CHECK (project_id IN (SELECT public.project_ids_for_user()));
CREATE POLICY messages_update_own ON public.messages
  FOR UPDATE USING (project_id IN (SELECT public.project_ids_for_user()));

-- documents
CREATE POLICY documents_select_own ON public.documents
  FOR SELECT USING (project_id IN (SELECT public.project_ids_for_user()));

-- invoices
CREATE POLICY invoices_select_own ON public.invoices
  FOR SELECT USING (project_id IN (SELECT public.project_ids_for_user()));

-- activity_log
CREATE POLICY activity_log_select_own ON public.activity_log
  FOR SELECT USING (project_id IN (SELECT public.project_ids_for_user()));

-- notifications
CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT USING (project_id IN (SELECT public.project_ids_for_user()));
CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE USING (project_id IN (SELECT public.project_ids_for_user()));

-- notification_preferences
CREATE POLICY notification_preferences_select_own ON public.notification_preferences
  FOR SELECT USING (client_id IN (SELECT public.client_ids_for_user()));
CREATE POLICY notification_preferences_update_own ON public.notification_preferences
  FOR UPDATE USING (client_id IN (SELECT public.client_ids_for_user()));
CREATE POLICY notification_preferences_insert_own ON public.notification_preferences
  FOR INSERT WITH CHECK (client_id IN (SELECT public.client_ids_for_user()));
