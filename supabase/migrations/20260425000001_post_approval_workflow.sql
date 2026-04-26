-- Add approval workflow columns to posts table
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS approval_status text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS submitted_by_email text DEFAULT NULL;

-- Allow 'pending_approval' status (already in constraint from 20260420000001)
-- No change needed — constraint already includes 'pending_approval'

-- Index for fast lookup of pending posts by workspace
CREATE INDEX IF NOT EXISTS idx_posts_pending_approval
  ON posts (workspace_id, status)
  WHERE status = 'pending_approval';
