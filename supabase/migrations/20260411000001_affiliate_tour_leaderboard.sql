-- Add affiliate portal enhancement columns
ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS tour_completed      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS leaderboard_opt_in  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS leaderboard_anonymous boolean NOT NULL DEFAULT true;
