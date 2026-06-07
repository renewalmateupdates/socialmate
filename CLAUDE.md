# SocialMate — Claude Code Project Context

> Drop this file in the root of the repo. Claude Code reads it automatically every session.
> Previous week snapshot: `CLAUDE-week-of-2026-04-11.md`

---

## Who I Am

**Joshua Bostic** — Founder & CEO, Gilgamesh Enterprise LLC (Wyoming LLC).
Solo bootstrapped builder. Quit the Walmart deli job as of June 2026 — now doing tree cutting/service work (works with Ron, a tree service client he also built a demo website for). Building SocialMate nights and weekends.
Also building a portfolio of local business websites as a side service (conversion-focused, mobile-first, flat-fee).
Vision: Creator OS — the home base for any creator, streamer, business, or person who wants to build online.
Mission: Power to the people. Tear down gatekeeping walls. Build the door.

---

## Hearthforge (Co-Founded Venture — Partnership with Butch Chiappinelli)

**Hearthforge** — 3D printing product company. Co-founded 50/50 with Butch Chiappinelli. Separate from Gilgamesh Enterprise LLC.
Co-founder: **Butch Chiappinelli** (handles manufacturing + CAD design; owns a Bambu Lab X1 Carbon).
Joshua handles web, software, and business side.
**Domain:** hearth-forge.com (live on Vercel, GitHub: renewalmateupdates/hearthforge-web)

**Logo:** Confirmed June 2026 — bold H letterform with flame integrated between the vertical pillars. Black/white. Designed by Butch. Embossable version for physical prints. Logo is `public/logo.png` in the repo.

**First product:** Modular desk rail system for streamers and content creators.
- Horizontal rail clamps to back edge of a gaming desk
- Accessories clip on at adjustable positions: mic holder, camera mount, headphone hook, Stream Deck stand, cable management clips
- Design language: matte black, minimal, premium
- C-clamps integrated into the rail as one printed piece; end caps still in design as of June 2026

**Business model:** Sell STL files digitally + ship physical prints + eventual file subscriptions.
**Entity:** No LLC yet. Will do joint LLC or DBA under Gilgamesh Enterprise LLC when revenue starts.
**Do NOT make:** Anything water-inclusive (cookie cutters, plant pots) — micro holes trap moisture and mold.
**Important:** Always describe Hearthforge as a CO-FOUNDED PARTNERSHIP with Butch — never as Joshua's solo venture. Misrepresenting this would be misleading to Butch.

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

**Live now:** Bluesky, Discord, Telegram, Mastodon, X/Twitter (pay-per-use, $0.01/tweet), TikTok (Production API approved May 17, 2026), LinkedIn (OAuth live May 21, 2026 — personal profile, `w_member_social` scope)
**Coming soon:** YouTube, Pinterest, Reddit
**Roadmap:** Instagram, Facebook, Threads, Tumblr, Pixelfed, LinkedIn Company Pages

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

## What's Been Built (as of May 21, 2026)

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

### Active — fix when touching the file

