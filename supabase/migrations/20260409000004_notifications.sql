-- In-app notifications table
-- Drives the bell icon + dropdown in the sidebar
-- Notification types:
--   post_published, post_failed, credits_low, credits_exhausted,
--   team_joined, approval_needed, referral_converted, affiliate_milestone
CREATE TABLE IF NOT EXISTS notifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  type         text NOT NULL DEFAULT 'system',
  message      text NOT NULL,
  action_url   text,
  read         boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

-- Fast unread count + ordered list queries
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON notifications(user_id, read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users manage own notifications"
  ON notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
