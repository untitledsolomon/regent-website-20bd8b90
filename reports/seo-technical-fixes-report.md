# Regent Website — SEO Technical Fixes: Final Report

Branch: `posthog/technical-seo-fixes` · Site: https://www.regentplatform.com · Company name: **Regent Technologies** ("Regent" for short; `regentplatform.com` is the domain only)

---

## 1. Page-by-page table (old → new)

Old = metadata as it shipped before this work. New = verified live (server-render curl against the built output). All lengths ≤ 60 chars unless noted.

| Page | Old title | New title | Description change | Canonical |
|---|---|---|---|---|
| `/` | `Regent: Infrastructure for the Next Generation of Systems` | `Regent Technologies \| Enterprise Systems & Infrastructure` | + "Based in Kampala, Uganda." | `https://www.regentplatform.com/` (unchanged) |
| `/about` | `About Regent \| Regent` | `About Regent Technologies \| Enterprise Systems` | rewritten in enterprise-systems register | www (unchanged) |
| `/capabilities` | `Capabilities & Solutions \| Regent` | `Capabilities & Solutions \| Regent Technologies` | unchanged | www (unchanged) |
| `/industries` | `Industry Solutions \| Regent` | `Industry Solutions \| Regent Technologies` | unchanged | www (unchanged) |
| `/platform` | `Platform Overview \| Regent` | `Platform Overview \| Regent Technologies` | unchanged | www (unchanged) |
| `/platform/<module>` | `<Name> \| Regent` | `<Name> \| Regent Technologies` | unchanged | www (unchanged) |
| `/products` | `Products \| Regent` | `Products \| Regent Technologies` | unchanged | www (unchanged) |
| `/products/<slug>` | `<Name> by Regent (in dev) \| Regent` | `<Name> by Regent (in development) \| Regent Technologies` | unchanged | www (unchanged) |
| `/careers` | `Careers \| Regent` | `Careers \| Regent Technologies` | unchanged | www (unchanged) |
| `/case-studies` | `Case Studies \| Regent` | `Case Studies \| Regent Technologies` | unchanged | www (unchanged) |
| `/case-studies/<slug>` | `<title> \| Case Study` (no brand) | `seoTitle(meta_title \|\| title)` → single ` \| Regent Technologies` suffix | uses `meta_description \|\|` | www (unchanged) |
| `/blog` | `Blog \| Regent` | `Blog \| Regent Technologies` | unchanged | www (unchanged) |
| `/blog/<slug>` | `meta_title` used verbatim (carries ` \| Regent` / ` \| Axis by Regent`) | `seoTitle(meta_title \|\| title)` — suffix normalized to single ` \| Regent Technologies` (see §5) | uses DB values | www (unchanged) |
| `/resources` | `Resources \| Regent` | `Resources \| Regent Technologies` | unchanged | www (unchanged) |
| `/resources/<slug>` | `<title>` (+ template) | same | unchanged | www (unchanged) |
| `/demo` | `Book a Demo \| Regent` | `Book a Demo \| Regent Technologies` | unchanged | www (unchanged) |
| `/privacy` | `Privacy Policy \| Regent` | `Privacy Policy \| Regent Technologies` | unchanged | www (unchanged) |
| `/terms` | `Terms of Service \| Regent` | `Terms of Service \| Regent Technologies` | unchanged | www (unchanged) |
| `/refund-policy` | `Refund Policy \| Regent` | `Refund Policy \| Regent Technologies` | unchanged | www (unchanged) |
| `/axis` | `Axis by Regent: Business Management Software` (absolute) | **unchanged** (per instruction, verbatim) | unchanged | www (unchanged) |
| `/axis/pricing` | `Axis Pricing \| Regent` | `Axis Pricing \| Regent Technologies` | unchanged | www (unchanged) |
| `/services/custom-software-development-uganda` | — (did not exist) | `Custom Software & Enterprise Systems \| Regent Technologies` | new (enterprise register; "custom software development" + "Uganda") | `www/…/custom-software-development-uganda` (new) |
| `/axis/invoicing` | — (did not exist) | `Invoicing Software for Small Business \| Regent Technologies` (59) | new, names Axis | www (new) |
| `/axis/accounting` | — (did not exist) | `Accounting Software for Small Business \| Regent Technologies` (60) | new, names Axis | www (new) |
| `/axis/inventory` | — (did not exist) | `Inventory Management Software Uganda \| Regent Technologies` (58) | new, names Axis | www (new) |
| `/axis/hr` | — (did not exist) | `HR & Attendance Software for Business \| Regent Technologies` (58) | new, names Axis | www (new) |

