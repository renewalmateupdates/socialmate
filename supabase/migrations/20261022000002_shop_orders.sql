-- Gilgamesh shop orders, as Shopify reports them (Oct 2026).
-- Run once in the Supabase SQL editor. Idempotent.
--
-- /admin/hq needs the shop's sales and the 25% of them promised to SM-Give.
-- Shopify no longer lets a store owner mint an API token in the admin (apps
-- moved to the Dev Dashboard, whose simple tokens need the store inside a
-- developer organization). So instead Shopify pushes each order to
-- /api/shopify/orders-webhook (Settings > Notifications > Webhooks), and this
-- table keeps the totals. No customer details are stored: no names, emails or
-- addresses, only what the dashboard adds up.

CREATE TABLE IF NOT EXISTS shop_orders (
  shopify_order_id  text        PRIMARY KEY,
  order_name        text,
  financial_status  text,
  -- Shopify's current subtotal: after discounts and refunds, before tax and
  -- shipping. That's the number the 25% SM-Give promise applies to.
  subtotal_cents    integer     NOT NULL DEFAULT 0,
  total_cents       integer     NOT NULL DEFAULT 0,
  currency          text,
  test              boolean     NOT NULL DEFAULT false,
  cancelled         boolean     NOT NULL DEFAULT false,
  ordered_at        timestamptz NOT NULL,
  updated_at        timestamptz NOT NULL DEFAULT now(),
  -- 'webhook', or 'manual' for orders added by hand from before the webhook
  source            text        NOT NULL DEFAULT 'webhook'
);

CREATE INDEX IF NOT EXISTS shop_orders_ordered_at_idx ON shop_orders (ordered_at DESC);

-- Service role only (the webhook and /admin/hq). No policies on purpose.
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
