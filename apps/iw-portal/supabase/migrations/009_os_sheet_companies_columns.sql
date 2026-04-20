-- Align os_sheet_companies with HubSpot company list columns (owner, geo, activity).
ALTER TABLE public.os_sheet_companies
  ADD COLUMN IF NOT EXISTS company_owner text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS state_region text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS country_region text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;
