CREATE TABLE IF NOT EXISTS enterprise_inquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  company text,
  team_size text,
  message text,
  created_at timestamptz default now()
);
-- No RLS needed (admin-only table, no user auth required for insert)
