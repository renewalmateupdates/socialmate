-- Hashtag collections table for /hashtags
-- Stores named groups of hashtags synced to user's account
CREATE TABLE IF NOT EXISTS hashtag_collections (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       text NOT NULL,
  tags       text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hashtag_collections_user_idx ON hashtag_collections(user_id);

ALTER TABLE hashtag_collections ENABLE ROW LEVEL SECURITY;

-- Policy may already exist if table was previously created outside migrations
DO $$ BEGIN
  CREATE POLICY "Users manage own hashtag collections"
    ON hashtag_collections FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
