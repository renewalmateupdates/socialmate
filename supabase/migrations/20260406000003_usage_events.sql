create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  event_type text not null, -- 'clip_lookup', 'ai_credit', etc.
  metadata jsonb,
  created_at timestamptz default now()
);
alter table usage_events enable row level security;
create policy "Users read own events" on usage_events for select using (auth.uid() = user_id);
create policy "Service inserts events" on usage_events for insert with check (true);
