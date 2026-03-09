

## Make Admin Dashboard and Site Mobile Responsive

### Problem
The admin layout has a fixed 260px sidebar with no mobile handling — it's unusable on small screens. Several admin pages and public pages also lack responsive adjustments.

### Plan

#### 1. Admin Layout — collapsible sidebar for mobile
- Add a mobile hamburger toggle that shows/hides the sidebar as an overlay on screens < `lg` (1024px)
- Sidebar hidden by default on mobile, slides in from left when toggled
- Add a top header bar on mobile with brand + hamburger button
- Close sidebar on nav link click (mobile)
- Keep existing desktop sidebar unchanged

#### 2. Admin Dashboard — responsive grid fixes
- Change stat cards grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` (currently 5 cards in 3-col grid)
- Quick actions: `grid-cols-2 sm:grid-cols-4`
- Reduce padding on mobile: `p-4 sm:p-6 lg:p-10`
- Make recent activity items stack better on small screens

#### 3. Admin list pages (PostList, ConsultationList, CaseStudyList, ResourceList, CareerList)
- Reduce padding/margins on mobile
- Make table-like layouts scroll horizontally or stack on mobile
- Ensure action buttons are accessible on small screens

#### 4. Admin detail/editor pages (ConsultationDetail, PostEditor, etc.)
- Reduce padding on mobile
- Stack side-by-side layouts vertically on small screens

#### 5. Public site responsive fixes
- Review and fix any overflow issues on the Index hero, cards grids, and content sections
- Ensure Demo form is properly sized on mobile
- Check Footer columns stack properly

### Files to edit
- `src/components/admin/AdminLayout.tsx` — major refactor for mobile sidebar
- `src/pages/admin/AdminDashboard.tsx` — responsive grid/padding
- `src/pages/admin/PostList.tsx` — responsive table
- `src/pages/admin/ConsultationList.tsx` — responsive table
- `src/pages/admin/CaseStudyList.tsx` — responsive layout
- `src/pages/admin/ResourceList.tsx` — responsive layout
- `src/pages/admin/CareerList.tsx` — responsive layout
- `src/pages/admin/ConsultationDetail.tsx` — responsive padding/stacking
- `src/pages/admin/PostEditor.tsx` — responsive layout
- `src/pages/Index.tsx` — check/fix mobile overflow
- `src/pages/Demo.tsx` — ensure form is mobile-friendly

