-- Paywalled posts — 3rd pillar of Creator Monetization

CREATE TABLE IF NOT EXISTS creator_paywalled_posts (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id      uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  creator_monetization_id uuid REFERENCES creator_monetization(id) ON DELETE CASCADE NOT NULL,
  title             text NOT NULL,
  preview           text NOT NULL,  -- shown to everyone (teaser)
  content           text NOT NULL,  -- shown only to verified fans / unlocked users
  unlock_price_cents int DEFAULT NULL, -- null = sub-only, set to unlock for one-time payment
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE creator_paywalled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their paywalled posts"
  ON creator_paywalled_posts FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

-- Public can read active posts (preview field only — content filtered in API)
CREATE POLICY "Public can read active paywalled posts"
  ON creator_paywalled_posts FOR SELECT
  USING (is_active = true);

-- Track one-time unlocks per post
CREATE TABLE IF NOT EXISTS creator_post_unlocks (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id             uuid REFERENCES creator_paywalled_posts(id) ON DELETE CASCADE NOT NULL,
  stripe_session_id   text UNIQUE NOT NULL,
  buyer_email         text,
  amount_cents        int NOT NULL,
  status              text DEFAULT 'pending' CHECK (status IN ('pending','paid','failed')),
  paid_at             timestamptz,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE creator_post_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners see their post unlocks"
  ON creator_post_unlocks FOR SELECT
  USING (post_id IN (
    SELECT id FROM creator_paywalled_posts
    WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  ));

CREATE POLICY "Anyone can insert an unlock record"
  ON creator_post_unlocks FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update unlock status"
  ON creator_post_unlocks FOR UPDATE USING (true);
