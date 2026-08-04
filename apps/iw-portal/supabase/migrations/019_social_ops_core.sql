-- IW Social Operations — core domain tables, RLS, and atomic RPC functions.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.canonical_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  editorial_category text NOT NULL,
  topic text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  body_long text NOT NULL DEFAULT '',
  body_short text NOT NULL DEFAULT '',
  primary_url text,
  quality_score numeric(5, 2),
  novelty_score numeric(5, 2),
  source_system text NOT NULL DEFAULT 'n8n'
    CHECK (source_system IN ('n8n')),
  source_workflow_id text NOT NULL,
  source_execution_id text NOT NULL,
  correlation_id text,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT canonical_content_idempotency_key_unique UNIQUE (idempotency_key)
);

CREATE INDEX IF NOT EXISTS canonical_content_source_execution_idx
  ON public.canonical_content (source_execution_id);

CREATE INDEX IF NOT EXISTS canonical_content_created_idx
  ON public.canonical_content (created_at DESC);

CREATE TABLE IF NOT EXISTS public.platform_publication (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_content_id uuid NOT NULL REFERENCES public.canonical_content(id) ON DELETE CASCADE,
  platform text NOT NULL,
  publisher text NOT NULL DEFAULT 'postiz'
    CHECK (publisher IN ('postiz')),
  postiz_batch_id text,
  postiz_post_id text,
  postiz_integration_id text,
  external_publication_id text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'scheduled', 'published', 'failed', 'skipped')),
  payload_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  publisher_response_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS platform_publication_canonical_idx
  ON public.platform_publication (canonical_content_id);

