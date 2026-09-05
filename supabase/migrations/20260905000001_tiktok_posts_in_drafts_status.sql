-- tiktok_posts.status did not allow 'in_drafts'.
--
-- The inbox upload flow (#621) settles at SEND_TO_USER_INBOX, which the app
-- records as 'in_drafts'. The CHECK constraint allowed only
-- draft/scheduled/publishing/published/failed, so every such write was rejected
-- with 23514 while the route reported the post settled. The first video ever
-- delivered to TikTok through SocialMate sat at 'publishing' because of it.
ALTER TABLE tiktok_posts DROP CONSTRAINT IF EXISTS tiktok_posts_status_check;
ALTER TABLE tiktok_posts ADD CONSTRAINT tiktok_posts_status_check
  CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'in_drafts'));
