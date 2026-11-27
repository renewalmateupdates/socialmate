-- Blog accuracy pass, Nov 26, 2026: the free plan's platforms. Run in the
-- Supabase SQL editor, only with Joshua's yes (it updates existing rows).
--
-- Free covers 6 of the 7 live platforms; X needs Pro because X bills SocialMate
-- for every post (lib/site-facts.ts). The code and locale files were corrected
-- in the PR that added this file; these 20 sentences in 19 database posts say
-- the same old thing. Each statement was checked read-only against the live row
-- on Nov 26: its old text appears exactly once. replace() only changes text that
-- is still there, so running it twice is harmless.
--
-- Two of them fix a second wrong fact in the same sentence: the Hootsuite post
-- gave X "a 5-post free quota" (Free's X quota is 0), and the one-sitting post
-- put Smart Queue in Free (it is Pro).
--
-- After running: POST /api/admin/revalidate for each slug (or wait out the
-- page's revalidate), check one page with curl, then run
-- node scripts/indexnow-submit.mjs.

BEGIN;

UPDATE blog_posts SET content = replace(content, $old$social scheduling for seven platforms, 15+ AI tools$old$, $new$social scheduling for seven platforms (six of them free, X on Pro), 15+ AI tools$new$), updated_at = now()
  WHERE slug = 'why-free-social-media-tools-are-winning' AND position($old$social scheduling for seven platforms, 15+ AI tools$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$- Free: 50 credits/month, 2 seats, all 7 live platforms$old$, $new$- Free: 50 credits/month, 2 seats, 6 of the 7 live platforms (X needs Pro)$new$), updated_at = now()
  WHERE slug = 'socialmate-vs-later' AND position($old$- Free: 50 credits/month, 2 seats, all 7 live platforms$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$<li>250 posts a month across all 7 platforms</li>$old$, $new$<li>250 posts a month across 6 platforms (X needs Pro)</li>$new$), updated_at = now()
  WHERE slug = 'schedule-linkedin-posts-free-tool' AND position($old$<li>250 posts a month across all 7 platforms</li>$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$Helping creators schedule 7 platforms for free$old$, $new$Helping creators schedule 6 platforms for free$new$), updated_at = now()
  WHERE slug = 'linkedin-personal-brand-2026' AND position($old$Helping creators schedule 7 platforms for free$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$SocialMate covers 7 platforms including LinkedIn and TikTok on a free plan.$old$, $new$SocialMate covers 7 platforms, and its free plan includes 6 of them, LinkedIn and TikTok among them (X needs Pro).$new$), updated_at = now()
  WHERE slug = 'social-media-scheduling-tools-small-business' AND position($old$SocialMate covers 7 platforms including LinkedIn and TikTok on a free plan.$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$a calendar view, and scheduling across 7 platforms.$old$, $new$a calendar view, and scheduling across 6 platforms (X needs Pro).$new$), updated_at = now()
  WHERE slug = 'best-linkedin-post-scheduler-2026' AND position($old$a calendar view, and scheduling across 7 platforms.$old$ in content) > 0;

UPDATE blog_posts SET excerpt = replace(excerpt, $old$SocialMate covers 7 platforms including TikTok and LinkedIn for $8/month (free tier available).$old$, $new$SocialMate covers 7 platforms including TikTok and LinkedIn for $8/month, and its free tier covers 6 of them (X needs Pro).$new$), updated_at = now()
  WHERE slug = 'social-media-scheduler-7-platforms' AND position($old$SocialMate covers 7 platforms including TikTok and LinkedIn for $8/month (free tier available).$old$ in excerpt) > 0;

UPDATE blog_posts SET content = replace(content, $old$**Tool:** SocialMate (free, 7 platforms).$old$, $new$**Tool:** SocialMate (free on 6 platforms, X on Pro).$new$), updated_at = now()
  WHERE slug = 'social-media-automation-small-business' AND position($old$**Tool:** SocialMate (free, 7 platforms).$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$all 7 platforms available, free plan covers 250 posts/month.$old$, $new$all 7 platforms available, and the free plan covers 250 posts/month on 6 of them (X needs Pro).$new$), updated_at = now()
  WHERE slug = 'post-same-content-7-social-platforms' AND position($old$all 7 platforms available, free plan covers 250 posts/month.$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$calendar view, bulk scheduling, Smart Queue, and 7-platform support all included.$old$, $new$calendar view, bulk scheduling and 6 platforms on the free plan; Pro adds X and Smart Queue.$new$), updated_at = now()
  WHERE slug = 'schedule-month-content-one-sitting' AND position($old$calendar view, bulk scheduling, Smart Queue, and 7-platform support all included.$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$no credit card, no setup fee, 7 platforms out of the box.$old$, $new$no credit card, no setup fee, 6 platforms free out of the box (X needs Pro).$new$), updated_at = now()
  WHERE slug = 'social-media-automation-budget-what-works' AND position($old$no credit card, no setup fee, 7 platforms out of the box.$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$Discord, Bluesky, LinkedIn, TikTok, Telegram, Mastodon, and X.$old$, $new$Discord, Bluesky, LinkedIn, TikTok, Telegram, Mastodon, and X (X needs Pro).$new$), updated_at = now()
  WHERE slug = 'connect-social-media-scheduler-zapier' AND position($old$Discord, Bluesky, LinkedIn, TikTok, Telegram, Mastodon, and X.$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$the free plan includes 7-platform scheduling and basic AI tools.$old$, $new$the free plan includes scheduling on 6 platforms (X needs Pro) and basic AI tools.$new$), updated_at = now()
  WHERE slug = 'best-free-ai-tools-content-creators-2026' AND position($old$the free plan includes 7-platform scheduling and basic AI tools.$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$all plans include 7-platform scheduling.$old$, $new$every plan schedules to 6 platforms, and Pro adds X.$new$), updated_at = now()
  WHERE slug = 'build-in-public-sharing-journey-gets-users' AND position($old$all plans include 7-platform scheduling.$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$all 7 platforms, free plan available.$old$, $new$7 platforms, 6 of them on the free plan.$new$), updated_at = now()
  WHERE slug = 'cross-platform-social-media-strategy-2026' AND position($old$all 7 platforms, free plan available.$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$7-platform scheduling, AI tools, and analytics all in one place.$old$, $new$7-platform scheduling (X needs Pro), AI tools, and analytics all in one place.$new$), updated_at = now()
  WHERE slug = 'social-media-saas-founders-drives-signups' AND position($old$7-platform scheduling, AI tools, and analytics all in one place.$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$AI tools, scheduling, and 7-platform support in one place.$old$, $new$AI tools, scheduling, and 7-platform support (X needs Pro) in one place.$new$), updated_at = now()
  WHERE slug = 'ai-social-media-schedulers-vs-manual-posting' AND position($old$AI tools, scheduling, and 7-platform support in one place.$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$SocialMate's free plan includes 7 live platforms: Bluesky, Discord, Telegram, Mastodon, TikTok, LinkedIn, and X/Twitter.$old$, $new$SocialMate's free plan includes 6 of its 7 live platforms: Bluesky, Discord, Telegram, Mastodon, TikTok, and LinkedIn. X/Twitter needs Pro.$new$), updated_at = now()
  WHERE slug = 'free-buffer-alternative-7-platforms' AND position($old$SocialMate's free plan includes 7 live platforms: Bluesky, Discord, Telegram, Mastodon, TikTok, LinkedIn, and X/Twitter.$old$ in content) > 0;

UPDATE blog_posts SET content = replace(content, $old$scheduling across 7 platforms (Discord, Bluesky, Telegram, Mastodon, TikTok, LinkedIn, and X/Twitter with a 5-post free quota)$old$, $new$scheduling across 6 platforms (Discord, Bluesky, Telegram, Mastodon, TikTok, and LinkedIn; X/Twitter needs Pro)$new$), updated_at = now()
  WHERE slug = 'free-hootsuite-alternative-that-works-2026' AND position($old$scheduling across 7 platforms (Discord, Bluesky, Telegram, Mastodon, TikTok, LinkedIn, and X/Twitter with a 5-post free quota)$old$ in content) > 0;

UPDATE blog_posts SET title = replace(title, $old$The Best Free Buffer Alternative With 7 Platforms (2026)$old$, $new$The Best Free Buffer Alternative: 7 Platforms, 6 Free (2026)$new$), updated_at = now()
  WHERE slug = 'free-buffer-alternative-7-platforms' AND position($old$The Best Free Buffer Alternative With 7 Platforms (2026)$old$ in title) > 0;

COMMIT;