- **`border-black` spinners throughout app — dark mode invisible.** 20+ pages use `animate-spin rounded-full border-b-2 border-black` without a `dark:border-white` variant. In dark mode the spinner is invisible against dark backgrounds. Dashboard fixed (PR #459). All others still need fixing. Files with big page-level spinners missing dark: fix: `ab-tests`, `accounts`, `achievements`, `ai-features`, `approvals`, `compose`, `competitor-tracking`, `content-gap`, `drafts`, `evergreen`, `invite`, `link-in-bio`, `onboarding`, `queue`, `reset-password`, `rss-import`, `settings`, `sm-pulse`, `sm-radar`, `workspaces/new`. Fix: add `dark:border-amber-500` or `dark:border-white` alongside existing `border-black`.
- **Streak counts published posts only** — penalizes SOMA users who scheduled a week in one session. Streak should count SCHEDULED posts (scheduled_at date) not just published. Fix: in streak API route, count posts where `scheduled_at::date = target_date` OR `published_at::date = target_date`.
- **Mobile: 2 fixed-bottom toasts missing safe-area** — `app/admin/white-label/page.tsx` and `app/hermes/campaigns/[id]/page.tsx` still use `fixed bottom-6 right-6` without `env(safe-area-inset-bottom)`. All 35 other pages were fixed in PR #261 but these two were missed.

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
- **Voice DNA interview completed by Joshua** — Full Advanced tier (40 questions) answered. Voice DNA summary active in SOMA. SOMA now knows: solo founder building in public, tree service worker (quit deli June 2026), hip-hop + LoL + space culture, authentic hustle tone, "cooked/fire/slay" vocab, specific angles around bootstrapped building, creator tools, and inspiring others to start from nothing. Note: if you submit updated CLAUDE.md to SOMA, it will regenerate the Voice DNA context.
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

**May 19, 2026 (PR #382):**
- **Bluesky token rotation race condition fixed** — Root cause: Inngest runs up to 5 posts concurrently. When two Bluesky posts fire at the same time, both read the same refresh token from the DB. The first one rotates it via `refreshSession`; the second gets a 400 error and was falling through with the now-stale access token, causing `createRecord` to fail with 401. Fix: on non-401 refresh failure, immediately re-read the `connected_accounts` row from DB to get the freshest token before attempting `createRecord`.
- **SOMA post time jitter** — `calculateScheduledAt` in `/api/soma/generate` was scheduling all morning posts at exactly `09:00:00`, afternoon at `14:00:00`, evening at `19:00:00`. Added 0–44 min random jitter so same-slot posts spread out and don't all land in the same Inngest concurrency window.
- **`platform_errors` JSONB column added to `posts`** — Publish errors per platform are now persisted to the DB (both Inngest and direct-publish paths). Previously errors were only in memory during the publish run and couldn't be diagnosed after the fact.
- **Calendar error visibility** — Failed/partial posts in the calendar now show the actual error message on hover (e.g. "Bluesky failed: session expired and could not be refreshed"). Also fixed: `PlatformBreakdown` was only rendered for `partial` posts — now also renders for fully `failed` posts.
- **SQL applied:** `ALTER TABLE posts ADD COLUMN IF NOT EXISTS platform_errors JSONB DEFAULT NULL;`

**May 18, 2026 (PRs #371–#372):**
- **TikTok Script Generator** (PR #371) — `/api/ai/tiktok-script` route (three-pool credit deduction, same pattern as hashtags). Accepts `{ topic, duration, tone }`, returns `{ hook, body[], cta }`. Dedicated page at `/ai-features/tiktok-script` with result cards + copy buttons. 5 credits. Gemini model `gemini-2.5-flash`.
- **GIF Export in Creator Studio** (PR #371) — `gifenc` installed. `exportGif()` added to `app/create/CreatePageClient.tsx`. Frame-by-frame canvas render loop: CSS filter + caption overlay baked in, 10fps, capped at 5s, 480px wide. "Export GIF" button + "max 5s" label in action bar. `types/gifenc.d.ts` module declaration added.
- **AI Features page** (PR #371) — `VIDEO_TOOLS` array added (TikTok Script Generator, Creator Studio & GIF Export, Clips Studio). New "Video & TikTok Tools" section. TikTok live banner (dark gradient, emerald badge, "Connect TikTok →" CTA) inserted before AI Tools section.
- **Blog batch 10** (PR #372) — 30 posts: TikTok scheduling (6), Twitch/YouTube clips (5), video content strategy (5), GIFs for social media (4), creator tool stacks (5), TikTok growth (5). `supabase/blog_batch_10.sql`. Sitemap updated with all 30 slugs. `llms.txt` blog count bumped to 270+.
- **Streamers page fix** — TikTok moved from `COMING_PLATFORMS` to `LIVE_PLATFORMS` in `app/for/streamers/page.tsx`.

**May 18, 2026 (session 2 — nav fix + bug sweep):**
- **TikTok Studio in public nav** — Added `/tiktok/studio` as flat link in desktop header (alongside Studio Stax / SOMA / Enki / Monetize). Added to mobile Products section. TikTok is Production-approved and live — it belongs in the nav.
- **Audience pages added to nav** — `/for/tiktok-creators` and `/for/video-creators` added to the Audiences dropdown in `PublicNav.tsx`. Both pages already existed; they were just not linked.
- **Calendar `pending_approval` status** — Bug: `Post` interface was missing `'pending_approval'` from status union type. `STATUS_DOT` and `STATUS_BADGE` maps also lacked an entry, so approval-queue posts would render with no dot/badge. Fixed with purple styling.
- **blog_batch_11.sql INTERVAL syntax** — Doubled single-quotes (`''3 days''`) in 19 places caused SQL error when run in Supabase. Fixed in worktree copy (was already fixed on main via direct commit).
- **Social media glossary** (PR #378) — `/glossary` page with 62 A-Z social media terms, client-side search, JSON-LD schema. PRs from background agents merged.
- **vs/ hub + 8 new comparison pages** (PR #379) — Canva, Plann, Social Champ, Ripl, Preview App, Gain, Kontentino, Unum added. Sitemap + llms.txt updated.
- **35 blog posts** (PR #380, batch 11) — SEO-targeted posts across platforms/scheduling/AI tools.
- **TikTok Studio UX polish** (PR #379) — Mobile fix: settings panel extracted to `PostSettingsPanel` component, rendered in both desktop panel + Post tab. Audio tab explains API limitation. Filter tab with color swatches. TikTok brand color `#fe2c55`. Pill-style tabs + backdrop-blur header.

**May 18, 2026:**
- **TikTok Production API approved** — Live since May 17, 2026 9:50 PM. Production credentials updated in Vercel. Platform count updated to 6 everywhere. Sandbox banner removed. TikTok now fully live for all users at /accounts and /tiktok/studio.

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

**May 14–18, 2026 — HERMES Cold Outreach System (PRs #318–#327):**
- **HERMES** — Full cold outreach system for Joshua (admin-only at `/hermes`). Campaigns with goal, persona, channel selection (email/Bluesky/Mastodon), 4-step sequence (Intro/Follow-up 1/Follow-up 2/Break-up), draft + auto modes.
- **Campaign management** — `/hermes/campaigns/new` creates campaigns. `/hermes/campaigns/[id]` shows prospects + messages tab.
- **Prospect management** — Add prospects manually with Hunter.io email finder (enter domain + name → gets email + confidence score). `HUNTER_API_KEY` required in env.
- **Auto-discover** — `lib/hermes-discover.ts` scrapes Substack leaderboard, GitHub user search, dev.to articles, and Hashnode GraphQL for prospects. Extracts emails from profile pages. No paid API required. Rate: ~5 prospects per source per run. Stores discover config in `apollo_query` JSONB column for weekly auto-runs.
- **Message generation** — Gemini-2.5-flash writes personalized Intro email per prospect. Context-aware by source (newsletter writer vs developer blogger). Falls back to safe default on parse failure.
- **Send** — Email via Resend. Bluesky DM via `chat.bsky.convo` XRPC. Mastodon DM via `/api/v1/statuses` with `visibility: 'direct'`.
- **Sequence follow-ups** — `hermesFollowUpCron` Inngest function fires daily, checks `next_contact_at` per prospect, generates next step message and sends or drafts.
- **Tables:** `hermes_campaigns`, `hermes_prospects`, `hermes_messages` — all with RLS.
- **SM Pulse** (`/sm-pulse`) — 20-credit niche trend scan. Calls `tool: 'pulse'` on `/api/ai`. Returns ranked trending topics in user's niche. Blurred preview state when no result.
- **SM Radar** (`/sm-radar`) — 20-credit content intelligence report. Calls `tool: 'radar'`. Returns content gaps, competitor weak spots, best formats, hook styles, timing signals, and one concrete opportunity for this week.

**May 19, 2026 (PRs #385–#388):**
- **Activation funnel** — First-use tracking: onboarding completion %, platform connected, first post published. Dashboard shows activation progress for new users. GA4 events fire on key milestones.
- **GA4 integration** — Google Analytics 4 wired in. Events: `onboarding_complete`, `platform_connected`, `post_published`, `upgrade_clicked`, `ai_tool_used`. `NEXT_PUBLIC_GA4_ID` env var.
- **Calendar retry button** — Failed posts in calendar now have a "Retry" button that re-fires the Inngest publish job for failed platforms only.
- **Comeback emails** — `comebackEmails` Inngest cron fires weekly for users who haven't posted in 7+ days. Personalized Resend email with their last post + streak. Non-fatal.
- **IRIS auto-draft cron** — Inngest function that generates a weekly IRIS Dispatch draft automatically (admin-only). Admin reviews before sending.
- **Admin health alert** — Inngest daily cron checks for stuck scheduled posts (past due + still `status='scheduled'`). Sends admin email if count > 0.
- **Roadmap voting** — Users can upvote roadmap items. Votes stored to DB, displayed on `/roadmap`.
- **Post Score** (Pro+, 5 credits) — AI-powered 0–100 quality score for any draft. Rates hook, clarity, and engagement potential. Shown inline in Compose.
- **Scheduling window + DND** — Settings → Scheduling tab. Set posting hours (e.g. 9am–9pm) and a Do-Not-Disturb window. Smart Queue respects window. Stored on `user_settings`.
- **Goal-based onboarding** — Step 1 now asks primary goal (schedule content / grow audience / manage clients). Saved to `user_settings.onboarding_goal`.
- **Loyalty achievement system** — `achievementCheckerCron` Inngest function fires daily. Awards credits for: first post, 10/50/100/500 posts, 7/30/100-day streaks, 3/6/12-month tenure, 3+ platforms connected, bio page created. Credits awarded via earned pool. `user_achievements` table with RLS.
- **Monthly-reset upgrade nudges** — `UpgradeNudge` dismiss now resets monthly (was 7 days). Free users see nudge again at the start of each calendar month.

**May 20, 2026 (PRs #389–#391):**
- **SIGIL** — Link in Bio renamed to SIGIL across all UI, nav, sidebar, and copy. Consistent with SocialMate deity naming system (HERMES/ENKI/SOMA/IRIS/HESTIA/SIGIL/ZENITH).
- **HESTIA** — Community tab at `/community` (was AGORA, renamed to HESTIA). Post wins, questions, tips, feedback, intros. Emoji reactions (🔥💯👏🚀❤️🤔), threaded replies, connected-account gate to keep it real. Categories: All / Wins / Questions / Tips / Feedback / Intros. Tables: `community_posts`, `community_replies`, `community_reactions`.
- **Guides PDF download** — "Download as PDF" button on all 5 Gilgamesh Guides. Opens native print dialog with a faint SocialMate watermark baked into background via `@media print` CSS. No external services.
- **Achievements page** — `/achievements` — 13 badges across Posts / Streaks / Tenure / Account. Unlocking awards earned credits. Progress bars for locked badges. Linked in sidebar Grow section.
- **30-Day Creator Challenge** — `/challenge` — Post every day for 30 consecutive days, earn 50 bonus credits. Daily progress heatmap, day counter, streak display.
- **ZENITH creator card** — `/zenith` — Shareable presence card showing platform connections, post count, streak, achievements, top post. Social share buttons.
- **Badge embed** — Embeddable SVG badge at `/badge.svg`. Copy embed code from Settings → Profile to show "Built with SocialMate" on your site.
- **Discount page** — `/discount` — `NONPROFIT50` (50% off Pro, honor system) and `STUDENT25` (25% off Pro, .edu email, honor system). No verification required.
- **HERMES → Gemini 2.5-flash** — Message generation upgraded from 1.5-flash to 2.5-flash. Smarter, faster outreach copy.
- **AI rate limiting** — 10 AI requests per minute per user. Returns 429 with retry-after header. Prevents accidental API abuse.
- **Blog batch 12** — 55 posts on creator growth, platform strategy, and community. SQL in `supabase/blog_batch_12.sql`.

**June 7, 2026:**
- **gilgameshenterprise.com — blog filtering + FAQ** — Blog page now has client-side category filter tabs (All / Business / Founder Story / Tech / etc.). FAQ page added at `/faq` — accordion layout, 3 sections: About GE, The Ventures, Philosophy. Nav updated to include FAQ link. Sitemap updated. Pushed to `renewalmateupdates/gilgameshenterprise`.
- **renewalmate.com — blog filtering + FAQ + nav polish** — Blog page now has category filter tabs (All / Alternatives / Personal Finance / Tips / Privacy). FAQ page added at `/faq` — 4 sections: About RenewalMate, Features, vs. Competitors (RocketMoney / Monarch / Mint / YNAB), Privacy. Footer updated with FAQ + Blog links. Sitemap now includes all blog slugs. Pushed to `renewalmateupdates/renewalmate`.
- **Hearthforge logo integrated** — Butch Chiappinelli's H+flame logo (PNG, black/white) saved to `public/logo.png` in `hearthforge-web` repo. Replaced Flame icon from lucide-react in PublicNav, PublicFooter, and AdminSidebar. `invert` CSS class renders it white on dark backgrounds. Merged `feat/full-polish` → `master`. Live on hearth-forge.com.
- **Gilgamesh Enterprise — Hearthforge co-founder language** — Hearthforge venture card now explicitly states "Co-founded with Butch Chiappinelli" and lists role split (Joshua: web/business, Butch: manufacturing/CAD). Tag updated to "3D Products — Partnership". Badge changed from "Coming Soon" to "Live" with correct URL `hearth-forge.com`.
- **GE logo saved locally** — Squarespace CDN URL for GCE logo replaced with locally-saved `/public/logo.png` — prevents image breaking when Squarespace hosting expires June 10.
- **Hearthforge SEO files** — `public/llms.txt`, `public/robots.txt`, `public/humans.txt` added to hearthforge-web repo. Merged to master.
- **Joshua's job updated** — Quit Walmart deli as of June 2026. Now works tree cutting/service with Ron (the same client he built a demo site for). CLAUDE.md "Who I Am" section updated.
- **Mate series — 3 live sites** — gilgameshenterprise.com (dark/gold holding company), renewalmate.com (green fintech landing), hearth-forge.com (3D printing — partnership with Butch). All on Vercel free tier. Combined with socialmate.studio = 4 active domains in the Gilgamesh portfolio.
- **Reddit posts drafted** — r/developers_hire update post (FOR HIRE, 3 new sites added to portfolio) and r/micro_saas update post (image bug root cause, 3 sites launched, MRR question). Both ready to post under u/InterestingRun7594.

**June 6, 2026 (PRs #467–#468):**
- **Gilgamesh Enterprise LLC website** — `gilgameshenterprise.com` migrated off Squarespace ($25/mo cancelled before June 10 charge). Rebuilt as Next.js on Vercel (free). Dark/gold design, professional holding company hub. Ventures listed: SocialMate, RenewalMate, Hearthforge (partnership noted), Gilgamesh's Guides. Logo pulled from Squarespace CDN and saved locally as `/public/logo.png`. GitHub: `renewalmateupdates/gilgameshenterprise`.
- **RenewalMate website** — `renewalmate.com` rebuilt from scratch. CTO's NS1 nameservers replaced with GoDaddy defaults (taking back domain DNS control). New landing page: green rebrand, "Stop Bleeding Money on Bills You Forgot About" hero, waitlist email capture, mission section, feature grid, comparison to RocketMoney/Monarch. Backend app (`app.renewalmate.com`) was down — CTO appears to have abandoned it. GitHub: `renewalmateupdates/renewalmate`.
- **Hearthforge website** — `hearth-forge.com` already live on Vercel. Butch's new logo (H+flame, black/white) integrated into nav, footer, and admin sidebar across all 3 component files. `llms.txt`, `robots.txt`, `humans.txt` added for SEO discoverability. GitHub: `renewalmateupdates/hearthforge-web`. Logo at `public/logo.png`.
- **SOMA image bugs fixed (PR #468):**
  1. Images were showing in queue but NOT posting to social profiles — root cause: `urls.regular` Unsplash images (1-3MB) exceed Bluesky's 1MB blob limit; uploads silently failed. Fixed by using `urls.small` (~400px, <500KB).
  2. Same image repeated across a week's posts — root cause: module-level `imageCache` returned same photo for same keyword. Fixed: removed module-level cache; each run now passes a `usedUrls: Set<string>` and retries up to 3x with random seed to get unique photos.
  3. TikTok failing through SOMA — root cause: no `case 'tiktok'` in `publishToAll`, hits `default` = instant fail. SOMA generates text posts; TikTok requires video. Fixed: skip TikTok in generate loop when no `include_video_url` on the project, with clear error message.
- **SOMA platform editing** — project page now has Edit button on Platforms card. Opens checkboxes for connected platforms (fetches from `/api/accounts/connected`). Saving updates both `platforms` and `platform_schedule` (adds new platforms with defaults, removes deselected ones).

**June 5, 2026 (PR #466):**
- **FCP loading skeletons — extended sweep** — Added `loading.tsx` skeleton screens to 5 more high-traffic pages: `/accounts`, `/blog`, `/features`, `/settings`, `/signup`. Combined with PR #459 (dashboard + onboarding), every major app route now has an instant skeleton on navigation. Preconnect hints added to `app/layout.tsx` for CDN and Supabase domains — shaves 100–200ms from first resource fetch on cold loads.
- **Build fix: invalid `revalidate` on `/features`** — `export const revalidate = 86400` was added to `app/features/page.tsx` which has `'use client'` — Next.js 15 treats `revalidate` exports on client components as a function reference, causing a prerender crash. Removed the export. Rule: `export const revalidate` only works in Server Components, never in `'use client'` files.

**June 1, 2026 (PRs #461–#464):**
- **Full public site i18n — all pages wired (PR #461)** — Every public-facing page now uses `useI18n()` and `t()`. Pages wired: `/pricing`, `/faq`, `/glossary`, `/features`, all 15 `/for/*` audience pages, all 75 `/vs/*` comparison pages (`vs_shared` namespace), `/affiliates`, `/give`, `/enterprise`, `/community`, `/zenith`, `/discount`, `/challenge`, `/achievements`, `/wall-of-love`, `/tiktok`, `/monetize`, `/blog`, `/guides`, `/about`. 74 namespaces total across 9 locales. `translate()` now supports `{param}` interpolation. **i18n is now 100% complete across the entire public site.**
- **Fix: vs/ metadata moved to layout.tsx (PR #462)** — i18n agent added `'use client'` to all 76 `/vs/` pages but left `export const metadata` in the same file — Next.js 15 doesn't allow both. Script `scripts/fix-vs-metadata.js` extracted metadata from each `page.tsx`, created a `layout.tsx` per route, and removed it from the page file. 76 layout files created. Build passing.
- **SEO/AI discovery overhaul (PR #463)** — `public/llms.txt` massively expanded (580+ lines): Preferred AI Summary block, deep per-system docs for SOMA/Enki/HERMES/IRIS, competitor comparisons, 14 Q&A pairs for AI queries, all 7 platforms with technical details. `public/humans.txt` added — team, stack, mission. `public/ai.txt` added — AI crawler policy, canonical facts, preferred summary. `public/.well-known/ai-plugin.json` added — ChatGPT plugin manifest. `app/layout.tsx`: 3 JSON-LD schemas added (SoftwareApplication expanded, new Organization schema, new WebSite schema with SearchAction). New vs/ pages: `vs/brandwatch`, `vs/klaviyo`, `vs/linktree`, `vs/beehiiv`, `vs/convertkit`, `vs/notionhq`, `vs/creatorstudio` — each with `layout.tsx` + `page.tsx`, i18n wired.
- **3 new vs/ pages + blog batch 18 (PR #464)** — `vs/mailchimp` (email-first, no Discord/TikTok/Bluesky scheduling), `vs/tiktok-native` (TikTok Studio is TikTok-only, we cross-post to 7 platforms), `vs/substack` (newsletter vs social layer, RSS import use case, 0% creator cut vs Substack's 10%). 20 new blog slugs added to sitemap (batch 18, June 2026).

**May 31, 2026 (PR #459):**
- **FCP performance sweep** — Vercel Speed Insights audit done. Dashboard (67 RES, 3.23s FCP) and Onboarding (70 RES, 4.28s FCP) had no `loading.tsx` anywhere in the app — client pages painted nothing visible while JS bundle loaded. Added `app/dashboard/loading.tsx` and `app/onboarding/loading.tsx` (animated skeletons). Dashboard loading spinner was `border-black` — invisible on dark mode backgrounds (anti-flash script sets dark class before hydration), causing browser to measure 3s+ FCP on painted-but-invisible content. Fixed to `border-amber-500`. Blog `[slug]` revalidate bumped 3600→86400 — hourly ISR cache expiry caused international CDN nodes (China 5.98s, Argentina 4.02s, France 3.59s) to hit US East origin. Blog index `revalidate = 86400` added — was SSR on every request (500-row Supabase query per page load). PR merged.

**May 26, 2026 (PRs #431–#432):**
- **Bug sweep — `.maybeSingle()` fixes (PR #431)** — Switched `.single()` → `.maybeSingle()` on upsert lookups in Bluesky connect, Telegram connect, and admin coupons routes. `.single()` returns a PGRST116 error for 0 rows; `.maybeSingle()` returns `{ data: null, error: null }` as intended. Metadata updated: title "7 Platforms Live", OG/Twitter descriptions list all 7 platforms.
- **Performance — initial JS bundle cut ~400KB (PR #432)** — Five targeted fixes to push desktop Real Experience Score from 88 → 90+:
  - `lib/i18n.ts` + `I18nContext.tsx`: Only English (~62KB) is statically bundled. The 8 other locale files (es/de/fr/pt/ru/zh/ja/ko) now load on demand via `dynamic import()` when a user switches language. Previously all locales were eagerly bundled into every page's JS.
  - `app/layout.tsx` + `components/LazyClientComponents.tsx`: FeedbackWidget, CookieBanner, InstallPrompt moved to a `'use client'` wrapper loaded with `next/dynamic + ssr:false`. `ssr:false` can't live in a Server Component — requires the client wrapper.
  - `app/page.tsx`: Removed dead server-side `supabase.auth.getUser()` call (result was computed but never used in JSX) and removed `PHLaunchBanner` (launch window was April 1–2, always returns null).
  - `app/blog/[slug]/page.tsx`: Added `export const revalidate = 3600` (ISR) + `generateStaticParams` for hardcoded slugs — blog posts now pre-build at deploy time instead of hitting Supabase on every request.
- **`/tiktok` public landing page** — SEO landing page at `/tiktok` targeting "TikTok scheduler" search queries. Added to sitemap.
- **PublicNav desktop consolidation** — Products dropdown on desktop nav, cleaner right side.

**May 28, 2026 (PRs #442–#446 + hotfix):**
- **SOMA video URL attachment (PR #442)** — `include_video_url TEXT DEFAULT NULL` column added to `soma_projects` (migration `20260527000002_soma_video_url.sql`). Text input on project page for a video URL. PATCH to project API saves it. Generate route reads `include_video_url` and injects a `VIDEO URL TO INCLUDE:` instruction block into Gemini prompt. Clear button removes saved URL. Cyan input + green "✓ Saved" pill with Remove button.
- **Enterprise tier (PR #443)** — `/enterprise` landing page (dark-forced, contact form with name/email/company/team size/message). Enterprise plan card added as 4th column on `/pricing` (custom pricing, unlimited seats, SLA, White Label Pro included, dedicated onboarding, priority support, custom contract). `POST /api/enterprise/inquiry` saves to `enterprise_inquiries` table + sends Resend HTML email to `socialmatehq@gmail.com`. "Enterprise" link in PublicNav desktop + mobile. Sitemap + llms.txt updated. SQL: `enterprise_inquiries` table (no RLS — admin-only). No Stripe — provisioned manually by Joshua.
- **White Label improvements (PR #444)** — 4 missing state vars added to Settings white label panel (`wlRemoveBranding`, `wlSaving`, `wlLogoUploading`, `wlLogoError`). Full UI: file upload button (calls `/api/white-label/logo-upload` to Supabase media bucket), inline logo preview, color swatch, remove-branding Pro-only toggle, custom domain locked state for Basic users. Default accent color corrected from `#000000` → `#f59e0b` (amber). SQL: `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS white_label_remove_branding BOOLEAN DEFAULT FALSE;`
- **SOMA Full Send expansion (PR #445)** — `somaFullSendDailyRun` Inngest function: cron `'0 13 * * *'` (daily 1pm UTC / 9am EDT), only Full Send workspaces (`soma_full_send_enabled = true`), max 7 posts/day per platform, 30 runs/month cap. Registered in `app/api/inngest/route.ts`. Project page shows 🚀 Full Send badge when active. Mode-aware max shown in schedule editor. Full Send daily cron runs separately from Autopilot's weekly Monday run — both coexist. **Resync `soma-full-send-daily-run` in Inngest after deploy.**
- **i18n remaining pages (PR #446)** — Settings Scheduling tab (title, description, start/end time labels, DND block), SOMA Weekly page (all JSX strings, error messages, button states), SOMA Upgrade page (feature list, CTA, footer). 54 new keys across 3 namespaces: `app_settings_scheduling_tab` (11), `app_soma_weekly` (34), `app_soma_upgrade` (9). All 7 locale files validated in sync. Full-app translation coverage now complete.
- **Build error hotfix (direct to main)** — `somaFullSendDailyRun` was imported in `route.ts` by the agent but never written to `lib/inngest.ts`. Full 180-line function added manually. Vercel deploy unblocked. Build passing.
- **Reddit posts live** — r/alphaandbetausers: updated tester recruitment post (2/12 opted in, feature update, Android CTA). r/buildinpublic: build-in-public update — "I said no new features then shipped 10 more things" — honest state, tech decisions, "what moved you from user to paying customer?" question.
- **Merge conflict resolved (PR #444)** — `llms.txt` conflict between white-label branch and main resolved — kept 570+ blog count from main.

**May 27, 2026 (PRs #433–#440):**
- **SOMA media toggle (PR #433)** — `include_media` BOOLEAN column added to `soma_projects` (migration `20260527000001_soma_include_media.sql`). Unsplash API integration in manual generate route: keyword extraction (strips stop words, returns first meaningful term from post content), `fetchUnsplashImage()` calls Unsplash random photo endpoint, fires required download-location tracking ping (API compliance), caches per-keyword within run. Attribution stored as `media_urls[1] = "Photo by X on Unsplash | profile_url"`. Non-fatal — posts still create if Unsplash unavailable. Toggle UI on project page (amber pill switch). `UNSPLASH_ACCESS_KEY` env var required.
- **Enki i18n (PR #434)** — 207 translation keys across 3 new namespaces: `app_enki_truth` (77 keys for TruthClient.tsx), `app_enki_trades` (38 keys, alias `tk` to avoid shadowing trade loop variable), `app_enki_doctrines` (92 keys, alias `td`). All 7 locale files (en/es/de/fr/pt/ru/zh) updated and validated in sync. Server component `page.tsx` files left unchanged — only client components wired.
- **Unsplash attribution compliance (PR #435)** — Cherry-picked compliance fix for generate route ensuring photographer credit format and download tracking are always triggered correctly.
- **UnsplashCredit component (PR #436)** — `components/UnsplashCredit.tsx` renders Unsplash thumbnail + "📷 Photo by [Name] on Unsplash" attribution link with `utm_source=socialmate&utm_medium=referral` UTM params. `size` prop: `'sm'` (queue cards, h-20) / `'md'` (calendar panel, h-28). Wired into `app/queue/page.tsx` (sm) and `app/calendar/page.tsx` (md). Both queries updated to include `media_urls` in select.
- **Landing page visual overhaul + signup cleanup (PR #437)**:
  - Hero headline: "Social media management without the $99/month price tag." → **"Post everywhere. All at once."** with amber→orange gradient on second line
  - Added radial depth glows behind hero (amber/purple/blue at low opacity, `blur-[100px+]`) — removes flat look
  - 7 live platform pills rendered directly in hero using `live` PLATFORMS array
  - Green pill badge → amber/white (`bg-amber-500/15 border-amber-500/30 text-white`)
  - CTA button → `bg-amber-500 hover:bg-amber-400` with `shadow-amber-500/25`
  - Stats numbers: explicit `text-white` added
  - Founder card condensed and moved below stats
  - Signup: removed `ageConfirmed` state + all guards → replaced with required `tosAccepted` ToS/Privacy checkbox (amber border/fill, inline links to /terms and /privacy)
  - Newsletter opt-in updated to reference **IRIS Dispatch** specifically (optional checkbox)
  - Removed redundant "By signing up you agree to our Terms" text at bottom
- **Blog FCP fix (PR #438)** — `generateStaticParams` in `app/blog/[slug]/page.tsx` now queries Supabase `blog_posts` table for all slugs at build time, merges with hardcoded list using `Array.from(new Set([...]))`. All 500+ DB-inserted blog posts now pre-render as static HTML at deploy time. FCP dropped from 3.72s Poor → CDN-edge fast. `revalidate = 3600` stays for ISR on posts between deploys.
- **Compose media preview (PR #439)** — `app/compose/page.tsx` now shows `<UnsplashCredit mediaUrls={draftMediaUrls} size="md" />` in the media attachments section when editing a SOMA-generated post with `media_urls`. State: `draftMediaUrls` set when draft loads. Label: "Attached image (from SOMA)".
- **Autopilot cron media toggle (PR #440)** — `somaAutopilotRun` in `lib/inngest.ts` now fetches `include_media` from each `soma_projects` row. If true, extracts keyword from post content, calls `autopilotFetchUnsplashImage()` (same pattern as manual route, scoped to step to avoid cross-run state leak), attaches `media_urls` to post insert. Non-fatal. **Remember to resync `soma-autopilot-run` in Inngest dashboard after deploy.**
- **Zaira Angelique E. Canuto onboarded** — Marketing team member. DocuSign sent. Welcome email sent. SocialMate media outline/guide created including platform access policy, suggested account names, brand voice + creative freedom guidelines.
- **Analytics snapshot (May 27)** — 794 visitors (+61%), 2,127 page views, 74% bounce rate. Top pages: / (300), /blog/discord-community-management-guide (93), /login (88). Top referrers: bing.com (98), duckduckgo.com (36), google.com (33), t.co (23). 33% USA, 21% Singapore, 9% China. 80% desktop, 19% mobile. RES jumped 94 → **96** after all merges. / page at **99**. Blog still at 65 (Needs Improvement — static params will help future visits).
- **Reddit + LinkedIn posts** — r/saasbuild post live: "Deli worker turned SaaS founder. 400 PRs, 7 platforms, 2 months. AMA, open to collabs." LinkedIn post live with landing page screenshot, Leo Burnett quote, 2 engagement questions.

**May 24, 2026 (PRs #426):**
- **Full public site sweep — dark mode, mobile, accuracy** — Three-phase sweep across every public-facing page. PR #426 on branch `fix/dark-mode-accuracy-sweep`.
  - **Phase 1 (dark mode):** All `for/`, `blog/`, `guides/`, `vs/`, and misc public pages audited for dark mode consistency. `PublicLayout` adds `dark` class forcing all `dark:` variants active regardless of system preference.
  - **Phase 2 (accuracy):** Every stat in the codebase updated to reflect current reality — 15+ AI tools (was 12), 7 live platforms (was 5 or 6). Files touched: `app/page.tsx`, `app/features/page.tsx`, `app/features/layout.tsx`, `app/for/agencies/page.tsx`, `app/for/small-business/page.tsx`, `app/for/streamers/page.tsx`, `app/for/tiktok-creators/page.tsx`, `app/for/linkedin-creators/page.tsx`, `app/faq/page.tsx`, `app/blog/[slug]/page.tsx`, `app/dashboard/page.tsx`, `app/roadmap/RoadmapClient.tsx`, `lib/inngest.ts` (email templates). All 75 vs/ pages: "12 AI tools" → "15+ AI tools". vs/canva, flick, kontentino, planly, plann, preview-app, ripl, sked-social, social-champ, unum: "6 platforms" → "7 platforms" + LinkedIn added to platform lists. vs/postcron "16 (free)" typo fixed → "7 live (free)".
  - **Phase 3 (mobile + logo consistency):** All 75 vs/ comparison tables wrapped with `overflow-x-auto` + `min-w-[480px]` for horizontal scroll on 375px screens. All 75 pages verified JSX-balanced programmatically. S lettermark (`<div>S</div>`) replaced with `<img src="/logo.png">` everywhere it appeared outside `LandingHeader.tsx` (dead code): `app/login/page.tsx` (3), `app/signup/page.tsx` (2), `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`, `app/error.tsx`, `app/not-found.tsx`, `app/invite/page.tsx`, `app/page.tsx` footer, `src/app/signup/page.tsx`.
- **Rule confirmed:** `LandingHeader.tsx` is dead code (replaced by `PublicNav` on `/` in April 2026) — do not import or touch it.

**May 22, 2026 (PR #401):**
- **IRIS AI auto-generate** — Admin UI at `/admin/iris` now has a violet "Generate draft with AI" button. `POST /api/admin/iris/generate` calls Gemini 2.5-flash with Joshua's tone rules + baked-in recent ship context. Returns complete newsletter draft (subject, intro, whatShipped, realNumbers, whatsNext, closing). Passes previous subject lines to avoid repeated angles. Fields pre-fill on success with inline confirmation banner. Admin-only gate.
- **Docs update rule established** — Whenever llms.txt is updated, CLAUDE.md + changelog + roadmap must all update in the same flow. Never update llms.txt alone.

**May 21, 2026 — LinkedIn Launch (PRs #394–#399):**
- **LinkedIn OAuth live** — Full end-to-end OAuth 2.0 flow with OpenID Connect. Connect at `/accounts` → OAuth authorize → callback upserts to `connected_accounts` (platform: `'linkedin'`) → disconnect button deletes the row. Route: `/api/accounts/linkedin/connect` + `/api/linkedin/callback` + `/api/accounts/linkedin/disconnect`.
- **LinkedIn posting live** — `/api/publish/linkedin` uses UGC Posts API (`/v2/ugcPosts`) with `w_member_social` scope. 60-day access tokens (no refresh — re-auth on expiry). Confirmed working with a live post immediately after connecting.
- **7 platforms** — LinkedIn joins Discord, Bluesky, Telegram, Mastodon, X/Twitter, and TikTok. Platform count updated to 7 across all pages: `app/page.tsx`, `app/features/page.tsx`, `app/accounts/page.tsx`, `app/compose/page.tsx`, `components/pages/LocalizedLanding.tsx`, `app/clips/page.tsx`, `app/ai-features/page.tsx`, `app/for/small-business/page.tsx`, `app/changelog/page.tsx`, `public/llms.txt`.
- **`/for/linkedin-creators` audience page** (PR #398) — Full SEO landing page targeting "free LinkedIn scheduler", "schedule LinkedIn posts", "LinkedIn post scheduler". Hero, pain points, 8 features, 7-platform grid (LinkedIn highlighted), comparison table vs Hootsuite/Buffer/Later/Publer, pricing, FAQ with JSON-LD. Added to PublicNav Audiences dropdown + sitemap.
- **vs/taplio** (PR #399) — New comparison page. Taplio = $39/mo LinkedIn-only. We = free + 7 platforms.
- **vs/shield-app** (PR #399) — New comparison page. Shield App = analytics-only, no scheduling. We = schedule + analyze in one, free.
- **19 LinkedIn blog posts** (PR #399) — `supabase/blog_batch_linkedin.sql`. SEO content covering LinkedIn scheduling, algorithm, content strategy, cross-posting, personal branding, hooks. Run SQL in Supabase.
- **sitemap + llms.txt updated** — 19 new LinkedIn blog slugs, vs/taplio, vs/shield-app, /for/linkedin-creators all added.
- **LinkedIn SOMA support** — SOMA project form updated so LinkedIn shows as a live platform option (generates content for personal profile; auto-queues on connect for users who haven't connected yet).
- **Bluesky grapheme fix** — `lib/publish/bluesky.ts` now counts graphemes via `Intl.Segmenter` (not UTF-16 code units). Posts with emojis that Bluesky accepts were being pre-rejected. Now truncates to 300 graphemes + "…" gracefully.
- **Enki pending trades fix** — Pending trades are now bulk-cancelled when switching to autonomous mode. Pending approvals banner hidden in autonomous mode.
- **SocialMate Discord community server** — Launched at discord.gg/2se6FGrbRU. Linked in sidebar under Community.

**May 21, 2026 — Bluesky Bug Investigation:**
- **Bluesky posting failures root-caused** — Two consecutive days of Bluesky failures diagnosed. Two bugs found:
  1. **Refresh token expiry** — Bluesky AT Protocol sessions expire after extended periods (or when logged in from another client). When `refreshSession` returns 401, code throws immediately and post fails. Fix: go to `/accounts` → disconnect Bluesky → reconnect with app password → hit Retry on failed calendar posts.
  2. **Character limit check bug (code fix pending)** — `lib/publish/bluesky.ts` uses `content.length` (UTF-16 code units) to enforce the 300-char limit, but Bluesky's actual limit is 300 *graphemes*. Every emoji is 2 UTF-16 code units but 1 grapheme. Posts with emojis that Bluesky would accept are being thrown out by our pre-flight check. Twitter's code truncates gracefully; Bluesky's code throws an error. Fix: use `Intl.Segmenter` for grapheme counting and truncate to 300 graphemes (+ "…") instead of throwing.

---

## Pending / In Progress

- **Google Play — closed testing** — Cooking slowly. v1.0.7 (versionCode 3) uploaded, 1 tester opted in. Passive CTA on signup page. *Do not revisit until June 2026.*

- **LinkedIn Company Pages** — Personal profile OAuth is live. Company page support requires `r_organization_social` + `w_organization_social` permissions. Next step: LinkedIn Developer Portal → existing app → request org permissions. **Lower priority — personal profile covers 90% of use cases.**

- **Instagram / Facebook** — Both require Meta App Review (same process, can be one app). Harder than LinkedIn — Meta review is strict. Business account required, users need Business/Creator Instagram accounts. **Hard — plan for 4–8 week review timeline.**

- **SOMA content run** — CLAUDE.md submitted to SOMA on May 28. Next run when ready.

- **Cofounder search** — Actively recruiting marketing cofounder via Reddit/LinkedIn. ~10% sweat equity over 24-month vest, 2-week trial, real contract.

- **Wyoming LLC annual report** — File when budget allows.

- **Enki Truth Mode** — 50-trade minimum per strategy. Check `/enki/truth` periodically.

- **Wall of Love** — Live at `/wall-of-love`. Add entries to `TESTIMONIALS` array when real quotes come in.

- **Birthday promo BDAY31** — ✅ ACTIVE NOW through Dec 15, 2026. Stripe coupon live (`promo_1TX2Ay7OMwDowUuUiLXH4Fe3`).

- **SocialMatePR (girlfriend's video brand)** — Claude chat mentor prompt delivered May 16. First video to all platforms once profiles are ready.

**Roadmap (next up):**
- **Growth** — 7 platforms live. Focus: getting paying users. Product Hunt follow-up ("We've shipped 50+ features since launch"). Target: June 1.
- **Wall of Love** — Collect first real testimonials. Add to TESTIMONIALS array in `app/wall-of-love/page.tsx`.
- **LinkedIn Company Pages** — Personal profile live. Company page = next LinkedIn upgrade when there's demand.
- **Discord community** — Server is live at discord.gg/2se6FGrbRU. Build it as a tester + feedback pool.
- **Apple App Store** — Deferred 3–6 months.
- **Google Play — closed testing** — 1 tester opted in. Passive CTA on signup page. *Do not revisit until June 2026.*
- **Instagram / Facebook** — Meta App Review. 4–8 week timeline.
- **Wyoming LLC annual report** — File when budget allows.
- **Enki Truth Mode** — 50-trade minimum per strategy. Check `/enki/truth` periodically.
- **Birthday promo BDAY31** — ✅ ACTIVE NOW through Dec 15, 2026.
- **Product Hunt follow-up** — "We've shipped 50+ features since launch." Target: June 1, 2026.

## Confirmed Done (stop asking about these)

- ✅ **gilgameshenterprise.com blog + FAQ (June 7)** — Category filter tabs on blog (client-side). FAQ page at /faq with accordion. Nav updated with FAQ link. Sitemap updated. Never ask to add blog filtering or FAQ to GE site again.
- ✅ **renewalmate.com blog + FAQ (June 7)** — Category filter tabs on blog. FAQ page at /faq (4 sections including vs. competitors). Nav updated. Sitemap includes all blog slugs. Never ask to add blog filtering or FAQ to RenewalMate again.
- ✅ **Hearthforge co-founder language on GE site (June 7)** — GilgameshEnterprise venture card for Hearthforge now says "Co-founded with Butch Chiappinelli", lists role split, URL points to hearth-forge.com, badge is Live. Never misrepresent Hearthforge as Joshua's solo venture.
- ✅ **Gilgamesh Enterprise website live (June 6)** — gilgameshenterprise.com on Vercel, dark/gold, Squarespace cancelled. Never rebuild from scratch again.
- ✅ **RenewalMate website live (June 6)** — renewalmate.com on Vercel, green rebrand, waitlist capture, DNS back under GoDaddy control. Never rebuild from scratch again.
- ✅ **Hearthforge logo integrated (June 6)** — Butch's H+flame logo in nav/footer/admin. public/logo.png. Never rebuild logo integration.
- ✅ **SOMA image dedup + size fix (June 6, PR #468)** — urls.small for Bluesky blob limit, usedUrls Set for dedup, TikTok skipped without video URL. Never ask to fix these image issues again.
- ✅ **Loading skeletons — full sweep complete (June 5, PR #466)** — `loading.tsx` now exists on every major route: dashboard, onboarding (PR #459) + accounts, blog, features, settings, signup (PR #466). Preconnect hints in `layout.tsx`. All skeleton screens are done. Never ask to add more loading skeletons.
- ✅ **Full public site i18n complete (June 1, PRs #461–#462)** — Every public page wired with `useI18n()`. 74 namespaces, 9 locales, `{param}` interpolation added. vs/ metadata moved to `layout.tsx` (76 files). i18n is 100% done — public site and app interior both complete. Never ask about unwired public pages.
- ✅ **SEO/AI discovery overhaul (June 1, PR #463)** — llms.txt 580+ lines, humans.txt, ai.txt, ai-plugin.json, 3 JSON-LD schemas in layout.tsx. 7 new vs/ pages. Never ask to build this again.
- ✅ **vs/mailchimp, vs/tiktok-native, vs/substack + blog batch 18 (June 1, PR #464)** — 3 new comparison pages live. 20 blog slugs in sitemap. Never ask to add these again.
- ✅ **FCP performance sweep (May 31, PR #459)** — `loading.tsx` added to dashboard + onboarding. Dashboard spinner fixed (border-black → border-amber-500, was invisible on dark mode). Blog revalidate 3600→86400. Blog index revalidate added. Merged. Never ask to add loading skeletons or fix blog revalidate again.

- ✅ **SOMA video URL attachment (May 28, PR #442)** — `include_video_url TEXT` on `soma_projects`. Text input on project page, PATCH saves it, generate route injects video URL block into Gemini prompt. Clear button. Never ask to build this again.
- ✅ **Enterprise tier (May 28, PR #443)** — `/enterprise` landing + contact form. Enterprise card on `/pricing`. `enterprise_inquiries` table. Resend email to admin on inquiry. "Enterprise" in PublicNav. No Stripe — manual provisioning. Never ask to build again.
- ✅ **White Label improvements (May 28, PR #444)** — Full Settings white label UI: logo upload, brand name, color picker, remove-branding toggle, custom domain gated to Pro. `/api/white-label/logo-upload` to Supabase. `white_label_remove_branding` column on user_settings. Never ask to improve white label UI again.
- ✅ **SOMA Full Send daily cron (May 28, PR #445)** — `somaFullSendDailyRun` function in `lib/inngest.ts`. Daily 1pm UTC, Full Send workspaces only, 7 posts/day cap, 30 runs/month cap. Dashboard badge. Coexists with Autopilot Monday cron. Resync `soma-full-send-daily-run` in Inngest. Never ask to build again.
- ✅ **i18n remaining pages complete (May 28, PR #446)** — Settings Scheduling tab, SOMA Weekly, SOMA Upgrade wired with useI18n(). 54 keys, all 7 locales in sync. Full-app i18n is now complete. Never ask about unwired pages again.
- ✅ **i18n full parity sweep (May 29, PR #456)** — Japanese (ja) and Korean (ko) added as full locales with complete landing page translations. SM-Pulse/SM-Radar card descriptions in `LocalizedLanding.tsx` switched from hardcoded English to `t()`. Mobile nav labels (Menu, Language, Merch, SM-Give) in `PublicNav.tsx` switched to `t()`. Critical English placeholder values backfilled for es/de/fr/pt/ru/zh. All 9 locale files validated — 1,530 keys, zero drift. `scripts/i18n-sweep.py` committed for future updates. Never ask to sweep locales again.
- ✅ **SOMA media toggle + Unsplash attribution display (May 27, PRs #433–#436)** — `include_media` on `soma_projects`. Unsplash API integration in generate route (keyword extraction, image fetch, attribution, download tracking). `UnsplashCredit` component in queue (sm) and calendar (md). Compliance cherry-pick PR #435. Never ask to build SOMA media toggle again.
- ✅ **Enki i18n (May 27, PR #434)** — 207 keys, 3 namespaces (app_enki_truth/trades/doctrines), all 7 locales validated. TruthClient, trades page, doctrines page all wired. Aliases `tk`/`td` to avoid loop variable shadowing. Never re-wire these files.
- ✅ **Landing page visual overhaul + signup cleanup (May 27, PR #437)** — "Post everywhere. All at once." headline, amber gradient, radial glows, platform pills in hero, amber CTA, white stats. Signup: age gate removed, ToS/Privacy required checkbox added, IRIS newsletter opt-in updated. Never revert these changes.
- ✅ **Blog FCP fix (May 27, PR #438)** — `generateStaticParams` queries all `blog_posts` slugs from Supabase at build time. All 500+ posts now static CDN-served. FCP dropped from 3.72s Poor. Never revert to hardcoded-only list.
- ✅ **Compose media preview (May 27, PR #439)** — `draftMediaUrls` state + `UnsplashCredit` in compose media section for SOMA posts with images. Never ask to add this again.
- ✅ **Autopilot cron media toggle (May 27, PR #440)** — `somaAutopilotRun` respects `include_media` per project. Images attached on Monday auto-runs. Never ask to add this again.
- ✅ **Performance bundle cut + bug sweep (May 26, PRs #431–#432)** — `.maybeSingle()` on all upsert lookups. i18n lazy loading (−394KB from every page). LazyClientComponents wrapper for `ssr:false` dynamic imports. Dead landing page auth call removed. PHLaunchBanner removed. Blog ISR + generateStaticParams. `/tiktok` landing page + nav consolidation all merged. Never redo these.
- ✅ **Full site sweep — dark mode + mobile + accuracy (May 24, PR #426)** — All public pages: dark mode consistent, comparison tables mobile-scrollable (overflow-x-auto), all stats updated to 15+ AI tools / 7 platforms, logo.png replaces S lettermark everywhere. All 75 vs/ pages JSX-balanced. Never ask to do this sweep again — it's done.
- ✅ **IRIS AI auto-generate (May 22, PR #401)** — Admin `/admin/iris` compose page has "Generate draft with AI" button. Gemini 2.5-flash writes subject + full body draft. Never ask to build this again.
- ✅ **HERMES cold outreach system (May 14–18, PRs #318–#327)** — Full campaign system at `/hermes` (admin-only). Prospect discovery (free: Substack/GitHub/dev.to/Hashnode), Hunter.io email finder, Gemini-powered message generation, Resend email + Bluesky/Mastodon DM send, 4-step sequence, follow-up cron. Never ask to build HERMES again.
- ✅ **SM Pulse + SM Radar** — `/sm-pulse` (trend scan, 20 credits) and `/sm-radar` (content intelligence report, 20 credits) both live. Never ask to build these.
- ✅ **ZENITH creator card (May 20)** — `/zenith` live. Shareable presence card. In sitemap. Never build again.
- ✅ **Achievements + 30-Day Challenge (May 19–20)** — `/achievements` (13 badges, credit rewards, progress bars) + `/challenge` (30-day heatmap, 50cr reward) both live. `user_achievements` table. Daily `achievementCheckerCron`. Never build again.
- ✅ **HESTIA community tab (May 20)** — `/community` live (was AGORA). Emoji reactions, threads, connected-account gate. Tables: community_posts/replies/reactions. Never build again.
- ✅ **SIGIL rename (May 20)** — Link in Bio is now SIGIL everywhere. Never revert to "Link in Bio".
- ✅ **Discount page (May 20)** — `/discount` live. NONPROFIT50 (50% off Pro) + STUDENT25 (25% off Pro). Honor system. Never build again.
- ✅ **Post Score (May 19)** — Pro+, 5 credits. AI 0–100 quality scorer inline in Compose. Never build again.
- ✅ **Scheduling Window + DND (May 19)** — Settings → Scheduling tab. Smart Queue respects window. Never build again.
- ✅ **Goal-based onboarding (May 19)** — Step 1 asks primary goal. Saved to user_settings.onboarding_goal. Never build again.
- ✅ **Loyalty achievement system (May 19)** — `achievementCheckerCron` Inngest daily. Credits for milestones. Never build again.
- ✅ **GA4 integration (May 19)** — NEXT_PUBLIC_GA4_ID env var. Key events fire on publish/upgrade/AI use. Never build again.
- ✅ **Roadmap voting (May 19)** — Users can upvote roadmap items on /roadmap. Never build again.
- ✅ **Comeback emails (May 19)** — Weekly cron for users inactive 7+ days. Never build again.
- ✅ **Blog batch 12 — 55 posts (May 20)** — creator growth, platform strategy, community. SQL: blog_batch_12.sql. Never ask to write these again.
- ✅ **Guides PDF download (May 20)** — All 5 Gilgamesh Guides have "Download as PDF" with watermark. No external services. Never build again.
- ✅ **Badge embed (May 20)** — `/badge.svg` + Settings → Profile embed code. Never build again.
- ✅ **AI rate limiting (May 20)** — 10 req/min/user. 429 + retry-after header. Never build again.
- ✅ **LinkedIn OAuth + posting live (May 21, PRs #394–#399)** — Personal profile connect, OAuth flow, UGC Posts API publishing. Confirmed with a live post. Platform count = 7. Never say LinkedIn is coming soon or pending again.
- ✅ **Bluesky grapheme fix (May 21)** — `Intl.Segmenter` for grapheme counting in `lib/publish/bluesky.ts`. Truncates to 300 graphemes gracefully. Never revert to `content.length`.
- ✅ **`/for/linkedin-creators` page (May 21, PR #398)** — Full SEO audience landing page. In PublicNav Audiences dropdown. Never ask to build it again.
- ✅ **vs/taplio + vs/shield-app (May 21, PR #399)** — Both comparison pages live. In vs/ hub. In sitemap and llms.txt. Never ask to build them again.
- ✅ **LinkedIn blog batch — 19 posts (May 21, PR #399)** — `supabase/blog_batch_linkedin.sql`. Run in Supabase. Never ask to write these again.
- ✅ **Calendar query fix (May 16, PR #355)** — Removed all date filters. Fetch all user posts (limit 500) with no `created_at`/`scheduled_at` range. SOMA posts may have null `created_at`; date filters silently excluded them. Never add a date filter to the calendar query again.
- ✅ **next-intl removed (May 16, PRs #350, #352)** — `createNextIntlPlugin` incompatible with Turbopack. Removed from `next.config.ts`. `LocalizedLanding.tsx` uses direct JSON imports. `i18n/routing.ts`, `i18n/request.ts`, and all locale layout files deleted. `proxy.ts` cleaned of all next-intl imports. Build is clean. Never re-introduce `next-intl` or `createNextIntlPlugin`.
- ✅ **Full-app i18n — all major pages complete (May 17, PRs #362–365)** — Core pages (Dashboard, Queue, Calendar, Compose, Analytics, Accounts, Inbox, Team, Drafts, Streak, Links, Activity, Media, AI Features, Agents hub, SOMA landing, Enki landing) + inner pages (SOMA dashboard, SOMA voice, Enki dashboard, Creator Hub, creator public page). **i18n build rule: any new key in `en.json` must be added to ALL 8 other locale files (es/de/fr/pt/ru/zh/ja/ko) in the same commit — TypeScript enforces `typeof enMessages` shape parity across all 9 locales.** All major pages are fully wired. Use `scripts/i18n-sweep.py` or run the node validation script before committing.
- ✅ **Gilgamesh's Guide Vol. 5 (May 17, PR #365)** — Creator Monetization live at `/guides/creator-monetization`. Email capture included. Never ask to build it again.
- ✅ **Calendar select('*') fix (May 17, PR #361)** — Explicit column lists on calendar fetch caused silent null returns if any column (e.g. `tags`) didn't exist. Now uses `select('*')` + wsLoading guard. Never revert to explicit column list on calendar query.
- ✅ **Landing page language switcher fix (May 17, PR #362)** — `PublicNav.setLocale()` now calls `router.push('/${code}')` when on a public locale path. Don't revert to localStorage-only.
- ✅ **i18n locale validation pattern** — Run `node -e "const en=require('./messages/en.json'); ..."` before every i18n commit to catch missing keys across all 9 files before Vercel does. Or use `scripts/i18n-sweep.py` for bulk key additions.
- ✅ **Onboarding Quick Start + auto-schedule + referral detection (May 14, PR #335)** — Quick Start path live. Starter posts now schedule to calendar (not drafts). Referral cookie banner. Never revert posts to draft status.
- ✅ **Pricing birthday promo + social proof + secure checkout (May 14, PR #335)** — BDAY31 coupon live in Stripe. Banner date-gated in UI. Trust strip below plan cards.
- ✅ **Wall of Love page (May 14, PR #335)** — `/wall-of-love` live. Add testimonials to TESTIMONIALS array when collected.
- ✅ **Guide email capture (May 14, PR #335)** — GuideEmailCapture component on all 4 Gilgamesh Guides. Never ask to add email capture to guides again.
- ✅ **Admin data fix (May 14)** — googlereview@socialmate.studio downgraded to free. Admin God Mode shows accurate 0 paid users.
- ✅ **Bluesky token race condition + SOMA jitter + error visibility (May 19, PR #382)** — `platform_errors` JSONB column live. Calendar hover shows actual error. Token re-read on concurrent refresh failure. SOMA posts now staggered 0–44 min per slot. SQL applied.
- ✅ **TikTok Script Generator (May 18, PR #371)** — Live at `/ai-features/tiktok-script`. 5 credits. Never ask to build again.
- ✅ **GIF Export in Creator Studio (May 18, PR #371)** — gifenc installed, exportGif() live. Never ask to build again.
- ✅ **Blog batch 10 (May 18, PR #372)** — 30 video/TikTok/creator posts. SQL in blog_batch_10.sql. Never ask to write these again.
- ✅ **TikTok Studio in public nav (May 18)** — Added to desktop header + mobile Products section. `/for/tiktok-creators` + `/for/video-creators` added to Audiences dropdown. Never say TikTok Studio is missing from nav again.
- ✅ **Social media glossary (May 18, PR #378)** — `/glossary` live with 62 terms, A-Z nav, search, JSON-LD. Never ask to build again.
- ✅ **vs/ hub + 8 new pages (May 18, PR #379)** — Canva, Plann, Social Champ, Ripl, Preview App, Gain, Kontentino, Unum. Never ask to add these again.
- ✅ **Blog batch 11 (May 18, PR #380)** — 35 posts. SQL in blog_batch_11.sql. Never ask to write these again.
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

## SOMA Content Guidelines

When SOMA generates content from this document, follow these behavioral rules on every run:

**Overall tone:** Professional and motivational. We are a bootstrapped startup solving real problems for real creators. Address our challenges (solo founder, building nights and weekends, bootstrapped) as proof that anyone can build — not as complaints. Lead with progress and mission, never with hardship.

**LinkedIn posts (SOMA automates LinkedIn — `w_member_social` scope, personal profile):**
- Always open with OR weave in a relevant inspirational quote from a public domain / clearly attributed source (philosophers, builders, athletes, leaders — Marcus Aurelius, Seneca, Steve Jobs, Kobe Bryant, etc.)
- The quote must be thematically connected to the post topic — do not use a generic filler quote
- Format: Quote styled as a standalone line, then the post body, then hashtags
- Tone: thought leadership + builder credibility + creator empowerment
- Always close with relevant hashtags (8-12, mix of broad and niche)

**All platforms:**
- Always include hashtags tailored to each platform's norms (LinkedIn: professional/industry tags, Bluesky/Mastodon: creator/tech tags, Twitter: short punchy tags)
- Motivational closing line that connects back to mission: "Power to the people. Build the door." or a natural variation
- Keep voice consistent with Joshua's Voice DNA (confident, authentic, hip-hop + space + LoL culture influences, "cooked/fire/slay" vocabulary used sparingly and naturally)
- Never repeat an angle that already exists in SOMA Project Memory — check topics_covered and angles_used before generating

**SOMA does NOT need a new document to generate content:**
- SOMA can run anytime using the master doc as evergreen context about who we are, what we've built, and what we stand for
- When there is no new diff or update to post about, SOMA should generate: product education posts (explaining features), platform-specific tips ("did you know you can schedule LinkedIn posts with SocialMate?"), creator tips and value posts, founder story / mission posts, engagement posts (questions, polls, hot takes), community shoutouts, and motivational content tied to the creator mission
- Not every post needs to be an update. Some of the best content is timeless brand-building, not changelog announcements
- Use Project Memory to avoid repeating the same angles regardless of whether a diff was submitted

**Media (current limitation — feature in progress):**
- SOMA does not yet auto-attach images or GIFs to posts
- Roadmap: toggle on SOMA projects to pull non-copyrighted images from Unsplash API and GIFs from GIPHY free tier, matched to post content
- Video content attachment planned for future milestone

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
