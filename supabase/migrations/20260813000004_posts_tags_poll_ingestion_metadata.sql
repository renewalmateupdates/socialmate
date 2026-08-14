-- Three columns the application has always written and the schema never had.
--
-- Verified against production by replaying each insert: with these fields the
-- write returns PGRST204, without them it returns 23503 (the deliberately fake
-- user id), meaning nothing else in the payload is wrong.
--
-- posts.tags / posts.poll_data
--   app/api/posts/create reads `tags` and `poll_data` off the request body and
--   passes them straight into both of its inserts. Neither column exists, so
--   Postgres rejected the entire row — that route has never created a post.
--   (Posts in the table came in through other paths.) The client sends this
--   data, so the columns are added rather than the fields dropped; dropping
--   them would silently discard what the user typed.
--
--   `tags` is also the column whose absence caused the calendar outage in May:
--   an explicit select naming a missing column returns an error and null data,
--   not an empty list. Adding it closes that hole for good.
--
-- soma_weekly_ingestion.metadata
--   The autopilot run inserts { project_id, auto: true } here and then reads it
--   back to answer "has this project already run today". The insert is followed
--   by `if (ingestionErr || !ingestion) throw` — so the missing column has been
--   throwing on every autopilot run, and the two dedup reads that depend on it
--   returned nothing regardless.

ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags      TEXT[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS poll_data JSONB;

ALTER TABLE soma_weekly_ingestion ADD COLUMN IF NOT EXISTS metadata JSONB;

-- The dedup read: today's ingestion rows, filtered by project id inside metadata.
CREATE INDEX IF NOT EXISTS soma_weekly_ingestion_metadata_idx
  ON soma_weekly_ingestion USING GIN (metadata);
