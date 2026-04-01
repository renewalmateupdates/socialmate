-- Admin Hub + Promo Code System Enhancements

-- ── affiliate_promo_codes: track original code for regeneration ────────────
ALTER TABLE affiliate_promo_codes
  ADD COLUMN IF NOT EXISTS code_template text;

-- Backfill: template = current code for all existing records
UPDATE affiliate_promo_codes
  SET code_template = code
  WHERE code_template IS NULL;

-- ── affiliates: new application fields + auto-reject support ──────────────
ALTER TABLE affiliates
  ADD COLUMN IF NOT EXISTS content_type   text,
  ADD COLUMN IF NOT EXISTS social_handles text,
  ADD COLUMN IF NOT EXISTS monthly_reach  text,
  ADD COLUMN IF NOT EXISTS engagement_rate text,
  ADD COLUMN IF NOT EXISTS can_reapply_at  timestamptz,
  ADD COLUMN IF NOT EXISTS auto_rejected   boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS meets_minimum   boolean DEFAULT false;

-- ── feedback: reply tracking ───────────────────────────────────────────────
ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS replied_at     timestamptz,
  ADD COLUMN IF NOT EXISTS reply_message  text,
  ADD COLUMN IF NOT EXISTS replied_by     text;

-- ── affiliate_conversions: tag credit pack purchases ──────────────────────
ALTER TABLE affiliate_conversions
  ADD COLUMN IF NOT EXISTS conversion_type text DEFAULT 'subscription',
  ADD COLUMN IF NOT EXISTS stripe_session_id text;
