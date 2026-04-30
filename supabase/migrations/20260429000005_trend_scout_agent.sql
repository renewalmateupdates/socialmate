-- Trend Scout Agent settings
CREATE TABLE IF NOT EXISTS trend_scout_settings (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid        REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled      boolean     DEFAULT false,
  last_ran_at  timestamptz,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(workspace_id)
);
ALTER TABLE trend_scout_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trend scout settings"
  ON trend_scout_settings FOR ALL USING (user_id = auth.uid());

-- Trend Scout results (latest analysis per workspace)
CREATE TABLE IF NOT EXISTS trend_scout_results (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid        REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  trends       jsonb       NOT NULL DEFAULT '[]',
  generated_at timestamptz DEFAULT now()
);
ALTER TABLE trend_scout_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own trend scout results"
  ON trend_scout_results FOR ALL USING (user_id = auth.uid());
