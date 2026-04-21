-- discord_automations: unified table for Welcome, Word Filter, and Role automation configs
-- Also creates the existing discord_welcome_configs and discord_role_configs tables
-- (referenced by /api/discord/welcome and /api/discord/roles) if they haven't been created yet.

CREATE TABLE IF NOT EXISTS discord_welcome_configs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  guild_id        TEXT NOT NULL,
  channel_id      TEXT NOT NULL,
  message         TEXT NOT NULL DEFAULT 'Welcome to the server, {{username}}! 🎉',
  enabled         BOOLEAN DEFAULT true,
  last_member_id  TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, guild_id)
);

CREATE TABLE IF NOT EXISTS discord_role_configs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  guild_id   TEXT NOT NULL,
  role_id    TEXT NOT NULL,
  role_name  TEXT,
  trigger    TEXT DEFAULT 'member_join',
  enabled    BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, guild_id)
);

ALTER TABLE discord_welcome_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_role_configs    ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'discord_welcome_configs' AND policyname = 'Users manage own welcome configs'
  ) THEN
    CREATE POLICY "Users manage own welcome configs"
      ON discord_welcome_configs FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'discord_role_configs' AND policyname = 'Users manage own role configs'
  ) THEN
    CREATE POLICY "Users manage own role configs"
      ON discord_role_configs FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Unified automations table (word filter + future automation types)
CREATE TABLE IF NOT EXISTS discord_automations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guild_id        TEXT NOT NULL,
  automation_type TEXT NOT NULL,
  config          JSONB NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, guild_id, automation_type)
);

ALTER TABLE discord_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own"
  ON discord_automations FOR ALL USING (user_id = auth.uid());

-- Add metadata column to connected_accounts if it doesn't exist
ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
