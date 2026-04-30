-- Caption Agent settings
CREATE TABLE IF NOT EXISTS caption_agent_settings (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid        REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled      boolean     DEFAULT false,
  feed_urls    jsonb       DEFAULT '[]',
  platforms    jsonb       DEFAULT '[]',
  max_per_day  int         DEFAULT 3,
  tone_hint    text        DEFAULT '',
  mode         text        DEFAULT 'draft',
  last_ran_at  timestamptz,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(workspace_id)
);
ALTER TABLE caption_agent_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own caption agent settings"
  ON caption_agent_settings FOR ALL USING (user_id = auth.uid());
