
-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  career_id UUID REFERENCES public.careers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application
CREATE POLICY "Anyone can submit job applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read job applications"
  ON public.job_applications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update
CREATE POLICY "Admins can update job applications"
  ON public.job_applications FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
CREATE POLICY "Admins can delete job applications"
  ON public.job_applications FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create private storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-applications', 'job-applications', false);

-- Anyone can upload to job-applications bucket
CREATE POLICY "Anyone can upload resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'job-applications');

-- Only admins can read resumes
CREATE POLICY "Admins can read resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'job-applications' AND has_role(auth.uid(), 'admin'::app_role));
