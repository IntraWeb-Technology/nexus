-- Canonical Stripe subscription state (Supabase is source of truth for portal reads).
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text,
  status text NOT NULL CHECK (
    status IN (
      'active',
      'trialing',
      'past_due',
      'canceled',
      'unpaid',
      'incomplete',
      'incomplete_expired'
    )
  ),
  price_id text,
  product_id text,
  currency text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamptz,
  latest_stripe_invoice_id text,
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_project_id_idx
  ON public.subscriptions (project_id);
CREATE INDEX IF NOT EXISTS subscriptions_client_id_idx
  ON public.subscriptions (client_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx
  ON public.subscriptions (status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscriptions_select_own ON public.subscriptions;
CREATE POLICY subscriptions_select_own ON public.subscriptions
  FOR SELECT USING (project_id IN (SELECT public.project_ids_for_user()));
