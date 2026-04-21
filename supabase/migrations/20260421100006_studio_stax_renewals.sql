-- Studio Stax renewal email timestamp columns
-- Adds timestamptz variants alongside the existing boolean columns.
-- The Inngest cron uses these for idempotency (when was the email last sent).
-- The legacy CRON_SECRET route still uses the boolean columns.

ALTER TABLE studio_stax_slots
  ADD COLUMN IF NOT EXISTS renewal_email_30_sent_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS renewal_email_14_sent_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS renewal_email_7_sent_at  timestamptz DEFAULT NULL;

-- Also add renewal_token and renewal_token_expires if not present
-- (used by the renew page token-auth flow).
ALTER TABLE studio_stax_slots
  ADD COLUMN IF NOT EXISTS renewal_token         text UNIQUE,
  ADD COLUMN IF NOT EXISTS renewal_token_expires timestamptz;

CREATE INDEX IF NOT EXISTS idx_stax_slots_renewal_token
  ON studio_stax_slots(renewal_token)
  WHERE renewal_token IS NOT NULL;
