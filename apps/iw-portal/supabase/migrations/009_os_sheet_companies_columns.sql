-- Align os_sheet_companies with HubSpot company list columns (owner, geo, activity).
-- Some linked environments have 008 marked as applied but are missing this table;
-- keep this migration defensive so later admin/RLS migrations can proceed.
CREATE TABLE IF NOT EXISTS public.os_sheet_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  company_name text,
  industry text,
  phone text,
  website text,
  address text,
  hubspot_company_id text
);

CREATE INDEX IF NOT EXISTS os_sheet_companies_company_name_idx ON public.os_sheet_companies (company_name);

ALTER TABLE public.os_sheet_companies
  ADD COLUMN IF NOT EXISTS company_owner text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS state_region text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS country_region text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;
