-- tiktok_posts.privacy_level rejected FOLLOWER_OF_CREATOR, one of the four
-- values TikTok's own creator_info API can return in privacy_level_options and
-- that init-upload already accepts and lets a creator pick in the UI. Any
-- account offering "Followers" as an option would fail this insert with 23514
-- the instant a user picked it -- for both an immediate post (confirm-upload)
-- and, now, a scheduled one (post/route.ts).
ALTER TABLE tiktok_posts DROP CONSTRAINT IF EXISTS tiktok_posts_privacy_level_check;
ALTER TABLE tiktok_posts ADD CONSTRAINT tiktok_posts_privacy_level_check
  CHECK (privacy_level IN ('PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'FOLLOWER_OF_CREATOR', 'SELF_ONLY'));

-- Commercial content disclosure (Your Brand / Branded Content) was collected
-- in the studio and sent straight to TikTok on an immediate post, but never
-- stored anywhere -- so a scheduled post had no way to carry the same
-- disclosure through to the cron that actually publishes it later, and every
-- scheduled TikTok post would have gone out silently undisclosed.
ALTER TABLE tiktok_posts ADD COLUMN IF NOT EXISTS brand_content_toggle BOOLEAN DEFAULT false;
ALTER TABLE tiktok_posts ADD COLUMN IF NOT EXISTS brand_organic_toggle BOOLEAN DEFAULT false;
