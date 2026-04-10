-- Enki Empire Tables
-- Creates all tables needed for the Enki treasury guardian platform.
-- Designed for the Gilgamesh Empire OS ecosystem with Phase 2 Command readiness.
--
-- Tables:
--   enki_profiles        — per-user Enki settings and tier
--   enki_doctrines       — user trading strategies
--   enki_trades          — normalized trade ledger across all brokers
--   enki_snapshots       — daily P&L snapshots per broker
--   enki_leaderboard     — public proof layer (% only, no dollar amounts)
--   enki_pdt_records     — PDT rule tracking
--   enki_trailing_stops  — trailing stop state per symbol
--   enki_notifications   — conquest alerts, guard triggers, system messages
--   enki_cloud_runners   — Cloud Runner worker registry
--   empire_events        — unified event bus for Gilgamesh Command (Phase 2)

-- ── enki_profiles ────────────────────────────────────────────────────────────
create table if not exists enki_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid unique not null references auth.users(id) on delete cascade,
  tier            text not null default 'citizen'
                    check (tier in ('citizen', 'commander', 'emperor')),
  cloud_runner    boolean default false,
  alpha_packs     text[] default '{}',
  guardian_mode   text default 'approval'
                    check (guardian_mode in ('approval', 'autonomous', 'dormant')),
  alpaca_connected    boolean default false,
  coinbase_connected  boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table enki_profiles enable row level security;

create policy "Users can view own enki profile"
  on enki_profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own enki profile"
  on enki_profiles for update
  using (auth.uid() = user_id);

create policy "Users can insert own enki profile"
  on enki_profiles for insert
  with check (auth.uid() = user_id);

-- ── enki_doctrines ───────────────────────────────────────────────────────────
create table if not exists enki_doctrines (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  description     text,
  config          jsonb not null default '{}',
  -- config shape:
  --   symbols[], max_positions, stop_loss_pct, take_profit_pct,
  --   trailing_stop, compound_mode, asset_class, broker,
  --   sector_limit_pct, max_daily_drawdown_pct, doctrine_pack
  is_active       boolean default true,
  is_public       boolean default false,
  is_template     boolean default false,
  backtest_result jsonb,
  copies_count    int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table enki_doctrines enable row level security;

create policy "Users can manage own doctrines"
  on enki_doctrines for all
  using (auth.uid() = user_id);

create policy "Public can view public doctrines"
  on enki_doctrines for select
  using (is_public = true);

-- ── enki_trades ──────────────────────────────────────────────────────────────
create table if not exists enki_trades (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  doctrine_id     uuid references enki_doctrines(id),
  broker          text not null check (broker in ('alpaca', 'coinbase', 'paper')),
  symbol          text not null,
  side            text not null check (side in ('buy', 'sell')),
  qty             numeric(20, 8) not null,
  price           numeric(20, 8) not null,
  reason          text,
  signals_json    jsonb,
  confidence      numeric(4, 2),
  paper           boolean default false,
  broker_order_id text,
  status          text default 'executed'
                    check (status in ('executed', 'pending', 'cancelled', 'failed')),
  created_at      timestamptz default now()
);

alter table enki_trades enable row level security;

create policy "Users can view own trades"
  on enki_trades for select
  using (auth.uid() = user_id);

create policy "Users can insert own trades"
  on enki_trades for insert
  with check (auth.uid() = user_id);

create index if not exists idx_enki_trades_user_created
  on enki_trades(user_id, created_at desc);

create index if not exists idx_enki_trades_symbol
  on enki_trades(symbol);

-- ── enki_snapshots ───────────────────────────────────────────────────────────
create table if not exists enki_snapshots (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  broker          text not null,
  cash            numeric(20, 2),
  equity          numeric(20, 2),
  portfolio_value numeric(20, 2),
  daily_pnl       numeric(20, 2),
  total_pnl       numeric(20, 2),
  open_positions  int default 0,
  snapshot_date   date default current_date,
  created_at      timestamptz default now()
);

alter table enki_snapshots enable row level security;

create policy "Users can view own snapshots"
  on enki_snapshots for select
  using (auth.uid() = user_id);

create policy "Users can insert own snapshots"
  on enki_snapshots for insert
  with check (auth.uid() = user_id);

create index if not exists idx_enki_snapshots_user_date
  on enki_snapshots(user_id, snapshot_date desc);

-- ── enki_leaderboard ─────────────────────────────────────────────────────────
-- Public proof layer — shows % P&L only, never dollar amounts or positions.
create table if not exists enki_leaderboard (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid unique not null references auth.users(id) on delete cascade,
  display_name    text not null,
  avatar_url      text,
  tier            text not null default 'citizen',
  trading_mode    text not null default 'paper'
                    check (trading_mode in ('paper', 'live')),
  total_pnl_pct   numeric(8, 2) default 0,    -- % only, NEVER dollar amount
  conquest_streak int default 0,
  best_streak     int default 0,
  total_trades    int default 0,
  win_rate        numeric(5, 2) default 0,
  doctrine_rank   text default 'Initiate',
  -- Initiate → Trader → Conqueror → Warlord → Emperor → Mythic Architect
  badges          text[] default '{}',
  is_visible      boolean default true,
  updated_at      timestamptz default now()
);

alter table enki_leaderboard enable row level security;

-- Public can read leaderboard entries where visible
create policy "Public can view visible leaderboard entries"
  on enki_leaderboard for select
  using (is_visible = true);

-- Users can update their own entry
create policy "Users can update own leaderboard entry"
  on enki_leaderboard for all
  using (auth.uid() = user_id);

create index if not exists idx_enki_leaderboard_pnl
  on enki_leaderboard(total_pnl_pct desc)
  where is_visible = true;

-- ── enki_pdt_records ─────────────────────────────────────────────────────────
create table if not exists enki_pdt_records (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  symbol          text not null,
  traded_at       timestamptz default now(),
  week_start      date not null   -- ISO week Monday
);

alter table enki_pdt_records enable row level security;

create policy "Users can manage own PDT records"
  on enki_pdt_records for all
  using (auth.uid() = user_id);

create index if not exists idx_enki_pdt_user_week
  on enki_pdt_records(user_id, week_start);

-- ── enki_trailing_stops ──────────────────────────────────────────────────────
create table if not exists enki_trailing_stops (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  broker          text not null,
  symbol          text not null,
  highest_price   numeric(20, 8) not null,
  stop_pct        numeric(5, 2) default 5.0,
  updated_at      timestamptz default now(),
  unique(user_id, broker, symbol)
);

alter table enki_trailing_stops enable row level security;

create policy "Users can manage own trailing stops"
  on enki_trailing_stops for all
  using (auth.uid() = user_id);

-- ── enki_notifications ───────────────────────────────────────────────────────
create table if not exists enki_notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  type            text not null,
  -- e.g. 'conquest_alert', 'fortress_trigger', 'trade_executed', 'trailing_stop'
  title           text,
  message         text,
  data            jsonb default '{}',
  is_read         boolean default false,
  created_at      timestamptz default now()
);

