-- A TikTok publish lives only in tiktok_posts, invisible to the main posts
-- table -- which every admin dashboard, the funnel Ground Truth, Queue,
-- Calendar, Analytics, and the shared monthly post quota all read from
-- instead. This column links a tiktok_posts row to the mirrored row that
-- gets created in posts once it actually publishes, so a duplicate is never
-- created on a re-check (status poll, Inngest retry).
ALTER TABLE tiktok_posts ADD COLUMN IF NOT EXISTS synced_post_id UUID REFERENCES posts(id) ON DELETE SET NULL;
