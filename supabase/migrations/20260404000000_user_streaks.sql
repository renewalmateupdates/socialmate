create table if not exists public.user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_post_date date,
  streak_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, workspace_id)
);

alter table public.user_streaks enable row level security;

create policy "Users manage own streaks"
  on public.user_streaks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
