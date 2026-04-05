-- Feature flags / kill switches for expensive API operations
-- Managed via admin UI at /admin — readable by all, writable only by service role

create table if not exists public.feature_flags (
  id          uuid primary key default gen_random_uuid(),
  flag        text not null unique,
  enabled     boolean not null default true,
  description text,
  updated_at  timestamptz not null default now(),
  updated_by  text -- admin user email for audit trail
);

-- Seed default flags
insert into public.feature_flags (flag, enabled, description) values
  ('twitter_posting',        true,  'X (Twitter) post publishing — disable to stop all X API write calls'),
  ('twitter_video',          true,  'X video uploads — disable to block video on X (reduces API costs)'),
  ('twitter_analytics',      true,  'X engagement data fetching — disable to stop read API calls'),
  ('ai_caption_generation',  true,  'Gemini AI caption generation — disable to cut Gemini costs'),
  ('ai_image_generation',    true,  'Gemini Imagen image generation — disable to cut Imagen costs'),
  ('ai_radar',               true,  'SM-Radar trend intelligence — disable if quota pressure'),
  ('ai_pulse',               true,  'SM-Pulse trend scanning — disable if quota pressure'),
  ('evergreen_recycling',    true,  'Evergreen post auto-recycling cron — disable to pause recycler'),
  ('push_notifications',     true,  'Web push notification sending — disable to pause pushes'),
  ('media_upload',           true,  'Media/image upload pipeline — disable if storage costs spike')
on conflict (flag) do nothing;

-- RLS: anyone can read flags (needed for client-side kill switch checks)
alter table public.feature_flags enable row level security;

create policy "Public read feature flags"
  on public.feature_flags for select
  using (true);

-- Only service role (admin) can write — no user-writable policy
-- Writes happen server-side via getSupabaseAdmin() only
