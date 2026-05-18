# SocialMate — Claude Code Project Context

> Drop this file in the root of the repo. Claude Code reads it automatically every session.
> Previous week snapshot: `CLAUDE-week-of-2026-04-11.md`

---

## Who I Am

**Joshua Bostic** — Founder & CEO, Gilgamesh Enterprise LLC (Wyoming LLC).
Solo bootstrapped builder. Working a Walmart deli job + part-time HR. Building SocialMate nights and weekends.
Vision: Creator OS — the home base for any creator, streamer, business, or person who wants to build online.
Mission: Power to the people. Tear down gatekeeping walls. Build the door.

---

## What SocialMate Is

A multi-platform social media scheduler and AI-powered Creator OS.
Live at: **socialmate.studio**
Soft launched: March 26, 2026. Official Product Hunt launch: April 1, 2026. 100% bootstrapped.
GitHub: github.com/renewalmateupdates/socialmate

**The pitch:** What competitors charge $99/month for, we give for $5 — or free.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15/16 (App Router) |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS v4 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Background jobs | Inngest (scheduled post delivery) |
| Payments | Stripe (subscriptions + webhooks) |
| AI | Google Gemini API |
| Deployment | Vercel (auto-deploy from GitHub) |
| Analytics | Vercel Analytics |

---

## Known TypeScript / Next.js 15 Gotchas

These have burned us before — always apply:

- **Route params must be Promise**: `{ params }: { params: Promise<{ id: string }> }` and `const { id } = await params`
- **No spread on iterators**: Use `Array.from(set)` not `[...set]` — TypeScript downlevel compat issue
- **Map.values() spread**: Use `Array.from(new Map(...).values())` not `[...new Map(...).values()]`
- **Stripe SDK v20**: `PromotionCodeCreateParams` uses `promotion: { type: 'coupon', coupon: id }` not top-level `coupon: id`
- **Supabase client in API routes**: Use inline `createServerClient` from `@supabase/ssr` with cookie handlers — `@/lib/supabase/server` does NOT exist in this codebase
- **Login redirect param**: Login page reads `?redirect=` not `?next=` — always use `router.push('/login?redirect=/path')`

---

## Platforms

**Live now:** Bluesky, Discord, Telegram, Mastodon, X/Twitter (pay-per-use, $0.01/tweet), TikTok (Production API approved May 17, 2026)
**Coming soon:** LinkedIn (no API acquired yet), YouTube, Pinterest, Reddit
**Roadmap:** Instagram, Facebook, Threads, Tumblr, Pixelfed

---

## Pricing & Plans

| Plan | Price | Credits/mo | Seats | Client Workspaces |
|---|---|---|---|---|
| Free | $0 | 50 | 2 | 0 |
| Pro | $5/mo | 500 | 5 | 0 |
| Agency | $20/mo | 2,000 | 15 | 5 |
| Pro Annual | $55/yr | 500 | 5 | 0 |
| Agency Annual | $209/yr | 2,000 | 15 | 5 |

**Add-ons:**
- White Label Basic: $20/mo (custom logo/colors/branding)
- White Label Pro: $40/mo (everything + custom domain)
- Credit packs: $1.99 (100cr) / $4.99 (300cr) / $9.99 (750cr) / $19.99 (2,000cr)

**Affiliate/Partner structure:**
- 30% recurring on all subscription payments (Pro, Agency, promos, white label)
- Milestone: 100+ active recurring payments → jumps to 40% forever
- Flat 10% on Starter + Popular credit packs
- Flat 15% on Pro + Max credit packs

**X/Twitter quota enforcement:**
- Free: 0 tweets/month (Pro+ required — X charges $0.01/tweet, so free users are gated at compose via upgrade prompt) | Pro: 150/month | Agency: 400/month
- X Booster add-on (one-time purchase, stacks, rolls over): Spark 50/$1.99 · Boost 120/$4.99 · Surge 250/$9.99 · Storm 500/$19.99
- Tracked by counting published posts with `platforms @> ['twitter']` this calendar month

**TikTok quota (free API — no per-post charge):**
- Free: 20 videos/month | Pro: 60/month | Agency: 200/month
- Uses PULL_FROM_URL — TikTok pulls video from Supabase storage. Cost: only egress (~$0.09/GB)
- Production API approved May 17, 2026. Connect button live on /accounts. TikTok Studio live at /tiktok/studio. Sandbox banner removed.

**Platform philosophy:** Open social (Bluesky, Mastodon, Discord, Telegram, TikTok) = free. Gatekept social (X/Twitter charges $0.01/tweet) = Pro+ required.

---

## Key Infrastructure Decisions

- **Infrastructure sustainability is always a priority** — Joshua is ballin on a budget. Every new feature needs quota gating or a clear cost model.
- **Credits system:** Three pools — monthly (resets), earned (referrals/milestones), purchased (never expire). Consumed in that order.
- **Publish-first architecture:** Post status is set atomically to prevent race conditions.
- **Idempotency guards** on all scheduled jobs — nothing fires twice.
- **RLS on all tables** — users only access their own data.
- **Feature flags table** in Supabase — admin-only write, for kill switches.
- **Inngest cron `'0 6 * * *'`** — evergreen recycling runs daily.
- **Enki Truth Mode scan** — Inngest cron `'*/15 * * * *'`, per-user isolation, Yahoo Finance OHLCV.
- If a feature could have API costs, gate it like AI credits. Build for free-tier sustainability first.

---

## What's Been Built (as of April 26, 2026 — end of day)

**Core:**
- Post scheduling (Now + future via Inngest), drafts, queue, calendar, bulk scheduling
- Multi-account per platform (Bluesky, Mastodon verified)
- 12 AI tools (Google Gemini): Caption, Rewrite, Hook, Thread + 8 more
- Three-pool credit system with real-time sidebar updates
- Workspace isolation (personal + client, cookie-scoped)
- 5-step onboarding tour + SM-Give card on final step
- 29 sidebar color themes
- Referral system (+25 credits per paying referral, milestone bonuses)

**Platforms:**
- Bluesky, Discord, Telegram, Mastodon — live
- X/Twitter — live (pay-per-use, quota enforced)
- Twitch clips — OAuth connect/disconnect, clip browser, thumbnail grid, one-click schedule
- YouTube clips — RSS-based (no API key needed), video grid

**Coupon & Partner Attribution System (April 2026):**
- `coupons` table: code, discount_type (percent/fixed/trial_extension), affiliate link, Stripe promo auto-creation
- `coupon_redemptions` table: per-user idempotency guard, no double-dipping
- `increment_coupon_redemptions` SQL function: atomic counter
- `/api/admin/coupons` — GET/POST/PATCH (admin only, Stripe SDK v20 compatible)
- `/api/coupons/validate` — public validation endpoint
- `/api/stripe/checkout` — accepts `coupon_code`, applies discount or trial days
- Stripe webhook extended: coupon `affiliate_id` in metadata → inserts `affiliate_conversions`, updates affiliate earnings
- Coupon input on `/pricing`, onboarding step 2, and `/settings` plan tab
- Admin UI at `/admin/coupons` — full table + create form with affiliate dropdown

**Partner/Affiliate System:**
- `/partners/dashboard` — referral link, promo codes, earnings, conversions, payouts, leaderboard, milestone badges
- `/affiliates` — public-facing landing page: commission rates, how it works, FAQ, apply CTA
- Footer "Affiliate" link updated to `/affiliates`

**Enki — AI Trading Bot:**
- Full system live: dashboard, doctrines, trades ledger, settings, leaderboard
- Tiers: Citizen (paper), Commander ($15/mo), Emperor ($29/mo), Cloud Runner ($10/mo)
- Quant engine: ADX filter, TP Ladder (TP1/TP2 partial exits), Kelly position sizing, Correlation Guard (Pearson > 0.85 blocks), DCA averaging, Sharpe/Sortino tracking
- Trailing stops: ATR-based, tightens after TP hits
- Session filter (9:30–16:00 EST), re-entry cooldown, daily 3% + portfolio 12% drawdown limits
- Guardian mode (Fortress Guard) + approval mode
- **Truth Mode (experiment, April 2026):**
  - `enki_truth_trades` + `enki_truth_strategy_stats` tables with RLS
  - `truth_mode_enabled` toggle in settings — locks Risk Profile + Position Size when ON
  - 15-min Inngest scan: momentum + mean reversion signals, same-day dedup, correlation guard
  - `/enki/truth` dashboard: sanity warnings, equity curve with SPY overlay, progress bars (target: 50 trades/strategy), per-strategy stats, CSV export
  - "Truth Mode" link in Enki dashboard navbar
  - Supabase migrations: `20260417000002_enki_truth_mode.sql`, `20260417000003_enki_truth_mode_enabled.sql`

**Pages/Features:**
- `/clips` — Twitch/YouTube tab switcher, connected/not-connected state, "Search Any Channel" with quota counter
- `/admin/users` — searchable user table
- `/admin/affiliates` — payout management
- `/admin/coupons` — coupon create/manage UI (new)
- `/admin/studio-stax` — listing approval/suspend
- `/admin/feedback` — unified feedback inbox
- `/admin/platform-stats` — per-platform success rates
- Studio Stax lister portal
- Link in Bio builder (free on all plans)
- Competitor tracking (3 accounts on free)
- Evergreen recycling
- RSS/blog import
- FeedbackButton component (floating bottom-left pill)
- Mobile hamburger fixed (iPhone 14 notch, `env(safe-area-inset-top)`, 44×44px touch target)

**Growth (April 19, 2026):**
- Growth partner onboarded: Abdus Sohag — `affiliates` + `affiliate_profiles` records created, referral link `?ref=SOHAG` active. 1-week trial at 10% commission.
- 140 content posts written (Apr 20–26) — saved to `content-posts-apr20-apr26.md`, ready to bulk schedule
- SM-Give webhook: 2% of new subscription payments + 100% of donations recorded to `sm_give_allocations`
- Sitemap updated: `/merch` + `/affiliates` added, stale `/affiliate` removed
- Growth partner contract template: `contracts/growth-partner-agreement.html`

**SM-Give & Merch (April 18–19, 2026):**
- `/give` — SM-Give live fund tracker with pulsing counter, fetches `/api/give/stats`
- `/merch` — fully live with Printify POD integration. First shirt showing. Stripe checkout confirmed working.
- SM-Give merch allocation: **75% of gross** revenue from every merch order → `sm_give_allocations`
- `sm_give_allocations` table — tracks give amounts by source (subscription/donation/affiliate_unclaimed/merch)
- `merch_waitlist` table — email capture for merch launch
- Printify real shop ID: `27238436` (was hardcoded as `1` everywhere — now reads `PRINTIFY_SHOP_ID` env var)
- `PRINTIFY_SHOP_ID=27238436` set in Vercel env vars
- Variant image switching: `MerchProductCard` matches selected variant ID against Printify's `variant_ids` array on each image to show correct color mockup
- Webhook auto-fulfills merch orders via Printify Orders API on `checkout.session.completed` with `metadata.type === 'merch'`

**SEO:**
- 28+ `/vs/` comparison pages
- 61+ blog posts
- `sitemap.ts` updated (includes /merch, /affiliates, /enki/truth)
- `public/llms.txt` updated

**X Booster & Quota Restructure (April 20, 2026):**
- X quota updated: Free 28/mo · Pro 150/mo · Agency 400/mo (down from 50/200/500)
- X Booster one-time add-on tiers: Spark (50 posts/$1.99) · Boost (120/$4.99) · Surge (250/$9.99) · Storm (500/$19.99)
- Booster credits stack and roll over month-to-month (never expire)
- `platform_account_registry` table tracks connected/disconnected Twitter accounts with 45-day global cooldown on disconnect (anti-abuse jail)
- Stripe price IDs live for all 4 Booster tiers (see price table below)

