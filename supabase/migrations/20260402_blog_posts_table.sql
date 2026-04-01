-- Blog posts table for Gemini-generated Studio Stax feature articles
-- and any future dynamic blog content

create table if not exists blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  excerpt      text,
  content      text not null,       -- full markdown content
  category     text default 'studio-stax',
  author       text default 'SocialMate AI',
  listing_id   uuid references curated_listings(id) on delete set null,
  published_at timestamptz default now(),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Index for fast slug lookups
create index if not exists idx_blog_posts_slug on blog_posts(slug);
create index if not exists idx_blog_posts_listing on blog_posts(listing_id) where listing_id is not null;
create index if not exists idx_blog_posts_published on blog_posts(published_at desc);

-- RLS: public can read, only service role can write
alter table blog_posts enable row level security;
create policy "Public can read blog posts" on blog_posts for select using (true);
