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
Launched: March 26, 2026. 100% bootstrapped. $0.27 infra cost at launch.
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

**Live now:** Bluesky, Discord, Telegram, Mastodon, X/Twitter (pay-per-use, $0.01/tweet)
**Coming soon:** LinkedIn (no API acquired yet), YouTube, Pinterest, Reddit
**Roadmap:** Instagram, Facebook, TikTok, Threads, Tumblr, Pixelfed

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
- Free: 28 tweets/month | Pro: 150/month | Agency: 400/month
- X Booster add-on (one-time purchase, stacks, rolls over): Spark 50/$1.99 · Boost 120/$4.99 · Surge 250/$9.99 · Storm 500/$19.99
- Tracked by counting published posts with `platforms @> ['twitter']` this calendar month

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

## Pending / In Progress

- **Abdus Sohag trial review** — trial ended April 26. Decide: keep at 10%, bump to standard 30%, or cut. Referral link: `?ref=SOHAG`.

- **Test SOMA end-to-end** — voice profile → create project → paste master doc → ingest → generate. Not yet tested by Joshua.

- **Push notification VAPID keys** — CONFIRMED SET in Vercel. Push notifications are live.

- **Enki Truth Mode testing** — 50-trade minimum per strategy before results are statistically valid.

- **LinkedIn integration** — API credentials not yet acquired. Requires: (1) LinkedIn Company Page published, (2) developer app at linkedin.com/developers, (3) apply for Marketing Developer Platform. On hold until Joshua has time.

- **TikTok API review** — submitted Apr 23. Support ticket `ad7714530aa61ad4` open re: app name. Check portal periodically. No action needed until approved.

- **Inngest resync** — after any deploy touching `lib/inngest.ts`, resync functions in Inngest dashboard.

**Roadmap (next up):**
- **Creator Monetization Hub** — fan subscriptions, tip jars, paywalled content (Stripe Connect required). Landing page live.
- **Compose per-platform preview** — live preview of how post looks on each platform (PR #218)
- **SOMA onboarding skip/resume** — skip steps + save progress (PR #218)
- **LinkedIn publishing** — pending API credentials

## Confirmed Done (stop asking about these)

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
