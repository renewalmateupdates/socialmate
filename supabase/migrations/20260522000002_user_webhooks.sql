CREATE TABLE IF NOT EXISTS user_webhooks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT '{post.published,post.failed}',
  secret text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE user_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own webhooks" ON user_webhooks FOR ALL USING (auth.uid() = user_id);
