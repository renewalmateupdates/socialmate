-- Admin VIP promo codes table
CREATE TABLE IF NOT EXISTS admin_promo_codes (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code             text        NOT NULL UNIQUE,
  label            text        NOT NULL,
  discount_pct     integer     NOT NULL CHECK (discount_pct BETWEEN 1 AND 100),
  duration         text        NOT NULL CHECK (duration IN ('forever', 'once', 'repeating')),
  duration_months  integer,
  max_redemptions  integer,
  stripe_coupon_id text,
  stripe_promo_id  text,
  note             text,
  active           boolean     NOT NULL DEFAULT true,
  created_by       text        NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Only service role can read/write; no public access
ALTER TABLE admin_promo_codes ENABLE ROW LEVEL SECURITY;

-- Set is_admin = true for the admin account
-- (ensures all admin routes work regardless of env var fallback)
UPDATE user_settings
SET    is_admin = true
WHERE  email    = 'socialmatehq@gmail.com';
