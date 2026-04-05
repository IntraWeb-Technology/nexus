-- Demo / tutorial-style notes table (Supabase + Next.js)

CREATE TABLE public.notes (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL
);

INSERT INTO public.notes (title)
VALUES
  ('Today I created a Supabase project.'),
  ('I added some data and queried it from Next.js.'),
  ('It was awesome!');

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Clerk JWTs are accepted as the `authenticated` role when the JWT template is configured.
CREATE POLICY notes_select_authenticated
  ON public.notes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY notes_insert_authenticated
  ON public.notes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY notes_update_authenticated
  ON public.notes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY notes_delete_authenticated
  ON public.notes
  FOR DELETE
  TO authenticated
  USING (true);
