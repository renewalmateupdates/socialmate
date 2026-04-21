CREATE TABLE IF NOT EXISTS gils_guide_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  download_sent BOOLEAN DEFAULT false
);

ALTER TABLE gils_guide_subscribers ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (no user-facing RLS needed for this table)
CREATE POLICY "service_role_only" ON gils_guide_subscribers
  USING (false)
  WITH CHECK (false);
