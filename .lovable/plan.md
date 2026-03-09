

## Production Readiness Audit

Here's what's missing or broken for production:

### 1. Security (Critical)
All write/delete RLS policies use `USING (true)` — meaning **any authenticated user** can edit/delete all content. There's no admin role system.
- **newsletter_sends** table is publicly readable (leaked newsletter content)
- **consultation_requests** and **newsletter_subscribers** can be modified/deleted by anonymous users
- Leaked password protection is disabled
- **Fix:** Create a `user_roles` table, a `has_role()` security-definer function, and rewrite all write/update/delete policies to require admin role. Add missing restrictive policies for anon users.

### 2. No Admin User Setup
There's no way to create the first admin account. You need at least one user in the auth system with an admin role assigned.
- **Fix:** Create an admin user and assign them the admin role in `user_roles`.

### 3. Missing Error/Loading States
Several pages fetch data but have minimal error handling. Network failures show blank screens.
- **Fix:** Add error states and retry options to data-fetching pages.

### 4. No Email Confirmation Flow
Admin login uses `signInWithPassword` but there's no signup page and no indication of how admin accounts are created. Email confirmation settings are unclear.

### 5. Missing Content
The site has placeholder/hardcoded data in several areas (e.g., trust logos on Demo page are just text strings like "Fortune 500 Bank"). Blog, case studies, resources pages will be empty until content is added via the admin panel.

### 6. Edge Function Reliability
- `reply-consultation` and `send-newsletter` functions rely on the RESEND_API_KEY secret (which is set) — but there's no verified sender domain configured in Resend, so emails may fail silently.
- No error feedback to admin when email sending fails.

### 7. No Rate Limiting
The consultation form and newsletter signup have no rate limiting — vulnerable to spam submissions.

---

## Recommended Priority Order

I'd suggest tackling these in order of impact:

1. **Security first** — Fix RLS policies with a proper admin roles system (prevents data breaches)
2. **Create admin account** — So you can actually manage the site
3. **Add missing RLS policies** — Block anon update/delete on consultation_requests, newsletter_subscribers; block anon select on newsletter_sends
4. **Enable leaked password protection**
5. **Add error handling** to public pages
6. **Verify Resend email setup** — Ensure your sender domain is configured

### Technical Details

**RLS fix requires:**
- New `app_role` enum type
- New `user_roles` table with RLS
- New `has_role()` security-definer function
- Drop and recreate ~15 write/delete policies across 6 tables to use `has_role(auth.uid(), 'admin')`
- Add 3 new restrictive policies for anon on newsletter_sends (SELECT), consultation_requests (UPDATE/DELETE), newsletter_subscribers (UPDATE/DELETE)

**Files to edit:** None for the security fix (all database migrations). Admin account creation is also a database operation.

