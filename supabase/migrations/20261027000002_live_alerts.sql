-- Go-live alerts: when a Twitch channel starts streaming, post a message to
-- the creator's connected platforms.
--
-- Twitch tells us through an EventSub webhook (app/api/twitch/eventsub); the
-- post itself is an ordinary row in `posts` (metadata.source = 'live_alert'),
-- so it goes through the normal publish pipeline and counts toward the
-- monthly cap. One Twitch subscription serves every alert on the same channel.

CREATE TABLE IF NOT EXISTS live_alerts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id    uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  twitch_user_id  text NOT NULL,
  twitch_login    text NOT NULL,
  twitch_name     text NOT NULL,
  platforms       text[] NOT NULL,
  -- {name}, {title}, {game} and {url} are filled in when the stream starts.
  template        text NOT NULL,
  enabled         boolean NOT NULL DEFAULT true,
  eventsub_id     text,
  -- One alert per stream, and none within 30 minutes of the last (a dropped
  -- stream that restarts gets a new stream id).
  last_stream_id  text,
  last_alert_at   timestamptz,
  last_error      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, twitch_user_id)
);

ALTER TABLE live_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own live alerts" ON live_alerts;
CREATE POLICY "Users manage their own live alerts" ON live_alerts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS live_alerts_broadcaster_idx ON live_alerts (twitch_user_id);
