-- Inbox Agent settings
CREATE TABLE IF NOT EXISTS inbox_agent_settings (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid        REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled      boolean     DEFAULT false,
  tone_hint    text        DEFAULT '',
  last_ran_at  timestamptz,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(workspace_id)
);
ALTER TABLE inbox_agent_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own inbox agent settings"
  ON inbox_agent_settings FOR ALL USING (user_id = auth.uid());

-- Inbox reply drafts — suggested replies for unread mentions
CREATE TABLE IF NOT EXISTS inbox_reply_drafts (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id    uuid        REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id         uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  platform        text        NOT NULL,
  mention_id      text        NOT NULL,
  mention_text    text,
  mention_author  text,
  mention_url     text,
  suggested_reply text,
  reply_metadata  jsonb       DEFAULT '{}',
  status          text        DEFAULT 'pending',
  created_at      timestamptz DEFAULT now(),
  UNIQUE(workspace_id, platform, mention_id)
);
ALTER TABLE inbox_reply_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own inbox reply drafts"
  ON inbox_reply_drafts FOR ALL USING (user_id = auth.uid());
