-- The posts_status_check constraint was missing 'failed' and 'partial' statuses.
-- The publish route sets these when platform delivery fails, causing status updates
-- to violate the constraint and leaving posts permanently stuck as 'scheduled'.

ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;

ALTER TABLE posts ADD CONSTRAINT posts_status_check
  CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'partial', 'pending_approval'));
