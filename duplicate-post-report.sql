-- Duplicate-post report (WS6 deliverable — READ ONLY, never deletes).
--
-- Run with a role that can SELECT blog_posts / case_studies (service_role is
-- easiest). Lists likely duplicate pairs by normalized title OR normalized
-- slug, with a suggested canonical (the older published row wins). Solomon
-- makes the content decision; this query only reports.
--
-- Normalization: lowercase, strip punctuation/whitespace runs, drop common
-- filler words, so "Regent — The Platform" and "regent the platform" compare
-- equal.

WITH norm AS (
  SELECT
    id,
    slug,
    title,
    published,
    date,
    'blog_posts' AS src,
    regexp_replace(
      lower(title),
      '[^a-z0-9]+', ' ', 'g'
    ) AS title_norm,
    regexp_replace(
      lower(slug),
      '[^a-z0-9]+', '', 'g'
    ) AS slug_norm
  FROM public.blog_posts
  UNION ALL
  SELECT
    id, slug, title, published, created_at::text,
    'case_studies',
    regexp_replace(lower(title), '[^a-z0-9]+', ' ', 'g'),
    regexp_replace(lower(slug), '[^a-z0-9]+', '', 'g')
  FROM public.case_studies
)
SELECT DISTINCT
  least(a.src || ':' || a.slug, b.src || ':' || b.slug) AS a_ref,
  greatest(a.src || ':' || a.slug, b.src || ':' || b.slug) AS b_ref,
  a.title AS a_title,
  b.title AS b_title,
  CASE WHEN a.title_norm = b.title_norm THEN 'same-title' ELSE 'near-title' END
    || CASE WHEN a.slug_norm = b.slug_norm THEN '+same-slug' ELSE '' END AS kind,
  CASE
    WHEN a.published AND b.published THEN 'both published'
    WHEN a.published THEN 'a published'
    WHEN b.published THEN 'b published'
    ELSE 'neither published'
  END AS status,
  'canonical=' || least(a.date, b.date) AS suggested_canonical
FROM norm a
JOIN norm b
  ON a.id <> b.id
 AND (a.title_norm = b.title_norm OR a.slug_norm = b.slug_norm)
ORDER BY kind, a_ref;
