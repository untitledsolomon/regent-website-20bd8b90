
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. RLS policies for user_roles table
CREATE POLICY "Admins can manage user_roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- DROP old permissive write/delete policies
-- =============================================

-- blog_posts
DROP POLICY IF EXISTS "Authenticated users can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can delete blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can read all blog posts" ON public.blog_posts;

-- case_studies
DROP POLICY IF EXISTS "Authenticated users can insert case studies" ON public.case_studies;
DROP POLICY IF EXISTS "Authenticated users can update case studies" ON public.case_studies;
DROP POLICY IF EXISTS "Authenticated users can delete case studies" ON public.case_studies;
DROP POLICY IF EXISTS "Authenticated users can read all case studies" ON public.case_studies;

-- resources
DROP POLICY IF EXISTS "Authenticated users can insert resources" ON public.resources;
DROP POLICY IF EXISTS "Authenticated users can update resources" ON public.resources;
DROP POLICY IF EXISTS "Authenticated users can delete resources" ON public.resources;
DROP POLICY IF EXISTS "Authenticated users can read all resources" ON public.resources;

-- careers
DROP POLICY IF EXISTS "Auth can manage careers" ON public.careers;

-- consultation_requests
DROP POLICY IF EXISTS "Authenticated users can read consultation requests" ON public.consultation_requests;
DROP POLICY IF EXISTS "Authenticated users can update consultation requests" ON public.consultation_requests;
DROP POLICY IF EXISTS "Authenticated users can delete consultation requests" ON public.consultation_requests;

-- newsletter_subscribers
DROP POLICY IF EXISTS "Authenticated users can read subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can delete subscribers" ON public.newsletter_subscribers;

-- newsletter_sends
DROP POLICY IF EXISTS "Auth can read newsletter sends" ON public.newsletter_sends;

-- =============================================
-- CREATE new admin-only policies
-- =============================================

-- blog_posts: admin can do everything, public reads published
CREATE POLICY "Admins can read all blog posts"
  ON public.blog_posts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert blog posts"
  ON public.blog_posts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog posts"
  ON public.blog_posts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog posts"
  ON public.blog_posts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- case_studies
CREATE POLICY "Admins can read all case studies"
  ON public.case_studies FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert case studies"
  ON public.case_studies FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update case studies"
  ON public.case_studies FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete case studies"
  ON public.case_studies FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- resources
CREATE POLICY "Admins can read all resources"
  ON public.resources FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert resources"
  ON public.resources FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update resources"
  ON public.resources FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete resources"
  ON public.resources FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- careers
CREATE POLICY "Admins can manage careers"
  ON public.careers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- consultation_requests
CREATE POLICY "Admins can read consultation requests"
  ON public.consultation_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update consultation requests"
  ON public.consultation_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete consultation requests"
  ON public.consultation_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- newsletter_subscribers
CREATE POLICY "Admins can read subscribers"
  ON public.newsletter_subscribers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subscribers"
  ON public.newsletter_subscribers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- newsletter_sends
CREATE POLICY "Admins can read newsletter sends"
  ON public.newsletter_sends FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert newsletter sends"
  ON public.newsletter_sends FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
