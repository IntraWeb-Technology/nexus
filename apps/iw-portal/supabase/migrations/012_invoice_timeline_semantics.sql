-- Canonical billing semantics for milestone timeline + recurring maintenance.
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS billing_phase text
    CHECK (billing_phase IN ('deposit', 'build_qa', 'handoff', 'maintenance')),
  ADD COLUMN IF NOT EXISTS billing_kind text
    NOT NULL DEFAULT 'project_milestone'
    CHECK (billing_kind IN ('project_milestone', 'recurring_maintenance')),
  ADD COLUMN IF NOT EXISTS milestone_order int
    CHECK (milestone_order IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS external_source text
    CHECK (external_source IN ('hubspot', 'stripe', 'manual')),
  ADD COLUMN IF NOT EXISTS external_object_id text,
  ADD COLUMN IF NOT EXISTS service_period_start date,
  ADD COLUMN IF NOT EXISTS service_period_end date,
  ADD COLUMN IF NOT EXISTS maintenance_group_key text;

-- External system idempotency for mapped invoices.
CREATE UNIQUE INDEX IF NOT EXISTS invoices_external_source_object_uidx
  ON public.invoices (external_source, external_object_id)
  WHERE external_source IS NOT NULL AND external_object_id IS NOT NULL;

-- One-time milestone uniqueness per project phase.
CREATE UNIQUE INDEX IF NOT EXISTS invoices_project_phase_once_uidx
  ON public.invoices (project_id, billing_phase, billing_kind)
  WHERE billing_kind = 'project_milestone' AND billing_phase IS NOT NULL;

CREATE INDEX IF NOT EXISTS invoices_billing_kind_idx
  ON public.invoices (billing_kind);

CREATE INDEX IF NOT EXISTS invoices_billing_phase_order_idx
  ON public.invoices (project_id, milestone_order, created_at);
