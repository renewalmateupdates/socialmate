-- One row per TikTok upload (Nov 27, 2026). Additive: an index, no data change.
--
-- TikTok Studio resends a confirm whose answer never came back
-- (confirmTiktokUpload in lib/tiktok-upload.ts). /api/tiktok/confirm-upload
-- looks for an earlier row before inserting; this index closes the one gap
-- left, a resend that reaches the route while the first confirm is still
-- inside it. The route answers the duplicate-key error (23505) as already
-- recorded. Without the index the app still works; that race just stays open.
--
-- Checked read-only on Nov 27 before writing this: 51 rows carry a publish id
-- and none is used twice, so the index builds. NULLs (scheduled posts not yet
-- sent to TikTok) are allowed any number of times.

CREATE UNIQUE INDEX IF NOT EXISTS tiktok_posts_tiktok_post_id_key
  ON tiktok_posts (tiktok_post_id);
