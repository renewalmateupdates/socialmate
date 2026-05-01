-- TikTok posts table
CREATE TABLE IF NOT EXISTS tiktok_posts (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id            UUID,
  video_storage_path      TEXT NOT NULL,
  video_url               TEXT NOT NULL,
  video_size_bytes        BIGINT,
  video_duration_seconds  NUMERIC,
  post_caption            TEXT DEFAULT '',
  hashtags                TEXT[] DEFAULT '{}',
  caption_overlay         TEXT DEFAULT '',
  caption_position        TEXT DEFAULT 'bottom',
  caption_color           TEXT DEFAULT '#ffffff',
  active_filter           TEXT DEFAULT 'None',
  sound_id                TEXT,
  sound_name              TEXT,
  privacy_level           TEXT NOT NULL DEFAULT 'PUBLIC_TO_EVERYONE'
    CHECK (privacy_level IN ('PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY')),
  disable_duet            BOOLEAN DEFAULT false,
  disable_comment         BOOLEAN DEFAULT false,
  disable_stitch          BOOLEAN DEFAULT false,
  scheduled_at            TIMESTAMPTZ,
  status                  TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed')),
  tiktok_post_id          TEXT,
  tiktok_account_open_id  TEXT,
  error_message           TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tiktok_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tiktok posts"
  ON tiktok_posts FOR ALL
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_tiktok_posts_user_status
  ON tiktok_posts(user_id, status);

CREATE INDEX IF NOT EXISTS idx_tiktok_posts_scheduled
  ON tiktok_posts(scheduled_at)
  WHERE status = 'scheduled';

-- TikTok quota columns on workspaces
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS tiktok_videos_this_month INTEGER DEFAULT 0;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS tiktok_booster_credits   INTEGER DEFAULT 0;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS tiktok_quota_reset_at    DATE    DEFAULT CURRENT_DATE;
