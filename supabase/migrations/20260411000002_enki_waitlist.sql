-- Enki early-access waitlist
CREATE TABLE IF NOT EXISTS enki_waitlist (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text,
  email         text        NOT NULL,
  tier_interest text        CHECK (tier_interest IN ('citizen', 'commander', 'emperor')),
  source        text        NOT NULL DEFAULT 'website',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS enki_waitlist_email_idx ON enki_waitlist (email);

ALTER TABLE enki_waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can join; only service role can read
CREATE POLICY "public insert waitlist"
  ON enki_waitlist FOR INSERT
  WITH CHECK (true);
