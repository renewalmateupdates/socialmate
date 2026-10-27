-- Campaign mode: a set of messages that rotates through chosen days and times
-- until an end date. The campaign itself holds the rules; the posts it makes
-- are ordinary rows in `posts` (metadata.source = 'campaign'), created a week
-- ahead by lib/campaign-run.ts, so Queue, Calendar and the publish pipeline
-- treat them like any other scheduled post.

CREATE TABLE IF NOT EXISTS campaigns (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id       uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  name               text NOT NULL,
  status             text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  platforms          text[] NOT NULL,
  -- Days of the week, 0 = Sunday, in the campaign's own time zone.
  days               smallint[] NOT NULL,
  -- Wall-clock times, 'HH:MM', in the campaign's own time zone.
  times              text[] NOT NULL,
  timezone           text NOT NULL,
  start_date         date NOT NULL,
  end_date           date NOT NULL,
  -- [{ "text": "...", "variants": ["..."], "image_url": "https://..." }]
  messages           jsonb NOT NULL,
  reworded           boolean NOT NULL DEFAULT false,
  -- Every slot up to here has had its post made (or was skipped on purpose).
  materialized_until timestamptz,
  -- Why the last top-up made fewer posts than it should have, for the campaign page.
  last_note          text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own campaigns" ON campaigns;
CREATE POLICY "Users manage their own campaigns" ON campaigns
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS campaigns_user_idx   ON campaigns (user_id);
CREATE INDEX IF NOT EXISTS campaigns_status_idx ON campaigns (status);
