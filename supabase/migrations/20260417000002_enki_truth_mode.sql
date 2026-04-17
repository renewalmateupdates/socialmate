-- ─────────────────────────────────────────────────────────────────────────────
-- Enki Truth Mode — DB Schema
-- Parallel validation system for testing real edge existence.
-- Two strategies only: momentum, mean_reversion.
-- Minimum 50 trades per strategy before drawing conclusions.
-- ─────────────────────────────────────────────────────────────────────────────

-- Full trade log — one row per position, updated in place as it evolves.
CREATE TABLE IF NOT EXISTS enki_truth_trades (
  id                    uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity
  symbol                text         NOT NULL,
  strategy              text         NOT NULL CHECK (strategy IN ('momentum','mean_reversion')),
  confidence            text         NOT NULL CHECK (confidence IN ('MEDIUM','HIGH')),
  congressional_boost   boolean      NOT NULL DEFAULT false,

  -- Indicators at entry (for post-hoc analysis)
  adx_at_entry          numeric(8,4),
  rsi_at_entry          numeric(8,4),
  atr_at_entry          numeric(8,4) NOT NULL,
  spy_price_at_entry    numeric(12,4),

  -- Entry
  entry_price           numeric(12,4) NOT NULL,
  entry_time            timestamptz   NOT NULL DEFAULT now(),
  qty                   numeric(12,4) NOT NULL,
  remaining_qty         numeric(12,4) NOT NULL,
  position_size_pct     numeric(6,3)  NOT NULL,
  position_usd          numeric(12,4) NOT NULL,
  kelly_pct_used        numeric(6,3),

  -- Exit levels
  stop_price            numeric(12,4) NOT NULL,
  highest_price_seen    numeric(12,4) NOT NULL,
  tp1_price             numeric(12,4) NOT NULL,
  tp2_price             numeric(12,4) NOT NULL,

  -- TP1 partial exit (sells 33% of position)
  tp1_hit               boolean      NOT NULL DEFAULT false,
  tp1_exit_price        numeric(12,4),
  tp1_exit_time         timestamptz,

  -- TP2 partial exit (sells another 33%)
  tp2_hit               boolean      NOT NULL DEFAULT false,
  tp2_exit_price        numeric(12,4),
  tp2_exit_time         timestamptz,

  -- Final exit
  exit_price            numeric(12,4),
  exit_time             timestamptz,
  exit_reason           text,        -- 'stop_loss' | 'trailing_stop' | 'tp1_only' | 'tp2_only' | 'full_tp' | 'manual' | 'eod'
  stop_loss_hit         boolean      NOT NULL DEFAULT false,
  trailing_stop_hit     boolean      NOT NULL DEFAULT false,

  -- P&L (computed on close)
  pnl_dollar            numeric(12,4),
  pnl_pct               numeric(10,4),
  win                   boolean,

  -- Status
  is_open               boolean      NOT NULL DEFAULT true,
  created_at            timestamptz  NOT NULL DEFAULT now(),
  updated_at            timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE enki_truth_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own truth trades"
  ON enki_truth_trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages truth trades"
  ON enki_truth_trades FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS enki_truth_trades_user_open
  ON enki_truth_trades (user_id, is_open, entry_time DESC);

CREATE INDEX IF NOT EXISTS enki_truth_trades_user_strategy
  ON enki_truth_trades (user_id, strategy, entry_time DESC);

-- ─────────────────────────────────────────────────────────────────────────────

-- Aggregated stats per user per strategy.
-- Upserted after every trade close. Keeps current snapshot for dashboard.
CREATE TABLE IF NOT EXISTS enki_truth_strategy_stats (
  id                    uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy              text         NOT NULL CHECK (strategy IN ('momentum','mean_reversion')),

  -- Sample size
  total_trades          int          NOT NULL DEFAULT 0,
  wins                  int          NOT NULL DEFAULT 0,
  losses                int          NOT NULL DEFAULT 0,
  win_rate              numeric(6,4) NOT NULL DEFAULT 0,  -- 0.0 to 1.0

  -- P&L summary
  gross_win_pct         numeric(10,4) NOT NULL DEFAULT 0,  -- sum of all winning trade pnl_pct
  gross_loss_pct        numeric(10,4) NOT NULL DEFAULT 0,  -- sum of all losing trade pnl_pct (negative)
  avg_win_pct           numeric(10,4) NOT NULL DEFAULT 0,
  avg_loss_pct          numeric(10,4) NOT NULL DEFAULT 0,  -- negative
  profit_factor         numeric(8,4),                      -- |gross_win| / |gross_loss|, null if no losses
  total_pnl_pct         numeric(10,4) NOT NULL DEFAULT 0,  -- cumulative

  -- Confidence tier breakdown
  high_conf_trades      int          NOT NULL DEFAULT 0,
  high_conf_wins        int          NOT NULL DEFAULT 0,
  medium_conf_trades    int          NOT NULL DEFAULT 0,
  medium_conf_wins      int          NOT NULL DEFAULT 0,

  -- Congressional filter impact
  congress_trades       int          NOT NULL DEFAULT 0,
  congress_wins         int          NOT NULL DEFAULT 0,

  -- Drawdown tracking
  max_consecutive_losses int         NOT NULL DEFAULT 0,
  current_consecutive_losses int     NOT NULL DEFAULT 0,

  updated_at            timestamptz  NOT NULL DEFAULT now(),

  UNIQUE (user_id, strategy)
);

ALTER TABLE enki_truth_strategy_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own truth stats"
  ON enki_truth_strategy_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages truth stats"
  ON enki_truth_strategy_stats FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
