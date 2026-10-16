-- Far-end delivery checks (lib/inngest-delivery-check.ts).
-- One row per published post and platform: whether the platform itself says
-- the post is live. Written nightly by the service role; nothing else reads it.
CREATE TABLE IF NOT EXISTS delivery_checks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  platform    text        NOT NULL,
  remote_id   text        NOT NULL,
  result      text        NOT NULL CHECK (result IN ('live', 'missing', 'unknown')),
  checked_at  timestamptz NOT NULL DEFAULT now()
);

-- The job upserts on (post_id, platform); without this index every upsert fails.
CREATE UNIQUE INDEX IF NOT EXISTS delivery_checks_post_platform_key
  ON delivery_checks (post_id, platform);
CREATE INDEX IF NOT EXISTS delivery_checks_checked_at_idx
  ON delivery_checks (checked_at);

-- RLS on with no policies: only the service role can read or write it.
ALTER TABLE delivery_checks ENABLE ROW LEVEL SECURITY;
