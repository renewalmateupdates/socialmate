# Workspace SQL Fixes

Run these in Supabase SQL Editor:

```sql
-- Add missing columns to workspaces table
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS default_platforms TEXT[] DEFAULT '{}';
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS is_personal BOOLEAN DEFAULT FALSE;

-- Add platform_post_ids to posts table (fixes post status bug)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS platform_post_ids JSONB DEFAULT '{}';

-- Add workspace scoping to connected_accounts
ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_connected_accounts_workspace ON connected_accounts(workspace_id);

-- Add workspace scoping to post_destinations
ALTER TABLE post_destinations ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_post_destinations_workspace ON post_destinations(workspace_id);

-- Add monthly_credits_remaining if not exists
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS monthly_credits_remaining INTEGER;
UPDATE user_settings SET monthly_credits_remaining = ai_credits_remaining WHERE monthly_credits_remaining IS NULL;

-- Add first_tour_completed for onboarding tour
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS first_tour_completed BOOLEAN DEFAULT FALSE;
```
