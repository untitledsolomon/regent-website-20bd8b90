

## Problems Identified

1. **Form step indicator is broken**: The Demo page has a 3-step indicator (`currentStep` state) but never advances it. All form fields render at once while the stepper stays stuck on step 1. There's no "Next" button or multi-step flow.

2. **Admin consultation management is barebones**: The ConsultationList only shows a list with delete and CSV export. The database already has `status`, `admin_notes`, `replied_by`, `replied_at` columns, but they're unused. No way to view details, reply, or update status.

## Plan

### 1. Fix the consultation form — make it a proper multi-step flow
- **Step 1 ("Tell Us")**: Name, Company, Email (required fields)
- **Step 2 ("Schedule")**: Industry, Company Size, Budget (optional fields)
- **Step 3 ("Scope")**: Message textarea + submit button
- Add "Next" / "Back" buttons for navigation between steps
- Validate required fields on step 1 before allowing next
- Advance `currentStep` as user progresses
- Submit on final step

### 2. Build a full consultation detail/management view
- Add a detail view for each consultation request (new route `/admin/inquiries/:id`)
- Show all submitted info clearly
- Add **status management**: dropdown to change status (new → contacted → in_progress → completed → archived)
- Add **admin notes**: textarea to save internal notes
- Add **reply via email**: button that opens a reply composer, which calls an edge function to send a reply email via Resend and records `replied_at` / `replied_by`
- Update the ConsultationList to show status badges and link each row to the detail view

### 3. Create a reply edge function
- New edge function `reply-consultation` that sends an email to the consultation requester using Resend
- Records the reply in the database (updates `replied_at`, `replied_by`)

### Technical details
- New file: `src/pages/admin/ConsultationDetail.tsx`
- New file: `supabase/functions/reply-consultation/index.ts`
- New route: `/admin/inquiries/:id`
- Edit: `src/pages/Demo.tsx` — split form into 3 steps with navigation
- Edit: `src/pages/admin/ConsultationList.tsx` — add status badges, clickable rows
- Edit: `src/App.tsx` — add ConsultationDetail route

