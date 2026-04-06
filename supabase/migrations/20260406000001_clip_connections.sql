create table if not exists clip_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  platform text not null check (platform in ('twitch', 'youtube')),
  channel_id text not null,
  channel_name text,
  channel_avatar text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, platform, channel_id)
);
alter table clip_connections enable row level security;
create policy "Users manage own clip connections" on clip_connections
  for all using (auth.uid() = user_id);
