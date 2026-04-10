-- Fix Enki Studio Stax listing: 'finance' is not a valid category.
-- Valid categories: social-media, content-creation, ai-tools, analytics,
--                   creator-economy, community, productivity, developer-tools
UPDATE curated_listings
SET category = 'ai-tools'
WHERE name = 'Enki' AND category = 'finance';
