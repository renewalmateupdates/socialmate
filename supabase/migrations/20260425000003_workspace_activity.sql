-- Workspace activity feed
-- Tracks key actions taken by workspace members for agency oversight

CREATE TABLE IF NOT EXISTS workspace_activity (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid       NOT NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  action      text        NOT NULL,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb       DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE workspace_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members see activity" ON workspace_activity
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
    OR workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role inserts activity" ON workspace_activity
  FOR INSERT WITH CHECK (true);

-- Index for fast recent-activity queries per workspace
CREATE INDEX IF NOT EXISTS workspace_activity_workspace_id_created_at
  ON workspace_activity (workspace_id, created_at DESC);
