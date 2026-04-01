-- Fix existing affiliate promo codes to match correct discount structure
-- 3M: 20% → 15%, 6M: 15% → 20%, 1Y: 10% → 25%, remove WLB/WLP

-- Fix 3M codes (was 20%, should be 15%)
UPDATE affiliate_promo_codes
SET discount_value = 15,
    description    = '15% off for 3 months'
WHERE code LIKE '%3M'
  AND discount_value = 20
  AND description LIKE '%3 months%';

-- Fix 6M codes (was 15%, should be 20%)
UPDATE affiliate_promo_codes
SET discount_value = 20,
    description    = '20% off for 6 months'
WHERE code LIKE '%6M'
  AND discount_value = 15
  AND description LIKE '%6 months%';

-- Fix 1Y codes (was 10%, should be 25%)
UPDATE affiliate_promo_codes
SET discount_value = 25,
    description    = '25% off annual plan'
WHERE code LIKE '%1Y'
  AND discount_value = 10
  AND description LIKE '%annual%';

-- Remove White Label codes
DELETE FROM affiliate_promo_codes
WHERE code LIKE '%WLB' OR code LIKE '%WLP';
