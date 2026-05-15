-- Studio Stax paid featured placement columns
-- Separate from admin_featured (Editor's Pick) — this is for paid spotlight placement.
-- Admin sets featured=true + featured_until=now+90d via /admin/studio-stax.
-- Public page shows featured cards first with gold border + badge.

ALTER TABLE curated_listings
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_curated_listings_featured
  ON curated_listings(featured, featured_until)
  WHERE featured = TRUE;
