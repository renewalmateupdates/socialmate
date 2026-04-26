-- Schedule templates: saved posting-time patterns per user
CREATE TABLE IF NOT EXISTS schedule_templates (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  slots      jsonb       NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schedule_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own schedule templates" ON schedule_templates
  FOR ALL USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS schedule_templates_user_id_idx ON schedule_templates (user_id);
