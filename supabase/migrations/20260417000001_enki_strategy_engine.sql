-- ─────────────────────────────────────────────────────────────────────────────
-- Enki Strategy Engine — DB Schema
-- Phase 1-8: multi-strategy hedge fund OS tables
-- ─────────────────────────────────────────────────────────────────────────────

-- Strategy performance tracking (rolling, per user per strategy)
-- One row per user per strategy per broker. Upserted on every trade close.
CREATE TABLE IF NOT EXISTS enki_strategy_performance (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy             text         NOT NULL CHECK (strategy IN ('momentum','mean_reversion','sentiment','volatility')),
  broker               text         NOT NULL DEFAULT 'paper',
  trade_count          int          NOT NULL DEFAULT 0,
  win_count            int          NOT NULL DEFAULT 0,
  total_pnl_pct        numeric(10,4) NOT NULL DEFAULT 0,
  rolling_sharpe       numeric(8,4),                   -- current rolling 30-period Sharpe
  rolling_sharpe_peak  numeric(8,4) NOT NULL DEFAULT 0, -- highest ever Sharpe (watermark)
  decay_score          numeric(4,3) NOT NULL DEFAULT 0, -- 0=healthy, 1=fully decayed
  is_disabled          boolean      NOT NULL DEFAULT false,
  disabled_until       timestamptz,
  updated_at           timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (user_id, strategy, broker)
);

ALTER TABLE enki_strategy_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own strategy performance"
  ON enki_strategy_performance FOR SELECT
  USING (auth.uid() = user_id);

-- Admin/Inngest service role can write
CREATE POLICY "Service role manages strategy performance"
  ON enki_strategy_performance FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────

-- Dynamic strategy capital weight vector (per user per broker)
-- Adjusted by decay system and performance history.
CREATE TABLE IF NOT EXISTS enki_capital_weights (
  id                    uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker                text         NOT NULL DEFAULT 'paper',
  momentum_weight       numeric(5,4) NOT NULL DEFAULT 0.3500,
  mean_reversion_weight numeric(5,4) NOT NULL DEFAULT 0.3000,
  sentiment_weight      numeric(5,4) NOT NULL DEFAULT 0.2000,
  volatility_weight     numeric(5,4) NOT NULL DEFAULT 0.1500,
  last_rebalanced_at    timestamptz  NOT NULL DEFAULT now(),
  updated_at            timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (user_id, broker)
);

ALTER TABLE enki_capital_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own capital weights"
  ON enki_capital_weights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages capital weights"
  ON enki_capital_weights FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────

-- Alpha decay events audit log
-- Records every decay detection event and the action taken.
CREATE TABLE IF NOT EXISTS enki_decay_events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy     text        NOT NULL,
  event_type   text        NOT NULL,  -- 'sharpe_decay' | 'winrate_decay' | 'regime_mismatch' | 'emergency'
  action_taken text        NOT NULL,  -- 'reduce_allocation' | 'disable_strategy' | 'emergency_halt'
  details      jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE enki_decay_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own decay events"
  ON enki_decay_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages decay events"
  ON enki_decay_events FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS enki_decay_events_user_created
  ON enki_decay_events (user_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────

-- Signal attribution log (Phase 7: self-improving feedback)
-- Tracks which strategies were active when each trade was opened,
-- so P&L can be attributed back to them on close.
CREATE TABLE IF NOT EXISTS enki_signal_attribution (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id      uuid         REFERENCES enki_trades(id) ON DELETE SET NULL,
  symbol        text         NOT NULL,
  broker        text         NOT NULL DEFAULT 'paper',
  strategy      text         NOT NULL,
  side          text         NOT NULL,
  confidence    int          NOT NULL,  -- 0–100 strategy-level confidence when trade opened
  fused_confidence int       NOT NULL,  -- 0–100 fused engine confidence
  pnl_pct       numeric(10,4),          -- filled on close
  win           boolean,                -- filled on close
  opened_at     timestamptz  NOT NULL DEFAULT now(),
  closed_at     timestamptz
);

ALTER TABLE enki_signal_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own signal attribution"
  ON enki_signal_attribution FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages signal attribution"
  ON enki_signal_attribution FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS enki_signal_attribution_user_symbol
  ON enki_signal_attribution (user_id, symbol, opened_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────

-- Add strategy_breakdown column to enki_trades for Phase 7 attribution
-- Stores the full strategy engine breakdown at time of trade entry.
ALTER TABLE enki_trades
  ADD COLUMN IF NOT EXISTS strategy_breakdown jsonb;
