-- Evergreen recycling: the two columns the rotation logic needs.
--
-- evergreenRecycler has never recycled a post. Two reasons, both silent.
--
-- The flag column is `evergreen`; every caller said `is_evergreen`. The very
-- first query in the cron filters on it, so it returned a 400, `candidates`
-- came back null, and the next line is:
--
--     if (!candidates?.length) return { recycled: 0, checked: 0 }
--
-- which is a clean, plausible-looking "nothing to do". The daily 6am cron has
-- reported success while doing nothing since the day it shipped. That half is
-- fixed in code.
--
-- The other half is these two columns, which genuinely do not exist. They are
-- what stops a post being recycled twice in the same week: the cron picks the
-- least-recently-queued evergreen post via
--
--     .or(evergreen_last_queued_at.is.null,evergreen_last_queued_at.lt.<7d ago>)
--     .order(evergreen_last_queued_at, nullsFirst)
--
-- and then stamps the winner. Without them there is no rotation at all, so the
-- same post would be re-queued every single day.
--
-- NULL is meaningful: it means "never queued", which sorts first. So no
-- backfill and no default on evergreen_last_queued_at.

ALTER TABLE posts ADD COLUMN IF NOT EXISTS evergreen_last_queued_at TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS evergreen_queue_count    INTEGER DEFAULT 0;

-- The cron's hot path: evergreen posts for one user, oldest-queued first.
CREATE INDEX IF NOT EXISTS posts_evergreen_rotation_idx
  ON posts (user_id, evergreen_last_queued_at)
  WHERE evergreen = true;
