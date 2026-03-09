

## Fix OG Meta Tags, Remove Umami Placeholder, Add Error Boundary

Three changes to wrap up non-Umami cleanup items.

---

### 1. `index.html` — Fix OG tags + remove Umami

- Change `og:title` and `twitter:title` from "Regent — Enterprise Infrastructure Platform" to "Regent — Infrastructure for the Next Generation of Systems" (matches the `<title>` tag and consultancy tone)
- Remove lines 21-22 (the Umami script tag and comment) entirely — it's a broken placeholder that generates failed network requests
- OG image URLs stay relative for now since there's no published domain yet; once a domain is set, we can make them absolute

### 2. `src/components/ErrorBoundary.tsx` — New file

Create a React error boundary class component that:
- Catches render errors and lazy-load failures
- Shows a minimal, branded fallback UI ("Something went wrong" + reload button)
- Styled with existing Tailwind classes to match the site

### 3. `src/App.tsx` — Wrap with ErrorBoundary

- Import `ErrorBoundary` and wrap the root `<BrowserRouter>` (or the entire App content) so any crash shows the fallback instead of a blank screen

---

### Files
| Action | File |
|--------|------|
| Edit | `index.html` |
| Create | `src/components/ErrorBoundary.tsx` |
| Edit | `src/App.tsx` |

