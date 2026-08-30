-- Backfill workspaces.plan from user_settings.plan.
--
-- The Stripe webhook has only ever written user_settings.plan. Roughly twenty
-- enforcement sites read workspaces.plan instead: the connected-account cap,
-- the X quota, all eight agents, Smart Queue, SOMA, Creator monetization.
-- Nothing ever wrote it. On 2026-08-29 it was NULL for 83 of 86 rows, and the
-- only non-null values had been set by hand in SQL.
--
-- Consequence: the first paying subscriber bought Pro Annual on 2026-08-29 and
-- was still enforced as free. Within the hour they hit the free tier's
-- one-account-per-platform cap four times trying to add a second Mastodon
-- account, then spent another forty minutes bouncing between /compose and
-- /accounts. They had already paid.
--
-- The webhook now writes both (syncWorkspacePlan) and lib/plan.ts
-- resolveWorkspacePlan() falls back to user_settings when a workspace has no
-- plan of its own. This fixes the rows that already exist.

UPDATE workspaces w
SET    plan = us.plan
FROM   user_settings us
WHERE  us.user_id = w.owner_id
  AND  us.plan IS NOT NULL
  AND  (w.plan IS DISTINCT FROM us.plan);

-- Anyone with no user_settings row at all is on free by definition; make that
-- explicit rather than leaving NULL for normalizePlan() to interpret.
UPDATE workspaces SET plan = 'free' WHERE plan IS NULL;
