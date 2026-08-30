-- Two upserts that have never once succeeded.
--
-- Postgres rejects ON CONFLICT (a, b) unless a unique index covers exactly
-- those columns, raising 42P10. Supabase's .upsert(..., { onConflict: 'a,b' })
-- compiles straight to that, so an upsert whose target has no matching index
-- fails for every user, every time, forever -- and stays invisible until
-- somebody performs that exact action.
--
-- Found 2026-08-30 by scripts/audit-dead-features.py, which probes every
-- onConflict target in the codebase against the live database.

-- Browser push notifications. Shipped April 2026 (PR #190); the August sweep
-- fixed its columns (auth vs auth_key) but not this, so every subscribe has
-- 500'd since launch. Nobody has ever received a push notification from
-- SocialMate: post published, Enki signals, streak reminders, competitor
-- alerts, performance alerts, none of them.
--
-- endpoint is the browser's own subscription URL and is globally unique by
-- construction, which is why the code upserts on it alone.
CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_endpoint_key
  ON push_subscriptions (endpoint);

-- Competitor tracking. The daily sync in lib/inngest.ts upserts scraped posts
-- on (competitor_id, post_url) and has always failed, so competitor_posts is
-- empty. Everything downstream reads from it: the Growth Scout agent, Trend
-- Scout's 48-hour competitor window, and the competitorAlerts cron, which has
-- therefore never had anything to alert on.
--
-- Competitor tracking is advertised on /pricing and the landing page as
-- included on every plan, free included.
CREATE UNIQUE INDEX IF NOT EXISTS competitor_posts_competitor_url_key
  ON competitor_posts (competitor_id, post_url);
