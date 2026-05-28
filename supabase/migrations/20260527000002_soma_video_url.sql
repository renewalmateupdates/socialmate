-- Add video URL attachment support to SOMA projects
-- Users can paste a TikTok or YouTube short video link to attach to generated posts
ALTER TABLE soma_projects ADD COLUMN IF NOT EXISTS include_video_url TEXT DEFAULT NULL;
