CREATE TABLE IF NOT EXISTS agent_email_drafts (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid        REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  target_name  text        NOT NULL,
  goal         text        NOT NULL,
  subject      text        NOT NULL,
  body         text        NOT NULL,
  credits_used int         DEFAULT 5,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE agent_email_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own email drafts"
  ON agent_email_drafts FOR ALL
  USING (user_id = auth.uid());
