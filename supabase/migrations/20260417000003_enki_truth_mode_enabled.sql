-- Add truth_mode_enabled flag to enki_profiles.
-- Truth Mode is opt-in per user (default off).
ALTER TABLE enki_profiles
  ADD COLUMN IF NOT EXISTS truth_mode_enabled boolean NOT NULL DEFAULT false;
