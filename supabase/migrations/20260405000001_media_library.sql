-- Media Library table
-- Tracks files uploaded to the Supabase Storage `media` bucket.

create table if not exists media_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  workspace_id  uuid references workspaces(id) on delete set null,
  filename      text not null,
  url           text not null,
  storage_path  text not null,
  size_bytes    bigint not null default 0,
  mime_type     text not null,
  created_at    timestamptz not null default now()
);

-- RLS
alter table media_items enable row level security;

create policy "Users can read own media"
  on media_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own media"
  on media_items for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own media"
  on media_items for delete
  using (auth.uid() = user_id);

-- Index for fast per-user queries
create index if not exists media_items_user_id_created_at_idx
  on media_items (user_id, created_at desc);
