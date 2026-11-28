-- TikTok pack (Nov 28, 2026; lib/tiktok-pack.ts).
--
-- Marks a scheduled TikTok video that took a pack video instead of one of the
-- month's, so cancelling it, or TikTok refusing it when it is sent, gives the
-- pack video back. Additive: one column with a default. The pack balance itself
-- already lives in workspaces.tiktok_booster_credits (added May 2026, unused
-- until now).
--
-- Run before the pack goes live. /api/tiktok/post names this column only for a
-- video that uses a pack, so until it exists, scheduling with a pack fails and
-- everything else works as before. The cancel route and the scheduled-send
-- failure step read it with select('*'), so they don't depend on it.
ALTER TABLE tiktok_posts
  ADD COLUMN IF NOT EXISTS used_pack_video boolean NOT NULL DEFAULT false;

-- Check (one row):
-- SELECT column_name, data_type, column_default
--   FROM information_schema.columns
--  WHERE table_name = 'tiktok_posts' AND column_name = 'used_pack_video';
