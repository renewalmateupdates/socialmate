-- Short URL / link shortener
CREATE TABLE IF NOT EXISTS short_links (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug         text        NOT NULL UNIQUE,
  original_url text        NOT NULL,
  title        text,
  clicks       integer     NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own short links" ON short_links
  FOR ALL USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS short_links_slug_idx ON short_links (slug);
CREATE INDEX IF NOT EXISTS short_links_user_id_idx ON short_links (user_id);
