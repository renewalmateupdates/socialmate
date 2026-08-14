-- posts.metadata — provenance for generated posts.
--
-- Five call sites write it and one reads it, but the column has never existed,
-- so every one of those inserts was rejected outright:
--
--   app/api/soma/generate       source, ingestion_id, day, slot
--   lib/inngest.ts (autopilot)  source, project_id, ingestion_id, day, slot,
--                               content_type
--   lib/inngest.ts (full send)  project_id, auto
--   app/soma/dashboard          skip_reason, on the skip action
--
-- Added rather than stripped from the payloads, because this is the only record
-- of which SOMA project and which run produced a given post. Without it there
-- is no way to answer "where did this post come from", which is exactly the
-- question that comes up when a generated post is wrong.
--
-- Nullable with no default: posts created by hand legitimately have no
-- provenance, and NULL says that more honestly than an empty object.

ALTER TABLE posts ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Supports "everything this SOMA project generated", the read that makes the
-- column worth having. GIN over jsonb keeps it useful for the other keys too.
CREATE INDEX IF NOT EXISTS posts_metadata_idx ON posts USING GIN (metadata);
