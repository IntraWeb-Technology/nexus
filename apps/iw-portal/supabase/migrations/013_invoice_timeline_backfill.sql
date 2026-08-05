-- Backfill canonical billing semantics for legacy invoices.

-- Mark HubSpot-linked rows with external identifiers.
UPDATE public.invoices
SET
  external_source = COALESCE(external_source, 'hubspot'),
  external_object_id = COALESCE(external_object_id, hubspot_invoice_id)
WHERE hubspot_invoice_id IS NOT NULL;

-- Derive phase semantics from existing descriptions/skus when possible.
UPDATE public.invoices
SET
  billing_phase = CASE
    WHEN billing_phase IS NOT NULL THEN billing_phase
    WHEN lower(description) LIKE '%deposit%' OR lower(COALESCE(sku, '')) LIKE '%setup%' THEN 'deposit'
    WHEN (lower(description) LIKE '%build%' AND lower(description) LIKE '%qa%') THEN 'build_qa'
    WHEN lower(description) LIKE '%handoff%' OR lower(description) LIKE '%hand off%' OR lower(description) LIKE '%go-live%' THEN 'handoff'
    WHEN lower(description) LIKE '%maintenance%' OR lower(description) LIKE '%retainer%' OR lower(COALESCE(sku, '')) LIKE '%mrr%' THEN 'maintenance'
    ELSE NULL
  END
WHERE billing_phase IS NULL;

UPDATE public.invoices
SET
  billing_kind = CASE
    WHEN billing_phase = 'maintenance' THEN 'recurring_maintenance'
    ELSE COALESCE(billing_kind, 'project_milestone')
  END;

UPDATE public.invoices
SET
  milestone_order = CASE
    WHEN billing_phase = 'deposit' THEN 1
    WHEN billing_phase = 'build_qa' THEN 2
    WHEN billing_phase = 'handoff' THEN 3
    ELSE NULL
  END
WHERE milestone_order IS NULL;