**Enki UX Fixes (April 20, 2026):**
- Guardian (Fortress Guard) toggle now lives directly on the Enki dashboard — no settings page required
- Pending approvals banner on Enki dashboard shows count + quick-approve link when approval mode is ON
- 24-hour auto-expiry on pending trades — stale approvals auto-decline so queue never jams
- Leaderboard nav fixed: Enki leaderboard now shows the Enki sidebar nav instead of the public SocialMate nav

**April 21, 2026 — Morning:**
- Admin platform jail UI at `/admin/platform-jail` — review/manage Twitter accounts in cooldown
- X Booster purchase UI in Settings plan tab with booster balance display
- X Booster quota warning in compose — shown when user is near/at X quota
- Partial post retry button in calendar/queue — lets users retry failed platforms on a partial post
- Partial post UX: per-platform breakdown shown in calendar, queue, and drafts (e.g. "Bluesky ✓ · X ✗ (quota)")
- Enki citizen onboarding flow (3-step) — guides new Citizen tier users through paper trading setup
- Enki Truth Mode: explicit Start/Stop controls on `/enki/truth` dashboard
- Studio Stax: per-lister detail page at `/studio-stax/[slug]`
- Studio Stax: criteria checklist on apply page so applicants know what's required
- Pricing page: X Boosters section + Studio Stax "Get Listed" section
- Gilgamesh's Guide: `/gils-guide` landing page, email capture → `gils_guide_subscribers` table, Resend delivery, donation section
- Discord management hub: word filter, automations API, Manage Server link
- Abdus Sohag: `affiliate_profiles` row created + `affiliates.status = 'active'`, workspace upgraded to Pro

