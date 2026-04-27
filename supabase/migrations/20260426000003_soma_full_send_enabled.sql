-- Track Full Send tier purchase separately from Autopilot
ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS soma_full_send_enabled BOOLEAN DEFAULT FALSE;
