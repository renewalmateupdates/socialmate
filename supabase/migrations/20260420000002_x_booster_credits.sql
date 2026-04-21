-- Add twitter_booster_balance column to user_settings
-- Tracks remaining X Booster posts purchased via one-time packs (never expire)
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS twitter_booster_balance integer NOT NULL DEFAULT 0;