**April 22, 2026 — Morning (PRs #195–#201):**
- **Repurpose cost** — bumped from 1 → 5 credits across route, AI features page, compose UI
- **Booster "Popular" badge dark mode** — fixed black badge/border invisible in dark mode; now amber across pricing, settings, onboarding
- **Team dark mode** — fixed all text/input/select/badge contrast across team page for dark mode
- **Client role** — new purple "Client" role added (Owner/Admin/Editor/Viewer/Client); "limited workspace access" permissions; validated in invite API
- **Dashboard plan card** — now shows connected platforms with ✓/dim indicators + seat roster (initials bubbles)
- **Dashboard drag & drop** — 4 stat cards (Scheduled/Drafts/Published/This Week) are now drag-and-drop reorderable; order persists to localStorage; 6-dot grip handle on hover
- **10 new compose templates** — Milestone Announcement, Hot Take, Storytime, Value Drop, Question/Poll, Behind the Numbers, Day in My Life, Lesson Learned, Appreciation Post, Promotion/Offer (total 15)
- **Best Times heatmap fix** — fixed cell sizing, dark mode empty cell visibility, alignment with labels
- **Analytics platform transparency** — "Platform Analytics Status" card shows per-platform data availability (Bluesky ✅, Mastodon ✅, Discord ⚠️, Telegram ⚠️, X 🔒, LinkedIn 🔒); Bluesky sync button; chart labels clarified
- **Inngest concurrency fix** — `publishScheduledPost` concurrency lowered from 10 → 5 (free plan limit); was silently failing since March 17
- **Collapsible sidebar** — desktop hamburger toggle (w-14 collapsed / w-56 expanded), persists via localStorage, icon-only mode with tooltips
- **Enki sidebar nav** — Enki leaderboard now shows Enki nav, not public nav; auto-refresh on dashboard
- **Social inbox** — unified `/inbox` for Bluesky, Mastodon, Telegram, Discord; X tab shows "coming soon"
- **Creator Studio video editor** — `/create`: trim, 8 CSS filters, caption overlay, export via MediaRecorder+canvas, thumbnail capture, platform dimensions

**April 22, 2026 — Evening:**
- **Dashboard crash fix** — `WorkspaceContext` crashed for `pro_annual`/`agency_annual` users because `PLAN_CONFIG['pro_annual']` = undefined. Fixed with `normalizePlan()` helper.
- **SOMA foundation** (PR #202) — `soma_identity_profiles`, `soma_weekly_ingestion`, `soma_credit_ledger` tables; SOMA columns on workspaces; `resetSomaCredits` Inngest cron (`0 0 1 * *`); identity interview onboarding at `/soma/onboarding` (5-step dark UI); credit API at `/api/soma/credits`; identity API at `/api/soma/identity`
- **SOMA dashboard** (PR #203) — `/soma` mission control: credits card, identity status, content queue (approve/edit/skip), mode toggle (Safe/Autopilot); `/soma/upgrade` gate for free users; `/api/soma/mode` PATCH; SOMA nav link in sidebar
- **SOMA weekly generation** (PR #204) — `/api/soma/ingest` (form + file upload), `/api/soma/ingest/upload`, `/api/soma/generate` (7-day content generation via Gemini); `/soma/weekly` page
- **Gilgamesh's Guide update** — Added "The AI Advantage: Building with No Permission" chapter preview (4 vibe-coding points); redesigned donation section into two-card layout ("Support Joshua" + "Pay It Forward")
- **lib/soma-costs.ts** — `SOMA_COSTS`: generate_post=5, generate_daily=12, generate_week=75, ingest_weekly=25, identity_update=15, autopilot_run=50

**April 21, 2026 — Evening (PR #190):**
- **AI Brand Voice** — `user_settings.brand_voice` JSONB column; Settings → Brand Voice tab (Pro+); tone/style/vocabulary/example fields; Gemini prompt injection via `=== BRAND VOICE INSTRUCTIONS ===` block; Compose badge showing active voice
- **Content Repurposing** — `/api/ai/repurpose` (6 formats: thread/email/caption/long_form/short_hook/linkedin_post, 1 credit each); new card in `/ai-features`; inline panel in Compose with Replace/Copy
- **Smart Queue** — `/api/posts/auto-schedule` (Pro+ only; fills 14-day/30-day window at platform-optimal ET hours; 1-hour collision avoidance); `⚡ Auto-schedule Drafts` button in Queue (free users see upgrade prompt); `✨ Use best time` link in Compose datetime picker
- **X-style Analytics Dashboard** — full rewrite of `/analytics`; SVG area chart (no libraries); platform breakdown bars; Bluesky engagement sync via `/api/analytics/bluesky-sync` (public ATP API); best-times heatmap; `bluesky_stats` JSONB column on `posts` table
- **Browser Push Notifications** — `push_subscriptions` table; `/public/sw.js` service worker; VAPID subscribe/unsubscribe/send API routes; `usePushNotifications` hook; Settings → Notifications toggle; Inngest triggers for post published + Enki trade signals. **Needs Vercel env vars:** `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` (generate with `npx web-push generate-vapid-keys`)
- **Studio Stax Renewal Emails** — `studioStaxRenewalEmails` Inngest cron (`0 9 * * *`); 30/14/7-day Resend drip to `studio_stax_slots`; timestamped idempotency (`renewal_email_*_sent_at`); STAX20 discount code; RenewalMate teaser in 30-day email
- **Roadmap page updated** — new shipped items added, Creator Monetization Hub + Content DNA + Unified Inbox added to coming-soon

**April 22, 2026:**
- **PublicNav redesign** — "Audiences ▾" dropdown (Streamers, Agencies, Small Biz); "Resources ▾" dropdown (Blog, Gil's Guide); SOMA added as standalone nav item alongside Studio Stax + Enki; mobile drawer updated with collapsible Audiences/Resources sections + Products section
- **SOMA Autopilot checkout** — `AutopilotModal` now calls `/api/stripe/checkout` with `price_1TP8rU7OMwDowUuUYLBNAVux`; replaced settings redirect with real Stripe subscription checkout
- **Studio Stax price IDs** — Founding (`price_1TP8wi7OMwDowUuUNQW7ER95`) + Standard (`price_1TP8xG7OMwDowUuUO05Vh1Kq`) added to checkout metadata; constants defined in checkout route for future subscription migration
- **WorkspaceContext annual-plan crash fix** — `normalizePlan()` added to map `pro_annual`/`agency_annual` before `PLAN_CONFIG` lookup; prevents crash for annual subscribers

**April 23, 2026:**
- **Dashboard crash fix (React #310)** — `useSensors`/`useSensor` from `@dnd-kit` were declared after `if (loading) return` early return in `DashboardInner`. Moved declarations before early return. Dashboard fully stable.
- **TikTok Developer App submitted** — App name: SocialMatehq. Content Posting API (Direct Post enabled) + Login Kit. Scopes: `user.info.basic`, `video.publish`, `video.upload`. Redirect URI: `https://socialmate.studio/api/tiktok/callback`. Status: **In review** (2–4 week queue). Sandbox environment auto-created (SocialMatehq2) — ignore until Production is approved.
- **LinkedIn Company Page** — setup started at linkedin.com/company/setup/new. Must complete + publish before applying for LinkedIn API.
- **LinkedIn posts drafted** — two long-form SEO/AEO posts written: Post 1 (Apr 23 tonight): TikTok API submission story. Post 2 (Apr 24 morning): bootstrapped builder narrative + feature roundup.

**April 24, 2026:**
- **Streak notifications** (Inngest cron `0 22 * * *`) — alerts users with 3+ day streaks who haven't posted today. Idempotent via notifications table. Push + in-app notification.
- **SOMA autopilot Inngest cron** (`0 12 * * 1`) — Monday weekly run. Rewrote to iterate `soma_projects` (not workspaces): uses per-project platforms, posts/day, window, run caps. Diffs master docs when available. Notifications link to specific project page.
- **SOMA Phase 2** (PR #208) — Named projects system: `/soma/projects/new`, `/soma/projects/[id]` (doc upload, diff results, generate button, doc history, delete modal), all project CRUD APIs, ingest API (Gemini diff analysis, saves versioned master docs, 25 credits), generate API (platform-native single-call generation, run caps, 75 credits). SQL: `soma_projects` + `soma_master_docs` tables with RLS applied.
- **FAQ page** — `/faq` with 6 sections: General, SOMA, Enki, Studio Stax, Billing, Privacy. Added to Resources dropdown in PublicNav and sitemap.
- **Home page nav unified** — `LandingHeader` replaced with `PublicNav` on `/` — now matches all other public pages.
- **Footer** — SOMA + Enki added to Product column in `PublicFooter`.
- **SOMA landing page platforms** — corrected to show live (Twitter, Bluesky, Mastodon, Discord, Telegram) vs coming soon (LinkedIn, Instagram, TikTok). Coming-soon platforms still generate content for manual posting, auto-queues when platform connects.
- **LinkedIn posts** — SOMA-focused long-form post written for LinkedIn distribution.
- **Inngest version** — pinned to `3.54.0` (security-patched 3.x, compatible with 3-arg `createFunction` API used throughout codebase).

**April 25, 2026:**
- **SOMA upgrade gate fix** (PR #213) — Dashboard gate changed from `c.monthly === 0` to `plan !== 'free'`. Pro/Agency users always reach dashboard; credits auto-provision on first load. Credits API now returns `plan` field.
- **SOMA landing pricing cards redesign** (PR #213) — Cards now match SocialMate main pricing page: light bg + colored border per tier (emerald/amber/purple), ✓ bullets, consistent field names.
- **SOMA Full Send mode toggle** (PR #214) — Dashboard now shows all 3 mode buttons (🟢 Safe / ⚡ Autopilot / 🚀 Full Send). Types extended to include `'full_send'` throughout. Full Send shows upgrade modal if not purchased.
- **SOMA email notifications** (PR #214) — Generate route sends Resend email after every run: Safe mode = "queue ready to review", Autopilot/Full Send = "posts scheduled". Non-fatal try/catch.
- **Roadmap updated** (PR #214) — SOMA credit counts corrected (500/2000), FAQ added as shipped, SOMA description updated with Projects/Full Send.
- **Media library bucket fix** (PR #215) — Upload route corrected from `'post-media'` → `'media'` bucket. `media_items` table SQL confirmed applied. `media` bucket confirmed exists (public, 50MB).
- **Admin workspace SQL** — `socialmatehq@gmail.com` workspace set to `plan='agency'`, `soma_credits_monthly=2000`, `soma_autopilot_enabled=true` directly in Supabase (SQL only, not in code — paying customers still see upgrade modal).

**April 27, 2026 (PRs #227–#229):**
- **SOMA Full Send modal fix** (PR #227) — `AutopilotModal` now takes `autopilotEnabled` + `fullSendEnabled` props; already-purchased tiers show "Already Active ✓" instead of a buy button; "Stay on Autopilot" cancel text when Autopilot is active. Added `soma_full_send_enabled` BOOLEAN column to `workspaces`. Credits API + mode API updated. Migration: `20260426000003_soma_full_send_enabled.sql`. Full Send `$20` badge correctly hidden when `full_send_enabled=true`. Mode API now accepts `'full_send'` mode.
- **SOMA connected-platform filter** (PR #228) — New project form fetches `/api/accounts/connected` on mount; only shows platforms the user has actually connected; pre-selects all; skeleton loader + empty state with Settings link. New API route: `GET /api/accounts/connected`.
- **SOMA per-platform schedule** (PR #229) — Each platform gets its own schedule row: posts/day picker (1–N, capped by mode tier) + day presets (Every day / Mon–Fri / Weekends / Custom) + S M T W T F S custom picker. Live summary per platform. Migration: `soma_projects.platform_schedule JSONB`. Projects API accepts + caps `platform_schedule`, derives global `posts_per_day` as max across platforms.
- **Blog batch** — 27 new posts added to STATIC_POSTS covering SOMA, Enki, team approval workflows, link shortener, posting streaks, content DNA, brand voice AI, smart queue, recurring posts, A/B testing, link in bio, competitor tracking, per-platform scheduling, Studio Stax, and the bootstrapped founder story.
- **Roadmap updated** — SOMA per-platform schedule + connected-platform filter added as shipped; schedule templates UI + workspace activity logging added as in-progress.

**April 26–27, 2026 (PRs #221–#224):**
- **Link in Bio click analytics + QR code** (PR #221) — per-link click tracking with `bio_link_clicks` table; QR code displayed in analytics tab using qrserver.com; Download QR button
- **Post performance alerts** (PR #221) — `postPerformanceAlerts` Inngest cron (`0 */6 * * *`); fires push + in-app notification when a post gets unusual engagement (2× avg); Settings toggle for opt-in
- **Team approval workflow** (PR #221) — Editor/Client roles submit posts as `pending_approval`; Owner sees pending count badge on Approvals nav; approve/reject with reason; approved posts auto-schedule
- **A/B post variant testing** (PR #221) — Pro+; two variants created simultaneously, published 24h apart; engagement comparison after publish; winner declared automatically
- **Inngest Map/Set fix** (PR #222) — replaced spread on `Map.values()` / `Set` iterators with `Array.from()` in `step.run` returns — fixes TypeScript build error
- **Link Shortener** (PR #223) — `/links` page; create/copy/delete short links at `socialmate.studio/go/[slug]`; click counter; `/go/[slug]` redirect route; SQL: `short_links` table with RLS
- **Notification count endpoint** (PR #223) — `GET /api/notifications/count` returns `{unread: N}` (0 not 401 for logged-out)
- **Workspace activity feed** (PR #223) — `GET /api/workspace/activity` last 50 events; SQL: `workspace_activity` table with RLS
- **Schedule templates API** (PR #223) — `GET/POST /api/schedule-templates`; SQL: `schedule_templates` table with RLS
- **Unread notification badge** (PR #224) — 🔔 sidebar bell polls `/api/notifications/count` every 60s; red badge capped at 99+; refreshes on pathname change
- **Workspace activity page** (PR #224) — `/activity` page: last 50 events with actor, icon, relative timestamps; sidebar nav item under Manage
- **Posting streak heatmap** (PR #224) — `/streak` page: GitHub-style 365-day contribution graph, hover tooltips, today indicator, legend; stats: current streak / longest / total posts / active days; motivational footer; `/api/streak` route
- **Approval submission notifications** (PR #224) — owners get instant in-app notification when Editor/Client submits a post for approval (both new inserts and existing draft updates); non-fatal

**April 28, 2026:**
- **60 blog posts added** — SQL INSERT into `blog_posts` table. Categories: SocialMate (18), SOMA (15), Enki (10), Studio Stax (10), RenewalMate (4), Founder Story (3). All live at `/blog/[slug]` immediately, no deploy needed.
- **SOMA chunked generation fix** — Gemini large-batch failure root cause: >14 posts in one call → truncated JSON → silent skip. Fix: `CHUNK_SIZE = 14`, loop generates each chunk separately. All platforms now generate correctly.
- **SOMA ingestion project_id fix** — `soma_weekly_ingestion` was missing `project_id` and `is_diff` columns. SQL migration applied. Generate button now appears after page reload. SQL: `ALTER TABLE soma_weekly_ingestion ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES soma_projects(id) ON DELETE CASCADE; ALTER TABLE soma_weekly_ingestion ADD COLUMN IF NOT EXISTS is_diff BOOLEAN DEFAULT FALSE;`
- **SOMA post times fixed** — `startHour` changed from 8 UTC (4am EDT) → 13 UTC (9am EDT). Posts now schedule 9am–7pm Eastern.
- **Queue bulk select** — Gmail-style checkboxes on every post card. Master "Select all" toggle. Per-day "Select day" checkboxes. Sticky bottom action bar: "Move to drafts" | "Delete" | dismiss. Amber highlight on selected cards.
- **Queue mobile safe-area fix** — Bulk action bar and toast now use `env(safe-area-inset-bottom)` so they don't overlap iPhone home indicator.
- **App Store strategy decided** — PWA first (manifest + sw, 1-day build), then Google Play via Capacitor wrapper. Don't wait for LinkedIn/TikTok/Meta APIs. Apple App Store deferred 3-6 months.
- **Toast safe-area audit** — 25+ pages use `fixed bottom-6 right-6` for toasts. Right-corner toasts don't overlap home indicator (centered). Long-term fix: shared `<Toast>` component with safe-area built in.

**April 26, 2026 — Late Night (PR #220):**
- **Recurring posts** — 🔁 Repeat toggle in compose (Daily/Weekly/Bi-weekly/Monthly + optional end date). Auto-reschedules next occurrence after publish via Inngest `computeNextOccurrence`. Queue shows 🔁 badge with rule label. SQL: 4 new columns on posts table.
- **Post as image** — 📸 Canvas PNG export (1200×630, no npm deps) in compose action bar + queue cards. Branded SocialMate card with amber header, word-wrapped content, platform badge.
- **Hashtag suggestions** — #️⃣ Gemini-powered panel in compose. 12 hashtags as clickable chips (append to content, no dupes), Copy all button. 1 credit. Dedicated `/api/ai/hashtags` route.
- **Roadmap + sitemap updated** — New shipped items, /refer + /analytics/dna + /monetize added to sitemap.

**April 26, 2026 — Evening (PR #219):**
- **Referral landing page** — `/refer/[code]` server component. Looks up affiliate by referral_code, shows personalized "invited by" landing with benefits + pricing + CTA to `/signup?ref=[code]`. Sets `ref_code` cookie (7-day) via client component fallback.
- **Weekly digest email** — `weeklyDigest` Inngest cron (`0 8 * * 0`, Sunday 8am UTC). Posts this week, streak, scheduled count, top post preview. Dark amber Resend email → `/analytics`. Skips users with no posts.
- **Enki trade history** — `/enki/trades` page with summary bar (win rate, P&L), filter tabs All/Open/Closed, FIFO P&L calculation, 25/page pagination. `enkiWeeklySummary` cron emails Monday 9am UTC.
- **Upgrade nudges** — `UpgradeNudge` component (dismissible 7 days via localStorage). Sidebar (0 or ≤10 credits), Compose (≤10 credits on free), Settings plan tab (always on free).
- **Competitor post alerts** — `competitorAlerts` Inngest cron (`0 */4 * * *`). Fires push + in-app notification when tracked competitor has new posts in `competitor_posts`.

**April 26, 2026:**
- **Content DNA** (PR #216) — `/analytics/dna` engagement fingerprint dashboard. Best day/time/length/format charts, top 5 posts, platform breakdown. "Sync Bluesky" and "Sync Mastodon" buttons. Requires ≥10 posts with engagement data.
- **Mastodon engagement sync** (PR #216) — `POST /api/analytics/mastodon-sync` pulls favourites/reblogs/replies from each connected Mastodon instance into `mastodon_stats` JSONB column.
- **Creator Monetize landing** (PR #216) — `/monetize` landing page with Tip Jar / Fan Subscriptions / Paywalled Posts preview + waitlist capture → `monetize_waitlist` table. Added to PublicNav + PublicFooter.
- **Admin God Mode overview** (PR #216) — `/admin/overview` server component: total users, new signups 7d, pro/agency counts, SOMA activity, churn signals (paid users 30d+ with no post in 14d), recent signups, quick links.
- **Inbox replies** (PR #217) — `POST /api/inbox/reply` handles Bluesky (full CID chain) and Mastodon (`in_reply_to_id`). Inline reply composer on mention/reply items in `/inbox`. Char counter, spinner, "✓ Replied" on success.
- **Compose thread builder** (PR #217) — 🧵 Thread toggle in compose. Numbered part cards with individual char counters, auto-split by platform limit, add/remove parts, submits as sequential posts 30s apart.
- **Compose save-as-template** (PR #217) — "Save as template" inline section in compose. Title + category, inserts to `post_templates`, auto-collapses on success.
- **SOMA onboarding skip/resume** (PR #218) — Skip button per step, "Save & continue later" saves to localStorage + partial identity POST. Resumes from saved step on return.
- **Compose per-platform preview** (PR #218) — 👁 Preview button opens modal with native-style mock cards for each selected platform (Bluesky, Mastodon, X, Discord, Telegram). Thread mode shows `1/N` indicator.
- **Enki paper trading bug fix** — Removed non-existent `total` column from `enki_trades` inserts (lines 1922 + 1994 in `lib/inngest.ts`). **This was a critical bug — ALL paper trades were silently failing since launch.** Now fixed.
- **SQL run in Supabase (Apr 26):**
  ```sql
  ALTER TABLE posts ADD COLUMN IF NOT EXISTS mastodon_stats JSONB DEFAULT NULL;
  CREATE TABLE IF NOT EXISTS monetize_waitlist (id uuid default gen_random_uuid() primary key, email text unique not null, created_at timestamptz default now());
  ALTER TABLE monetize_waitlist ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Anyone can join waitlist" ON monetize_waitlist FOR INSERT WITH CHECK (true);
  ```

**April 29, 2026 (PRs #255–#260):**
- **Agents Hub** (PR #255) — `/agents` hub page with Live Now / Coming Soon sections. Launched with Email Outreach Agent (5 credits/email, Gemini-powered subject+body, draft history) and Growth Scout (free Pro+, reads competitor_posts + own posts, cadence chart, top competitor posts, insights).
- **Phase 2 roadmap features** (PR #256) — Schedule Templates UI at `/schedules` (full CRUD, day/time slot picker); SOMA Credit Packs component + `/api/soma/credits/purchase` Stripe checkout (3 pack sizes, lazy Stripe init); Workspace activity logging wired into `/api/posts/publish`; PWA Install Prompt (`components/InstallPrompt.tsx`, `beforeinstallprompt`, 7-day dismiss).
- **Newsletter Agent** (PR #257) — Sunday 9am UTC cron. Draft mode: generates newsletter from week's posts via Gemini, emails owner to review. Auto mode: sends to full subscriber list via Resend. Settings at `/agents/newsletter`. Tables: `newsletter_settings`, `newsletter_sends`.
- **Client Report Agent** (PR #257) — Monday 9am UTC cron. Agency-only. Generates HTML email report (posts published, scheduled ahead, active platforms) sent to owner + CC list. Settings at `/agents/client-report`. Table: `client_report_settings`.
- **Repurpose Agent** (PR #258) — Wednesday 9am UTC cron. Pro+. Picks best recent post, repurposes to selected formats (Thread/Caption/LinkedIn/Email/Short Hook) via Gemini, creates drafts. No per-run credits. Settings at `/agents/repurpose`. Table: `repurpose_settings`.
- **Caption Agent** (PR #259) — Daily 11am UTC cron. Agency-only. Watches configured RSS feeds, finds new articles since last run, generates social post drafts via Gemini (custom `parseRSSFeed()` regex parser, no npm deps). Max-per-day cap, tone guidance, draft/auto mode. Settings at `/agents/caption-agent`. Table: `caption_agent_settings`.
- **Trend Scout** (PR #260) — Daily 7am UTC cron. Pro+. Analyzes competitor posts from last 48h + user's own recent posts via Gemini. Returns 5 trending content angles (topic/why_now/angle/sample_caption). Each has a "Draft Post" button that pre-fills Compose. Falls back to evergreen angles if no competitor data. Table: `trend_scout_settings` + `trend_scout_results`.
- **Inbox Agent** (PR #260) — Every 2h cron. Pro+. Refreshes Bluesky tokens from `connected_accounts`, fetches unread mentions, generates suggested replies via Gemini with tone guidance. Stores in `inbox_reply_drafts` with full Bluesky threading metadata (parent_uri/cid, root_uri/cid). Settings page at `/agents/inbox-agent` shows pending drafts with Send/Edit/Dismiss controls that call existing `/api/inbox/reply`. Tables: `inbox_agent_settings`, `inbox_reply_drafts`.
- **All 8 agents now live** — agents hub has zero coming-soon slots. Roadmap page updated.
- **SQL run after each PR** — all 8 new DB tables confirmed applied.
- **Inngest functions to resync after PRs #257–260 merge**: `newsletter-agent`, `client-report-agent`, `repurpose-agent`, `caption-agent`, `trend-scout-agent`, `inbox-agent`

**April 30, 2026 (PR #261):**
- **Toast safe-area fix** — `components/Toast.tsx` shared component added with `env(safe-area-inset-bottom)`. Replaced `fixed bottom-6 right-6` with safe-area style across all 35 pages/components — zero remaining occurrences codebase-wide.
- **Creator Monetization Hub** — full build. Stripe Connect Express onboarding (`/api/monetize/connect` + callback). Settings API (Pro+ gate): page handle/title/bio, tip jar (min/max/enable), fan subscription (price/name/desc/enable). `/monetize/hub` dashboard: connect Stripe, earnings cards (total tips + active subscribers), recent tips + fan list. `/creator/[handle]` public page: tip presets ($1/$3/$5/$10), custom amount, name/message, fan sub card, "Powered by SocialMate". 0% platform cut — all payments via Stripe Connect `transfer_data.destination`. Stripe webhook: `creator_tip` (mark paid), `creator_subscription` (record fan), `customer.subscription.deleted` (mark cancelled). Sidebar: 💸 Creator Hub. Landing page updated to "Now Live — Pro+". SQL: `creator_monetization`, `creator_tips`, `creator_fan_subscriptions` tables with RLS.

---

## Known Issues / Bugs (fix these when touched)

## Audit Findings (April 19–20, 2026) — resolved

- ✅ Broken `/affiliate` links in `/give` and `/referral` — now correctly point to `/affiliates` (PR #160)
- ✅ Exposed debug route `/api/merch/debug` — deleted (PR #160)
- ✅ Missing try/catch in `/api/feature-requests` POST — added (PR #160)
- ✅ `posts_status_check` DB constraint missing `failed` and `partial` values — migration added (PR #173). **Must run SQL in Supabase if not auto-applied:** `ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check; ALTER TABLE posts ADD CONSTRAINT posts_status_check CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'partial', 'pending_approval'));`
- ✅ Twitter quota plan lookup bug — personal workspace defaulted to 'free' plan (50 limit) because `workspaceId=null` caused empty DB lookup. Fixed to query by `owner_id + is_personal=true` (PR #175)
- ✅ Admin email (`socialmatehq@gmail.com`) now bypasses X quota entirely (PR #175)

---

## Admin Tools (built Apr 20, 2026)

- `GET /api/admin/rescue-scheduled` — shows count of posts stuck in 'scheduled' past their scheduled_at
- `POST /api/admin/rescue-scheduled` — force-publishes all stuck posts via `fromInngest:true`, force-fails any that still error so they don't stay stuck forever
- `GET /api/admin/post-diagnostics` — shows today's partial/failed posts with per-platform success/fail breakdown from `platform_post_ids`

Run rescue in browser console (must be logged in as socialmatehq@gmail.com):
```js
fetch('/api/admin/rescue-scheduled', {method:'POST'}).then(r=>r.json()).then(d=>console.log(JSON.stringify(d,null,2)))
```

---

**May 1, 2026 (PR #270):**
- **TikTok live on /accounts** — TikTok moved from Coming Soon → Live Integrations. Connect button hits `/api/tiktok/auth`, OAuth flow works via sandbox credentials. Lands on `/tiktok/studio` after auth.
- **X free quota: 28 → 5 tweets/month** — Free users get 5 tweets/month to taste X. Compose already shows "Buy X Booster →" nudge when exhausted. Booster packs monetize heavier free-tier X usage.
- **TikTok API confirmed free** — No per-post charges from TikTok. Indirect costs only: Supabase storage + egress (~$1-2/100 active users/month). Legitimate competitive edge — most competitors charge $18+/mo for TikTok scheduling.
- **Abdus Sohag cut** — `affiliates.status = 'inactive'`, workspace downgraded to free. SQL run directly in Supabase.

**May 5, 2026:**
- **TikTok FILE_UPLOAD posting working** ✅ — Full end-to-end flow confirmed. `init-upload` → client PUT to TikTok upload URL → `confirm-upload`. Unaudited app restriction: account must be in Private mode until Production API approved. Sandbox banner shown in TikTok Studio.
- **TikTok demo submitted** ✅ — Loom demo video recorded and uploaded to TikTok developer portal. App resubmitted for Production API review. Support ticket `ad7714530aa61ad4` open. No action needed until approved.
- **Gilgamesh's Guides launched** — Free long-form guide series at `/guides`. Vol. 1 "Starting a Business From Scratch" live (PR #278). Vol. 2 "Marketing on Zero Budget" (PR #281). Hub + Guides CTA added to landing page (PR #279). Guides linked in PublicNav Resources dropdown.
- **Landing page polish** (PR #279) — Beta milestone bar removed, founder credibility card added, Guides CTA section replaced empty testimonials placeholder, hero headline tightened. Merged.
- **TikTok status corrected** (PR #280) — Reverted to 'soon' on landing page (was prematurely set to 'live'); platform count back to 5. Will flip to 'live' when Production API approved.
- **Google Play CI/CD** (PR #281) — `.github/workflows/android-release.yml` builds signed AAB on GitHub Actions (ubuntu-latest, no Android Studio needed). Triggers on `git tag v*`. `GOOGLE_PLAY_SETUP.md` rewritten with full GitHub Actions instructions.

**May 6, 2026 (PRs #285–#291):**
- **`public/logo.png` added** (PR #288) — Canonical three-circle grayscale gradient SocialMate icon, copied from `public/image-1778082573747.png`. All nav/footer/page logo references now use `/logo.png`.
- **PublicNav logo** (PR #287) — Bumped from `w-8 h-8` → `w-10 h-10`, pointing to `/logo.png`.
- **PublicFooter logo** (PR #289) — Replaced hardcoded "S" lettermark div with `<img src="/logo.png" className="w-8 h-8 rounded-xl" />`.
- **Privacy + Terms overhaul** (PR #290) — Large logo (`w-24 h-24 rounded-3xl`) added before h1 on both pages. "Last updated" bumped to May 6, 2026. Privacy policy: full TikTok per-scope documentation for developer review (`user.info.basic`, `video.upload`, `video.publish`), paragraph reconciling "SocialMatehq" developer portal name with "SocialMate" brand, "TikTok (planned)" → "TikTok (live)". TikTok app resubmitted May 2026.
- **20 blog posts inserted via SQL** — Business credit, tax strategy, founder story, platform guides, content systems. All high-search-volume personal finance + creator business queries. Full slug list in memory.
- **Sitemap updated** (PR #291) — 20 new blog slugs added to `app/sitemap.ts` `BLOG_SLUGS` array. Merged.
- **Social posts content file** — `content-posts-may6-guides-batch.md` created locally at `C:\Users\jbost\socialmate\`. Use SOMA to generate content from updated CLAUDE.md master doc — do NOT manually schedule posts.

**May 6, 2026 (continued — PRs #292–#297):**
- **Gilgamesh's Guides Vol. 3** (PR #292) — `/guides/business-credit-legal` live. 7 chapters: DUNS, PAYDEX, Licenses, Tax Deductions, LLC vs S-Corp, Banking, Insurance. Merged.
- **Gilgamesh's Guides Vol. 4** (PR #293) — `/guides/vibe-coding-with-ai` live. 7 chapters: What Vibe Coding Is, The Stack, The Workflow, Prompting, Debugging, Going Live, The Mindset. Written in Joshua's voice. Merged.
- **10 vibe coding blog posts + sitemap** (PR #294) — Slugs: vibe-coding-what-it-is-how-to-start, build-saas-no-cs-degree-ai-2026, claude-code-review-solo-founder, best-ai-coding-tools-solo-founders-2026, nextjs-supabase-starter-stack-2026, how-to-prompt-ai-for-coding-beginners, ship-software-faster-with-ai-workflow, building-saas-working-full-time-job, free-stack-build-saas-zero-cost-2026, solo-founder-tech-stack-no-team-2026. Merged.
- **Landing page always-dark** (PR #295) — Root div changed from `bg-white dark:bg-gray-950` to `dark min-h-screen bg-gray-950`. Forces dark background regardless of system preference. Merged.
- **Changelog May 6 entry** (PR #296) — Covers guides complete, Google Play CI/CD, TikTok, blog posts, logo fix, privacy overhaul, dark landing. Merged.
- **Landing page guides fix** (PR #297) — Fixed Vol. 3 (was wrongly showing Vibe Coding), added Vol. 4. Grid changed to 2×2. All 4 guides now live with correct hrefs. Merged.
- **Google Play Console account created** — Developer name: SocialMate. Account ID: 8266379090016264889. Personal account under socialmatehq@gmail.com. AAB built successfully via GitHub Actions (v1.0.4, Android Release Build #5). Device verification: ✅ complete. Identity verification: **submitted May 6, 2026 — awaiting Google review (1–3 days)**. Once approved, phone verification auto-clears, then: create app in console → upload AAB → internal testing.

**May 6, 2026 (end of session — PRs #298–#301):**
- **CLAUDE.md master doc updated** (PR #298, #299, #301) — Full session recap committed. Roadmap cleaned up. Ready to submit to SOMA.
- **SOMA diff fix** (PR #300) — Two bugs fixed: (1) standalone `/api/soma/ingest` now fetches previous raw_input from DB and passes both old+new to Gemini with explicit "extract only what changed" instructions. (2) Project ingest `/api/soma/projects/[id]/ingest` had 4000-char content truncation — bumped to 30000 so full CLAUDE.md gets analyzed. SOMA now generates posts about what's actually new, not full history.
- **SOMA posting schedule editable** (PR #300) — Project page schedule section now has Edit/Save/Cancel controls. Posts/day can be adjusted with +/− buttons. Day toggles work inline. Saves via PATCH to project API.

**May 6, 2026 (continued — PRs #302–#303):**
- **SOMA project ingest 30k + editable schedule** (PR #302) — Cherry-picked missed commit from PR #300: project ingest content truncation bumped 4k→30k chars, editable posting schedule on project page (Edit/Save/Cancel buttons). Both live.
- **SOMA Voice DNA Builder** (PR #303) — Full adaptive personality system:
  - `/soma/voice` page: 40-question personality interview in 3 configurable tiers. Foundation (10q, ~5min): niche, audience, tone, slang, your story, what you solve, what you'd never sound like. Deep Dive (25q): endless topic, niche misconceptions, vulnerability stance, differentiator, contrarian belief, audience frustration, success vision. Advanced (40q): campaign style, hot take ratio, promo ratio, seasonal relevance, anything else.
  - Gemini reads all answers and writes a **Voice DNA summary** (150-200 word instruction block) injected into every future SOMA content prompt. SOMA stops guessing and starts sounding like you.
  - **Post-publish feedback modal**: pops up automatically after every content run. 3 rotating questions from a pool of 8 (voice match rating, more-of requests, what missed the mark, what's happening in your world, tone check). Every response is saved to `soma_voice_feedback` and Gemini rebuilds the Voice DNA from the last 20 feedback items. SOMA gets smarter every single run.
  - Both generate routes now inject `personality_summary` as `CREATOR VOICE DNA` block when available.
  - SOMA dashboard: Voice DNA Builder quick action (purple, prominent). SOMA project page: banner CTA if no profile, tier indicator if active.
  - SQL applied: 3 columns added to `soma_identity_profiles` (`personality_tier`, `personality_answers`, `personality_summary`). New `soma_voice_feedback` table with RLS.

**May 7, 2026 (PRs #304–#308):**
- **SOMA Voice DNA 404 fix** (PR #305) — Done screen "Go to Projects" linked to /soma/projects (doesn't exist). Fixed to /soma/dashboard.
- **SOMA Voice DNA dashboard indicator** (PR #306) — Identity Status card on SOMA dashboard now shows "🧬 Voice DNA: Advanced tier active" + tier badge when completed. Quick action shows "✓ Advanced tier saved" (purple) vs generic CTA.
- **SOMA Project Memory system** (PR #308) — Full persistent content memory per project:
  - `soma_project_memory` table: `running_summary` (rolling manager notes), `topics_covered` (string array), `angles_used` (string array), `total_posts_generated` (int).
  - Ingest route reads memory before Gemini prompt and tells it what NOT to repeat. Gemini returns a mandatory `memory_update` field (2-3 sentence manager notes) appended with timestamp to `running_summary`.
  - Project page SOMA Memory panel: shows running manager notes, topics covered pills, angles used pills, total posts generated, and a "🗑 Clear memory" button for fresh start.
  - **500k character cap** on project ingest (up from 30k). Full document sent — no slicing, no truncation. Documents larger than 500k chars get a 400 error.
  - `/api/soma/projects/[id]/memory` route: GET (read memory) + DELETE (clear/reset).
  - SQL applied: `soma_project_memory` table with RLS.
- **Feedback modal made on-demand** (PR #308) — Removed auto-popup after generate run (was firing before user could review posts). Now shown via "🎙️ Give feedback" button in generate result section. User-initiated only.
- **Voice DNA interview completed by Joshua** — Full Advanced tier (40 questions) answered. Voice DNA summary active in SOMA. SOMA now knows: solo founder building in public, deli job worker, hip-hop + LoL + space culture, authentic hustle tone, "cooked/fire/slay" vocab, specific angles around bootstrapped building, creator tools, and inspiring others to start from nothing.
- **Google Play identity verified** — Google Play Console identity review approved (screenshot confirmed May 7). Next step when ready: play.google.com/console → Create app → Upload AAB v1.0.4 (GitHub Actions run #5 artifact) → Internal testing.
- **LinkedIn post written** — Long-form SEO/GEO/AIO LinkedIn post about SOMA, Voice DNA, and the bootstrapped builder grind. Includes Marcus Aurelius quote opener. Ready to publish manually.

**May 8, 2026:**
- **Google Play closed testing confirmed active** — App is in console. Internal testing: Active. Closed testing: Active (1 track, closed test release published). **Blocker to production: 12 opted-in testers + 14-day run.** Currently 0 opted in.
- **Reddit posts written for tester recruitment** — Two posts drafted May 8:
  - **r/cofounderhunt** — Updated cofounder search post. Title: `[Looking for Cofounder | Sweat Equity Only | Startup Ready] Solo founder, live SaaS, 12 Google Play testers away from production — need someone who can grow this`. Lists all shipped features + equity offer (~10%).
  - **r/buildinpublic** — Build-in-public progress post. Title: `6 weeks solo, bootstrapped, working a deli job — I'm 12 beta testers away from Google Play production. Here's what I actually built.` Shares journey + lessons + naturally asks for closed test opt-ins. Follows r/buildinpublic rules (no pure promo, share progress/lessons).

**May 9, 2026:**
- **Android Developer Verification confirmed** — `studio.socialmate.app` package shows as Registered in Google Play Console (screenshot confirmed May 9). 1 key. Last updated May 7, 2026. Ahead of Google's September 2026 mandatory registration deadline — no action needed.
- **Tester recruitment campaign expanded** — LinkedIn post drafted (updates + inspirational quote + tester CTA). Reddit posts drafted and posted across 6 subreddits:
  - **r/ShowMeYourApps** — Mobile-only, no AI content (Rule 3). Focused on Android closed test ask.
  - **r/alphaandbetausers** — No rules, full feature list including AI tools. Direct tester ask with DM CTA.
  - **r/SideProject** — Story-led showcase with tester ask. DM CTA for closed test invite.
  - **r/sideprojects** — Full detail post (problem, tech stack, what shipped). No funnelling — link included directly. Flair: vibecoded showcase.
  - **r/buildinpublic** — Journey + lessons, callout to commenter advice about 1-2 core workflows. Tester ask woven in naturally.
  - **r/saasbuild** — SaaS Journey flair. Story-led, no links in post. Tester ask via comments.
- **Reddit/DM community engagement** — Replied to comments on recruitment posts. Notable feedback received:
  - OptimalYear2147: advised single success path onboarding ("pick channel → load 5 starter posts → auto-schedule with one tap") and 1-2 tight personas instead of chasing all users. Also volunteered as Android tester — DM sent.
  - newtophillyfromkc: volunteered as Android tester — DM sent.
  - Aggravating-Cheek318: Google Play tester requirement surprised them too, relatable moment.
  - New_Sense2690 (Top 1%): validated deli job + ship grind, echoed "ship less, talk to users earlier" lesson.
- **llms.txt updated (PR #313)** — AI discoverability file brought current: added Agents Hub (8 agents), Gilgamesh's Guides Vol 1-4, SOMA Voice DNA Builder, SOMA Project Memory, Creator Monetization Hub marked live, TikTok sandbox status, blog count bumped to 175+, all missing key pages added. This file is scanned by ChatGPT, Perplexity, Claude, Gemini when answering "what's a Hootsuite alternative" type queries.

**May 11–12, 2026 (PRs #323–#327):**
- **Android Google OAuth deep link fix** (PR #323) — `AndroidManifest.xml` added intent filter for `studio.socialmate.app://` custom scheme. `MainActivity.java` rewritten to intercept OAuth callback, translate custom scheme back to HTTPS, and load in Capacitor WebView. `app/login/page.tsx` detects Android user agent and uses custom scheme as OAuth redirect. Supabase redirect URL `studio.socialmate.app://auth/callback` added to allowed list.
- **Android build fixes** (PRs #324, #325) — Fixed `onResume()` access modifier (must be `public` to match `BridgeActivity`). Bumped `versionCode` 2→3, `versionName` 1.0.5→1.0.7. v1.0.7 (versionCode 3) built via GitHub Actions and uploaded to Play Console closed testing track. 1 tester opted in.
- **Enki mode toggle fix** (PR #326) — Nav "Approval Mode" badge converted from static `<span>` to clickable `<button>`. New `toggleApprovalMode()` function cycles approval↔autonomous. Guardian Pause/Resume now activates in autonomous mode by default.
- **Audit bug fixes** (PR #327) — 7 bugs fixed across 10 files:
  - Duplicate welcome email removed from `auth/callback/route.ts` (Inngest sequence handles it)
  - Enki `total` column removed from all `enki_trades` inserts in `lib/inngest.ts` (column doesn't exist — was silently failing all trades)
  - Dashboard Recent Trades `$NaN` fixed — replaced `t.total.toFixed(2)` with `((t.qty ?? 0) * (t.price ?? 0)).toFixed(2)`
  - HERMES API routes now return 403 for non-admin users (all 5 route files)
  - SOMA `skipPost` status changed from `'failed'` to `'draft'`
  - SOMA `approvePost` now falls back to `now + 10 min` if `scheduled_at` is null
  - Trend Scout dead always-true condition fixed

**May 12, 2026 — Growth & Marketing:**
- **AlternativeTo** — SocialMate submitted, pending 24hr approval. Alternatives added: Buffer, Hootsuite, Later, SocialBee, Publer.
- **Reddit** — u/CaptainNo3491 suspended (appeal submitted). New account: u/InterestingRun7594 (display: SocialMate). Pinned post written. r/cofounderhunt post written. Karma building in progress.
- **Competitor research** — Full pricing audit of 20 competitors completed. Key gaps: Instagram/Facebook/LinkedIn (blocked on API). Key edges: Discord/Telegram scheduling (unique), SOMA Voice DNA, Enki, 8 agents at $5/mo, SM-Give, creator monetization.
- **LinkedIn** — Multiple posts written including build-in-public update, cofounder search angle.
- **Cofounder search** — Actively recruiting marketing cofounder via Reddit/LinkedIn. Offering ~10% sweat equity over 24-month vest, 2-week trial, real contract.

**May 13–14, 2026 (PRs #329–#334):**
- **62 new blog posts + sitemap update** (PR #329) — 3 batches of SQL INSERTs covering Platform Schedulers, Competitor Alternatives, How-To Guides, AI Tools, Creator Guides, Founder Story. 60 new slugs added to sitemap (2 skipped as duplicates).
- **IRIS Dispatch newsletter** (PR #330) — Biweekly build-in-public newsletter named after the Greek goddess of the rainbow + divine messenger (fits deity pantheon: HERMES/ENKI/SOMA/IRIS). Admin compose UI at `/admin/iris` with live preview (iframe), recipient count, confirmation modal, send history. Settings opt-in toggle in onboarding step 1 + Settings → Notifications. IRIS card added to Admin Hub.
- **IRIS unsubscribe** (PR #331) — One-click unsubscribe via `GET /api/unsubscribe/iris?email=xxx`. Sets `iris_opt_in=false`. Confirmation page at `/unsubscribe/iris` with success/error states. CAN-SPAM compliant. Per-recipient HTML generation with unique unsubscribe URLs in every email batch.
- **Admin God Mode fixes** (PR #332) — All workspace queries now exclude admin's own account (`owner_id != adminUserId`). Pro count, Agency count, MRR, SOMA autopilot, churn signals, and recent signups all reflect real users only.
- **Admin God Mode + clickable stats + platform distribution** (PR #333) — Stat cards are now clickable links (Pro → `/admin/users?plan=pro`). Platform Distribution section shows connected account counts per platform. Admin users page reads `?plan=` from URL on mount (Suspense boundary added for Next.js 15 build fix).
- **Badge + OG metadata** (PR #333) — Link-in-bio badge upgraded from 40%-opacity text to amber-S pill. Creator page badge same design. `app/[username]/layout.tsx` + `app/creator/[handle]/layout.tsx` added with `generateMetadata` for per-page OG tags. Blog posts now include `og:image` + Twitter card.
- **Changelog updated** — May 9 + May 14 entries added. Changelog linked in PublicNav Resources dropdown.
- **Monthly credits reset email** — Inngest cron `0 10 1 * *` (1st of each month, 10am UTC). Sends personalized Resend email to every user with their refreshed credit count. Free users get a soft Pro upgrade nudge. Registered in `/api/inngest/route.ts`.
- **Signup social proof** — "30+ creators already scheduling with SocialMate" with emoji avatars added to signup page left panel.
- **SQL to run in Supabase:** `supabase/migrations/20260513000001_iris_newsletter.sql` (ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS iris_opt_in BOOLEAN DEFAULT true; + CREATE TABLE iris_dispatches).
- **Edition #1 of IRIS Dispatch sent** — Subject: "We're Live, We're Building, and We're Not Stopping". 29 recipients. Joshua confirmed receipt.

**May 17, 2026 (PRs #361–#363):**
- **Calendar definitive fix** (PR #361) — Root cause: `.select('id, content, ..., tags')` explicit column list fails silently if `tags` column doesn't exist (Supabase returns `error + null`, not empty array). Fix: changed to `select('*')` everywhere in calendar page. Also added `wsLoading` guard so fetch only runs after WorkspaceContext resolves, auto-navigate effect to jump to the month with first scheduled post when current month is empty, limit bumped to 1000. **Never add explicit column lists or date filters to the calendar query — both cause silent failures.**
- **Full-app i18n — core pages wired** (PR #362) — All 12 core app pages now use `useI18n()` and `t()`: Dashboard, Queue, Calendar, Analytics, Accounts, Inbox, Team, Drafts, Streak, Links, Activity, Media Library. New namespaces added: `app_streak`, `app_links`, `app_activity`, `app_media` — in all 7 locale JSON files (en + zh with real translations, es/de/fr/pt/ru use English fallback). TypeScript enforces all locale files match `typeof enMessages` — **rule: any new key added to en.json must be added to ALL 6 other locale files in the same commit or build fails.**
- **Full-app i18n — remaining pages wired** (PR #363) — Compose, AI Features, Agents hub, SOMA landing, Enki landing all wired with `t()`. New namespaces: `app_ai_features`, `app_agents`, `app_soma_landing`, `app_enki_landing`. All 7 locale files in sync — validated clean.
- **Language switcher on landing page fixed** (PR #363) — `PublicNav.setLocale()` now calls `router.push()` to the locale URL when on a public landing page (`/`, `/es`, `/de`, etc.). Previously it only wrote to localStorage which has no effect on server-rendered pages.
- **Birthday promo BDAY31 activated** (PR #363) — Start date moved from 2026-06-15 to 2026-05-17. Active now through Dec 15, 2026. Amber banner + BDAY31 apply button live on /pricing.

**May 17, 2026 (continued — PRs #366–#367):**
- **Settings + Bio page i18n** (PR #366) — White Label tab, Brand Voice tab, Appearance tab, and `app/[username]/page.tsx` all wired with `useI18n()`. All 7 locale files validated clean.
- **40 blog posts — batch 9** (PR #367, SQL: `supabase/blog_batch_9.sql`) — SM-Give/charity (6), creator monetization (6), Guide Vol. 5 promos (3), BDAY31 promo (3), building in public/founder (4), i18n/multi-language (3), SOMA (4), Enki (3), Studio Stax (3), creator economy (5). All 40 live in DB. Sitemap updated with all 40 slugs.
- **Changelog** — May 16 + May 17 entries added. Blog count in llms.txt bumped to 240+.

**May 17, 2026 (continued — PRs #364–#365):**
- **i18n — inner app pages** (PR #364) — SOMA dashboard (`app_soma_dashboard`), SOMA voice (`app_soma_voice`), Enki dashboard (`app_enki_dashboard`), Creator Hub (`app_creator_hub`), creator public page (`app_creator_public`) all wired with `useI18n()`. Fixed variable shadowing bug in Enki dashboard where `.map((t) => ...)` shadowed the `t()` i18n function — was a correctness bug. All 7 locale files validated in sync. **i18n inner pages are now fully complete across all major app sections.**
- **Gilgamesh's Guide Vol. 5 — Creator Monetization** (PR #365) — `/guides/creator-monetization` live. 8 chapters: Why Creators Stay Broke, The Monetization Stack, Tip Jars, Fan Subscriptions, Digital Products & Courses, Brand Deals, Affiliate Marketing, Stacking to $5K/month. Added to guides hub + sitemap.
- **Build fix** (PR #365) — `zh.json` missing `app_creator_public.loading` key caused Vercel TypeScript build failure. Fixed + validated all 7 locale files clean.

**May 16, 2026 (PRs #350–#355):**
- **next-intl / Turbopack build error resolved** (PRs #350, #352) — `createNextIntlPlugin` injects a webpack alias that Turbopack silently ignores, causing "Couldn't find next-intl config file" at runtime. Fix: removed the plugin wrapper from `next.config.ts`, rewrote `LocalizedLanding.tsx` with direct JSON imports + `createT()` helper, deleted `i18n/routing.ts` + `i18n/request.ts` + all `/app/{locale}/layout.tsx` files, cleaned `proxy.ts` of all next-intl imports.
- **i18n scope clarified** — Only public landing pages (`/es/`, `/de/`, `/fr/`, `/pt/`, `/ru/`, `/zh/`) are localized. The full app interior (Dashboard, SOMA, Enki, Compose, Analytics, Settings, etc.) is English-only. Full-app i18n added to roadmap as a major planned feature.
- **Calendar bug fix** (PRs #351–#355) — Multiple PRs chasing a query issue. Root cause: `created_at` column may have no DB default, so SOMA-generated posts have `created_at = NULL`. Any `gte('created_at', start)` filter silently excludes them. Fix: removed all date filters from the calendar query. Fetch all user posts (`limit 500`) ordered by `scheduled_at`. `getPostDateKey()` uses `scheduled_at || created_at` for cell placement — correct for all post types.
- **Girlfriend's SocialMatePR prompt** — Claude chat mentor prompt written for video content brand setup across TikTok, YouTube, Instagram Reels, Pinterest, Snapchat, Facebook Reels. Includes Phase 1 (account setup), Phase 2 (content strategy + schedule), Phase 3 (Video Launch Pack template per-platform for every video).
- **r/cofounderhunt post updated** — New post written with updated stats (80+ scheduled posts, SOMA Voice DNA active, IRIS newsletter sent, all 8 agents live). Posted to r/cofounderhunt via u/InterestingRun7594.

**May 14, 2026 (PR #335):**
- **Onboarding Quick Start** — New "Quick Start" path on Step 1 skips name entry + post generation; jumps straight to platform select → connect → done. Full flow unchanged for users who want it.
- **Auto-schedule starter posts** — Step 4 now saves posts as `status='scheduled'` with staggered times (2h from now, +30min each) instead of drafts. Users land on dashboard with posts already on calendar — first win moment.
- **Referral detection** — Reads `ref_code` cookie on onboarding mount; shows personalized "You were invited by a friend" banner on Step 1.
- **Simplified Step 1** — Removed "Here's what you'll do" info box. IRIS opt-in compacted to single checkbox row. Quick Start link added as secondary CTA.
- **Signup page Google Play beta CTA** — "Android App — Join Beta" card on desktop panel and mobile hero, links to `play.google.com/apps/testing/studio.socialmate.app`. Passively recruits testers 24/7 from organic signup traffic.
- **Pricing page updates** — "Join 30+ creators" social proof in header. Birthday promo banner: teaser before 6/15/2026, active 6/15–12/15 (code `BDAY31`, 31% off, Joshua turns 31). Secure checkout trust strip below plan cards (Stripe badge, cancel anytime, no CC for free).
- **Stripe coupon BDAY31 created** — Promo ID: `promo_1TX2Ay7OMwDowUuUiLXH4Fe3`. 31% off, Once, expires Dec 15 2026.
- **Wall of Love page** — `/wall-of-love` live. Empty state with social proof + mailto testimonial CTA. Add entries to `TESTIMONIALS` array in `app/wall-of-love/page.tsx` as quotes come in. In sitemap + PublicFooter.
- **Email capture on all 4 Gilgamesh Guides** — `GuideEmailCapture` component added to end of all 4 guides. Uses existing `/api/gils-guide/subscribe` endpoint + `gils_guide_subscribers` table.
- **Admin data fix** — `googlereview@socialmate.studio` workspace downgraded from pro → free in both `workspaces` and `user_settings` tables. Admin God Mode now shows 0 paid users (accurate).
- **LinkedIn origin story saved** — Real founding story documented: RenewalMate marketing struggle → ProductHunt Claude Code crossover → built SocialMate with Claude. Use for all marketing copy.
- **LinkedIn post style documented** — Memory saved: body + hashtags + quote, first comment has socialmate link. Always output both blocks.

---

## Pending / In Progress

- **Google Play — closed testing** — Cooking slowly. v1.0.7 (versionCode 3) uploaded, 1 tester opted in. Passive CTA on signup page. *Do not revisit until June 2026.*

- **LinkedIn API** — LinkedIn Company Page started. Next step: create Developer App at developer.linkedin.com → apply for `r_organization_social` + `w_organization_social` permissions. Review typically 2–4 weeks. **Medium difficulty — mostly a waiting game once submitted.**

- **Instagram / Facebook** — Both require Meta App Review (same process, can be one app). Harder than LinkedIn — Meta review is strict. Business account required, users need Business/Creator Instagram accounts. **Hard — plan for 4–8 week review timeline.** Not worth starting until LinkedIn is live.

- **SOMA content run** — Submit updated CLAUDE.md (May 17) to SOMA project. Priority for content generation.

- **Cofounder search** — Actively recruiting marketing cofounder via Reddit/LinkedIn. ~10% sweat equity over 24-month vest, 2-week trial, real contract.

- **Wyoming LLC annual report** — File when budget allows.

- **Enki Truth Mode** — 50-trade minimum per strategy. Check `/enki/truth` periodically.

- **Wall of Love** — Live at `/wall-of-love`. Add entries to `TESTIMONIALS` array when real quotes come in.

- **Birthday promo BDAY31** — ✅ ACTIVE NOW through Dec 15, 2026. Stripe coupon live (`promo_1TX2Ay7OMwDowUuUiLXH4Fe3`).

- **SocialMatePR (girlfriend's video brand)** — Claude chat mentor prompt delivered May 16. First video to all platforms once profiles are ready.

**Roadmap (next up):**
- **New features** — Core platform is stable. Focus: growth, testimonials, LinkedIn API application.
- **i18n — remaining inner pages** — Creator Hub, Bio, Settings (full), SOMA/Enki sub-pages still need `t()` wiring. Wire when those pages are touched.
- **Product Hunt follow-up** — "We've shipped 50+ features since launch" post. Target: June 1.
- **Gilgamesh's Guides Vol. 5+** — Creator monetization deep-dive.
- **Discord community** — Own Discord server as tester pool + feedback loop.
- **Apple App Store** — Deferred 3–6 months.
- **LinkedIn publishing** — Blocked on API credentials. On hold.
## Confirmed Done (stop asking about these)

- ✅ **Calendar query fix (May 16, PR #355)** — Removed all date filters. Fetch all user posts (limit 500) with no `created_at`/`scheduled_at` range. SOMA posts may have null `created_at`; date filters silently excluded them. Never add a date filter to the calendar query again.
- ✅ **next-intl removed (May 16, PRs #350, #352)** — `createNextIntlPlugin` incompatible with Turbopack. Removed from `next.config.ts`. `LocalizedLanding.tsx` uses direct JSON imports. `i18n/routing.ts`, `i18n/request.ts`, and all locale layout files deleted. `proxy.ts` cleaned of all next-intl imports. Build is clean. Never re-introduce `next-intl` or `createNextIntlPlugin`.
- ✅ **Full-app i18n — all major pages complete (May 17, PRs #362–365)** — Core pages (Dashboard, Queue, Calendar, Compose, Analytics, Accounts, Inbox, Team, Drafts, Streak, Links, Activity, Media, AI Features, Agents hub, SOMA landing, Enki landing) + inner pages (SOMA dashboard, SOMA voice, Enki dashboard, Creator Hub, creator public page). **i18n build rule: any new key in `en.json` must be added to ALL 6 other locale files in the same commit — TypeScript enforces `typeof enMessages` shape parity across all locales.** Still unwired: Settings full, Bio editor, SOMA/Enki sub-pages (truth, trades, doctrines) — wire when touched.
- ✅ **Gilgamesh's Guide Vol. 5 (May 17, PR #365)** — Creator Monetization live at `/guides/creator-monetization`. Email capture included. Never ask to build it again.
- ✅ **Calendar select('*') fix (May 17, PR #361)** — Explicit column lists on calendar fetch caused silent null returns if any column (e.g. `tags`) didn't exist. Now uses `select('*')` + wsLoading guard. Never revert to explicit column list on calendar query.
- ✅ **Landing page language switcher fix (May 17, PR #362)** — `PublicNav.setLocale()` now calls `router.push('/${code}')` when on a public locale path. Don't revert to localStorage-only.
- ✅ **i18n locale validation pattern** — Run `node -e "const en=require('./messages/en.json'); ..."` before every i18n commit to catch missing keys across all 7 files before Vercel does.
- ✅ **Onboarding Quick Start + auto-schedule + referral detection (May 14, PR #335)** — Quick Start path live. Starter posts now schedule to calendar (not drafts). Referral cookie banner. Never revert posts to draft status.
- ✅ **Pricing birthday promo + social proof + secure checkout (May 14, PR #335)** — BDAY31 coupon live in Stripe. Banner date-gated in UI. Trust strip below plan cards.
- ✅ **Wall of Love page (May 14, PR #335)** — `/wall-of-love` live. Add testimonials to TESTIMONIALS array when collected.
- ✅ **Guide email capture (May 14, PR #335)** — GuideEmailCapture component on all 4 Gilgamesh Guides. Never ask to add email capture to guides again.
- ✅ **Admin data fix (May 14)** — googlereview@socialmate.studio downgraded to free. Admin God Mode shows accurate 0 paid users.
- ✅ **TikTok Production API approved (May 17, 2026)** — Production API approved by TikTok. Platform flipped to 'live' on landing page + LocalizedLanding. Platform count updated 5→6. Sandbox banner removed from /tiktok/studio. Roadmap entry moved to 'shipped'. llms.txt updated. CLAUDE.md Platforms section updated. Never list TikTok as coming soon or pending again.
- ✅ **AlternativeTo listing approved (May 14)** — Live. 9 alternatives listed. Never ask to submit again.
- ✅ **IRIS Dispatch + unsubscribe (May 13–14, PRs #330–331)** — Newsletter live. Edition #1 sent + received. Unsubscribe flow CAN-SPAM compliant. Settings opt-in toggle live. Never ask about building IRIS again.
- ✅ **Admin God Mode exclusion fix (PR #332)** — Admin's own account excluded from all stats. Pro=0, Agency=0, MRR=$0 accurately reflects real users.
- ✅ **Clickable admin stats + platform distribution (PR #333)** — Cards link to filtered users. Platform distribution section live. Suspense fix deployed.
- ✅ **Badge + OG metadata (PR #333)** — Amber-S pill badge on bio + creator pages. Per-page OG tags for [username], creator/[handle], and blog posts.
- ✅ **Monthly credits reset email** — Inngest cron live. Sends 1st of every month. Registered in route.ts.
- ✅ **Changelog updated + linked in nav** — May 9 + May 14 entries. Changelog in PublicNav Resources.
- ✅ **Signup social proof** — "30+ creators" social proof added to signup page left panel.
- ✅ **Voice DNA Builder completed (May 7)** — Joshua completed full Advanced tier (40 questions). Voice DNA summary active and injected into every SOMA generate prompt. Never ask Joshua to complete the interview again.
- ✅ **SOMA Project Memory (PR #308, May 7)** — `soma_project_memory` table live. Ingest reads/writes memory. 500k char cap. Full doc no truncation. Project page shows memory panel + Clear button. `/api/soma/projects/[id]/memory` GET + DELETE live.
- ✅ **Feedback modal on-demand (PR #308, May 7)** — Auto-popup removed. Manual "🎙️ Give feedback" button in generate result. User controls when to answer.
- ✅ **Voice DNA 404 fix (PR #305, May 7)** — Done screen links to /soma/dashboard. Merged.
- ✅ **Voice DNA dashboard indicator (PR #306, May 7)** — Tier badge + "✓ saved" state on SOMA dashboard. Merged.
- ✅ **Google Play identity approved (May 7)** — Confirmed via screenshot. Console ready for app creation.
- ✅ **Google Play app created + closed testing active (May 8)** — App in console. Internal testing: Active. Closed testing: Active (1 track). Still need 12 opted-in testers + 14 days to apply for production.
- ✅ **SOMA Credit Packs fully live (Apr 30, PR #263)** — Stripe products created (Starter $4.99/75cr, Growth $12.99/225cr, Pro $24.99/500cr). Price IDs hardcoded. Labels updated. Webhook wired from PR #256.
- ✅ **Capacitor Android wrapper + Link in Bio monetize blocks (Apr 30, PR #262)** — `capacitor.config.json`, Capacitor deps, `GOOGLE_PLAY_SETUP.md`, Link in Bio tip/subscribe quick-add, Creator Hub share section (QR + copy links).
- ✅ **Toast safe-area fix (Apr 30, PR #261)** — `components/Toast.tsx` created. All 35 pages fixed. Zero remaining `fixed bottom-6 right-6` occurrences.
- ✅ **Creator Monetization Hub (Apr 30, PR #261)** — Tip jar + fan subscriptions live. Stripe Connect Express. `/monetize/hub` dashboard. `/creator/[handle]` public page. Webhook handlers for tip/sub/cancel. SQL: 3 tables applied.
- ✅ **Agents Hub complete (Apr 29)** — All 8 agents live: Email Outreach, Growth Scout, Newsletter, Client Report, Repurpose, Caption, Trend Scout, Inbox Agent. PRs #255–260 all merged. SQL for all 8 tables applied.
- ✅ **Schedule Templates UI (PR #256)** — `/schedules` page built. Full CRUD.
- ✅ **SOMA Credit Packs UI+API (PR #256)** — Component + checkout route built. Stripe products created Apr 30.
- ✅ **Workspace activity logging (PR #256)** — Wired into post publish route.
- ✅ **PWA Install Prompt (PR #256)** — `InstallPrompt` component added to layout.

- ✅ **PR #229** — SOMA per-platform schedule (posts/day + day picker per platform). Migration: soma_projects.platform_schedule. Merged.
- ✅ **PR #228** — SOMA new project only shows connected platforms (GET /api/accounts/connected). Merged.
- ✅ **PR #227** — SOMA Full Send modal fix + soma_full_send_enabled column. Modal hides purchased tiers. Merged.
- ✅ **PR #221 batch** — Bio click analytics, post performance alerts, team approval workflow, A/B variant testing. Merged.
- ✅ **PR #222** — Inngest Map/Set spread fix (TypeScript build error). Merged.
- ✅ **PR #223 batch** — Link shortener (/links + /go/[slug]), notification count endpoint, workspace activity API, schedule templates API. SQL: short_links + schedule_templates + workspace_activity. Merged.
- ✅ **PR #224 batch** — Unread notification badge in sidebar, /activity page, /streak heatmap, approval submission notifications. Merged.

- ✅ **PR #220 batch (Apr 26 late night)** — Recurring posts, post-as-image, hashtag suggestions, roadmap+sitemap update. Merged.
- ✅ **PR #219 batch (Apr 26 evening)** — Referral landing /refer/[code], weekly digest email, Enki trade history + weekly P&L email, upgrade nudges, competitor alerts. Merged.
- ✅ **Twitch env vars** — `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` set in Vercel. Callback: `https://socialmate.studio/api/clips/twitch/callback`. DONE.
- ✅ **Supabase migrations** — `usage_events`, `notifications`, `competitor_accounts`, `hashtag_collections`, `studio_stax_admin_featured`, `enki_truth_trades`, `enki_truth_strategy_stats`, `coupons`, `coupon_redemptions` all confirmed ran.
- ✅ **Login redirect** — all Enki pages use `?redirect=` not `?next=`. Fixed.
- ✅ **Stripe SDK v20 promo code params** — `promotion: { type: 'coupon', coupon: id }` format confirmed and in use.
- ✅ **enkiTruthModeScan** — registered in `app/api/inngest/route.ts`. Running every 15 min.
- ✅ **Growth partner affiliate account** — Abdus Sohag (thez1shann@gmail.com) created in Supabase Auth + linked in `affiliates` table. UUID: `1ac0b2ca-fc44-4a87-8781-67f9b81d4fbe`. Commission rate: 10% (trial). Temp password: SocialMate2026!
- ✅ **SM-Give renewal tracking** — `invoice.payment_succeeded` now records 2% to `sm_give_allocations` with source `subscription_renewal`. Only fires on `billing_reason = subscription_cycle`. PR #164.
- ✅ **SM-Give webhook integration** — `sm_give_allocations` writes added to Stripe webhook: 2% of subscription checkouts, 100% of donation checkouts. Both non-fatal. PR #148 merged.
- ✅ **Supabase migrations (Apr 18)** — `sm_give_allocations`, `merch_waitlist` confirmed ran.
- ✅ **Supabase email confirmation** — "Confirm email" toggle is ON (verified Apr 19). Users must confirm before first sign-in.
- ✅ **Merch Printify shop ID** — Real shop ID `27238436` found via debug endpoint. `PRINTIFY_SHOP_ID` env var added to Vercel. Fixed in `merch/page.tsx`, `merch/checkout/route.ts`, and `stripe/webhook/route.ts`. PR #157 merged.
- ✅ **Merch variant image** — `MerchProductCard` now updates image when user selects a different color/size. PR #158 merged.
- ✅ **SM-Give merch allocation** — Corrected from 30% to 75% of gross in webhook handler. PR #159 merged.
- ✅ **Content posts rewrite** — All 140 posts rewritten to ≤280 chars including hashtags. Organized by day + platform. `content-posts-apr20-apr26.md` ready to bulk schedule. PR #155 merged.
- ✅ **Audit fixes (Apr 19)** — Broken `/affiliate` links fixed, debug route deleted, feature-requests error handling added. PR #160 open.
- ✅ **X quota restructure (Apr 20)** — New limits: Free 28 · Pro 150 · Agency 400. X Booster one-time add-on tiers live in Stripe (Spark/Boost/Surge/Storm). Booster credits stack and roll over.
- ✅ **Platform account jail (Apr 20)** — `platform_account_registry` table tracks Twitter accounts with 45-day global cooldown on disconnect. Anti-abuse: disconnecting and reconnecting to reset quota is blocked.
- ✅ **Enki Guardian toggle on dashboard (Apr 20)** — Fortress Guard toggle now on the dashboard page directly. Pending approvals banner + 24-hr auto-expiry on stale trades.
- ✅ **Enki leaderboard nav fix (Apr 20)** — Leaderboard now renders Enki nav, not public SocialMate nav.
- ✅ **Partial post UX (Apr 21)** — Per-platform breakdown shown in calendar/queue/drafts. Retry button for failed platforms. Done.
- ✅ **Admin platform jail UI (Apr 21)** — `/admin/platform-jail` lists Twitter accounts in 45-day cooldown. Done.
- ✅ **X Booster Settings UI (Apr 21)** — Purchase UI + balance display on Settings plan tab. Quota warning in compose. Done.
- ✅ **Enki citizen onboarding (Apr 21)** — 3-step onboarding flow for new Citizen tier users. Done.
- ✅ **Enki Truth Mode Start/Stop (Apr 21)** — Explicit Start/Stop controls on `/enki/truth`. Done.
- ✅ **Studio Stax detail page (Apr 21)** — Per-lister page at `/studio-stax/[slug]`. Criteria checklist on apply page. Done.
- ✅ **Pricing page Studio Stax section (Apr 21)** — "Get Listed" section with Founding Member + Standard cards. Done.
- ✅ **Gilgamesh's Guide (Apr 21)** — `/gils-guide` landing page live. Email capture → `gils_guide_subscribers`. Resend delivery. Done.
- ✅ **Discord management hub (Apr 21)** — Word filter + automations API + Manage Server link live. Done.
- ✅ **Abdus partner access (Apr 21)** — `affiliate_profiles` row created, `affiliates.status = 'active'`, workspace upgraded to Pro. Dashboard accessible.
- ✅ **AI Brand Voice (Apr 21)** — Settings tab (Pro+), Gemini injection, Compose badge. Migration: `brand_voice` JSONB on `user_settings`. Done.
- ✅ **Content Repurposing (Apr 21)** — `/api/ai/repurpose`, ai-features card, Compose inline panel. 6 formats, 1 credit. Done.
- ✅ **Smart Queue / Auto-schedule (Apr 21)** — Pro+ only. Queue page button + Compose best-time picker. Done.
- ✅ **Analytics overhaul (Apr 21)** — X-style dark dashboard. SVG area chart, heatmap, Bluesky engagement sync. Done.
- ✅ **Push notifications (Apr 21)** — Service worker, VAPID routes, Settings toggle, Inngest triggers. Needs VAPID env vars in Vercel.
- ✅ **Studio Stax renewal emails (Apr 21)** — Inngest cron 9am daily, 30/14/7-day Resend drip, STAX20 code. Needs SQL migration run.
- ✅ **PublicNav dropdowns (Apr 22)** — Audiences ▾ + Resources ▾ dropdowns, SOMA standalone. Done.
- ✅ **SOMA Autopilot Stripe checkout (Apr 22)** — Real Stripe subscription checkout wired. price_1TP8rU7OMwDowUuUYLBNAVux. Done.
- ✅ **Studio Stax Stripe price IDs (Apr 22)** — Constants + metadata added to checkout route. Founding: price_1TP8wi7OMwDowUuUNQW7ER95 / Standard: price_1TP8xG7OMwDowUuUO05Vh1Kq. Done.
- ✅ **Annual plan crash fix (Apr 22)** — normalizePlan() in WorkspaceContext. Done.
- ✅ **Dashboard React #310 crash fix (Apr 23)** — dnd-kit hooks moved before early return in DashboardInner. Dashboard fully stable.
- ✅ **TikTok API submitted (Apr 23)** — SocialMatehq app submitted for review. Content Posting API + Direct Post + Login Kit. Status: In review.
- ✅ **Dashboard React #310 fix (Apr 22)** — useSensors/useSensor (dnd-kit) declared after early return, violating Rules of Hooks. Moved before `if (loading) return`. Pushed directly to main. Done.
- ✅ **SOMA upgrade gate (Apr 25)** — Gate now checks `plan !== 'free'` instead of `c.monthly === 0`. Admin workspace manually set to agency via SQL. Done (PR #213).
- ✅ **SOMA Full Send toggle (Apr 25)** — All 3 mode buttons live in dashboard. Full Send type added throughout. Done (PR #214).
- ✅ **SOMA email notifications (Apr 25)** — Generate route sends Resend email on every run. Done (PR #214).
- ✅ **Media Library (Apr 25)** — `/media` page live, `media_items` table confirmed applied, `media` bucket confirmed public. Bucket name fix merged (PR #215).
- ✅ **Roadmap updated (Apr 25)** — SOMA credit counts fixed, FAQ shipped, media library shipped. Done (PR #214).
- ✅ **Content DNA (Apr 26)** — `/analytics/dna` engagement fingerprint dashboard + Mastodon sync + DNA API. PR #216 merged.
- ✅ **Admin God Mode (Apr 26)** — `/admin/overview` server component with users/revenue/SOMA/churn signals. PR #216 merged.
- ✅ **Creator Monetize landing (Apr 26)** — `/monetize` landing + waitlist table. PR #216 merged.
- ✅ **Inbox replies (Apr 26)** — Bluesky + Mastodon inline reply from `/inbox`. PR #217 merged.
- ✅ **Compose thread builder + save-as-template (Apr 26)** — PR #217 merged.
- ✅ **SOMA onboarding skip/resume (Apr 26)** — PR #218 merged.
- ✅ **Compose per-platform preview (Apr 26)** — PR #218 merged.
- ✅ **Enki paper trading fix (Apr 26)** — Removed `total` column from `enki_trades` inserts (was silently failing since launch). Fixed in current PR.
- ✅ **SOMA autopilot cron email (Apr 26)** — Confirmed live in `somaAutopilotRun` at line 3675 of `lib/inngest.ts`. Sends Resend email after every Monday cron run.
- ✅ **TikTok Developer App setup (Apr 22)** — App: SocialMatehq. Content Posting API added, Direct Post ON, scopes: video.publish + video.upload, socialmate.studio domain verified, TIKTOK_CLIENT_KEY + TIKTOK_CLIENT_SECRET in Vercel. Pending: record demo video (Win+G) + submit for review.

---

## Weekly Content System

Each Friday (or end of sprint), archive the current CLAUDE.md as `CLAUDE-week-of-YYYY-MM-DD.md`.
Then diff the two files through Gemini/Claude to generate a week's worth of social posts based on what changed.
The diff = the story. Ship it to every platform.

---

## Coding Rules

- **Always consider infrastructure cost** — if it hits an external API, it needs quota gating
- **Use prebuilt/existing patterns** — don't reinvent. Reuse existing auth, RLS, Inngest, Stripe patterns already in the codebase
- **Token efficiency matters** — run focused, targeted tasks. Use plan mode (Shift+Tab) for complex multi-file work before writing code
- **Mobile first** — always check iPhone notch, touch targets (44×44px min), safe area insets
- **No hardcoded wrong numbers** — check actual Stripe price IDs in Appendix B before touching payment code
- **Don't break what works** — UI/UX must flow cleanly. If unsure, ask before touching working flows
- **Commit frequently** with descriptive messages
- **One branch + one PR per fix** — never accumulate changes from multiple fixes onto one branch
- **Always open a PR after pushing** — push + PR is one step, always provide the direct PR link
- **Update CLAUDE.md** every time a significant feature ships

---

## Stripe Live Price IDs (DO NOT GUESS THESE)

| Product | Price ID | Amount |
|---|---|---|
| Pro Monthly | price_1T9S2v7OMwDowUuULHznqUD5 | $5.00/mo |
| Agency Monthly | price_1TFMHp7OMwDowUuUgeLAeJNY | $20.00/mo |
| Pro Annual | price_1TFMHx7OMwDowUuUl9PqWxMs | $55.00/yr |
| Agency Annual | price_1TFMI07OMwDowUuUoHfKJEpo | $209.00/yr |
| White Label Basic | price_1TFMHt7OMwDowUuU56Fzw4fE | $20.00/mo |
| White Label Pro | price_1TFMIG7OMwDowUuUcjNNGB0Q | $40.00/mo |
| Credits Starter (100cr) | price_1TFMI47OMwDowUuUhTrbe3oq | $1.99 |
| Credits Popular (300cr) | price_1TFMI77OMwDowUuU0wDZWcCL | $4.99 |
| Credits Pro (750cr) | price_1TFMIA7OMwDowUuUwI3SEGCR | $9.99 |
| Credits Max (2000cr) | price_1TFMID7OMwDowUuU2sQgbIx9 | $19.99 |
| Donation $5 | price_1TFMIJ7OMwDowUuUj5amigA0 | $5.00 |
| Donation $10 | price_1TFMIM7OMwDowUuUcmN2hPwT | $10.00 |
| Donation $25 | price_1TFMIQ7OMwDowUuUfdZXeATH | $25.00 |
| Donation $50 | price_1TFMIT7OMwDowUuUHgqWqtUZ | $50.00 |
| Enki Commander Monthly | price_1TMthL7OMwDowUuUndSIejcJ | $15.00/mo |
| Enki Commander Annual | price_1TMthy7OMwDowUuURnoHc2Qq | $120.00/yr |
| Enki Emperor Monthly | price_1TMtiN7OMwDowUuUU5rzK88L | $29.00/mo |
| Enki Emperor Annual | price_1TMtis7OMwDowUuUpQ2hZamc | $240.00/yr |
| Enki Cloud Runner | price_1TMtkc7OMwDowUuU8aepieuq | $10.00/mo |
| X Booster Spark (50 posts) | price_1TOK9u7OMwDowUuUlgZPUwLZ | $1.99 |
| X Booster Boost (120 posts) | price_1TOKAH7OMwDowUuUn6pcSTQd | $4.99 |
| X Booster Surge (250 posts) | price_1TOKBv7OMwDowUuUsykwyuUa | $9.99 |
| X Booster Storm (500 posts) | price_1TOKCg7OMwDowUuU2PEzonf6 | $19.99 |
| SOMA Autopilot | price_1TP8rU7OMwDowUuUYLBNAVux | $10.00/mo |
| SOMA Full Send | price_1TPlGE7OMwDowUuUWS0QUnLw | $20.00/mo |
| Studio Stax Founding Member | price_1TP8wi7OMwDowUuUNQW7ER95 | $100.00/yr recurring |
| Studio Stax Standard | price_1TP8xG7OMwDowUuUO05Vh1Kq | $150.00/yr recurring |
| SOMA Credits Starter (75cr) | price_1TRx227OMwDowUuU8IRlxaRh | $4.99 one-time |
| SOMA Credits Growth (225cr) | price_1TRx2U7OMwDowUuU5ZqeMu6a | $12.99 one-time |
| SOMA Credits Pro (500cr) | price_1TRx2w7OMwDowUuU4t8lMMwe | $24.99 one-time |

---

## What NOT to Touch Without Asking

- Stripe webhook handler — live payments depend on it. The coupon affiliate commission block (added April 2026) is the only intentional addition; don't touch the rest
- RLS policies — they're in place for security, don't remove or bypass
- Inngest publish jobs — idempotency guards are critical, don't remove them
- The three-pool credit system logic — complex, tested, working
- Any env vars — don't suggest hardcoding these

---

## Context: The Human Behind This

Joshua works a deli job and builds this in his spare hours. He's solo, bootstrapped, budget-conscious. Every decision needs to consider:

1. Does this cost money at scale?
2. Can we use a free tier, prebuilt solution, or existing pattern instead?
3. Does this break anything that's already working?

He's not building features for features' sake. He's building toward 2,000–4,000 paying Pro users and $10k–$20k MRR in 12 months. Every task should move the needle on stability, growth, or user trust.

**Goal: Power to the people. Build the door.**