alter table enki_notifications enable row level security;

create policy "Users can manage own enki notifications"
  on enki_notifications for all
  using (auth.uid() = user_id);

create index if not exists idx_enki_notifications_user_created
  on enki_notifications(user_id, created_at desc);

-- ── enki_cloud_runners ───────────────────────────────────────────────────────
create table if not exists enki_cloud_runners (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid unique not null references auth.users(id) on delete cascade,
  worker_id       text unique,
  region          text default 'us-east-1',
  status          text default 'provisioning'
                    check (status in ('provisioning', 'active', 'stopped', 'error')),
  last_heartbeat  timestamptz,
  last_trade_at   timestamptz,
  restart_count   int default 0,
  provisioned_at  timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table enki_cloud_runners enable row level security;

create policy "Users can view own cloud runner"
  on enki_cloud_runners for select
  using (auth.uid() = user_id);

-- ── empire_events (Phase 2 — Gilgamesh Command readiness) ───────────────────
-- All Gilgamesh products emit events here.
-- Gilgamesh Command will consume these to render the unified empire dashboard.
create table if not exists empire_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  product         text not null
                    check (product in ('enki', 'socialmate', 'renewalmate', 'studio_stax', 'command')),
  event_type      text not null,
  -- e.g. 'trade_executed', 'post_published', 'subscription_started', 'pnl_update'
  payload         jsonb not null default '{}',
  created_at      timestamptz default now()
);

-- Service role inserts events; users can only read their own
alter table empire_events enable row level security;

create policy "Users can view own empire events"
  on empire_events for select
  using (auth.uid() = user_id);

create index if not exists idx_empire_events_user_product
  on empire_events(user_id, product);

create index if not exists idx_empire_events_created
  on empire_events(created_at desc);
