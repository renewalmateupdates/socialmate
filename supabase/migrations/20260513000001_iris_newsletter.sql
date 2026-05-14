-- IRIS Dispatch newsletter opt-in on user_settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS iris_opt_in BOOLEAN DEFAULT true;

-- Track every edition sent
CREATE TABLE IF NOT EXISTS iris_dispatches (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  edition         int  NOT NULL,
  subject         text NOT NULL,
  intro           text,
  what_shipped    text,
  real_numbers    text,
  whats_next      text,
  closing         text,
  body_html       text,
  recipient_count int  DEFAULT 0,
  sent_at         timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE iris_dispatches ENABLE ROW LEVEL SECURITY;
-- Admin-only; no public access
CREATE POLICY "No public access" ON iris_dispatches FOR ALL USING (false);
