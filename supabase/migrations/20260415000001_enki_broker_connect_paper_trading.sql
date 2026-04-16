-- Enki: Broker Connect + Paper Trading MVP
-- Adds encrypted key storage columns to enki_profiles,
-- extends enki_trades status values for paper trading,
-- adds snapshot upsert support, and aligns doctrine column names.

-- ── 1. Add encrypted broker key columns to enki_profiles ─────────────────────
alter table enki_profiles
  add column if not exists alpaca_key_id  text,       -- AES-256 encrypted
  add column if not exists alpaca_secret  text,       -- AES-256 encrypted
  add column if not exists alpaca_paper   boolean,    -- true = paper-api endpoint
  add column if not exists coinbase_key_id text,      -- AES-256 encrypted
  add column if not exists coinbase_secret text,      -- AES-256 encrypted
  add column if not exists risk_preset    text default 'balanced'
    check (risk_preset in ('conservative', 'balanced', 'aggressive'));

-- ── 2. Extend enki_trades status to support paper trading states ──────────────
-- Drop the existing status constraint and replace with an expanded one
alter table enki_trades
  drop constraint if exists enki_trades_status_check;

alter table enki_trades
  add constraint enki_trades_status_check
    check (status in ('executed', 'filled', 'pending', 'pending_approval', 'cancelled', 'failed'));

-- Add executed_at column for paper trades (tracks when signal fired)
alter table enki_trades
  add column if not exists executed_at timestamptz;

-- ── 3. Add unique constraint to enki_snapshots for upsert support ─────────────
-- The paper trading scan uses upsert on (user_id, broker, snapshot_date)
-- Only add if it doesn't already exist
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'enki_snapshots_user_broker_date_key'
  ) then
    alter table enki_snapshots
      add constraint enki_snapshots_user_broker_date_key
        unique (user_id, broker, snapshot_date);
  end if;
end
$$;

-- Add updated_at to enki_snapshots for upsert tracking
alter table enki_snapshots
  add column if not exists updated_at timestamptz default now();

-- ── 4. Service role needs to insert paper trades (Inngest runs as service role)
-- The existing insert policy only allows auth.uid() = user_id, which won't work
-- for server-side Inngest jobs using the service role key.
-- Service role bypasses RLS by default — no policy change needed.
-- Just document: Inngest paper scan uses getSupabaseAdmin() which uses service role.

-- ── 5. Index for paper trade lookups ─────────────────────────────────────────
create index if not exists idx_enki_trades_broker_status
  on enki_trades(user_id, broker, status);

-- ── 6. Note on doctrines ─────────────────────────────────────────────────────
-- enki_doctrines uses 'is_active' (not 'active'). The paper trading scan
-- queries .eq('is_active', true) — no schema change needed here.
