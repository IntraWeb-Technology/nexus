-- Data subject requests (GDPR/CCPA deletion, opt-out, access) — service_role only.

CREATE TABLE IF NOT EXISTS public.data_subject_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('delete_personal_data', 'marketing_opt_out', 'access_copy')),
  status text NOT NULL DEFAULT 'pending_verification'
    CHECK (status IN (
      'pending_verification',
      'verified',
      'processing',
      'completed',
      'partial',
      'rejected',
      'manual_review'
    )),
  note text,
  verification_token_hash text,
  verified_at timestamptz,
  completed_at timestamptz,
  execution_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  retention_exceptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_ip inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS data_subject_requests_email_idx
  ON public.data_subject_requests (lower(email));

CREATE INDEX IF NOT EXISTS data_subject_requests_status_idx
  ON public.data_subject_requests (status, created_at DESC);

ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;

-- No policies for authenticated/anon => deny via API; service_role bypasses RLS.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_subject_requests TO service_role;
