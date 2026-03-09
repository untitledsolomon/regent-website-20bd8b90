

## Admin Dashboard Overhaul + Dark/Light Theme + Seed Content

This is a large scope covering three areas: UI overhaul of the entire admin panel, theme toggle, and database seed content. Given the number of files, I'll focus changes on the highest-impact areas.

---

### 1. Dark/Light Theme Toggle

The project already has `darkMode: ["class"]` in tailwind config, dark CSS variables in `index.css`, and `next-themes` installed.

**Changes:**
- **`src/App.tsx`**: Wrap the app (or just admin routes) with `ThemeProvider` from `next-themes`
- **`src/components/admin/AdminLayout.tsx`**: Add a theme toggle button (Sun/Moon icon) in the sidebar header area, using `useTheme()` from `next-themes`
- **`src/pages/admin/AdminLogin.tsx`**: Add the `dark` class awareness so login page also respects theme

**Issue to fix**: Several admin components use hardcoded light-mode colors like `bg-emerald-50`, `text-emerald-600`, `bg-amber-50`, `bg-blue-50` etc. These need dark-mode variants (`dark:bg-emerald-950`, `dark:text-emerald-400`, etc.) across all admin pages.

---

### 2. Admin Dashboard UI Overhaul

Transform the current functional-but-basic admin UI into a polished, premium SaaS-grade interface. Key design upgrades:

**AdminLayout (sidebar)**:
- Refined spacing, subtle glass-morphism effect on sidebar
- Animated hover states with micro-interactions
- User avatar section with gradient ring
- Collapsible sidebar with icon-only mode on desktop
- Breadcrumb-style page header in the main content area
- Theme toggle in sidebar footer

**AdminDashboard (overview)**:
- KPI cards with subtle gradient borders and glass effect
- Sparkline mini-charts inside KPI cards
- Smoother chart styling with better color palette
- Card hover animations with scale and shadow transitions
- Better loading skeletons (shimmer effect)

**List Pages (PostList, CaseStudyList, ResourceList)**:
- Table-style layout with proper column headers instead of stacked cards
- Hover row highlighting
- Better status badges with dot indicators
- Refined bulk action bar with frosted glass effect
- Improved search bar with icon

**AdminLogin**:
- Centered card with subtle background pattern
- Animated gradient accent
- Better input styling with floating labels or refined borders

**AdminSettings**:
- Better section cards with icons and descriptions
- Toggle switches for settings where appropriate

---

### 3. Seed Content (Database Migration)

Insert sample content so the site isn't empty on first visit. Single migration with:

- **3 blog posts**: AI/enterprise topics with realistic titles, excerpts, content, published=true
- **3 case studies**: Different industries with metrics, results, published=true
- **3 resources**: Mix of Whitepaper/Guide/Template types, published=true, one featured
- **2 career openings**: Engineering and sales roles, published=true

All content will use placeholder/generic text appropriate for an enterprise AI/tech company (matching the Regent brand).

---

### Database Migration

```sql
-- Seed blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, author, date, category, read_time, published) VALUES
('The Future of Enterprise AI...', 'future-enterprise-ai', '...', '...', 'Regent Editorial', 'March 1, 2026', 'AI Strategy', '8 min read', true),
-- (2 more)

-- Seed case studies  
INSERT INTO case_studies (title, slug, industry, summary, challenge, solution, metrics, results, published) VALUES
('...', '...', 'Financial Services', '...', '...', '...', '[...]'::jsonb, '{...}', true),
-- (2 more)

-- Seed resources
INSERT INTO resources (title, slug, type, description, published, featured) VALUES
('...', '...', 'Whitepaper', '...', true, true),
-- (2 more)

-- Seed careers
INSERT INTO careers (title, department, location, type, description, published) VALUES
('Senior AI Engineer', 'Engineering', 'Remote', 'Full-time', '...', true),
-- (1 more)
```

---

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/admin/ThemeToggle.tsx` | Sun/Moon toggle component |

### Files to Edit
| File | Change |
|------|--------|
| `src/App.tsx` | Add ThemeProvider wrapper |
| `src/components/admin/AdminLayout.tsx` | Complete UI overhaul + theme toggle |
| `src/pages/admin/AdminDashboard.tsx` | Premium UI redesign |
| `src/pages/admin/AdminLogin.tsx` | Modern login page with dark mode |
| `src/pages/admin/AdminSettings.tsx` | Refined settings UI + dark mode |
| `src/pages/admin/PostList.tsx` | Table layout + dark mode colors |
| `src/pages/admin/CaseStudyList.tsx` | Table layout + dark mode colors |
| `src/pages/admin/ResourceList.tsx` | Table layout + dark mode colors |
| `src/pages/admin/AdminAnalytics.tsx` | Dark mode color fixes |

### Execution Order
1. Add ThemeProvider + theme toggle component
2. Overhaul AdminLayout sidebar
3. Redesign AdminDashboard
4. Update AdminLogin
5. Update list pages with table layout + dark mode
6. Update AdminSettings + AdminAnalytics dark mode
7. Run seed content migration

