-- Enki Co-Pilot table
-- Allows a Commander+ subscriber to invite one trusted viewer (read-only)
-- to their Enki dashboard. One co-pilot per owner (UNIQUE on owner_user_id).

CREATE TABLE IF NOT EXISTS enki_copilots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  copilot_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  copilot_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'removed')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(owner_user_id)
);

ALTER TABLE enki_copilots ENABLE ROW LEVEL SECURITY;

-- Owner can manage their own co-pilot row
CREATE POLICY "Users manage own copilot" ON enki_copilots
  FOR ALL USING (auth.uid() = owner_user_id);

-- Co-pilot can read the row they're invited to
CREATE POLICY "Copilot can read their row" ON enki_copilots
  FOR SELECT USING (auth.uid() = copilot_user_id);

CREATE INDEX IF NOT EXISTS idx_enki_copilots_copilot_user
  ON enki_copilots(copilot_user_id)
  WHERE copilot_user_id IS NOT NULL;
