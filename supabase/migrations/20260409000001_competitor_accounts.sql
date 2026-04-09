-- Competitor accounts table for /competitor-tracking
-- Stores up to 3 competitor handles per user (enforced in app layer)
CREATE TABLE IF NOT EXISTS competitor_accounts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       text NOT NULL,
  platform   text NOT NULL,
  handle     text NOT NULL,
  notes      text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS competitor_accounts_user_idx ON competitor_accounts(user_id);

ALTER TABLE competitor_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users manage own competitor accounts"
  ON competitor_accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
