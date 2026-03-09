

## Modernize Admin Dashboard with KPIs, Analytics, Settings & Documentation

### 1. Redesign Admin Dashboard (`src/pages/admin/AdminDashboard.tsx`)
- **KPI cards row**: Total content, published rate (%), new inquiries this week, subscriber growth — each with trend indicators (↑/↓ percentage)
- **Analytics section**: Add charts using `recharts` (already installed):
  - Content published over time (bar chart by month)
  - Inquiries by status (pie/donut chart)
  - Subscriber growth (line chart)
- **Recent activity** stays but gets a cleaner card layout
- Query additional data: inquiries with status breakdown, subscribers with `created_at` for growth tracking

### 2. Add Settings Page (`src/pages/admin/AdminSettings.tsx`)
- **General settings section**: Site name display, admin email
- **Email configuration**: Show Resend status (configured/not), notification email
- **Security section**: Display current RLS status, link to change password (via `supabase.auth.updateUser`)
- **Danger zone**: Clear cache / sign out all sessions
- Route: `/admin/settings`

### 3. Add Documentation Page (`src/pages/admin/AdminDocumentation.tsx`)
- Tabbed layout documenting:
  - **Site Overview**: All public routes, their purpose, and data sources
  - **API Endpoints**: All 5 edge functions with method, URL, request/response format, auth requirements
  - **Database Schema**: All tables, columns, RLS policies summary
  - **Admin Guide**: How to create/edit content, manage inquiries, send newsletters
- All content is hardcoded (static reference docs)

### 4. Update Admin Layout (`src/components/admin/AdminLayout.tsx`)
- Add "Settings" and "Documentation" nav items with `Settings` and `BookOpen` icons
- Add a divider between content nav and utility nav

### 5. Update Routes (`src/App.tsx`)
- Add lazy imports and routes for `AdminSettings` and `AdminDocumentation`

### Files to create
- `src/pages/admin/AdminSettings.tsx`
- `src/pages/admin/AdminDocumentation.tsx`

### Files to edit
- `src/pages/admin/AdminDashboard.tsx` — complete redesign with charts and KPIs
- `src/components/admin/AdminLayout.tsx` — add Settings + Docs nav items
- `src/App.tsx` — add 2 new admin routes

