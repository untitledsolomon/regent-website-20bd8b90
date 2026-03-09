

## Fix Resource Download Buttons

### Root Cause
Two issues:
1. **No files exist** — all 8 resources in the database have `file_url = NULL`, so `handleDownload` exits without doing anything
2. **Wrong click target** — the `onClick` is on the entire `motion.div` card wrapper, but the user only wants the Download button to be clickable. The "Download" text is just a styled `<div>`, not a real `<button>`.

### Changes

**`src/components/CardComponents.tsx`** (ResourceCard):
- Remove `onClick={handleDownload}` from the outer `motion.div`
- Replace the "Download" text `<div>` with an actual `<button>` element that calls `handleDownload`
- When `fileUrl` is null/empty, show a toast notification ("File coming soon") instead of silently doing nothing
- Add proper button styling (cursor, hover state)

**`src/pages/Resources.tsx`** (Featured Resource section):
- Same fix for the featured resource: when `file_url` is null, show a toast instead of doing nothing
- The featured button already is a `<button>`, but needs the null-file handling

**Database update** — Set `file_url` on all seeded resources to a working sample PDF (`https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`) so downloads work immediately. This is a temporary placeholder until real PDFs are uploaded via the admin.

### Files
| File | Change |
|------|--------|
| `src/components/CardComponents.tsx` | Make Download a real button, remove card-level onClick, add null-file toast |
| `src/pages/Resources.tsx` | Add null-file toast for featured resource |
| Database (UPDATE query) | Set file_url on all resources to a sample PDF |

