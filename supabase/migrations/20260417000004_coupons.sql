-- ─────────────────────────────────────────────────────────────────────────────
-- Coupon + Partner Attribution System
-- Additive only — does not touch any existing table or policy.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coupons (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  code                 text         NOT NULL,
  affiliate_id         uuid         REFERENCES affiliates(id) ON DELETE SET NULL,
  discount_type        text         NOT NULL CHECK (discount_type IN ('percent', 'fixed', 'trial_extension')),
  discount_value       numeric(10,2) NOT NULL,
  max_redemptions      int,
  current_redemptions  int          NOT NULL DEFAULT 0,
  expires_at           timestamptz,
  stripe_coupon_id     text,        -- Stripe coupon object ID
  stripe_promo_id      text,        -- Stripe promotion code ID
  active               boolean      NOT NULL DEFAULT true,
  note                 text,
  created_at           timestamptz  NOT NULL DEFAULT now()
);

-- Case-insensitive unique index so SAVE20 == save20
CREATE UNIQUE INDEX IF NOT EXISTS coupons_code_lower_idx ON coupons (LOWER(code));

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages coupons"
  ON coupons FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id                      uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id               uuid         NOT NULL REFERENCES coupons(id),
  user_id                 uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  redeemed_at             timestamptz  NOT NULL DEFAULT now()
);

-- One redemption per user per coupon — prevents double-dipping
CREATE UNIQUE INDEX IF NOT EXISTS coupon_redemptions_unique
  ON coupon_redemptions (coupon_id, user_id);

ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages coupon_redemptions"
  ON coupon_redemptions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS coupon_redemptions_coupon_id
  ON coupon_redemptions (coupon_id);

-- ── Atomic counter increment — called at checkout session creation ─────────
CREATE OR REPLACE FUNCTION increment_coupon_redemptions(coupon_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE coupons
  SET current_redemptions = current_redemptions + 1
  WHERE id = coupon_id;
$$;
