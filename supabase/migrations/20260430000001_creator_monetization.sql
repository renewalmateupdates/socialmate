-- Creator Monetization Hub tables

-- Main settings per workspace
CREATE TABLE IF NOT EXISTS creator_monetization (
  id                        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id              uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id                   uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Stripe Connect Express
  stripe_account_id         text,
  stripe_onboarding_complete boolean DEFAULT false,

  -- Page identity
  page_handle               text UNIQUE,  -- e.g. "joshuab" → /creator/joshuab
  page_title                text,
  page_bio                  text,
  avatar_url                text,

  -- Tip jar
  tip_enabled               boolean DEFAULT false,
  tip_min                   integer DEFAULT 100,   -- cents, $1
  tip_max                   integer DEFAULT 10000, -- cents, $100

  -- Fan subscriptions
  subscription_enabled      boolean DEFAULT false,
  subscription_price        integer DEFAULT 500,   -- cents/month, $5
  subscription_name         text DEFAULT 'Supporter',
  subscription_description  text DEFAULT 'Support my work and get access to exclusive content.',

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(workspace_id)
);

ALTER TABLE creator_monetization ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own creator settings"
  ON creator_monetization FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Anyone can read public creator pages by handle
CREATE POLICY "Public read creator page"
  ON creator_monetization FOR SELECT
  USING (page_handle IS NOT NULL AND stripe_onboarding_complete = true);

-- Tips received
CREATE TABLE IF NOT EXISTS creator_tips (
  id                      uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id            uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  creator_monetization_id uuid REFERENCES creator_monetization(id) ON DELETE CASCADE,
  amount                  integer NOT NULL, -- cents
  message                 text,
  supporter_name          text,
  supporter_email         text,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  status                  text DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  created_at              timestamptz DEFAULT now()
);

ALTER TABLE creator_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creators see own tips"
  ON creator_tips FOR SELECT
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- Fan subscriptions
CREATE TABLE IF NOT EXISTS creator_fan_subscriptions (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id          uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  creator_monetization_id uuid REFERENCES creator_monetization(id) ON DELETE CASCADE,
  subscriber_email      text NOT NULL,
  subscriber_name       text,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id    text,
  status                text DEFAULT 'active' CHECK (status IN ('active','cancelled','past_due')),
  created_at            timestamptz DEFAULT now(),
  cancelled_at          timestamptz
);

ALTER TABLE creator_fan_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creators see own fan subscriptions"
  ON creator_fan_subscriptions FOR SELECT
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));
