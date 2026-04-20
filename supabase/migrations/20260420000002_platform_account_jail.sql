-- Platform Account Registry (Jail System)
-- Prevents the same Twitter account from being connected to multiple SocialMate users.
-- Disconnecting enters a 45-day cooling period before the account can be reconnected by anyone.

CREATE TABLE IF NOT EXISTS platform_account_registry (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform            TEXT NOT NULL,                    -- 'twitter'
  platform_account_id TEXT NOT NULL,                    -- Twitter user ID
  connected_to_user   UUID REFERENCES auth.users(id),  -- currently connected user (null if in jail/released)
  status              TEXT NOT NULL DEFAULT 'active',   -- 'active' | 'cooling' | 'released'
  disconnected_at     TIMESTAMPTZ,
  cooling_until       TIMESTAMPTZ,                      -- disconnected_at + 45 days
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(platform, platform_account_id)
);

-- RLS: users can only see their own records; admin sees all
ALTER TABLE platform_account_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own" ON platform_account_registry
  FOR SELECT USING (connected_to_user = auth.uid());

CREATE POLICY "admin_all" ON platform_account_registry
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'socialmatehq@gmail.com'
  );
