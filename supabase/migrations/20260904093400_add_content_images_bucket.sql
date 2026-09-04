-- Separate bucket for blog/case-study images (covers, inline post images)
-- from the resource-files bucket, which should hold downloadable resource
-- documents (whitepapers, guides, checklists) only.
--
-- Prior to this migration, ResourceEditor, PostEditor, CaseStudyEditor, and
-- RichTextEditor all uploaded to "resource-files" regardless of content type.
-- This bucket gives blog/case-study images their own home going forward;
-- existing files already in resource-files are left in place (no backfill).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-images',
  'content-images',
  true,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
);

-- Storage RLS: mirror the resource-files policy shape (public read,
-- authenticated write) so the admin UI and MCP server (service role)
-- both work the same way against this bucket.
CREATE POLICY "Public can read content images" ON storage.objects
  FOR SELECT USING (bucket_id = 'content-images');

CREATE POLICY "Authenticated users can upload content images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'content-images');

CREATE POLICY "Authenticated users can update content images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'content-images');

CREATE POLICY "Authenticated users can delete content images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'content-images');

-- Also add a file_size_limit to the existing resource-files bucket, which
-- currently has none. NOT restricting allowed_mime_types here: the legacy
-- admin editors (ResourceEditor, PostEditor, CaseStudyEditor, RichTextEditor)
-- still upload images into this same bucket today, and that flow is being
-- reworked separately — restricting MIME types now would break those editors
-- before their upload targets are updated. Revisit once they're split.
UPDATE storage.buckets
SET file_size_limit = 10485760 -- 10MB
WHERE id = 'resource-files';
