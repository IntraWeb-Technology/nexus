-- Link portal invoice rows to HubSpot CRM invoices (optional dedupe when syncing)
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS hubspot_invoice_id text;

CREATE UNIQUE INDEX IF NOT EXISTS invoices_hubspot_invoice_id_uidx
  ON public.invoices (hubspot_invoice_id)
  WHERE hubspot_invoice_id IS NOT NULL;
