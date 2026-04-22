-- SOMA Identity Profiles
CREATE TABLE IF NOT EXISTS soma_identity_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tone_profile jsonb DEFAULT '{}',
  writing_style_rules jsonb DEFAULT '{}',
  behavioral_traits jsonb DEFAULT '{}',
  voice_examples text[] DEFAULT '{}',
  interview_completed boolean DEFAULT false,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id)
);

-- SOMA Weekly Ingestion
CREATE TABLE IF NOT EXISTS soma_weekly_ingestion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  week_label text,
  raw_input text,
  diff_summary jsonb DEFAULT '{}',
  extracted_insights jsonb DEFAULT '{}',
  generated_posts_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- SOMA Credit Ledger
CREATE TABLE IF NOT EXISTS soma_credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  credits_used int NOT NULL,
  balance_after int NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add SOMA columns to workspaces
ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS soma_credits_monthly int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS soma_credits_used int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS soma_credits_purchased int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS soma_credits_reset_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS soma_autopilot_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS soma_mode text DEFAULT 'safe';

-- Set monthly credits by plan
UPDATE workspaces SET soma_credits_monthly = CASE
  WHEN plan = 'pro' OR plan = 'pro_annual' THEN 1000
  WHEN plan = 'agency' OR plan = 'agency_annual' THEN 5000
  ELSE 0
END;

-- RLS
ALTER TABLE soma_identity_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE soma_weekly_ingestion ENABLE ROW LEVEL SECURITY;
ALTER TABLE soma_credit_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own soma_identity_profiles" ON soma_identity_profiles
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users access own soma_weekly_ingestion" ON soma_weekly_ingestion
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users access own soma_credit_ledger" ON soma_credit_ledger
  FOR ALL USING (user_id = auth.uid());
