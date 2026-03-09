CREATE TABLE public.careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'Full-time',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published careers" ON public.careers
  FOR SELECT USING (published = true);

CREATE POLICY "Auth can manage careers" ON public.careers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);