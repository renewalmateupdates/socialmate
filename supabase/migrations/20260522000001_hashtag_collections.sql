-- Hashtag collections: add workspace_id + hashtags column if missing
-- The original migration (20260409000002) used `tags text[]`.
-- The API at /api/hashtag-collections uses `hashtags text[]`.
-- This migration adds the new columns and creates a fresh table definition
-- that matches the API. Existing rows are untouched.

-- Add workspace_id column if it doesn't exist (used by compose API)
ALTER TABLE hashtag_collections
  ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;

-- Add hashtags column (the column the API writes to)
ALTER TABLE hashtag_collections
  ADD COLUMN IF NOT EXISTS hashtags text[] NOT NULL DEFAULT '{}';

-- Back-fill hashtags from tags for any pre-existing rows
UPDATE hashtag_collections
  SET hashtags = tags
  WHERE hashtags = '{}' AND tags IS NOT NULL AND array_length(tags, 1) > 0;

-- Add updated_at column if it doesn't exist
ALTER TABLE hashtag_collections
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
