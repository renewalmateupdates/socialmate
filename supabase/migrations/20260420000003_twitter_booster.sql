-- Add X Booster balance to user_settings
-- This tracks purchased X post top-up credits (separate from monthly quota)
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS twitter_booster_balance INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN user_settings.twitter_booster_balance IS
  'Extra X posts purchased via one-time X Booster packs. Consumed only after monthly quota is exhausted.';
