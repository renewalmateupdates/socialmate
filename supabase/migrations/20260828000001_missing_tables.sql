-- Four tables the code has been writing to that do not exist in production.
--
-- Found 2026-08-28 by comparing every table named in a .from() call against the
-- live PostgREST schema. scripts/audit-schema-drift.py did not catch these
-- because it skipped any table it could not find — see the fix in that script,
-- committed alongside this file. A missing table is strictly worse than a
-- missing column and was the one thing the guard could not see.
--
-- Each of these is a shipped, advertised feature that has never worked:
--
--   gils_guide_subscribers  every guide email signup 500s. GuideEmailCapture is
--                           on all 14 guides. Live since May.
--   usage_events            the entire Aug 23 funnel instrumentation records
--                           nothing, /admin/usage is empty, the Twitch public
--                           clip quota is unenforced, and the reactivation
--                           route's idempotency guard cannot see who it has
--                           already emailed.
--   clip_connections        Clips Studio. Twitch and YouTube connect, list and
--                           disconnect all fail. Advertised on the landing page.
--   discord_automations     the Discord management hub's automations tab.
--
-- usage_events already had TWO migration files (20260406000003 and
-- 20260409000003) and neither was ever applied. The later one cannot be: it uses
-- `CREATE POLICY IF NOT EXISTS`, which is not valid PostgreSQL, so pasting it
-- aborts the whole transaction and the CREATE TABLE rolls back with it. That
-- file is deleted in this commit; this is the version that runs.

-- ── usage_events ───────────────────────────────────────────────────────────
-- Every writer uses the service-role client, which bypasses RLS. The policies
-- below exist for reads and for any future client-side write, not for the
-- current ones.
CREATE TABLE IF NOT EXISTS usage_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  metadata   jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Supports both the monthly quota count (user + type + month) and the funnel
-- dashboard's scan by type over a date range.
CREATE INDEX IF NOT EXISTS usage_events_user_type_idx
  ON usage_events (user_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS usage_events_type_created_idx
  ON usage_events (event_type, created_at DESC);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own usage events" ON usage_events;
CREATE POLICY "Users read own usage events"
  ON usage_events FOR SELECT USING (auth.uid() = user_id);

-- Scoped, not `with check (true)`. A permissive insert policy would let any
-- authenticated client write events attributed to anyone else.
DROP POLICY IF EXISTS "Users insert own usage events" ON usage_events;
CREATE POLICY "Users insert own usage events"
  ON usage_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── gils_guide_subscribers ─────────────────────────────────────────────────
-- Written only by the service-role client in /api/gils-guide/subscribe.
-- RLS on with no policies = nobody reads this through PostgREST. It is a list
-- of email addresses; that is the correct default.
CREATE TABLE IF NOT EXISTS gils_guide_subscribers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,   -- upsert targets onConflict: 'email'
  name          text,
  download_sent boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE gils_guide_subscribers ENABLE ROW LEVEL SECURITY;

-- ── clip_connections ───────────────────────────────────────────────────────
-- Read and written with the user's session client, so RLS is load-bearing here.
CREATE TABLE IF NOT EXISTS clip_connections (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform       text NOT NULL,          -- 'twitch' | 'youtube'
  channel_id     text NOT NULL,
  channel_name   text,
  channel_avatar text,
  access_token   text,
  refresh_token  text,
  expires_at     timestamptz,
  created_at     timestamptz DEFAULT now()
);

-- BOTH unique indexes are required, because the two callers upsert on different
-- conflict targets and Postgres needs a matching unique index for each:
--   twitch callback  -> onConflict: 'user_id,platform,channel_id'
--   youtube connect  -> onConflict: 'user_id,platform'
-- The two-column one is the tighter rule and decides the product behaviour:
-- one connected channel per platform per user, which is what /clips shows.
CREATE UNIQUE INDEX IF NOT EXISTS clip_connections_user_platform_idx
  ON clip_connections (user_id, platform);
CREATE UNIQUE INDEX IF NOT EXISTS clip_connections_user_platform_channel_idx
  ON clip_connections (user_id, platform, channel_id);

ALTER TABLE clip_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own clip connections" ON clip_connections;
CREATE POLICY "Users manage own clip connections"
  ON clip_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── discord_automations ────────────────────────────────────────────────────
-- Also session-client, also RLS-dependent.
CREATE TABLE IF NOT EXISTS discord_automations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  guild_id        text NOT NULL,
  automation_type text NOT NULL,
  config          jsonb DEFAULT '{}'::jsonb,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- Matches onConflict: 'user_id,guild_id,automation_type'
CREATE UNIQUE INDEX IF NOT EXISTS discord_automations_user_guild_type_idx
  ON discord_automations (user_id, guild_id, automation_type);

ALTER TABLE discord_automations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own discord automations" ON discord_automations;
CREATE POLICY "Users manage own discord automations"
  ON discord_automations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
