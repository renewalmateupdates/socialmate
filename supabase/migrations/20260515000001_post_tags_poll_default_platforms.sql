-- Post tags: TEXT[] column for labeling posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Poll data: JSONB column for poll options + duration
ALTER TABLE posts ADD COLUMN IF NOT EXISTS poll_data JSONB DEFAULT NULL;

-- Default platforms: user_settings column to pre-select platforms in Compose
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS default_platforms TEXT[] DEFAULT '{}';
