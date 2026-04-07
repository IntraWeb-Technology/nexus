-- Contractual change orders: JSON payload, CO number, PDF path, HubSpot sync metadata, storage bucket

ALTER TABLE public.change_orders
  ADD COLUMN IF NOT EXISTS co_number text,
  ADD COLUMN IF NOT EXISTS payload jsonb,
  ADD COLUMN IF NOT EXISTS pdf_storage_path text,
  ADD COLUMN IF NOT EXISTS hubspot_submission_id text,
  ADD COLUMN IF NOT EXISTS hubspot_sync_status text,
  ADD COLUMN IF NOT EXISTS hubspot_sync_error text;

UPDATE public.change_orders
SET payload = jsonb_build_object(
  'legacy', true,
  'title', title,
  'description', description
)
WHERE payload IS NULL;

ALTER TABLE public.change_orders
  ALTER COLUMN payload SET DEFAULT '{}'::jsonb;

UPDATE public.change_orders SET payload = '{}'::jsonb WHERE payload IS NULL;

ALTER TABLE public.change_orders
  ALTER COLUMN payload SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS change_orders_project_co_number_uidx
  ON public.change_orders (project_id, co_number)
  WHERE co_number IS NOT NULL;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('change-order-packets', 'change-order-packets', false, 5242880)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit;

DROP POLICY IF EXISTS change_order_packets_select_own_project ON storage.objects;

-- Clients read PDFs for their projects: path {project_id}/{...}
CREATE POLICY change_order_packets_select_own_project ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'change-order-packets'
    AND split_part(name, '/', 1) IN (SELECT id::text FROM public.project_ids_for_user())
  );

-- Only service role bypasses RLS for INSERT; anon/authenticated typically cannot insert this bucket.
-- If you need JWT-based upload later, add an INSERT policy mirroring client-uploads.
