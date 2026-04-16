-- Add columns referenced by the admin panel UI and admin API route
-- but missing from curated_listings.
-- These were introduced in code but never migrated.

ALTER TABLE curated_listings
  ADD COLUMN IF NOT EXISTS free_until    timestamptz,   -- set when admin grants a free listing
  ADD COLUMN IF NOT EXISTS renewal_date  timestamptz,   -- when the listing is due for renewal
  ADD COLUMN IF NOT EXISTS plan_tier     text;          -- 'founding' | 'standard'

-- Populate renewal_date from studio_stax_slots for existing active listings
-- (best-effort; new listings will be set on Stripe webhook)
UPDATE curated_listings cl
SET renewal_date = s.expires_at
FROM studio_stax_slots s
WHERE s.listing_id = cl.id
  AND s.status = 'active'
  AND cl.renewal_date IS NULL;

-- Populate plan_tier from studio_stax_slots for existing active listings
UPDATE curated_listings cl
SET plan_tier = s.tier
FROM studio_stax_slots s
WHERE s.listing_id = cl.id
  AND s.status = 'active'
  AND cl.plan_tier IS NULL;
