

## Implement Remaining Launch Items

Based on my review, several items from the suggestions are **already done** (CSV export, image upload for blog/case study editors). Here's what actually needs building:

---

### 1. Add Empty States to Public Pages

Currently, when no content is published:
- **Blog** (line 204): Already has an empty state for filtered results, but no overall empty state when zero posts exist
- **Case Studies**: No empty state — just renders an empty grid
- **Resources**: No empty state — just renders an empty grid
- **Careers**: Needs checking but likely same issue

**Fix**: Add friendly empty-state messages to each page when the database returns zero items. Something like "No [content] published yet. Check back soon." with a subtle icon.

### 2. Wire Up Resources Page Newsletter Subscribe

The Resources page (lines 204-217) has a subscribe form that is **completely non-functional** — the button and input aren't connected to any handler. Need to wire it up the same way the Blog page does (insert into `newsletter_subscribers`, call `newsletter-welcome` function).

### 3. Dynamic Sitemap Generation

Create an edge function `generate-sitemap` that:
- Queries published blog posts, case studies, and resources from the database
- Generates a proper XML sitemap with all static pages + dynamic content URLs
- Returns XML with correct `Content-Type: application/xml`

Update the approach: Instead of a static `public/sitemap.xml`, serve it from an edge function. Update `robots.txt` to point to the edge function URL.

Alternatively (simpler): Create an admin button that regenerates `sitemap.xml` by querying the DB. But since we can't write to `public/` at runtime, the edge function approach is better.

### 4. Not Doing (Already Complete)
- CSV export for subscribers — already implemented with download button
- Image upload for blog posts — already has drag-and-drop upload to storage
- Image upload for case studies — already has upload support

---

### Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/sitemap/index.ts` | Dynamic sitemap endpoint |

### Files to Edit
| File | Change |
|------|--------|
| `src/pages/Blog.tsx` | Add overall empty state when zero posts |
| `src/pages/CaseStudies.tsx` | Add empty state when zero case studies |
| `src/pages/Resources.tsx` | Add empty state + wire up newsletter subscribe |
| `src/pages/Careers.tsx` | Add empty state for zero openings |
| `public/robots.txt` | Update sitemap URL to edge function |
| `supabase/config.toml` | Add sitemap function config with `verify_jwt = false` |

### Execution Order
1. Add empty states to all four public pages
2. Wire up Resources page newsletter subscribe
3. Create sitemap edge function
4. Update robots.txt

