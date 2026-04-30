-- Repurpose Agent settings
CREATE TABLE IF NOT EXISTS repurpose_settings (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid        REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled      boolean     DEFAULT false,
  formats      jsonb       DEFAULT '["thread","caption"]',
  mode         text        DEFAULT 'draft',
  last_ran_at  timestamptz,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(workspace_id)
);
ALTER TABLE repurpose_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own repurpose settings"
  ON repurpose_settings FOR ALL USING (user_id = auth.uid());
