-- One-way HubSpot → Supabase: merged property snapshots from webhook payloads.
-- Writes go through merge_hubspot_crm_entity (service_role); staff may SELECT for ops.

CREATE TABLE IF NOT EXISTS public.hubspot_crm_entities (
  object_type text NOT NULL CHECK (object_type IN ('contact', 'deal', 'company')),
  hubspot_id text NOT NULL,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_event jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_subscription_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (object_type, hubspot_id)
);

CREATE INDEX IF NOT EXISTS hubspot_crm_entities_updated_idx
  ON public.hubspot_crm_entities (updated_at DESC);

CREATE OR REPLACE FUNCTION public.merge_hubspot_crm_entity(
  p_object_type text,
  p_hubspot_id text,
  p_properties_patch jsonb,
  p_last_event jsonb,
  p_subscription_type text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_object_type NOT IN ('contact', 'deal', 'company') THEN
    RAISE EXCEPTION 'invalid object_type';
  END IF;
  IF p_hubspot_id IS NULL OR length(trim(p_hubspot_id)) = 0 THEN
    RAISE EXCEPTION 'hubspot_id required';
  END IF;

  INSERT INTO public.hubspot_crm_entities (
    object_type,
    hubspot_id,
    properties,
    last_event,
    last_subscription_type
  )
  VALUES (
    p_object_type,
    trim(p_hubspot_id),
    COALESCE(p_properties_patch, '{}'::jsonb),
    COALESCE(p_last_event, '{}'::jsonb),
    p_subscription_type
  )
  ON CONFLICT (object_type, hubspot_id) DO UPDATE SET
    properties = public.hubspot_crm_entities.properties || EXCLUDED.properties,
    last_event = EXCLUDED.last_event,
    last_subscription_type = EXCLUDED.last_subscription_type,
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.merge_hubspot_crm_entity(text, text, jsonb, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.merge_hubspot_crm_entity(text, text, jsonb, jsonb, text) TO service_role;

ALTER TABLE public.hubspot_crm_entities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hubspot_crm_entities_select_staff ON public.hubspot_crm_entities;
CREATE POLICY hubspot_crm_entities_select_staff ON public.hubspot_crm_entities
  FOR SELECT USING (public.is_staff());

GRANT SELECT ON public.hubspot_crm_entities TO authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON public.hubspot_crm_entities TO service_role;
