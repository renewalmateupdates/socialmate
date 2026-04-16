-- Studio Stax analytics: daily aggregated view/click counters per listing.
-- One row per (listing_id, stat_date) — counters incremented atomically via
-- helper functions called by API routes (service role, no RLS needed).

create table if not exists stax_daily_stats (
  id          uuid    primary key default gen_random_uuid(),
  listing_id  uuid    not null references curated_listings(id) on delete cascade,
  stat_date   date    not null default current_date,
  views       integer not null default 0,
  clicks      integer not null default 0,
  unique (listing_id, stat_date)
);

create index if not exists idx_stax_daily_stats_listing_date
  on stax_daily_stats (listing_id, stat_date desc);

-- ── Atomic increment helpers ──────────────────────────────────────────────────

-- Increment click counter for one listing on a given date.
create or replace function increment_stax_click(
  p_listing_id uuid,
  p_date       date
) returns void language sql security definer as $$
  insert into stax_daily_stats (listing_id, stat_date, clicks, views)
  values (p_listing_id, p_date, 1, 0)
  on conflict (listing_id, stat_date)
  do update set clicks = stax_daily_stats.clicks + 1;
$$;

-- Bulk-increment view counters for multiple listings on a given date.
create or replace function increment_stax_views(
  p_listing_ids uuid[],
  p_date        date
) returns void language sql security definer as $$
  insert into stax_daily_stats (listing_id, stat_date, views, clicks)
  select unnest(p_listing_ids), p_date, 1, 0
  on conflict (listing_id, stat_date)
  do update set views = stax_daily_stats.views + 1;
$$;