**Root template change (C1):** site-wide title template `%s | Regent` → `%s | Regent Technologies`; default title → `Regent Technologies | Enterprise Systems & Infrastructure`. Every page that relied on the template (rather than an absolute title) picked up the full company name automatically — including `/axis/pricing` (copy untouched).

**og:image / twitter:image (C3):** added `images: [{ url: '/og-image.png' }]` to the `openGraph` + `twitter` of all 22 indexable pages. Root layout already carries it, but page-level `openGraph`/`twitter` replace (not deep-merge) the root, so per-page image was required. `/axis` and `/axis/pricing` were **excluded per your instruction** ("don't touch the axis product page") — verified in code and live; flagged here for completeness.

**Canonical:** already www on every existing page (fixed in an earlier PR); all 9 new pages set `alternates.canonical` to their www URL. Verified live on all 23 routes.

---

## 2. Structured data (JSON-LD)

- **Organization** (root layout): `name: "Regent Technologies"`, `alternateName: ["Regent"]`, description in enterprise register, `address: { '@type': 'PostalAddress', addressLocality: 'Kampala', addressCountry: 'UG' }`, `sameAs` kept. The pre-fix Org JSON-LD used `'Regent Platform'` as a name — removed.
- **WebSite** — **new**, in root layout.
- **BreadcrumbList** — new `Breadcrumbs` server component on all 18 content pages + new pages (Home → …). Not on `/axis` or `/axis/pricing` (untouched).
- **FAQPage** — new on the services landing page and all 4 Axis module pages (visible FAQ + JSON-LD).
- **Article** metadata on case-study detail: client-side duplicate removed (SSR'd BreadcrumbList etc. only).
- `/` has `@graph` with Organization + WebSite; verified `Organization` + `addressLocality Kampala` + `WebSite` present in served HTML.

---

## 3. Nav / footer changes

- **Navbar:** removed the `Pricing` entry from the shared nav links (desktop + mobile menus — one source). `/axis/pricing` remains reachable from `/axis` and the four module pages.
- **Footer (final, after owner's PR review comment):** the footer is otherwise **unchanged from the original** — the only edit is the removal of the four Axis **module** links (`/axis/invoicing`, `/axis/accounting`, `/axis/inventory`, `/axis/hr`). All columns restored as before: Solutions (Overview/Architecture/Modules/Security → /platform, **Axis Pricing** → /axis/pricing), Capabilities (4 links → /capabilities), Industries (4 links → /industries), Resources (Whitepapers, Case Studies, Documentation, Blog), Company (About, Services, Careers, News, Contact), bottom-row links incl. the Security span, and the original 6-track grid. Company blurb ends "Based in Kampala, Uganda."
- **`/axis`:** appended one add-only "Explore each Axis module" links row; all existing copy untouched.

---

## 4. Branding sweep

- Company name now "Regent Technologies" throughout metadata/JSON-LD/title template; "Regent" as everyday short form.
- `Regent Product suite` / Dominion Finance / Mabruk Atelier: **absent from shipped code** — the only occurrence is inside the unapplied tracked artifact `technical-seo-fixes-full.patch` (not shipped). Nothing to fix in the working tree; flagged per plan.
- "Regent Platform" removed from Org JSON-LD; appears only in the domain `www.regentplatform.com`.
- `SME`: no occurrences in shipped metadata/JSON-LD (Axis copy is "small business", per requirement).
- No DAWN / Sentinel / OMNI in shipped code (internal variable names only). Axis is the only named product.

---

## 5. DB `meta_title` rows (blog + case studies) — title normalization

All **42 published blog posts** and all **5 case studies** carry a brand suffix in their DB `meta_title`. New `seoTitle()`/`stripBrandSuffix()` logic (C2 + C4) strips it and re-applies the single canonical `| Regent Technologies`.

**Counts (live Supabase):** 24 end `| Regent` · 18 end `| Axis by Regent` (blog) + 5 end `| Axis by Regent` (case studies) · 0 end `| Regent Technologies`.

**C4 note (plan deviation worth reviewing):** `stripBrandSuffix` was written to handle `| Regent Technologies` / `| Regent`, but not `| Axis by Regent` — the guard's stated purpose is "the template never appends the brand twice", and 23 rows use the `| Axis by Regent` form. Without C4 those rows render e.g. `Axis Accounting | Axis by Regent | Regent Technologies` (brand doubled). C4 adds one regex alternation so they render `Axis Accounting | Regent Technologies`. Isolated in its own commit for easy revert.

Titles that would exceed 60 chars after re-appending the brand are returned as `{ absolute: <stripped title> }` — the brand suffix is dropped (never cut words). These are:

Over-60 → absolute (no brand suffix): "African Businesses Keep Being Sold Software That Wasn't Built For Them", "Axis, in Context: How Axis Fits Into Regent's Systems Thinking", "Axis, in Context: What Stays Fixed as the Product Evolves", "Client, Invoice, Payment: One Connected Thread", "Data, Workflows, Intelligence: Why They Belong in One System", "The Cost of Delayed Business Reporting and Decision-Making", "Bridging LMS and SIS Silos With Event-Driven Architecture", "Employee, Role, Attendance: One Connected Record", "Financial Visibility: How Well Do You Know Your Business?", "Infrastructure, Not Instances: Point Solutions vs. Systems", "The Hidden Cost of Software Migration Nobody Budgets For", "Data Modeling for Systems That Outlive Their First Version", "Permission Model Design: Why Access Control Belongs Early", "On Permanence: Building Software for Decades, Not Funding Cycles", "On Permanence: Why Declining Shortcuts Builds Durable Software", "Purchase, Inventory, Sale: One Connected Number", "Revenue vs. Profit: What's the Difference?", "5 Signs Your Business Has Outgrown Its Systems", "Systems That Compound: Why Connected Systems Gain Value Over Time", "Interoperability: Why System Integration Determines Compounding Value", "The Hidden Cost of Fragmented Information", "What Does a Stock Count Reveal? Shrinkage & Phantom Stock", "What Is a General Ledger and Why It Matters", "What Does \"Enterprise-Grade\" Software Actually Mean?", "Enterprise-Grade Software: Designing for Failure Conditions", "Cash Flow vs. Profit: Why Profitable Businesses Run Out of Cash", "Why Early Growth Can Be Misleading for Startups", "Why WhatsApp Isn't a Business Management System", "Why Doesn't My Inventory Match My Spreadsheet?", "Your Competitor Isn't Winning With a Better Product — It's Better Systems", "Multi-Branch Case Study: One View Across Every Location", "Multi-Employee Case Study: One System for Roles, Attendance & Client Work", "Multi-Branch Retail Case Study: One System for Stock, Currency & Finance", "Retail Case Study: One System for Purchasing & Inventory", "Service Business Case Study: Consolidating 5 Tools Into One System".

Same-keyword example: `5 Signs You've Outgrown Spreadsheets | Axis by Regent` → `5 Signs You've Outgrown Spreadsheets | Regent Technologies` (58).

**No DB rows were edited** — all changes happen at render time via `seoTitle` (so a future brand change only touches one file).

**Sitemap (guard 2):** blog index, blog `[slug]`, blog related-posts, case-studies index + `[slug]`, and `sitemap.ts` all use the identical visibility condition `.eq('published', true)` — they never consult `publish_at` (an admin scheduling field). The sitemap's blog/case/resource entries filter on `published` and use `updated_at` as `lastModified`; static pages have no lastmod. The `[slug]` fetch now matches the index so no index-visible post is hidden.

---

## 6. Task A — authority / canonicals / sitemap

- Apex → www single 301: configured at the Vercel dashboard (no `vercel.json`; verified, hand-off only — nothing in this repo to change).
- All canonicals = `https://www.regentplatform.com/<path>`; none point to a redirected or noindex URL. Sitemap URLs are www-only (built from `SITE_URL`).
- New pages added to `sitemap.ts` static entries: services page + 4 Axis module pages.
- `robots.ts` serves www + references sitemap (verified live). Sitemap only ever lists `published` content.

### Task B — dispatch.regentplatform.com junk (external host — hand-off only)

This host is **not** this repo (email/Dispatch lives on Supabase edge functions + the separate dispatch host). Do the following on the dispatch host, not here:

1. Add a noindex — either `robots.txt` `Disallow` is **not** recommended (still indexable via other means); use one of:
   - HTML `<meta name="robots" content="noindex, nofollow">` on the templates for `/update_password`, `/subscribe`, `/p/test-post`; or
   - HTTP header `X-Robots-Tag: noindex, nofollow` on those routes.
2. Delete `/p/test-post` if it was only a smoke-test (Google lists it under "Discovered – currently not indexed").
3. After deploying, verify with `curl -I` that each junk URL emits `X-Robots-Tag` (or fetch the HTML and confirm the robots meta), and re-submit them in Search Console → URL Inspection → Request indexing (they'll be dropped once noindex lands).

www-side already handled (verified live): `/unsubscribe` noindex, `/careers/apply/…` noindex, `/pricing` → 307 → `/axis/pricing`, unknown URLs → real 404 status + `noindex` (the old soft-404s on products/platform-module were replaced with `notFound()` in C2).

---

## 7. Verification results

- `npm run build` (`next build --webpack`): ✅ exit 0, 63/63 routes.
- `npx vitest run`: ✅ 26/26 pass.
- `next lint`: ❌ **cannot run** — pre-existing dependency incompatibility (`@eslint/eslintrc` boot crash with eslint 9.32.0, untouched by this work). Build + tests pass instead.
- Live curl suite (built output, port 3000): 21 routes verified — **all** titles clean (no "Kampala", no "Regent Platform"-as-name, no doubled brand), **all** canonicals www, **all** og:image + twitter:image present, JSON-LD on every page (Organization + WebSite on `/`, BreadcrumbList on content pages, FAQPage on services + module pages). `/products` free of Dominion/Mabruk. Unknown URL → 404 + noindex. `/pricing` → 307. `robots.txt` references sitemap.
- **og:image earlier appeared "missing" on some routes — root cause was a `next start` process running a pre-og:image build (started 20:33 vs build 20:35); restarted on the current build and all routes now serve it.** No code issue.

---

## 8. TODOs / hand-offs (out of scope, requiring the owner)

1. **Street address** for Org JSON-LD Kampala `PostalAddress` — left as `// TODO(solomon): add the full street address once one is public.`
2. **`/admin/login`** serves 200 with the generic site title and no robots meta (auth-gated by middleware; only the login route is public). Pre-existing, untouched. Recommend adding `robots: { index: false }`.
3. **Sitemap still lists `/pricing`** (307 → `/axis/pricing`). Pre-existing; `/axis/pricing` itself is not sitemapped. Recommend swapping the entry (or removing it) — left as-is per scope.
4. **Dispatch host noindex** — perform on the external host per §6 (no code here).
5. **Vercel dashboard** — apex→www redirect already live (verified); nothing to change.
6. `/products/regent-crm` renders `Regent CRM by Regent (in development)` — the "Regent…by Regent" redundancy was flagged in the plan and intentionally left (title ≤ 60).

---

## 9. Follow-up changes (F1–F5) — per file

**F1 — `src/lib/axisModules.ts` (de-country + retitle)**
- Removed "Uganda" from all four modules' who-for lines, FAQ Q/A, descriptions, OG titles; audience now phrased as **"growing small businesses"** (no country).
- Inventory title set to the exact requested string: **`Inventory Management Software for Business | Regent Technologies`**.
  - ⚠️ **Length flag:** this resolves to **64 chars**, over the requested ≤60. The exact string the user specified *is* >60; I used the string verbatim as instructed rather than deviating from it. `seoTitle()` is not used here (titles are set via `title.absolute`), so nothing was auto-trimmed. If ≤60 is required, a shorter keyword part is needed (e.g. `Inventory Software for Business | Regent Technologies` = 54). Accounting = 60 (OK); invoicing = 59; HR = 59.
- Inventory `ogTitle`: `Axis Inventory & Custody — Inventory Management Software for Business`; inventory description/ogTitle match the new wording.

**F2 — screenshot slots (new files, both left EMPTY by design)**
- `src/components/ScreenshotFrame.tsx` — server component: rounded border, browser-style top bar (3 dots), optional caption, `next/image` with explicit `width`/`height` (defaults 1200×675), `alt` required, `loading="lazy"` everywhere except the hero slot (`priority`). Renders nothing when `shot` is null → empty arrays leave the layout complete, no placeholders.
- `src/lib/screens.ts` — `MODULE_SCREENS` (invoicing/accounting/inventory/hr) and `SERVICES_SCREENS`, all `[]`. Convention: `[0]` hero visual (right column desktop / below text mobile), `[1..n]` feature rows in order; `SERVICES_SCREENS[0]` = wide services slot. Adding one entry to an array is the only step needed to show a screenshot.
- **Expected files in `/public/screens/`** (16:9, 1200×675 recommended — set `width`/`height` in the entry to match the real file to avoid CLS):

  | File | Slot |
  |---|---|
  | `axis-invoicing-hero.png` | invoicing hero (also `axis-invoicing-1.png … -5.png` for the 5 feature rows) |
  | `axis-accounting-hero.png` | accounting hero (`axis-accounting-1.png … -5.png`) |
  | `axis-inventory-hero.png` | inventory hero (`axis-inventory-1.png … -5.png`) |
  | `axis-hr-hero.png` | HR hero (`axis-hr-1.png … -5.png`) |
  | `services-hero.png` | services page wide slot |

  `.png` or `.jpg` both fine; `alt` required in the entry.

**F3 — expand module pages** (`src/lib/axisModules.ts` data + `src/components/AxisModulePage.tsx`)
- Each module: 5 features (lucide-style `Icons` already in repo), 4-step "How it works", "What it replaces", "How Axis connects to the other modules" (names the other 3 with links), "Who it is for", 6-question FAQ **including a trial Q and per-plan pricing Q answered verbatim from `/axis/pricing`** (e.g. inventory: "Inventory tracking is in Pro and above. Starter covers quotations, invoicing and core accounting."; HR: "Employee management is in Advanced.").
- `AxisModulePage.tsx`: hero with optional screenshot slot (2-col desktop, stacked mobile), alternating feature rows with per-row screenshot slots, numbered step cards, FAQPage JSON-LD, sibling cross-links, CTA. H1s, titles, canonicals, breadcrumbs, CTAs preserved.
- **FAQ rendered with the same "sane" components as the `/axis` product page** (per PR #46 review comment): shadcn `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent` + `SectionHeader`, replacing the prior bespoke `divide-y` listing.
- **SEO-safe accordion (module pages AND `/axis`):** `AccordionContent` uses `forceMount` on all five pages (the four module pages + `/axis`, no copy touched) so every answer is present in the **raw static SSR HTML** (crawlers / Google see the full Q&A without JS), and the shared `ui/accordion.tsx` was updated to collapse closed items via `grid-rows-[0fr]/[1fr]` instead of the mount-only height keyframes (the old keyframe approach left force-mounted closed content expanded). So the accordions now behave/look like the `/axis` page (collapsed, closable) **and** are crawler-visible. Verified on all five pages by scanning the served HTML with `<script>`/`<style>` blocks removed. The FAQPage JSON-LD still exposes the same Q&A for structured data.
- Rendered word counts (built output): invoicing **727**, accounting **712**, inventory **720**, HR **745** (target ~700–900 ✓).

**F4 — expand services page** (`src/app/(public)/services/custom-software-development-uganda/page.tsx`)
- Added: opening statement, wide screenshot slot (`SERVICES_SCREENS[0]`), "What Regent builds" → 4 cards (enterprise systems, internal systems, web applications, AI-powered tools), approach principles as statements, an Axis section ("one system Regent has built and operates"), existing FAQ kept (6 Q) + FAQPage JSON-LD, CTA → `/demo`. "Custom software development" used sparingly; Uganda kept here by design (per F1, services stays as-is). Rendered **801** words (target ~800–1000 ✓).

**F5 — footer / Axis module links** (`src/components/Footer.tsx`): the four Axis **module** links removed (per the explicit request). Per the owner's PR review comment, the rest of the footer was left **as it was** — the earlier link de-duplication was reverted.

**Verification (follow-up):** `npm run build` ✅; `npx vitest run` ✅ 26/26; live curl on port 3000: titles/descriptions/canonicals/OG, `FAQPage` JSON-LD on all four module pages + services, footer link assertions (module links & "News" gone; Platform / Capabilities / Industries / Axis Pricing / Whitepapers & Docs present), `/axis` and `/axis/pricing` untouched.
