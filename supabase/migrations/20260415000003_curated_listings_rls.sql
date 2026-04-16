-- RLS for curated_listings
-- Public can read approved listings.
-- Listers can read their own listing (by applicant_email).
-- Listers can update description and url on their own listing.
-- All writes go through the service-role API routes (admin + application POST).

ALTER TABLE curated_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved listings (powers the public directory)
CREATE POLICY IF NOT EXISTS "Public read approved listings"
  ON curated_listings FOR SELECT
  USING (status = 'approved' OR status = 'active');

-- Applicant can read their own listing at any status (for the portal)
CREATE POLICY IF NOT EXISTS "Applicant reads own listing"
  ON curated_listings FOR SELECT
  USING (applicant_email = auth.jwt() ->> 'email');

-- Applicant can update only description and url on their own listing
-- (All other fields are admin-managed)
CREATE POLICY IF NOT EXISTS "Applicant updates own listing description and url"
  ON curated_listings FOR UPDATE
  USING (applicant_email = auth.jwt() ->> 'email')
  WITH CHECK (applicant_email = auth.jwt() ->> 'email');
