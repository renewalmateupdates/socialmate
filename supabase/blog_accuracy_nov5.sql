-- Blog accuracy pass, Nov 5, 2026. Run in the Supabase SQL editor.
-- Part 1 corrects facts inside posts. Each replace() only changes text that is
-- still there, so running it twice is harmless. Originals are backed up in the
-- git-excluded blog_price_backup_nov5_accuracy.json in the repo root.

BEGIN;

-- 5-dollar-social-media-tool-replaces-99: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$$5/Month$sm$, $sm$$8/Month$sm$), updated_at = now()
WHERE slug = $sm$5-dollar-social-media-tool-replaces-99$sm$;

-- 5-dollar-social-media-tool-replaces-99: 4 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$$5/month$sm$, $sm$$8/month$sm$), updated_at = now()
WHERE slug = $sm$5-dollar-social-media-tool-replaces-99$sm$;

-- content-ideas-real-estate-social: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$LinkedIn, Instagram, TikTok, and Bluesky all in one dashboard$sm$, $sm$LinkedIn, TikTok, Bluesky and more in one dashboard$sm$), updated_at = now()
WHERE slug = $sm$content-ideas-real-estate-social$sm$;

-- creator-os-vision: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$- Enki — AI trading bot for creator wealth-building$sm$, $sm$- LinkedIn publishing (live since May 2026) and TikTok publishing (public posts since October 2026)$sm$), updated_at = now()
WHERE slug = $sm$creator-os-vision$sm$;

-- creator-os-vision: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$- LinkedIn and Instagram publishing$sm$, $sm$- YouTube publishing (waiting on Google's review)$sm$), updated_at = now()
WHERE slug = $sm$creator-os-vision$sm$;

-- creator-os-vision: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$- TikTok integration (in review)$sm$, $sm$- Instagram, Facebook and Threads, once Meta's app review is done$sm$), updated_at = now()
WHERE slug = $sm$creator-os-vision$sm$;

-- creator-os-vision: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$- Creator monetization hub (tip jar, fan subscriptions, paywalled posts)$sm$, $sm$- Campaign mode upgrades, starting with link tracking$sm$), updated_at = now()
WHERE slug = $sm$creator-os-vision$sm$;

-- why-x-costs-extra-and-tiktok-is-free: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$TikTok ✅ Free (pending Production API approval)$sm$, $sm$TikTok ✅ Free (20 videos a month on the free plan)$sm$), updated_at = now()
WHERE slug = $sm$why-x-costs-extra-and-tiktok-is-free$sm$;

-- how-to-schedule-posts-in-advance: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$supports Bluesky, Mastodon, Discord, Telegram, X/Twitter, and LinkedIn — with a free plan that covers most individual creators' needs.$sm$, $sm$supports Bluesky, Mastodon, Discord, Telegram, X/Twitter, LinkedIn and TikTok, with a free plan (X needs Pro) that covers most individual creators' needs.$sm$), updated_at = now()
WHERE slug = $sm$how-to-schedule-posts-in-advance$sm$;

-- link-in-bio-guide: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$`socialmate.studio/bio/[yourhandle]`$sm$, $sm$`socialmate.studio/l/[yourhandle]`$sm$), updated_at = now()
WHERE slug = $sm$link-in-bio-guide$sm$;

-- link-in-bio-tools-compared-2026: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$socialmate.studio/bio/yourname$sm$, $sm$socialmate.studio/l/yourname$sm$), updated_at = now()
WHERE slug = $sm$link-in-bio-tools-compared-2026$sm$;

-- socialmate-link-in-bio-free-landing-page: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$`socialmate.studio/u/yourhandle`$sm$, $sm$`socialmate.studio/l/yourhandle`$sm$), updated_at = now()
WHERE slug = $sm$socialmate-link-in-bio-free-landing-page$sm$;

-- 50-features-solo-bootstrapped-60-days: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$- Enki: autonomous trading bot with Truth Mode$sm$, $sm$- Enki: an autonomous trading bot with Truth Mode (since moved out of SocialMate into its own product)$sm$), updated_at = now()
WHERE slug = $sm$50-features-solo-bootstrapped-60-days$sm$;

