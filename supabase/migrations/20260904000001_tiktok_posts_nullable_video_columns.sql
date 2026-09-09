-- Documents a schema change that was already applied by hand in the Supabase
-- SQL editor on/around Sept 4-5, 2026 (commit f61215e), never committed as a
-- migration file. Verified live via PostgREST's OpenAPI schema on Sept 9, 2026:
-- video_storage_path/video_url are absent from tiktok_posts' required columns.
--
-- FILE_UPLOAD-based TikTok posting (init-upload -> client PUT -> confirm-upload)
-- never has a Supabase-hosted video URL -- TikTok holds the bytes, we never do
-- -- so the original NOT NULL constraints on these two columns rejected every
-- confirm-upload insert from May 5, 2026 onward. The route discarded the insert
-- error and returned success anyway, so tiktok_posts silently stopped gaining
-- rows for four months while every video upload to TikTok itself kept working.

ALTER TABLE tiktok_posts ALTER COLUMN video_storage_path DROP NOT NULL;
ALTER TABLE tiktok_posts ALTER COLUMN video_url DROP NOT NULL;