CREATE INDEX IF NOT EXISTS platform_publication_postiz_post_idx
  ON public.platform_publication (postiz_post_id)
  WHERE postiz_post_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.review_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_content_id uuid NOT NULL REFERENCES public.canonical_content(id) ON DELETE CASCADE,
  review_scope text NOT NULL
    CHECK (review_scope IN ('publication_group', 'individual_publication', 'canonical_content')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rewrite_requested', 'skipped', 'failed')),
  risk_level text NOT NULL DEFAULT 'medium'
    CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS review_item_status_created_idx
  ON public.review_item (status, created_at DESC);

CREATE INDEX IF NOT EXISTS review_item_canonical_idx
  ON public.review_item (canonical_content_id);

CREATE TABLE IF NOT EXISTS public.review_action (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_item_id uuid NOT NULL REFERENCES public.review_item(id) ON DELETE CASCADE,
  action text NOT NULL
    CHECK (action IN ('approve', 'request_rewrite', 'skip')),
  note text,
  actor_staff_id uuid REFERENCES public.staff_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS review_action_review_item_idx
  ON public.review_action (review_item_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.outbox_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL
    CHECK (event_type IN ('social.review.created', 'social.review.completed', 'social.workflow.failed')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'published', 'failed')),
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS outbox_event_dispatch_idx
  ON public.outbox_event (status, available_at)
  WHERE status = 'pending';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.canonical_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_publication ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_action ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_event ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS canonical_content_staff_select ON public.canonical_content;
CREATE POLICY canonical_content_staff_select ON public.canonical_content
  FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS platform_publication_staff_select ON public.platform_publication;
CREATE POLICY platform_publication_staff_select ON public.platform_publication
  FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS review_item_staff_select ON public.review_item;
CREATE POLICY review_item_staff_select ON public.review_item
  FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS review_action_staff_select ON public.review_action;
CREATE POLICY review_action_staff_select ON public.review_action
  FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS outbox_event_staff_select ON public.outbox_event;
CREATE POLICY outbox_event_staff_select ON public.outbox_event
  FOR SELECT USING (public.is_staff());

GRANT SELECT ON public.canonical_content TO authenticated;
GRANT SELECT ON public.platform_publication TO authenticated;
GRANT SELECT ON public.review_item TO authenticated;
GRANT SELECT ON public.review_action TO authenticated;
GRANT SELECT ON public.outbox_event TO authenticated;

GRANT ALL ON public.canonical_content TO service_role;
GRANT ALL ON public.platform_publication TO service_role;
GRANT ALL ON public.review_item TO service_role;
GRANT ALL ON public.review_action TO service_role;
GRANT ALL ON public.outbox_event TO service_role;

-- ---------------------------------------------------------------------------
-- Ingest RPC (atomic, idempotent)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ingest_editorial_draft(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_idempotency_key text;
  v_existing canonical_content%ROWTYPE;
  v_canonical_id uuid;
  v_review_id uuid;
  v_outbox_id uuid;
  v_publication_ids uuid[] := '{}';
  v_pub jsonb;
  v_pub_id uuid;
  v_platforms text[] := '{}';
  v_review_url text;
BEGIN
  v_idempotency_key := nullif(trim(p_payload->>'idempotency_key'), '');
  IF v_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'missing idempotency_key';
  END IF;

  SELECT * INTO v_existing
  FROM public.canonical_content
  WHERE idempotency_key = v_idempotency_key;

  IF FOUND THEN
    SELECT array_agg(id ORDER BY created_at)
    INTO v_publication_ids
    FROM public.platform_publication
    WHERE canonical_content_id = v_existing.id;

    SELECT id INTO v_review_id
    FROM public.review_item
    WHERE canonical_content_id = v_existing.id
    ORDER BY created_at
    LIMIT 1;

    SELECT id INTO v_outbox_id
    FROM public.outbox_event
    WHERE event_type = 'social.review.created'
      AND payload->>'review_item_id' = v_review_id::text
    ORDER BY created_at
    LIMIT 1;

    RETURN jsonb_build_object(
      'canonical_content_id', v_existing.id,
      'platform_publication_ids', COALESCE(to_jsonb(v_publication_ids), '[]'::jsonb),
      'review_item_id', v_review_id,
      'outbox_event_id', v_outbox_id,
      'idempotent_replay', true
    );
  END IF;

  IF nullif(trim(p_payload #>> '{workflow,workflow_id}'), '') IS NULL THEN
    RAISE EXCEPTION 'missing workflow.workflow_id';
  END IF;
  IF nullif(trim(p_payload #>> '{workflow,execution_id}'), '') IS NULL THEN
    RAISE EXCEPTION 'missing workflow.execution_id';
  END IF;
  IF jsonb_array_length(COALESCE(p_payload->'publications', '[]'::jsonb)) = 0 THEN
    RAISE EXCEPTION 'publications must not be empty';
  END IF;

  INSERT INTO public.canonical_content (
    editorial_category,
    topic,
    headline,
    body_long,
    body_short,
    primary_url,
    quality_score,
    novelty_score,
    source_system,
    source_workflow_id,
    source_execution_id,
    correlation_id,
    idempotency_key
  ) VALUES (
    COALESCE(nullif(trim(p_payload #>> '{canonical,editorial_category}'), ''), 'unknown'),
    COALESCE(p_payload #>> '{canonical,topic}', ''),
    COALESCE(p_payload #>> '{canonical,headline}', ''),
    COALESCE(p_payload #>> '{canonical,body_long}', ''),
    COALESCE(p_payload #>> '{canonical,body_short}', ''),
    nullif(trim(p_payload #>> '{canonical,primary_url}'), ''),
    (p_payload #>> '{canonical,quality_score}')::numeric,
    (p_payload #>> '{canonical,novelty_score}')::numeric,
    'n8n',
    p_payload #>> '{workflow,workflow_id}',
    p_payload #>> '{workflow,execution_id}',
    nullif(trim(p_payload #>> '{workflow,execution_id}'), ''),
    v_idempotency_key
  )
  RETURNING id INTO v_canonical_id;

  FOR v_pub IN SELECT * FROM jsonb_array_elements(p_payload->'publications')
  LOOP
    INSERT INTO public.platform_publication (
      canonical_content_id,
      platform,
      publisher,
      postiz_batch_id,
      postiz_post_id,
      postiz_integration_id,
      status,
      payload_snapshot,
      publisher_response_snapshot
    ) VALUES (
      v_canonical_id,
      COALESCE(nullif(trim(v_pub->>'platform'), ''), 'unknown'),
      COALESCE(nullif(trim(v_pub->>'publisher'), ''), 'postiz'),
      nullif(trim(v_pub->>'postiz_batch_id'), ''),
      nullif(trim(v_pub->>'postiz_post_id'), ''),
      nullif(trim(v_pub->>'postiz_integration_id'), ''),
      'draft',
      COALESCE(v_pub->'payload_snapshot', '{}'::jsonb),
      COALESCE(v_pub->'publisher_response_snapshot', '{}'::jsonb)
    )
    RETURNING id INTO v_pub_id;

    v_publication_ids := array_append(v_publication_ids, v_pub_id);
    v_platforms := array_append(v_platforms, COALESCE(nullif(trim(v_pub->>'platform'), ''), 'unknown'));
  END LOOP;

  INSERT INTO public.review_item (
    canonical_content_id,
    review_scope,
    status,
    risk_level
  ) VALUES (
    v_canonical_id,
    COALESCE(nullif(trim(p_payload #>> '{review,review_scope}'), ''), 'publication_group'),
    'pending',
    COALESCE(nullif(trim(p_payload #>> '{review,risk_level}'), ''), 'medium')
  )
  RETURNING id INTO v_review_id;

  v_review_url := COALESCE(
    nullif(trim(p_payload->>'review_url'), ''),
    '/admin/social-ops'
  );

  INSERT INTO public.outbox_event (event_type, payload, status)
  VALUES (
    'social.review.created',
    jsonb_build_object(
      'review_item_id', v_review_id,
      'canonical_content_id', v_canonical_id,
      'editorial_category', COALESCE(p_payload #>> '{canonical,editorial_category}', 'unknown'),
      'headline', COALESCE(p_payload #>> '{canonical,headline}', ''),
      'topic', COALESCE(p_payload #>> '{canonical,topic}', ''),
      'platforms', to_jsonb(v_platforms),
      'risk_level', COALESCE(p_payload #>> '{review,risk_level}', 'medium'),
      'review_url', v_review_url
    ),
    'pending'
  )
  RETURNING id INTO v_outbox_id;

  RETURN jsonb_build_object(
    'canonical_content_id', v_canonical_id,
    'platform_publication_ids', to_jsonb(v_publication_ids),
    'review_item_id', v_review_id,
    'outbox_event_id', v_outbox_id,
    'idempotent_replay', false
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Review action RPC (atomic status projection + immutable action + outbox)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.apply_review_action(
  p_review_item_id uuid,
  p_action text,
  p_note text,
  p_actor_staff_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item review_item%ROWTYPE;
  v_new_status text;
  v_action_id uuid;
  v_outbox_id uuid;
BEGIN
  IF p_action NOT IN ('approve', 'request_rewrite', 'skip') THEN
    RAISE EXCEPTION 'invalid action: %', p_action;
  END IF;

  SELECT * INTO v_item
  FROM public.review_item
  WHERE id = p_review_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'review_item not found';
  END IF;

  IF v_item.status <> 'pending' THEN
    RAISE EXCEPTION 'review_item is not pending (current: %)', v_item.status;
  END IF;

  v_new_status := CASE p_action
    WHEN 'approve' THEN 'approved'
    WHEN 'request_rewrite' THEN 'rewrite_requested'
    WHEN 'skip' THEN 'skipped'
  END;

  INSERT INTO public.review_action (review_item_id, action, note, actor_staff_id)
  VALUES (p_review_item_id, p_action, nullif(trim(p_note), ''), p_actor_staff_id)
  RETURNING id INTO v_action_id;

  UPDATE public.review_item
  SET status = v_new_status,
      resolved_at = now()
  WHERE id = p_review_item_id;

  INSERT INTO public.outbox_event (event_type, payload, status)
  VALUES (
    'social.review.completed',
    jsonb_build_object(
      'review_item_id', p_review_item_id,
      'canonical_content_id', v_item.canonical_content_id,
      'action', p_action,
      'actor_staff_id', p_actor_staff_id,
      'note', nullif(trim(p_note), '')
    ),
    'pending'
  )
  RETURNING id INTO v_outbox_id;

  RETURN jsonb_build_object(
    'review_item_id', p_review_item_id,
    'status', v_new_status,
    'review_action_id', v_action_id,
    'outbox_event_id', v_outbox_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.ingest_editorial_draft(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_review_action(uuid, text, text, uuid) TO service_role;
