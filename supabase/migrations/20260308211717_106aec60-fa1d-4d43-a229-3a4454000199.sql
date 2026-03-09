
-- Create resource_type enum
CREATE TYPE public.resource_type AS ENUM ('Whitepaper', 'Research', 'Documentation', 'Case Study');

-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'Regent Editorial',
  date TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  read_time TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Case studies table
CREATE TABLE public.case_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  challenge TEXT NOT NULL DEFAULT '',
  solution TEXT NOT NULL DEFAULT '',
  results TEXT[] NOT NULL DEFAULT '{}',
  metrics JSONB NOT NULL DEFAULT '[]',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  type resource_type NOT NULL DEFAULT 'Whitepaper',
  description TEXT NOT NULL DEFAULT '',
  file_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Public read for published content
CREATE POLICY "Public can read published blog posts" ON public.blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Public can read published case studies" ON public.case_studies
  FOR SELECT USING (published = true);

CREATE POLICY "Public can read published resources" ON public.resources
  FOR SELECT USING (published = true);

-- Authenticated users full CRUD
CREATE POLICY "Authenticated users can read all blog posts" ON public.blog_posts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert blog posts" ON public.blog_posts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog posts" ON public.blog_posts
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blog posts" ON public.blog_posts
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read all case studies" ON public.case_studies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert case studies" ON public.case_studies
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update case studies" ON public.case_studies
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete case studies" ON public.case_studies
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read all resources" ON public.resources
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert resources" ON public.resources
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update resources" ON public.resources
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete resources" ON public.resources
  FOR DELETE TO authenticated USING (true);

-- Storage bucket for resource files
INSERT INTO storage.buckets (id, name, public) VALUES ('resource-files', 'resource-files', true);

-- Storage RLS
CREATE POLICY "Public can read resource files" ON storage.objects
  FOR SELECT USING (bucket_id = 'resource-files');

CREATE POLICY "Authenticated users can upload resource files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resource-files');

CREATE POLICY "Authenticated users can update resource files" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'resource-files');

CREATE POLICY "Authenticated users can delete resource files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'resource-files');
