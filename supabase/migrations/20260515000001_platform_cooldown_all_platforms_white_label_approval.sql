-- ── Platform Account Jail: extend to all platforms ──────────────────────────
-- The platform_account_registry table already exists (created 20260420000002_platform_account_jail.sql).
-- No schema changes needed — the UNIQUE(platform, platform_account_id) constraint already
-- supports multiple platforms. The comment on the table said 'twitter' but the column is
-- generic TEXT, so it works for bluesky, mastodon, discord, telegram, and tiktok out of the box.

-- ── White Label Approval Flow ─────────────────────────────────────────────────
-- Add white_label_status and white_label_requested_at to user_settings.
-- white_label_status: NULL (never purchased) | 'pending' | 'active' | 'rejected'

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS white_label_status       TEXT         DEFAULT NULL
    CHECK (white_label_status IN ('pending', 'active', 'rejected')),
  ADD COLUMN IF NOT EXISTS white_label_requested_at TIMESTAMPTZ  DEFAULT NULL;

-- Backfill: any user who already has white_label_active=true gets status='active'
UPDATE user_settings
SET white_label_status = 'active'
WHERE white_label_active = TRUE
  AND white_label_status IS NULL;
