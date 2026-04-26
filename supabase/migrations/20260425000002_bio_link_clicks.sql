-- Bio link click tracking for Link in Bio analytics
CREATE TABLE IF NOT EXISTS bio_link_clicks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  link_id uuid not null,
  clicked_at timestamptz default now(),
  referrer text
);

ALTER TABLE bio_link_clicks ENABLE ROW LEVEL SECURITY;

-- Users can only read their own click data
CREATE POLICY "Users see own clicks" ON bio_link_clicks
  FOR SELECT USING (auth.uid() = user_id);

-- Public bio pages need to insert clicks without auth (fire-and-forget)
CREATE POLICY "Anyone can insert" ON bio_link_clicks
  FOR INSERT WITH CHECK (true);

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS bio_link_clicks_user_id_idx ON bio_link_clicks(user_id);
CREATE INDEX IF NOT EXISTS bio_link_clicks_link_id_idx ON bio_link_clicks(link_id);
CREATE INDEX IF NOT EXISTS bio_link_clicks_clicked_at_idx ON bio_link_clicks(clicked_at);
