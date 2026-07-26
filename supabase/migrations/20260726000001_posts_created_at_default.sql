-- Fix posts.created_at NULLs (Jul 26, 2026)
-- ----------------------------------------------------------------------------
-- Root cause of several undercounting bugs: the posts table was missing a
-- DEFAULT on created_at (every other table has `created_at timestamptz default
-- now()`). SOMA's generate/autopilot inserts omit created_at, so those rows land
-- as NULL. Any query that filters `.gte('created_at', ...)` silently drops NULL
-- rows, so SOMA posts were invisible to:
--   - the monthly post-limit quota (app/api/posts/create) — SOMA posts slipped past
--   - the dashboard "This Week" stat
--   - streak counting
-- (The admin "posts today/week/month" counters were fixed separately to use
--  published_at, which is the correct field for "published" counts.)
--
-- This adds the missing default so new inserts are always stamped, and backfills
-- existing NULLs from the best available timestamp. Idempotent: safe to re-run.

ALTER TABLE posts ALTER COLUMN created_at SET DEFAULT now();

UPDATE posts
SET created_at = COALESCE(scheduled_at, published_at, now())
WHERE created_at IS NULL;
