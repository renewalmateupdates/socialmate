-- Fix notifications table schema to match what the API route expects.
-- The original migration created `read` (boolean), but the route queries `is_read`.
-- Also adds `title` and `data` columns that the notification display logic expects.

-- Add is_read (preferred name) if not yet present
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS title   text,
  ADD COLUMN IF NOT EXISTS data    jsonb;

-- Back-fill is_read from the old `read` column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'read'
  ) THEN
    UPDATE notifications SET is_read = read WHERE is_read IS NULL;
  END IF;
END $$;

-- NOTE: we intentionally do NOT drop the old `read` or `action_url` columns here
-- to avoid losing data. The API route reads `is_read` (new) and `data->>'action_url'`
-- (new jsonb), so old columns are harmlessly ignored going forward.

-- Re-create index on is_read
DROP INDEX IF EXISTS notifications_user_unread_idx;
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON notifications(user_id, is_read, created_at DESC);
