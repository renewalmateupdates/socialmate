-- Evergreen recycling columns on posts table
alter table public.posts add column if not exists is_evergreen boolean not null default false;
alter table public.posts add column if not exists evergreen_last_queued_at timestamptz;
alter table public.posts add column if not exists evergreen_queue_count int not null default 0;

-- Index for fast evergreen lookup
create index if not exists posts_evergreen_idx
  on public.posts(user_id, workspace_id, is_evergreen)
  where is_evergreen = true;
