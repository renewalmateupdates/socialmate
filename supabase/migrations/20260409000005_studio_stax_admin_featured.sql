-- Admin featured spots for Studio Stax
-- Allows Joshua to manually pin 3-5 "editor's picks" that always rank first
ALTER TABLE curated_listings
  ADD COLUMN IF NOT EXISTS admin_featured      boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_featured_note text;

CREATE INDEX IF NOT EXISTS curated_listings_featured_idx
  ON curated_listings(admin_featured, smgive_donated_cents DESC)
  WHERE status = 'live';
