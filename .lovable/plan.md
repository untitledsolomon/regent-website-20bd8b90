

## Create Career Application Page

### Problem
Career listings and the "Get in Touch" button both link to `/demo` (the consultation form), which is unrelated to job applications.

### Changes

**1. New database table: `job_applications`**
- Columns: `id`, `career_id` (FK to careers), `name`, `email`, `phone`, `cover_letter`, `resume_url`, `created_at`
- RLS: anyone can INSERT, only admins can SELECT/UPDATE/DELETE

**2. New storage bucket: `job-applications`**
- Public: No (private bucket, admin-only access)
- For resume/CV file uploads

**3. New page: `src/pages/CareerApply.tsx`** (`/careers/apply/:id`)
- Fetches career details by ID to show job title, department, location
- Application form with fields: name, email, phone (optional), cover letter (textarea), resume upload (PDF/DOC)
- On submit: uploads resume to storage, inserts row into `job_applications`, shows success state
- Styled consistently with the rest of the site

**4. New route in `src/App.tsx`**
- Add `/careers/apply/:id` route pointing to `CareerApply`

**5. Update `src/pages/Careers.tsx`**
- Change job listing `<Link to="/demo">` → `<Link to={`/careers/apply/${job.id}`}>`
- Change bottom "Get in Touch" link → "Send Us Your Resume" linking to a general apply page or keeping `/demo` with updated copy (will link to `/careers/apply/general`)

**6. Admin visibility**
- Add `job_applications` to admin so applications can be viewed (basic list view)

### Files
| File | Change |
|------|--------|
| Database migration | Create `job_applications` table + storage bucket |
| `src/pages/CareerApply.tsx` | New application form page |
| `src/App.tsx` | Add route |
| `src/pages/Careers.tsx` | Update links |

