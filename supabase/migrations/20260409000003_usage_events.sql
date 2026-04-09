-- Usage events table — quota tracking for API-cost features
-- event_type examples: 'twitch_clip_lookup'
-- Quotas enforced in app layer:
--   Free:   100 twitch_clip_lookups / month
--   Pro:    1000 / month
--   Agency: unlimited
CREATE TABLE IF NOT EXISTS usage_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  metadata   jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Index supports monthly quota count queries:
-- WHERE user_id = ? AND event_type = ? AND created_at >= start_of_month
CREATE INDEX IF NOT EXISTS usage_events_user_type_idx
  ON usage_events(user_id, event_type, created_at DESC);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users read own usage events"
  ON usage_events FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users insert own usage events"
  ON usage_events FOR INSERT WITH CHECK (auth.uid() = user_id);
