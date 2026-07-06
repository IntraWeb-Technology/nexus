-- os_sheet_companies had staff_select policy (010) but RLS was off in some environments
-- (e.g. table created via 009 without 008's ENABLE). Policies are ignored until RLS is on.
ALTER TABLE public.os_sheet_companies ENABLE ROW LEVEL SECURITY;
