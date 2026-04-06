create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null default 'general' check (type in ('bug', 'feature', 'general')),
  message text not null,
  url text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved')),
  admin_note text,
  created_at timestamptz default now()
);
alter table feedback enable row level security;
create policy "Users insert own feedback" on feedback for insert with check (auth.uid() = user_id);
create policy "Users read own feedback" on feedback for select using (auth.uid() = user_id);
