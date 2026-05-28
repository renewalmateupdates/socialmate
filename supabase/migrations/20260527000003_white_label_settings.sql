-- ── White Label improvements ───────────────────────────────────────────────
-- Add white_label_remove_branding (Pro-only toggle to hide "Powered by SocialMate")
-- All other white label columns (active, tier, status, brand_name, logo_url,
-- custom_domain, brand_color) already exist from earlier migrations.

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS white_label_remove_branding BOOLEAN DEFAULT FALSE;
