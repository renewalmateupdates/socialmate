-- Add x_booster_credits column to user_settings
-- Tracks remaining X Booster posts purchased via one-time packs (never expire)
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS x_booster_credits integer NOT NULL DEFAULT 0;
