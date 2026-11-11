-- -----------------------------------------------------------------------------
-- 20261113000006_fix_stale_insight_links.sql
-- Insight rows generated before the admin-URL resolver shipped carry legacy
-- links: public-page insights were stored as "/blog/" + page path (e.g.
-- "/blog//demo", "/blog//blog", "/blog//products"), and rule-based anomalies
-- had no link at all (or pointed at /contact). Rewrite them to match what the
-- current generator produces — public pages and anomalies open the analytics
-- page. Idempotent: a second run matches no rows.
-- -----------------------------------------------------------------------------

UPDATE public.ai_insights
SET target_url  = CASE WHEN target_type = 'page' THEN '/admin/analytics' ELSE NULL END,
    target_id   = NULL,
    target_slug = NULL,
    action      = CASE WHEN target_type = 'page' THEN 'view_analytics' ELSE NULL END,
    actionable  = (target_type = 'page')
WHERE dismissed_at IS NULL
  AND target_url LIKE '/blog/%';

UPDATE public.ai_insights
SET target_url = '/admin/analytics',
    action     = 'view_analytics',
    actionable = true
WHERE generated_by = 'rule'
  AND dismissed_at IS NULL
  AND (target_url IS NULL OR target_url = '/contact');
