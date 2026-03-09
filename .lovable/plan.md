

## Content Analytics & Downloadable Resources

### What We're Building
1. A `content_views` table to track views on blog posts, case studies, and resource downloads
2. Tracking logic on public pages (blog post view, case study view, resource download)
3. Updated admin dashboard with content performance analytics (top content, view counts, download counts)
4. Functional download buttons on resources (already wired to `file_url` — just need tracking)

### Database Changes

**New table: `content_views`**
```sql
CREATE TABLE public.content_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,        -- 'blog_post', 'case_study', 'resource_download'
  content_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  viewer_ip text,                     -- optional, for dedup
  user_agent text                     -- optional metadata
);
```

**RLS policies:**
- Anyone can INSERT (public tracking — no auth required)
- No public SELECT/UPDATE/DELETE
- Admins can SELECT all

**Add `view_count` and `download_count` as computed values** — we'll query aggregates from `content_views` rather than maintaining counters on the content tables (simpler, no race conditions).

### Frontend Changes

#### 1. Track Blog Post Views (`src/pages/BlogPost.tsx`)
- On page load (after post loads), fire a single INSERT to `content_views` with `content_type: 'blog_post'` and `content_id: post.id`
- Use a `useEffect` with a ref to prevent double-counting on re-renders

#### 2. Track Case Study Views (`src/pages/CaseStudyDetail.tsx`)
- Same pattern: INSERT on load with `content_type: 'case_study'`

#### 3. Track Resource Downloads (`src/components/CardComponents.tsx` + `src/pages/Resources.tsx`)
- On download click, INSERT to `content_views` with `content_type: 'resource_download'` before opening the file URL
- Pass `resource.id` through to the ResourceCard component

#### 4. Create a shared tracking hook (`src/hooks/useContentTracking.ts`)
- `useTrackView(contentType, contentId)` — fires once on mount
- `trackDownload(contentId)` — callable function for download clicks

#### 5. Update Admin Dashboard (`src/pages/admin/AdminDashboard.tsx`)
- Add new KPI: "Total Views" (sum of all content_views)
- Add "Top Performing Content" section showing a ranked table with:
  - Content title, type, view/download count
  - Sorted by count descending, top 10
- Add a "Views Over Time" line chart (last 30 days, aggregated daily)
- Query `content_views` with aggregation using `.select()` and group by content_id
- Since Supabase JS client doesn't support GROUP BY, create a database function `get_content_analytics()` that returns aggregated data

**New database function: `get_content_analytics()`**
```sql
CREATE FUNCTION public.get_content_analytics()
RETURNS TABLE (content_type text, content_id uuid, title text, view_count bigint)
SECURITY DEFINER
```
This joins `content_views` with blog_posts/case_studies/resources to return titles and counts.

**New database function: `get_daily_views(days int)`**
Returns daily view counts for the chart.

### Files to Create
- `src/hooks/useContentTracking.ts`

### Files to Edit
- `src/pages/BlogPost.tsx` — add view tracking
- `src/pages/CaseStudyDetail.tsx` — add view tracking
- `src/components/CardComponents.tsx` — add download tracking to ResourceCard
- `src/pages/Resources.tsx` — pass resource id to ResourceCard
- `src/pages/admin/AdminDashboard.tsx` — add analytics widgets

### Execution Order
1. Database migration (table + functions + RLS)
2. Create tracking hook
3. Wire tracking into public pages
4. Update dashboard with analytics

