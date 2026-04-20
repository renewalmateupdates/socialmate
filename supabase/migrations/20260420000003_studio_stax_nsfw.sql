-- Add NSFW labeling columns to curated_listings
ALTER TABLE curated_listings
  ADD COLUMN IF NOT EXISTS is_nsfw BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS nsfw_reason TEXT; -- optional admin note