-- building-in-public-60-days-socialmate: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$and Enki (an AI trading bot).$sm$, $sm$and Enki (an AI trading bot, since moved out of SocialMate into its own product).$sm$), updated_at = now()
WHERE slug = $sm$building-in-public-60-days-socialmate$sm$;

-- creator-economy-2026-whats-changed: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$Tools like SocialMate's Enki (coming soon) will learn individual creator voices$sm$, $sm$Tools like SocialMate's SOMA learn individual creator voices$sm$), updated_at = now()
WHERE slug = $sm$creator-economy-2026-whats-changed$sm$;

-- deli-job-founder-shipping-software-2am: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$Enki (our trading bot) is live with paper and live trading.$sm$, $sm$Enki (the trading bot) has since moved out of SocialMate into its own product.$sm$), updated_at = now()
WHERE slug = $sm$deli-job-founder-shipping-software-2am$sm$;

-- youtube-creator-social-tools-stack: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$SocialMate supports YouTube Shorts scheduling alongside your other platforms.$sm$, $sm$SocialMate doesn't post to YouTube yet (that's waiting on Google's review), but it shares the clips you pull from YouTube to your other platforms.$sm$), updated_at = now()
WHERE slug = $sm$youtube-creator-social-tools-stack$sm$;

-- youtube-shorts-scheduler-free-2026: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$You can schedule clips and Shorts alongside content for other platforms — all from one dashboard.$sm$, $sm$You can share those clips and Shorts to your other platforms from one dashboard. Uploading the Short to YouTube itself still happens in YouTube Studio, because YouTube posting in SocialMate is waiting on Google's review.$sm$), updated_at = now()
WHERE slug = $sm$youtube-shorts-scheduler-free-2026$sm$;

-- youtube-shorts-scheduler-free-2026: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$SocialMate supports this cross-platform workflow — create your clip, write platform-specific captions, and schedule to YouTube and TikTok simultaneously.$sm$, $sm$SocialMate handles the TikTok side of that workflow: create your clip, write the caption and schedule it, then upload the same video as a Short in YouTube Studio.$sm$), updated_at = now()
WHERE slug = $sm$youtube-shorts-scheduler-free-2026$sm$;

-- schedule-fitness-content-week-ahead: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$the free plan gives you 50 scheduled posts per month$sm$, $sm$the free plan gives you 250 scheduled posts per month$sm$), updated_at = now()
WHERE slug = $sm$schedule-fitness-content-week-ahead$sm$;

-- socialmate-twitch-youtube-clip-browser: 1 occurrence(s)
UPDATE blog_posts SET content = replace(content, $sm$**SocialMate is the only social media scheduler with a native Twitch and YouTube clip browser.**$sm$, $sm$**Few social media schedulers have a built-in Twitch and YouTube clip browser. SocialMate does.**$sm$), updated_at = now()
WHERE slug = $sm$socialmate-twitch-youtube-clip-browser$sm$;

-- Part 2: remove 11 trading posts that sell Enki tiers on the SocialMate blog.
-- Enki left SocialMate on Oct 26 and /enki is only a waitlist, so these posts
-- advertise plans nobody can buy. The 25 Enki posts removed Oct 26 set the
-- precedent. Their URLs will return 404. Backed up with the rest.
DELETE FROM blog_posts WHERE slug IN ('backtesting-trading-strategy-guide', 'best-trading-bots-2026', 'congressional-trading-explained', 'creators-and-trading', 'how-to-start-automated-trading', 'how-to-start-investing-algorithmically', 'paper-trading-before-going-live', 'reddit-sentiment-stock-trading-signals', 'stocks-vs-crypto-algorithmic-trading', 'what-is-algorithmic-trading-beginners', 'why-paper-trading-matters');

COMMIT;

-- Check: should return 0 rows.
SELECT slug FROM blog_posts WHERE content ILIKE '%pending Production API approval%' OR content ILIKE '%socialmate.studio/bio/%'
   OR content ILIKE '%socialmate.studio/u/%' OR content ILIKE '%SocialMate supports YouTube Shorts%';
