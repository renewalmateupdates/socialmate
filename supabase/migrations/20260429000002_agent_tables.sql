-- Newsletter Agent settings
CREATE TABLE IF NOT EXISTS newsletter_settings (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id       uuid        REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id            uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled            boolean     DEFAULT false,
  mode               text        DEFAULT 'draft',
  subscriber_emails  jsonb       DEFAULT '[]',
  subject_prefix     text        DEFAULT '',
  custom_intro       text        DEFAULT '',
  last_sent_at       timestamptz,
  created_at         timestamptz DEFAULT now(),
  UNIQUE(workspace_id)
);
ALTER TABLE newsletter_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own newsletter settings"
  ON newsletter_settings FOR ALL USING (user_id = auth.uid());

-- Newsletter send history
CREATE TABLE IF NOT EXISTS newsletter_sends (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id     uuid        REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id          uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  subject          text        NOT NULL,
  content_html     text,
  subscriber_count int         DEFAULT 0,
  mode             text        DEFAULT 'draft',
  sent_at          timestamptz DEFAULT now()
);
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own newsletter sends"
  ON newsletter_sends FOR ALL USING (user_id = auth.uid());

-- Client Report Agent settings
CREATE TABLE IF NOT EXISTS client_report_settings (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id      uuid        REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id           uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled           boolean     DEFAULT false,
  recipient_emails  jsonb       DEFAULT '[]',
  last_sent_at      timestamptz,
  created_at        timestamptz DEFAULT now(),
  UNIQUE(workspace_id)
);
ALTER TABLE client_report_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own client report settings"
  ON client_report_settings FOR ALL USING (user_id = auth.uid());
