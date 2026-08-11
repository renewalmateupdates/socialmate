-- Feature flags: seed only the switches that are actually wired (Aug 2026).
--
-- Supersedes the seed in 20260405000000_feature_flags.sql, which listed ten
-- flags when only two were ever read by code. The other eight were switches
-- connected to nothing: flipping ai_caption_generation off during a Gemini cost
-- spike would have changed exactly nothing, while looking like protection.
--
-- Five of those eight are now wired (see lib/feature-flags.ts for the registry
-- and what each does when off). Three are deleted rather than wired, because
-- the features they name do not exist:
--
--   twitter_video        lib/publish/twitter.ts is images-only; video upload
--                        was never built
--   twitter_analytics    X does not give us engagement data on our tier
--   ai_image_generation  there is no image generation route
--
-- Readers FAIL OPEN: a missing row means enabled. So this seed is not required
-- for the product to work — it exists so /admin/feature-flags shows real rows
-- with audit timestamps rather than inferring them.

create table if not exists public.feature_flags (
  id          uuid primary key default gen_random_uuid(),
  flag        text not null unique,
  enabled     boolean not null default true,
  description text,
  updated_at  timestamptz not null default now(),
  updated_by  text
);

alter table public.feature_flags enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feature_flags'
      and policyname = 'Public read feature flags'
  ) then
    create policy "Public read feature flags"
      on public.feature_flags for select using (true);
  end if;
end $$;

-- The switches that are read somewhere in the codebase.
insert into public.feature_flags (flag, enabled, description) values
  ('twitter_posting',       true, 'X post publishing — off stops all X API writes and the per-tweet charge'),
  ('ai_caption_generation', true, 'AI caption tool — off returns paused and charges no credits'),
  ('ai_pulse',              true, 'SM-Pulse trend scans — off returns paused and charges no credits'),
  ('ai_radar',              true, 'SM-Radar reports — off returns paused and charges no credits'),
  ('media_upload',          true, 'Media upload pipeline — off refuses uploads before any bytes are stored'),
  ('push_notifications',    true, 'Web push sending — off stops pushes, in-app notifications continue'),
  ('evergreen_recycling',   true, 'Evergreen recycler cron — off skips the daily 6am run')
on conflict (flag) do nothing;

-- Remove the switches that gate nothing, so the admin page cannot offer a lever
-- that does not move anything.
delete from public.feature_flags
where flag in ('twitter_video', 'twitter_analytics', 'ai_image_generation');

-- Verify: should return the seven above, all enabled.
--   select flag, enabled, description from public.feature_flags order by flag;
