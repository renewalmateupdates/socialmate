CREATE TABLE IF NOT EXISTS sm_give_allocations (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  source           text         NOT NULL CHECK (source IN ('subscription', 'donation', 'affiliate_unclaimed', 'merch')),
  gross_cents      int          NOT NULL,
  give_cents       int          NOT NULL, -- the portion going to SM-Give
  stripe_session_id text,
  user_id          uuid         REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE sm_give_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages sm_give_allocations"
  ON sm_give_allocations FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS sm_give_allocations_source ON sm_give_allocations (source);
CREATE INDEX IF NOT EXISTS sm_give_allocations_created ON sm_give_allocations (created_at DESC);
