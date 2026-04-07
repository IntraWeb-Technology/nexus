-- Client uploads, signatures, milestone approvals, change orders, storage bucket

-- documents: signature audit fields
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS signed_by text;

-- milestone_approvals
CREATE TABLE public.milestone_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  approved_by_name text NOT NULL,
  approved_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX milestone_approvals_milestone_id_idx ON public.milestone_approvals(milestone_id);
CREATE INDEX milestone_approvals_project_id_idx ON public.milestone_approvals(project_id);

-- change_orders
CREATE TABLE public.change_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  staff_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT change_orders_status_check CHECK (status IN ('pending', 'reviewed', 'approved', 'declined'))
);

CREATE INDEX change_orders_project_id_idx ON public.change_orders(project_id);

-- RLS new tables
ALTER TABLE public.milestone_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY milestone_approvals_select_own ON public.milestone_approvals
  FOR SELECT USING (project_id IN (SELECT public.project_ids_for_user()));

CREATE POLICY milestone_approvals_insert_own ON public.milestone_approvals
  FOR INSERT WITH CHECK (project_id IN (SELECT public.project_ids_for_user()));

CREATE POLICY change_orders_select_own ON public.change_orders
  FOR SELECT USING (project_id IN (SELECT public.project_ids_for_user()));

CREATE POLICY change_orders_insert_own ON public.change_orders
  FOR INSERT WITH CHECK (project_id IN (SELECT public.project_ids_for_user()));

-- Portal clients: insert/update documents, activity, notifications (JWT path; service role bypasses RLS)
CREATE POLICY documents_insert_own ON public.documents
  FOR INSERT WITH CHECK (project_id IN (SELECT public.project_ids_for_user()));

CREATE POLICY documents_update_own ON public.documents
  FOR UPDATE USING (project_id IN (SELECT public.project_ids_for_user()));

CREATE POLICY activity_log_insert_own ON public.activity_log
  FOR INSERT WITH CHECK (project_id IN (SELECT public.project_ids_for_user()));

CREATE POLICY notifications_insert_own ON public.notifications
  FOR INSERT WITH CHECK (project_id IN (SELECT public.project_ids_for_user()));

-- Private storage bucket for client uploads (10 MB max in app logic; optional DB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('client-uploads', 'client-uploads', false, 10485760)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit;

DROP POLICY IF EXISTS client_uploads_select_own_project ON storage.objects;
DROP POLICY IF EXISTS client_uploads_insert_own_project ON storage.objects;

-- Path: {project_id}/{timestamp}-{filename} — first segment must be a project the user owns
CREATE POLICY client_uploads_select_own_project ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'client-uploads'
    AND split_part(name, '/', 1) IN (SELECT id::text FROM public.project_ids_for_user())
  );

CREATE POLICY client_uploads_insert_own_project ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'client-uploads'
    AND split_part(name, '/', 1) IN (SELECT id::text FROM public.project_ids_for_user())
  );
