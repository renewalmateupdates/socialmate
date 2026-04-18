CREATE TABLE IF NOT EXISTS merch_waitlist (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE merch_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages merch_waitlist"
  ON merch_waitlist FOR ALL TO service_role USING (true) WITH CHECK (true);
