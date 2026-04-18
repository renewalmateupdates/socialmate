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
- Free: 50 tweets/month | Pro: 200/month | Agency: 500/month
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

## What's Been Built (as of April 19, 2026)

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
- `/merch` — landing page with Printify POD angle, SM-Give charity tie-in (75% of profit), email waitlist
- `sm_give_allocations` table — tracks give amounts by source (subscription/donation/affiliate_unclaimed/merch)
- `merch_waitlist` table — email capture for merch launch

**SEO:**
- 28+ `/vs/` comparison pages
- 61+ blog posts
- `sitemap.ts` updated (includes /merch, /affiliates, /enki/truth)
- `public/llms.txt` updated

---

## Known Issues / Bugs (fix these when touched)

- No open bugs currently tracked — add new ones here as discovered.

---

## Pending / In Progress

- **Content post batch — READY TO SCHEDULE (Apr 20–26):**
  - 140 posts written and saved to `content-posts-apr20-apr26.md` in repo root
  - 10 slots/day × 2 platforms (X + Bluesky) × 7 days
  - Schedule: 1 post/hour, 8am–5pm ET starting Monday Apr 20
  - Copy-paste into bulk scheduler — file is organized by day + time slot
  - Joshua unavailable 12:30pm–10:30pm Apr 20 — all posts are pre-scheduled so delivery unaffected

- **Merch Printify integration** — waiting on Joshua's Printify store URL to update /merch Shop Now button

- **Supabase email confirmation** — not yet verified; check Authentication → Email in Supabase dashboard to confirm "Confirm email" is enabled

- **SM-Give renewal tracking gap** — webhook currently records 2% on new subscription checkouts only. Renewal payments (`invoice.payment_succeeded`) are not yet handled. Low priority but worth closing eventually.

- **Growth partner trial (Abdus Sohag)** — 1-week trial active as of Apr 19. Referral link: `?ref=SOHAG`. Review results end of week; if strong, set up contract + renegotiate to standard affiliate rates.

- **Enki Truth Mode testing** — market opens Monday Apr 21; first real signal data expected then. 50-trade minimum per strategy before results are valid.

- **Discord management tools** (future — moderation, welcome messages, role automation)
- **Gilgamesh's Guide landing page** (future — free PDF, business/creator/self-dev guide for entrepreneurs)
- **LinkedIn integration** — API credentials not yet acquired

## Confirmed Done (stop asking about these)

- ✅ **Twitch env vars** — `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` set in Vercel. Callback: `https://socialmate.studio/api/clips/twitch/callback`. DONE.
- ✅ **Supabase migrations** — `usage_events`, `notifications`, `competitor_accounts`, `hashtag_collections`, `studio_stax_admin_featured`, `enki_truth_trades`, `enki_truth_strategy_stats`, `coupons`, `coupon_redemptions` all confirmed ran.
- ✅ **Login redirect** — all Enki pages use `?redirect=` not `?next=`. Fixed.
- ✅ **Stripe SDK v20 promo code params** — `promotion: { type: 'coupon', coupon: id }` format confirmed and in use.
- ✅ **enkiTruthModeScan** — registered in `app/api/inngest/route.ts`. Running every 15 min.
- ✅ **Growth partner affiliate account** — Abdus Sohag (thez1shann@gmail.com) created in Supabase Auth + linked in `affiliates` table. UUID: `1ac0b2ca-fc44-4a87-8781-67f9b81d4fbe`. Commission rate: 10% (trial). Temp password: SocialMate2026!
- ✅ **SM-Give webhook integration** — `sm_give_allocations` writes added to Stripe webhook: 2% of subscription checkouts, 100% of donation checkouts. Both non-fatal. PR #148 merged.
- ✅ **Supabase migrations (Apr 18)** — `sm_give_allocations`, `merch_waitlist` confirmed ran.

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
