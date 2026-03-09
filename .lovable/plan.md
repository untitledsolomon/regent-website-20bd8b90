

## Two-Part Update: Reword Pages + Enhanced Content Analytics

### Part 1: Reword Capabilities & Industries Pages

The Capabilities and Industries pages currently present Regent as a **platform/product** ("pre-built connectors", "deploy connectors", CLI demos). The rest of the site (About, Index) positions Regent as a **systems integration consultancy** that builds custom infrastructure for clients.

**Changes needed:**

#### `src/pages/Capabilities.tsx`
- Remove `capabilityStats` (180+ connectors, 12 protocols, 4hrs deploy, 99.99% uptime) — these are product metrics. Replace with consultancy-appropriate stats (e.g., "400+ Systems Delivered", "12+ Industries", "99.99% Uptime SLA", "50+ Enterprise Clients")
- Remove the CLI-style `workflowSteps` interactive demo (shows `$ regent connect --source salesforce`) — replace with a services-oriented workflow: Discovery → Architecture → Implementation → Optimization
- Reword the comparison table: change "Regent Approach" framing from product to service delivery model
- Update hero text to emphasize consulting capability, not product features
- Remove the `integrationComparison` table or reframe it as "Why Regent's Approach Is Different"

#### `src/pages/Industries.tsx`
- Update `industryStats` — change "Systems Connected: 10,000+" and other product-like metrics to service-appropriate ones
- Reword hero copy to match consulting tone
- Minor wording adjustments to match the rest of the site

#### `src/data/siteData.ts`
- Update `detailedCapabilities` descriptions and points to remove platform/product language
- Update `industries` and `industriesDetailed` descriptions to remove "platform" references

### Part 2: Enhanced Content Analytics

#### Database Changes

**Alter `content_views` table** — add columns for richer audience data:
```sql
ALTER TABLE content_views
  ADD COLUMN country text,
  ADD COLUMN city text,
  ADD COLUMN device_type text,      -- 'desktop', 'mobile', 'tablet'
  ADD COLUMN browser text,
  ADD COLUMN os text,
  ADD COLUMN referrer text,
  ADD COLUMN session_id text;
```

**New database function: `get_analytics_detail()`** — returns all content view records with joined content titles for the analytics tab.

**New database function: `get_audience_breakdown()`** — returns aggregated audience data (by country, device, browser, OS).

#### Frontend: Tracking Enhancement (`src/hooks/useContentTracking.ts`)
- Parse `navigator.userAgent` to extract device type, browser, and OS
- Capture `document.referrer`
- Generate a session ID (stored in `sessionStorage`)
- Use a free IP geolocation API or capture timezone as a proxy for location
- Send all this data with every view insert

#### Frontend: New Analytics Tab in Admin Dashboard

**Update `src/components/admin/AdminLayout.tsx`:**
- Add "Analytics" nav item under Content section with `Activity` icon, path `/admin/analytics`

**Create `src/pages/admin/AdminAnalytics.tsx`:**
- Full dedicated analytics page with multiple sections:
  - **Overview KPIs**: Total views, unique sessions, avg views/day, top country
  - **Views Over Time** chart (reuse existing area chart pattern, 30 days)
  - **Top Content** table with view counts, content type badges
  - **Audience Breakdown** section with:
    - Device type distribution (pie chart: desktop/mobile/tablet)
    - Browser distribution (bar chart)
    - OS distribution (bar chart)
    - Top countries/cities (ranked list)
    - Top referrers (ranked list)
  - **Recent Views** table: timestamp, content title, device, browser, country — paginated, most recent first

**Update `src/App.tsx`:**
- Add route for `/admin/analytics`

### Files to Create
- `src/pages/admin/AdminAnalytics.tsx`

### Files to Edit
- `src/pages/Capabilities.tsx` — reword to consultancy tone
- `src/pages/Industries.tsx` — minor wording fixes
- `src/data/siteData.ts` — update capability/industry descriptions
- `src/hooks/useContentTracking.ts` — capture device, browser, OS, referrer, session
- `src/components/admin/AdminLayout.tsx` — add Analytics nav item
- `src/pages/admin/AdminDashboard.tsx` — simplify views section (moved to dedicated page)
- `src/App.tsx` — add analytics route

### Execution Order
1. Database migration (alter table + new functions)
2. Update tracking hook with richer data
3. Reword Capabilities, Industries, and siteData
4. Create Analytics page and wire routing

