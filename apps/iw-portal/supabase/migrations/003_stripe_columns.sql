-- Stripe linkage for Checkout + webhooks
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'usd';

CREATE INDEX IF NOT EXISTS invoices_stripe_checkout_session_id_idx
  ON public.invoices (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;
