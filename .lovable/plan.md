

## Admin Dashboard Features + Fix Resource Downloads

Seven changes across database migrations, new components, and bug fixes.

---

### 1. Fix Resource Downloads (Bug Fix)

**Problem**: `window.open(url, "_blank", "noopener,noreferrer")` is blocked by popup blockers in most browsers because it opens in a new window context.

**Fix**: In `ResourceCard` (`CardComponents.tsx`) and the featured resource button in `Resources.tsx`, replace `window.open()` with a programmatic anchor element approach — create a temporary `<a>` tag with `href` and `download` attribute, click it, and remove it. This triggers a proper download instead of a popup.

### 2. Scheduled Publishing

**Database**: Add `publish_at` column (nullable `timestamptz`) to `blog_posts` and `case_studies` tables. Update the public SELECT RLS policies to also check `publish_at IS NULL OR publish_at <= now()`.

**Editor UI**: Add a "Schedule" date-time picker in `PostEditor.tsx` and `CaseStudyEditor.tsx` next to the Published checkbox. When a future date is set, the post is marked published but won't appear publicly until that date.

**List UI**: Show "Scheduled" badge (with date) in `PostList.tsx` and `CaseStudyList.tsx` for items where `publish_at` is in the future.

### 3. SEO Metadata Fields

**Database**: Add `meta_title`, `meta_description`, and `og_image` columns (nullable text) to `blog_posts` and `case_studies`.

**Editor UI**: Add a collapsible "SEO Settings" section at the bottom of `PostEditor.tsx` and `CaseStudyEditor.tsx` with inputs for meta title, meta description (textarea), and OG image URL.

**Frontend**: Update `BlogPost.tsx` and `CaseStudyDetail.tsx` to use these fields in `<PageMeta>` when present, falling back to title/excerpt.

### 4. Activity Log

**Database**: Create an `admin_activity_log` table with columns: `id`, `user_id`, `action` (text, e.g. "published_post"), `entity_type` (text), `entity_id` (uuid), `entity_title` (text), `created_at`. RLS: admin-only SELECT, admin-only INSERT.

**Helper hook**: Create `src/hooks/useActivityLog.ts` with a `logActivity()` function that inserts a row.

**Integration**: Call `logActivity()` in the save/delete handlers of PostEditor, CaseStudyEditor, ResourceEditor, CareerEditor, and list pages (on delete/toggle).

**Dashboard widget**: Add a "Recent Activity" card to `AdminDashboard.tsx` showing the last 20 actions with timestamps.

### 5. Auto-save Drafts

**Approach**: Use `localStorage` to auto-save editor form state every 30 seconds in `PostEditor.tsx` and `CaseStudyEditor.tsx`. On load, if there's a saved draft for the current post ID (or "new"), show a banner "Unsaved draft found — Restore / Discard". Clear localStorage on successful save.

No database changes needed — this is purely client-side.

### 6. Bulk Actions

Add checkbox selection + bulk action bar to `PostList.tsx`, `CaseStudyList.tsx`, and `ResourceList.tsx`:
- Checkbox on each row + "Select All" in header
- When items selected, show a floating action bar with "Publish", "Unpublish", "Delete" buttons
- Bulk operations use `.in('id', selectedIds)` for efficient batch updates/deletes

---

### Database Migration (single SQL migration)

```sql
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
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert activity log" ON admin_activity_log
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

-- Update public SELECT policies to respect publish_at
DROP POLICY "Public can read published blog posts" ON blog_posts;
CREATE POLICY "Public can read published blog posts" ON blog_posts
  FOR SELECT USING (published = true AND (publish_at IS NULL OR publish_at <= now()));

DROP POLICY "Public can read published case studies" ON case_studies;
CREATE POLICY "Public can read published case studies" ON case_studies
  FOR SELECT USING (published = true AND (publish_at IS NULL OR publish_at <= now()));
```

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/useActivityLog.ts` | Helper to log admin actions |

### Files to Edit
| File | Change |
|------|--------|
| `src/components/CardComponents.tsx` | Fix download using anchor element |
| `src/pages/Resources.tsx` | Fix featured resource download |
| `src/pages/admin/PostEditor.tsx` | Add schedule picker, SEO fields, auto-save |
| `src/pages/admin/CaseStudyEditor.tsx` | Add schedule picker, SEO fields, auto-save |
| `src/pages/admin/PostList.tsx` | Add bulk actions, scheduled badge |
| `src/pages/admin/CaseStudyList.tsx` | Add bulk actions, scheduled badge |
| `src/pages/admin/ResourceList.tsx` | Add bulk actions |
| `src/pages/admin/AdminDashboard.tsx` | Add recent activity widget |
| `src/pages/BlogPost.tsx` | Use SEO fields in PageMeta |
| `src/pages/CaseStudyDetail.tsx` | Use SEO fields in PageMeta |

