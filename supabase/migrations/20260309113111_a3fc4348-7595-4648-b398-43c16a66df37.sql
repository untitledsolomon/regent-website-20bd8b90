-- Fix all RLS policies: drop RESTRICTIVE versions and recreate as PERMISSIVE

-- ========== blog_posts ==========
DROP POLICY IF EXISTS "Admins can read all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can read published blog posts" ON public.blog_posts;

CREATE POLICY "Admins can read all blog posts" ON public.blog_posts FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert blog posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update blog posts" ON public.blog_posts FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete blog posts" ON public.blog_posts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public can read published blog posts" ON public.blog_posts FOR SELECT TO public USING (published = true AND (publish_at IS NULL OR publish_at <= now()));

-- ========== case_studies ==========
DROP POLICY IF EXISTS "Admins can read all case studies" ON public.case_studies;
DROP POLICY IF EXISTS "Admins can insert case studies" ON public.case_studies;
DROP POLICY IF EXISTS "Admins can update case studies" ON public.case_studies;
DROP POLICY IF EXISTS "Admins can delete case studies" ON public.case_studies;
DROP POLICY IF EXISTS "Public can read published case studies" ON public.case_studies;

CREATE POLICY "Admins can read all case studies" ON public.case_studies FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert case studies" ON public.case_studies FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update case studies" ON public.case_studies FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete case studies" ON public.case_studies FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public can read published case studies" ON public.case_studies FOR SELECT TO public USING (published = true AND (publish_at IS NULL OR publish_at <= now()));

-- ========== careers ==========
DROP POLICY IF EXISTS "Public can read published careers" ON public.careers;
DROP POLICY IF EXISTS "Admins can manage careers" ON public.careers;

CREATE POLICY "Public can read published careers" ON public.careers FOR SELECT TO public USING (published = true);
CREATE POLICY "Admins can manage careers" ON public.careers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ========== resources ==========
DROP POLICY IF EXISTS "Public can read published resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can read all resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can insert resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can update resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can delete resources" ON public.resources;

CREATE POLICY "Public can read published resources" ON public.resources FOR SELECT TO public USING (published = true);
CREATE POLICY "Admins can read all resources" ON public.resources FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert resources" ON public.resources FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update resources" ON public.resources FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete resources" ON public.resources FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ========== consultation_requests ==========
DROP POLICY IF EXISTS "Anyone can submit a consultation request" ON public.consultation_requests;
DROP POLICY IF EXISTS "No public reads on consultation_requests" ON public.consultation_requests;
DROP POLICY IF EXISTS "Admins can read consultation requests" ON public.consultation_requests;
DROP POLICY IF EXISTS "Admins can update consultation requests" ON public.consultation_requests;
DROP POLICY IF EXISTS "Admins can delete consultation requests" ON public.consultation_requests;

CREATE POLICY "Anyone can submit a consultation request" ON public.consultation_requests FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can read consultation requests" ON public.consultation_requests FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update consultation requests" ON public.consultation_requests FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete consultation requests" ON public.consultation_requests FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ========== admin_activity_log ==========
DROP POLICY IF EXISTS "Admins can read activity log" ON public.admin_activity_log;
DROP POLICY IF EXISTS "Admins can insert activity log" ON public.admin_activity_log;

CREATE POLICY "Admins can read activity log" ON public.admin_activity_log FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert activity log" ON public.admin_activity_log FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ========== content_views ==========
DROP POLICY IF EXISTS "Anyone can insert content views" ON public.content_views;
DROP POLICY IF EXISTS "Admins can read content views" ON public.content_views;

CREATE POLICY "Anyone can insert content views" ON public.content_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read content views" ON public.content_views FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ========== newsletter_subscribers ==========
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "No public reads on newsletter_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can read subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ========== newsletter_sends ==========
DROP POLICY IF EXISTS "No public insert on newsletter_sends" ON public.newsletter_sends;
DROP POLICY IF EXISTS "Admins can read newsletter sends" ON public.newsletter_sends;
DROP POLICY IF EXISTS "Admins can insert newsletter sends" ON public.newsletter_sends;

CREATE POLICY "Admins can read newsletter sends" ON public.newsletter_sends FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert newsletter sends" ON public.newsletter_sends FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ========== job_applications ==========
DROP POLICY IF EXISTS "Anyone can submit job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can read job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can update job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can delete job applications" ON public.job_applications;

CREATE POLICY "Anyone can submit job applications" ON public.job_applications FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can read job applications" ON public.job_applications FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update job applications" ON public.job_applications FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete job applications" ON public.job_applications FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ========== user_roles ==========
DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

CREATE POLICY "Admins can manage user_roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());