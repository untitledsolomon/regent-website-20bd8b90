-- -----------------------------------------------------------------------------
-- 20261113000004_resources_seo.sql
-- Resources currently have no SEO fields (unlike blog posts and case studies).
-- Add the same meta_title / meta_description / og_image trio so the AI
-- editorial helper and the Resource editor can write them. Additive.
-- -----------------------------------------------------------------------------

ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS og_image text;
