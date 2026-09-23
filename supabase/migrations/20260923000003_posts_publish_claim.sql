-- Two independent schedulers can both try to publish the same due post: the
-- GitHub Actions cron (.github/workflows/publish-scheduled.yml, every 5 min,
-- hits /api/cron/publish-scheduled) and Inngest's own publishScheduledPost.
-- The only guard between them was `if (post.published_at) return 409` in
-- /api/posts/publish -- a read-then-act check, not a lock, so both could read
-- null before either wrote and both would publish to every platform.
--
-- This column backs a real atomic claim: a conditional UPDATE that only one
-- caller's request can affect. See /api/posts/publish/route.ts.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS publish_claimed_at TIMESTAMPTZ;
