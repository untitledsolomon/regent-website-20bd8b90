
-- Scheduled publishing
ALTER TABLE blog_posts ADD COLUMN publish_at timestamptz;
ALTER TABLE case_studies ADD COLUMN publish_at timestamptz;

-- SEO fields
ALTER TABLE blog_posts ADD COLUMN meta_title text;
ALTER TABLE blog_posts ADD COLUMN meta_description text;
ALTER TABLE blog_posts ADD COLUMN og_image text;
ALTER TABLE case_studies ADD COLUMN meta_title text;
ALTER TABLE case_studies ADD COLUMN meta_description text;
ALTER TABLE case_studies ADD COLUMN og_image text;

-- Activity log
CREATE TABLE admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  entity_title text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read activity log" ON admin_activity_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert activity log" ON admin_activity_log
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update public SELECT policies to respect publish_at
DROP POLICY "Public can read published blog posts" ON blog_posts;
CREATE POLICY "Public can read published blog posts" ON blog_posts
  FOR SELECT USING (published = true AND (publish_at IS NULL OR publish_at <= now()));

DROP POLICY "Public can read published case studies" ON case_studies;
CREATE POLICY "Public can read published case studies" ON case_studies
  FOR SELECT USING (published = true AND (publish_at IS NULL OR publish_at <= now()));
