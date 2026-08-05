-- Portal-delivered PDFs: Storage path + optional link to documents row (preferred download path).

UPDATE storage.buckets SET file_size_limit = 26214400 WHERE id = 'client-uploads';

ALTER TABLE public.os_contracts_queue
  ADD COLUMN IF NOT EXISTS pdf_storage_path text,
  ADD COLUMN IF NOT EXISTS proposal_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS os_contracts_queue_proposal_document_id_idx
  ON public.os_contracts_queue (proposal_document_id)
  WHERE proposal_document_id IS NOT NULL;

COMMENT ON COLUMN public.os_contracts_queue.pdf_storage_path IS
  'Supabase Storage path in bucket client-uploads (project_id/...). Prefer proposal_document_id for downloads.';
COMMENT ON COLUMN public.os_contracts_queue.proposal_document_id IS
  'Registered documents row for portal download via /api/documents/download.';
