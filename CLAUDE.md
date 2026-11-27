# SocialMate — Claude Code Project Context

> Read automatically at the start of every session. Kept short on purpose: the
> dated session log that used to live here (March to November 2026) is in
> `docs/history/claude-log-2026.md`, verbatim. Open decisions are in `TODO.md`.
> How to run, build and test: `README.md`.

## Start here (local sessions)

Work happens in local sessions on Joshua's PC, in `C:\Users\jbost\socialmate`.
Cloud sessions were retired on Nov 5, 2026.

1. `git status` and `git pull` on `main` first. One branch and one PR per fix.
   Since Nov 25, 2026 Claude merges its own PRs once checks pass and the
   preview checks out; a feature it isn't sure about waits for Joshua.
2. `gh auth status`: pushes and PRs here need the `renewalmateupdates` account
   (`gh auth switch --hostname github.com --user renewalmateupdates`). HereNow
   needs `gilgameshenterprisellc-pixel`; the active one drifts between sessions.
3. Before pushing: `npx tsc --noEmit`, `npm test`, and `npm run build` for
   anything that renders or routes. Run the two Python audits before shipping
   database work (see "THE failure mode" below).
4. `.env.local` holds the real keys (gitignored); `.env.example` lists the names.
   Never print, commit or delete env files, `socialmate-release.jks` or the
   private files listed in `.git/info/exclude`. **This repo is public**: keep
   customer details and personal notes out of committed files.

---

## Who I Am

**Joshua Bostic** — Founder & CEO, Gilgamesh Enterprise LLC (Wyoming LLC).
Solo bootstrapped builder. Quit the Walmart deli job as of June 2026 — now doing tree cutting/service work (works with Ron, a tree service client he also built a demo website for). Building SocialMate nights and weekends.
Also building a portfolio of local business websites as a side service (conversion-focused, mobile-first, flat-fee).
Vision: Creator OS — the home base for any creator, streamer, business, or person who wants to build online.
Mission: Power to the people. Tear down gatekeeping walls. Build the door.

---

## Raid Ready Labs (Co-Founded Venture, Partnership with Butch Chiappinelli)

**Raid Ready Labs** (formerly Hearthforge; renamed July 9, 2026). 3D printing product company, co-founded with Butch Chiappinelli. Separate from Gilgamesh Enterprise LLC.
Co-founder: **Butch Chiappinelli** (handles CAD design and manufacturing; owns the printer, a Bambu Lab H2C).
Joshua handles the marketing, web, software and business side.
**Domain:** raidreadylabs.com (confirmed July 17, 2026; site code lives in `renewalmateupdates/hearthforge-web`). The old hearth-forge.com is retired and returns a 404, so never link it.

**Logo:** Confirmed July 17, 2026. A silver backpack with a rolled sleeping mat, centered on a black heraldic banner, flat monochrome stencil style. The old H+flame mark is retired.

**First product:** Modular desk rail system (the T-rail) for streamers and content creators.
- Horizontal rail clamps to back edge of a gaming desk
- Accessories clip on at adjustable positions: mic holder, camera mount, headphone hook, Stream Deck stand, cable management clips
- Design language: matte black, minimal, premium
- C-clamps integrated into the rail as one printed piece; end caps still in design as of June 2026
- **Oct 23, 2026:** Joshua has the first physical T-rail prototype from Butch. Better than expected, still room to refine.

**Business model:** Sell STL files digitally + ship physical prints + eventual file subscriptions.
**Entity:** No LLC yet. Will do joint LLC or DBA under Gilgamesh Enterprise LLC when revenue starts.
**Do NOT make:** Anything water-inclusive (cookie cutters, plant pots), because micro holes trap moisture and mold.
**Important:** Always describe Raid Ready Labs as a CO-FOUNDED PARTNERSHIP with Butch, never as Joshua's solo venture. Misrepresenting this would be misleading to Butch. Don't state the equity split publicly.

---

## Freely Scripture (separate project)

A free scripture app Joshua started Nov 1–2, 2026: the Bible, Catholic Bible, Tanakh, Quran (Arabic + English), Bhagavad Gita, Dhammapada, Tao Te Ching, Analects and Book of Mormon, all public domain, offline, no ads, no account. Motto: give away what costs nothing to run, charge only for what costs money, at cost. Code in `renewalmateupdates/freelybible` (its README and COSTS.md hold the details), live at freelybible.vercel.app. Not part of SocialMate: never put SocialMate code or claims in it, or the reverse.

---

## HereNow (separate project)

The IRL presence app ("check in, see who's here, We Met unlocks DMs"), built with
Jacob. Code in `gilgameshenterprisellc-pixel/herenow`, which has its own CLAUDE.md;
read that, not this file, for HereNow work. Expo SDK 54, Supabase + PostGIS, iOS
builds through Codemagic, live on the App Store since Oct 16, 2026.

- **Pilot week (Nov 2026): about nine venues set up during the week.** Monster
  was not confirmed as a sponsor. #311 (sponsor numbers) and #312 (geofencing,
  venue and org fixes) are merged and their SQL ran Nov 4.
- **Late Nov 4: hardening sweep merged (HereNow #314) and its SQL ran**
  (`supabase/pilot_hardening_nov2026.sql`, 3:51 PM): private check-ins were
  readable by any account, a We Met sender could confirm their own request,
  owners could move their fence, the venue dashboard only counted people in the
  room at that moment, and the exit ring now follows the building outline.
  Next is the 1.0.4 build (Codemagic, TestFlight device checks, App Review).
  HereNow's CLAUDE.md "Current state and pick-up list" is the list.
- **Pushing needs the `gilgameshenterprisellc-pixel` account.** The clone is
  `C:\Users\jbost\herenow`. `gh auth switch --hostname github.com --user
  gilgameshenterprisellc-pixel` to push there, then back to `renewalmateupdates`
  for this repo. Supabase stays on the Free plan for now.
- Never put SocialMate code or claims in it, or the reverse.

---

## What SocialMate Is

A multi-platform social media scheduler and AI-powered Creator OS.
Live at: **socialmate.studio**
Soft launched: March 26, 2026. Official Product Hunt launch: April 1, 2026. 100% bootstrapped.
GitHub: github.com/renewalmateupdates/socialmate

**The pitch:** What competitors charge $99/month for, we give for $8 — or free.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
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

**Live now:** Bluesky, Discord, Telegram, Mastodon, X/Twitter (pay-per-use, $0.01/tweet), TikTok (Production API approved May 17, 2026; Direct Post audit approved Oct 23, 2026, so videos post publicly), LinkedIn (OAuth live May 21, 2026 — personal profile, `w_member_social` scope)
**Built, waiting on the platform's review (Nov 17, 2026, PRs #805 to #809):** Instagram, Facebook Pages and Threads (Meta App Review) and YouTube (Google verification; uploads stay Private until its API audit). Only the admin and the reviewer logins in `META_REVIEWER_EMAILS` / `YOUTUBE_REVIEWER_EMAILS` can connect them until `META_CONNECT_OPEN` / `YOUTUBE_CONNECT_OPEN` are set; steps in `META_SETUP.md`. Not a public claim yet.
**Not available:** Pinterest (built, application declined), Reddit (application declined; no connect or publish code exists)
**Roadmap ideas:** Tumblr, Pixelfed, LinkedIn Company Pages

---

## Pricing & Plans

**Repriced August 12, 2026** (PRs #555–#557). Pro $5 → $8, Agency $20 → $29,
annual moved to two months free, free post cap 100 → 250. Done with **zero active
subscribers**, so there was no grandfathering, no migration and no angry emails.
That window closes permanently the day someone subscribes.

| Plan | Price | Posts/mo | Credits/mo | Seats | Client Workspaces | Accounts per platform |
|---|---|---|---|---|---|---|
| Free | $0 | 250 | 50 | 2 | 0 | 1 |
| Pro | $8/mo | 1,000 | 500 | 5 | 1 | 5 |
| Agency | $29/mo | 5,000 | 2,000 | 15 | 5 | 10 |
| Pro Annual | $80/yr | 1,000 | 500 | 5 | 1 | 5 |
| Agency Annual | $290/yr | 5,000 | 2,000 | 15 | 5 | 10 |
| Enterprise | custom | — | — | unlimited | — | — |

**These numbers are the source of truth.** `lib/post-limits.ts` and
`app/pricing/page.tsx` must agree with them and with each other. Claims that
drifted from this table have caused two separate corrections (PR #522, PR #556).

**Never say "unlimited"** about posts, seats or connected accounts. Every tier is
capped, the caps are above, and four blog posts had to be corrected in August for
claiming otherwise. Enterprise seats are the single exception.

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
- Content sharing audit (Direct Post) approved Oct 23, 2026: videos post to public profiles with the privacy the creator picks. Verified with a public post that day.

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
- **Enki's Inngest jobs are not registered** (wound down Oct 2026; see the note in `app/api/inngest/route.ts`). Don't re-register them in SocialMate.
- If a feature could have API costs, gate it like AI credits. Build for free-tier sustainability first.

---

## Commands

| Task | Command |
|---|---|
| Install | `npm install` |
| Dev server | `npm run dev` (http://localhost:3000) |
| Production build | `npm run build` |
| Lint | `npm run lint` (must report 0 errors; the ~680 warnings are a backlog to shrink as files are touched) |
| Type check | `npx tsc --noEmit` |
| Script tests | `npm test` (runs every `scripts/test-*.mjs`, no network); `python scripts/test-audit-schema-drift.py` for the audit script |
| Schema drift audit | `python scripts/audit-schema-drift.py` (needs production read keys in `.env.local`) |
| Upsert target audit | `python scripts/audit-dead-features.py` |
| Submit URLs to IndexNow | `node scripts/indexnow-submit.mjs` |
| Redraw the share image | `node scripts/make-og-image.mjs` (after any price, free-cap or platform change; `npm test` fails until it's run) |

Deploys: Vercel builds every push to `main` (production) and every branch (preview).
Environment variables live in Vercel and in your local `.env.local`, which is
gitignored. Never commit or print them.

## Where things live

- `app/` pages and API routes (App Router). `components/`, `contexts/`, `hooks/`, `lib/` shared code.
- `supabase/` SQL migrations and one-off SQL; `scripts/` audits, tests and migration helpers.
- `messages/` the nine locale files (any new key goes in all nine in the same commit).
- `android/` + `capacitor.config.json` the Google Play wrapper; `browser-extension/` the Chrome extension.
- `docs/` setup guides and design notes; `docs/sql/` hand-run SQL notes; `docs/marketing/` launch and content drafts; `docs/history/` the session log.

## Known Issues / Bugs (fix these when touched)

### THE failure mode of this codebase — read this before writing a query

**A query naming a column the table does not have returns an error and null
data, not empty data.** Every caller that writes `const { data } = await ...`
throws the error away, so the feature just quietly does nothing. Forever.

The August 12–13 sweep found **nine separate instances**, each of which had
silently disabled a shipped, advertised feature — some since launch. It is by a
wide margin the most expensive bug class in this project, and it is invisible
without deliberately looking.

Rules that follow from it:

- `scripts/audit-schema-drift.py` compares every column named in the code against
  the live schema. **Run it before shipping anything that touches the DB.** It is
  depth-aware (nested jsonb keys are not columns), knows about ternaries, and as
  of Aug 30 also reports **missing tables** — it used to skip any table it could
  not resolve, which is how four features with no backing table hid for months.
  `scripts/test-audit-schema-drift.py` covers its text scanning; run it if you
  touch the script.
- `scripts/audit-dead-features.py` catches the half that only fails at runtime.
  It probes every `onConflict` target against the live database, because Postgres
  raises `42P10` unless a unique index covers exactly those columns — an upsert
  with no matching index fails for every user, forever, and is invisible until
  someone performs that exact action. Zero-write by construction.
- **One fact, one place.** Three separate bugs in three days came from the same
  shape: the same fact stored in two tables, one written and the other read.
  `affiliates.status` vs `affiliate_profiles.status` (PR #573),
  `user_settings.plan` vs `workspaces.plan` (PR #579, cost the first paying
  customer their whole first hour), `team_members` vs `workspace_members`
  (PR #581). Before adding a column that duplicates state, don't. Read the plan
  through `resolveWorkspacePlan()` in `lib/plan.ts`, never off either table.
- Never discard a Supabase error. Destructure `{ data, error }` and at minimum
  `console.warn` it. Fire-and-forget writes still log — see `lib/usage.ts`.
- Prefer `select('*')` when you do not control the schema. The May calendar
  outage was an explicit column list naming a `tags` column that did not exist.
- `.maybeSingle()` for optional lookups. `.single()` errors on zero rows.
- Verify a new insert shape against production before shipping: post it with a
  deliberately fake `user_id`. `23503` (foreign key) means every column was
  accepted. `PGRST204` or `42703` means a phantom column. `23514` means a CHECK
  constraint rejected a value — that is a separate gate, and it is how the
  notifications table stayed empty even after its columns were right.

### Active — fix when touching the file

No open known bugs in code as of October 15, 2026. `audit-schema-drift.py` and
`audit-dead-features.py` were both re-run that evening, after #707–#714: no
phantom columns across 930 files, all 35 upsert targets indexed. (Also clean
that morning across 901 files, and after the #585–#595 sweep on August 30.)

**Resolved Oct 26 (PR #752):** the public address is `socialmatehq@gmail.com`,
held in `lib/contact.ts`. Never show an `@socialmate.studio` address; that domain
has no mailbox (its MX is Resend inbound and nothing forwards it).

**Both audits were clean on the morning of Aug 30 and five never-ran features
were found anyway.** The audits catch phantom columns and impossible upserts.
They cannot catch a function nothing calls (#594), a field that is out of API
scope (#585), a column the app writes but never reads (#595), or a reply-to
that was never set (#591). For that, walk the product.

**Run this SQL if `audit-dead-features.py` still reports 42P10:**
```sql
CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_endpoint_key
  ON push_subscriptions (endpoint);
CREATE UNIQUE INDEX IF NOT EXISTS competitor_posts_competitor_url_key
  ON competitor_posts (competitor_id, post_url);
```

Previously tracked issues, all resolved:
- ✅ Dark mode spinners — `dark:border-amber-500` added to all 20 pages (PR #472, June 8)
- ✅ Streak counts scheduled posts — `api/streak` now includes `scheduled` status + uses `scheduled_at` (PR #471, June 8)
- ✅ Toast safe-area — `admin/white-label` and `hermes/campaigns/[id]` now use shared `<Toast>` component (PR #471, June 8)

## Admin Tools (built Apr 20, 2026)

- `GET /api/admin/rescue-scheduled` — shows count of posts stuck in 'scheduled' past their scheduled_at
- `POST /api/admin/rescue-scheduled` — force-publishes all stuck posts via `fromInngest:true`, force-fails any that still error so they don't stay stuck forever
- `GET /api/admin/post-diagnostics` — shows today's partial/failed posts with per-platform success/fail breakdown from `platform_post_ids`

Run rescue in browser console (must be logged in as socialmatehq@gmail.com):
```js
fetch('/api/admin/rescue-scheduled', {method:'POST'}).then(r=>r.json()).then(d=>console.log(JSON.stringify(d,null,2)))
```

---

## Rules learned the hard way

Collected verbatim from the "Rules that follow" in each dated entry of
`docs/history/claude-log-2026.md` (the entry title says where to read the story).

**From: August 23, 2026 — Funnel instrumentation, and the pricing the August sweep missed (PRs #567–#569)**

- **A funnel step that is not in `FUNNEL_EVENTS` is not recorded.** `/api/track`
  validates against the same list and logs a warning on anything else, so a typo
  fails loudly instead of writing a step nobody will query.
- **Never trust a "shipped" line in this file without grepping for it.** Two entries
  in this document were false today. That is the second time; the August sweep found
  nine.
- **Derived arithmetic moves with the number it was derived from.** "One-twentieth of
  the going rate", "$80/year = $4.58/month", `100 × $20 × 40%` — every one of these
  survived a price migration that updated the price beside it.

**From: August 28–30, 2026 — The first paying customer, and the week the audits grew teeth (PRs #573–#582)**

- **Verify a "shipped" feature by exercising it, not by reading the changelog.**
  Five separate never-ran discoveries in three days. Every one had the same cause:
  nobody had performed the action.
- **A guard with a blind spot is worse than no guard**, because it is trusted.
  `audit-schema-drift.py` silently skipped tables it could not resolve, and had two
  false positives from an apostrophe inside a `//` comment. Both fixed; it now has
  tests.

**From: August 30, 2026 — The day the onboarding turned out to save nothing (PRs #585–#595)**

- **A dead code path hides every bug downstream of it.** #595 was completely
  inert while `handleFinish` never ran; #594 made it live within the hour.
  Fixing a path that never executed does not just restore it, it activates
  everything behind it. Re-test after un-breaking something.
- **Walk the flow. Then query the database.** #592 fixed the starter-post insert
  correctly and the post still did not save, because the insert lived inside a
  function nothing called. Two full walkthroughs and a production query found
  what the diff could not.
- **Never quote an activation number that counts our own accounts.** Four of
  them exist. Use `lib/internal-accounts.ts`.

**From: September 9-10, 2026 — The posting pipeline had never been audited, and neither had the marketing copy describing it (PRs #632-#638)**

- **A tracking call placed before the code that can fail measures attempts, not outcomes.** If an analytics event fires at the top of a handler instead of after the thing it's counting actually succeeds, it will look like a real number and be worthless. Put funnel events at the API layer, after the write succeeds — not in the client handler, and not scattered across every button that can reach that handler.
- **Two implementations of the same action will drift, silently, forever.** `/api/posts/create`'s Post Now and `/api/posts/publish`'s direct path did the same thing for months with different side effects, and nothing ever compared them. If a feature can be triggered two ways, it should be one function called twice, not two functions that happen to agree today.
- **"Marked done" in this file means grep it, not trust it.** The August repricing sweep, the LinkedIn launch, and the never-say-unlimited rule were all previously logged as complete and all had live violations months later. A changelog entry is a claim about the day it was written, not a live guarantee — re-verify with the literal string before quoting a "done" line from this file to a customer or an AI crawler.
- **"Never say unlimited" doesn't require the word "unlimited."** "No post cap," "no caps," "no post limits ever" are the identical claim and just as wrong. Grep the meaning, not the token.

**From: September 10-11, 2026 — HERMES becomes a real paid feature, and the day the pricing page finally meant what it said (PRs #647-#652)**

- **A pricing-page number with no backing code is a promise nobody is keeping — and it's not an all-or-nothing failure.** HERMES's `sendsPerDay` and `campaigns` caps were real and enforced from day one; `prospectsPerMonth` and `discoverRunsPerMonth` sat right next to them as pure copy for months. Half-enforced reads as trustworthy, which makes it more dangerous than a page that's obviously all talk.
- **A quota shared across every customer needs a per-customer cap even when the vendor doesn't require one.** Nothing about Hunter.io's billing forces SocialMate to limit any single user — the vendor is happy to let one account burn the whole month's pool. The cap has to be imposed on this side, or one customer's usage becomes every other customer's outage.
- **Onboarding and signup carry a performance tax no other route does: they are structurally always cold.** A returning user's fifth trip to `/dashboard` benefits from a warm cache and previously-downloaded JS; nobody's fifth trip to `/signup` exists. Bundle-size and layout-shift fixes on these two specific pages are worth disproportionately more than the identical fix anywhere else in the app, because every single visitor experiences them cold.

**From: September 11-12, 2026 — Three more small drifts, and the media library's "zero rows since April" finally has a reason (PRs #658-#660)**

- this is the fourth time in this project's history a table read "zero rows ever" and the reason turned out to be a discarded error on the write path (`bio_pages` on Sept 11, `notifications` on Aug 13, plus the nine-feature August sweep). "Confirmed applied" in this file has only ever meant the migration ran — it has never once meant the write path was verified. Treat a "zero rows" finding as an active bug report, not a shrug.

**From: September 23, 2026 — TikTok real scheduling, then the first full Creator OS audit (PRs #661-680)**

- **Two competing implementations of the same duty will eventually both be wrong in different ways.** The scheduler race (#668) and the affiliate balance split (#673) were both "two things independently trying to be the one source of truth" — a second scheduler and a second balance column — and both had silently drifted from the real one. When two code paths do the same job, that is itself the bug, before either path's logic is even checked.
- **A feature's own UI copy is a claim, and claims go stale exactly like code does.** `/schedules`' "apply to SOMA projects" sat there as a promise with no backing code for months (#680) — nobody file-searched for the thing the button was supposed to do because the copy sounded finished. Read a feature's stated capability as a test to run, not a description to trust.
- **Read the vendor's docs before shipping money-movement code, not after.** #679 asserted from memory that `on_behalf_of` moves Stripe's fee to the connected account. It does not; the destination-charges page says the platform balance is debited for fees, refunds and chargebacks. The bug it targeted was real (a "0% cut" feature where SocialMate pays ~2.9% + 30 cents per payment, which is about 33% of a $1 tip) and invisible by construction, since nothing errors. The fix was wrong and merged anyway. Payment semantics get verified against the docs page, quoted in the PR, or they do not ship.

**From: September 24–26, 2026 — Turning user comments into fixes, and the week Discord turned out to be broken for everyone (PRs #681–#687)**

- **Never let a model decide anything the system already knows.** The date, the schedule and the price belong to code. The model writes the words.
- **A job that swallows its failures looks exactly like a job that had nothing to do.** Throw, so the run reports it. Three weeks of empty calendar had no signal.
- **A flow that is "already in the repo" but has never produced a production row has never been tested.** Before pointing users at it, check the external configuration (here: which Discord app, which redirect URIs, which token) and do one real end-to-end run. Same lesson as #679.
- **A secret pasted into chat is burned; rotate it.** Never ask for one. Client IDs are public and fine to share.
- **Keep Reddit replies to 2–4 sentences.** Detail goes in chat and in the feedback log, not the reply.

**From: October 14–15, 2026: The first outside publishers, and fixing what the data pointed at (PRs #695–#703)**

- **"Created in the last minute" is not "new account".** Email signups confirm minutes later. Use `isFirstSignIn()`.
- **Capture where a visit starts, not where the form is.** Almost nobody lands on `/signup`.
- **A response field has one type everywhere.** If the UI reads `upgrade` as copy, no route may send a boolean. Grep the consumers before changing a response shape.
- **Fuzz anything that rewrites user text.** The splitter's first sentence regex silently dropped whatever it could not match, and only random input showed it.
- **A `useCallback` with no dependencies freezes what it read on the first render.** Treat that lint warning as a bug report.

**From: October 15, 2026 (evening): the TikTok audit went back in, and what the first logged-out crawl found (PRs #704–#714)**

- **Never put a `loading.tsx` above a route that calls `notFound()`.** The stream starts with a 200 before the 404 is known.
- **Derive lists of what exists; never hand-maintain them.** 38 phantom posts came from one hand-kept slug list.
- **A lock against abuse must not lock out the person it protects.**
- **Blog posts are claims, and they drift faster than code.** The Sept 10 sweep fixed the site; this one still found Instagram claims and a free cap five times too low in the pages AI crawlers read most. Re-scan the blog after any pricing or platform change.
- **GitHub can report a false conflict when one PR moves a file another edits.** `git merge-tree` shows whether it is real; merging main into the branch clears it.

**From: October 16–22, 2026: partners, the HQ page, and posts that went out late or not at all (PRs #715–#736)**

- **Every path that makes a post scheduled queues a `post/scheduled` event.** The GitHub sweep is a 3 to 5 hour backstop, not a schedule. Don't fix lateness with a sub-hourly cron; the Inngest budget can't take it.
- **The same fact in two tables, again.** The partner program was two programs that never met. Check for a second table before trusting the first.

**From: October 23, 2026: TikTok approves public posting (PRs #737–#741)**

- **An approval email is not proof.** Make one real public post before telling 48 people it works.
- **When one request sends a value and another writes the row, both need it.** #738 was the disclosure reaching TikTok in init-upload and never reaching confirm-upload.
- **A database edit to a cached page isn't live until it's refreshed.** Edit, call `/api/admin/revalidate`, confirm with curl, then IndexNow.

**From: October 24–29, 2026: SOMA rebuilt, campaigns and go-live alerts, and pages for what people ask AI (PRs #742–#761)**

- **Find out what people ask AI, then give them a page that answers it.** The `/for/*` pages are where ChatGPT signups land. Add an audience as an entry in `lib/audiences.ts`, never as a new folder (a folder wins over the dynamic route).
- **One price, one constant.** #743 was a label and a charge that drifted for six months. The route and the UI import the same number.
- **A setting the UI saves is a promise.** SOMA's Auto-Collect toggle and the dashboard mode toggle both wrote values nothing read.
- **A model may write the words, never the links or prices.** Campaign rewording keeps a version only if it has every link and price the message had.

**From: October 30 to November 1, 2026: Buffer page corrected, OnlyFans and Patreon pages, and team members could not post (PRs #763–#767)**

- **Accounts belong to the workspace owner, not to the author.** Never pass `post.user_id` to a publisher; pass `accountScopeFor(...).ownerId`. A post's `user_id` says who wrote it.
- **A paid gate in front of a queue that a free feature fills is a dead end.** Free sells 2 seats and the Editor role. The approval queue was Pro-only, and everything an Editor sent went into it.
- **Decided Nov 5:** Pro includes 1 client workspace (`PLAN_CLIENT_WORKSPACES` in `lib/plan.ts`). The plan table here, `llms.txt`, `ai.txt`, `/vs/buffer` and `/vs/hootsuite` now say so too.
- **Fixed in #768 (merged Nov 2):** the owner's Queue, Calendar and Drafts listed only posts they wrote, and RLS stopped them moving, cancelling, retrying or deleting a team member's post. `/api/workspaces/posts` now serves a workspace's posts whoever wrote them, and `canManagePost()` in `lib/team-workspaces.ts` is the one check (author, or the workspace owner/admin). Since Nov 3, Compose opens a teammate's post directly for an owner or admin (see below).

**From: November 2, 2026 (PR #769): LinkedIn formatter, 14 audience pages, 8 blog posts, teammates' posts in Compose**

- **A markdown link only works if the renderer handles it.** The blog renderer understood headings, lists and bold lines, not links, so every `[Start free](/signup)` call to action shipped as visible brackets. Check how text is rendered before writing it in a new syntax.

**From: November 3, 2026 (PR #770): three more free tools, a blog feed, an audience hub, and robots.txt stopped hiding /affiliates**

- **A robots.txt rule is a prefix.** `Disallow: /affiliate` blocks `/affiliates`. Write exact paths with `$`, and keep one robots source, derived from the same list as sign-in.

**From: November 3, 2026 (PR #771): the free tools hand their post to the product**

- **Don't make someone redo work to sign up.** A visitor who wrote a post in a free tool had to start again after signing up. Carry what they made across the signup.

**From: November 4, 2026 (PR #772): cleanup, the `src/` trap, and HereNow's pilot week**

- **"This code is dead" is a claim. Grep for imports, including path aliases,
  before deleting anything.**
- **A cloud session that can't push hands over a patch file.** `git format-patch`
  in the cloud, `git am` on Joshua's PC, then `gh` to push, PR and merge. Prove
  the patch applies to the current main before sending it.

**From: November 18, 2026: TikTok posts waited on a browser tab**

- **A check that runs in the browser stops when the tab closes.** TikTok Studio
  was the only thing that asked TikTok whether a video published: for two
  minutes, and only while the page stayed open. Three posts from one creator
  sat on "Sending" for up to three days and never reached the posts table.
  Anything that settles a record's status needs a server-side follow-up (an
  Inngest event that sleeps and checks, plus a daily sweep), not just a poll.
- **TikTok accepting a video is not TikTok publishing it.** The scheduled
  publisher and `/api/tiktok/post` marked a post published, mirrored it and
  counted it the moment TikTok accepted the upload, before TikTok pulled the
  file and decided. Only PUBLISH_COMPLETE from the status endpoint means live.

**From: November 19, 2026: posting from TikTok Studio was hard to find on a phone**

- **A reason in a tooltip is no reason on a phone.** Studio's Post button was
  greyed out until an audience was picked, with the reason in a `title`
  tooltip, in a tab shown as a bare phone icon, at the bottom of a 288 px
  scroll box inside a scrolling page. Half the phone users who added a video in
  the 45 days to Nov 18 never pressed it. Put what is missing on screen, and
  let a press take the person to it.
- **Look at the phone layout before deciding people lost interest.** "Connected
  but never posted" was 92 of 99 accounts, 62 of them TikTok only, and it read
  like motivation. The funnel by device pointed at the screen instead.

**From: November 19, 2026: Write with AI hung for five minutes and kept the credits**

- **Every outside call a person waits on needs a time limit shorter than the
  function's.** The AI routes took credits, then called Gemini with no limit.
  When Gemini never answered, Vercel ended the function at 300 seconds
  (`FUNCTION_INVOCATION_TIMEOUT`), the person saw "Network error", and the
  refund in the catch block never ran. `lib/gemini.ts` gives Gemini 40 seconds
  inside a 60-second route.
- **"The variable is set" is not "it works".** `/api/admin/health` said AI was
  configured while every AI request failed. It now asks Gemini for one word
  with the production key and shows Google's own answer.
- **A flex column with no `min-w-0` takes the width of its longest line.** One
  row of post previews made the Queue 801 px wide on a 375 px phone.
  `scripts/test-layout-columns.mjs` holds every main column to it.
- **A listed model is not a working model.** The key still listed
  `gemini-3.6-flash` and Google's status page was green while every request
  hung with no answer; Google Cloud retired 3.6 Flash that day (Nov 19) and
  named 3.8 Flash. A model retirement has now taken all AI down twice (July:
  2.5 Flash, a 404; November: 3.6 Flash, a silent hang). When AI fails, read
  `/api/admin/health` first: it asks every model in `GEMINI_MODELS`, says which
  one requests are getting answers from (`answeredBy`), and when none answers,
  asks every other stable Flash model the key lists.
- **One model is not enough.** The evening the fix moved to `gemini-3.8-flash`,
  3.8 Flash answered 503 "high demand", then took 12 s for one word, then said
  nothing for 20 s, while 3.6 Flash (the model that hung all day) answered in
  about a second. Google sheds load per model, free tier first. Every Gemini
  call now goes through `GEMINI_MODELS` in `lib/gemini.ts`, tried in order:
  `geminiModel()` for a person waiting (10 s a model, 40 s in all) and
  `geminiLongModel()` for longer answers and background work. `scripts/test-gemini.mjs`
  fails if anything builds its own model. A model that failed is asked last
  for the next 3 minutes on that function instance, so one busy model costs
  one slow request, not every request.

**From: November 19-20, 2026: Vercel paused the whole site for CPU**

- **Hobby's limits are a switch, not a bill.** Hobby includes 4 hours of Fluid
  Active CPU a month. Going over paused every route at once (pages, API,
  `/api/inngest`, the crons) with `402 DEPLOYMENT_DISABLED` for the rest of the
  cycle, and refused deploys ("Account is blocked", which is how #816 merged
  without deploying). The team is on Pro since Nov 20: $20 a month with $20 of
  usage included, and the first day used $0.17 of it.
- **A poll in a shared component runs in every open tab, hidden or not.** The
  bell and the sidebar's unread badge each polled every minute, in both copies
  of the sidebar (the phone drawer only slides off screen), so one open tab
  sent four requests a minute all day: Vercel's two busiest routes and two
  thirds of all Active CPU. A session's own browser tab left on `/queue` was
  one of those tabs. Poll through `hooks/useVisiblePoll.ts` and share answers
  through `lib/shared-fetch.ts`; `scripts/test-cpu-budget.mjs` fails on a
  plain timer that calls the API from components, contexts or hooks.
- **A page that reads the request renders on every visit.** Awaiting
  `searchParams` (or `cookies()`, `headers()`) makes a page dynamic, and its
  `revalidate` does nothing. The homepage did this from March to Nov 20. The
  build's route table says which: ƒ renders per request, ○ and ● are cached.
- **The proxy is billed for every request it matches.** It ran 8.1K times in a
  window where every function together ran about 4.5K. Its matcher covers
  pages only; API routes check their own session.
- **Our own test traffic is in Vercel's numbers.** The built-in browser's phone
  emulation sends a phone user agent, so Speed Insights files it under Mobile,
  and a hidden browser pane renders slowly. The Nov 19 checks of `/queue` and
  `/tiktok/studio` at phone size were most of that day's mobile data and gave
  a Real Experience Score of 13 (first paint 7.8 s). Discount a day with those
  checks in it before reading mobile scores.

**From: November 18, 2026: the update email's audience missed an opt-out**

- **An email audience honors every opt-out the product offers, not just the one
  its route was written around.** The update email skipped "unsubscribe" replies
  but not the newsletter checkbox (`user_settings.iris_opt_in = false`), and its
  Nov 16 batch reached 15 people who had said no. Before a bulk send, grep for
  every place a person can say no to email.
- **A test login is ours.** Reviewer logins for a platform's review live in
  `META_REVIEWER_EMAILS` / `YOUTUBE_REVIEWER_EMAILS`, and `isInternalEmail` reads
  both. The Meta reviewer login had been counted as a customer publisher and was
  queued for the update email.
- **A reply that only reaches Resend is gone in 30 days.** Resend keeps sent and
  received mail for 30 days on every plan below Enterprise, so the replies to
  the Aug 30 email (sent seven minutes before #591 added a reply-to) could never
  be checked again. Every send sets a reply-to through `lib/mail.ts`; keep it so.
- **Resend's free plan allows 100 emails per UTC day, received mail included.**
  The day resets at midnight UTC: 7 PM Eastern in winter, 8 PM in summer.
  `BULK_EMAIL_DAILY_CAP` defaults to 100, the whole quota, so a full day of bulk
  sends still leaves nothing for app mail. Start a big send right after the
  reset and keep it well under 100.

**From: November 20, 2026: app pages were a spinner until their JavaScript ran (PRs #820 to #822)**

- **`useSearchParams()` in a page sends the whole page as a spinner.** Next
  renders everything up to the nearest Suspense in the browser instead, so the
  HTML of /accounts, /dashboard, /settings, /compose, /queue and /drafts held
  only a spinner, and a phone painted nothing useful until about 1.2 MB of
  JavaScript had run. Read a callback's params from `window.location` in a mount
  effect, or keep the hook in a small child with its own Suspense. When the
  first screen itself depends on the URL (settings' `?tab=`), render the route
  per request instead (`export const dynamic = 'force-dynamic'` in its layout):
  then the hook reads the real URL on the server and nothing bails out. After a
  build, `grep -o BAILOUT_TO_CLIENT_SIDE_RENDERING .next/server/app/<page>.html`
  says which pages still do it (every page has a few from the cookie banner,
  install prompt and feedback button, which are client-only on purpose).
- **supabase-js asks for the user one request at a time.** `getUser()` waits on
  the client's auth lock, so nine callers on one page (providers, sidebar, page)
  were nine round trips in a row before any of the page's own data. The browser
  client now shares one check per page load (`lib/shared-user.ts`, applied in
  `lib/supabase.ts`); don't add a second cache on top of it.
- **A loading state has the shape of the loaded page.** /accounts showed
  "Connect your first social account" while its list was still empty, then
  removed it for everyone who had one: a 0.37 layout shift on every visit by a
  returning user. Render what doesn't depend on the data at once, and put what
  does where its arrival moves nothing on the first screen.
- **A skeleton with no text is not a paint.** Gray boxes and spinners don't
  count as a first contentful paint, so a phone shown only those records
  nothing until the JavaScript runs. Put the page's real title in the skeleton
  (`components/AppPageSkeleton.tsx`), and keep the sidebar at the same place in
  the loading tree and the loaded one, or it is rebuilt when the data arrives.

**From: November 20, 2026: deleted posts kept their queued jobs**

- **A job that wakes up later treats a missing row as done, and only a failed
  read as a reason to retry.** `.single()` turns zero rows into an error, so
  "deleted" and "the database hiccuped" look the same. Use `.maybeSingle()`
  and check `error` separately. Ending a campaign deleted its queued posts,
  and each one's `post/scheduled` run would still have called the publish
  route, got a 404 and retried three times.

**From: November 25, 2026: an outside tester's walkthrough**

- **A warning is not a guard.** Compose said "No Bluesky account connected"
  and let Schedule through anyway. The post saved as Scheduled, the Queue and
  the Dashboard listed it, the streak counted it, and it failed at its time.
  The check now sits in `/api/posts/create` and the thread route, and Compose
  and the Dashboard use the same helper (`lib/connected-platforms.ts`).
- **Copy about Free names what Free gets.** "7 live platforms" sat on the Free
  card, nine `/for` pages and the homepage grid while X needs Pro, and the
  Free sidebar showed X at "0 / 0, Limit reached". Which platforms are
  Pro-only comes from `PAID_ONLY_PLATFORM_NAMES` in `lib/site-facts.ts`.

**From: November 26, 2026: the Queue and the /streak page (#832)**

- **A query's window covers every time it counts by.** /api/streak counted a
  post on the day it went out but only read posts by `scheduled_at`, which
  Post Now leaves empty, so no Post Now post ever reached the /streak page.
- **One person's posts can pass 1,000 rows.** The admin has over 1,700 in a
  year, and PostgREST stops at 1,000 a request. Page with `selectAll`
  (`lib/admin-metrics.ts`), or read the newest first (#831).
- **A streak day is the day a post was due.** 274 of 1,712 published posts
  went out on a later day than planned, held up by our outages. Counting by
  `published_at` broke people's streaks over our own delays.

**From: November 26, 2026: wiring the Black Friday code**

- **A code is used when it is paid for, not when checkout opens.** The
  checkout route recorded a redemption before Stripe's page loaded, so one
  click on Back burned the code. Check a completed Checkout Session.
- **A code the box accepts must exist where the money is taken.** NONPROFIT50
  and STUDENT25 said "applied" for six months with nothing in Stripe behind
  them. A discount is real only when a Stripe promotion code carries it.
- **Prove a discount's length on a test clock before it goes live.** Stripe's
  docs don't say whether a 12-month coupon touches a yearly renewal; a test
  clock answered in a minute (it doesn't).

**From: November 26, 2026: what Free covers, everywhere (#835)**

- **Fixing the pages people see first is not fixing the claim.** #830 fixed
  the homepage, /pricing and nine /for pages; about 600 more sentences said
  the same thing in comparison pages, audience answers, locale files in eight
  other languages and database blog posts. Grep the meaning in `app`, `lib`,
  `messages` and `blog_posts`, in every language, before calling it done.
- **A list of items is read as one claim.** "7 platforms · 15+ AI tools · Free
  forever" says all seven are free even though no single phrase does.
  `scripts/test-free-platform-claims.mjs` reads a whole sentence, so it sees
  these; it cannot see a card headed "Free" over a "7 platforms" list item.

**From: November 27, 2026: TikTok Studio's confirm (#836)**

- **Never refuse to record what already happened.** confirm-upload checked the
  monthly cap after TikTok had the video, so past the cap the video went out,
  no row was kept, and the error invited posting it again. Check a limit before
  the action it limits; afterwards, record what the other service did.
- **The request that records finished work must outlive the page.** Phones drop
  pages (a reload, an app switch, memory). Send it with `keepalive`, and make
  the route answer a resend as done, so resending a lost one is safe.
- **`input.click()` bubbles.** A hidden file input inside an element whose own
  click opens it runs that handler twice. Stop the click on the input.

**From: November 27, 2026: what's coming (#837)**

- **A status list goes stale in both directions.** /best-times filed TikTok
  and X as planned months after both went live, while Pinterest sat under
  "coming" after it declined. Read a platform's status from
  `lib/site-facts.ts`; never type it into a page.

**From: November 27, 2026: the sign-in callback (#842)**

- **A redirect is part of the page it lands on.** /onboarding's time to first
  byte runs from the click on Google's consent screen through every hop, so
  each query the auth callback awaited was time spent on Google's last screen:
  up to ten in a row, 1.31 s at p75. Await only what decides where the person
  goes, hand the bookkeeping to `after()`, and change cookies before it:
  `after()` runs once the response has gone.
- **A Poor route on two events is a lead, not a finding.** Desktop's Poor list
  held 45 and 48 s LCPs (our own browser pane, loaded while hidden) and an INP
  spike from two presses on two days. Read the event count and the chart
  before fixing.

**From: November 27, 2026: referral links (#843)**

- **Look a value up the way it was stored.** /refer/CODE and /z/CODE
  uppercased codes that are generated in lowercase, so both pages were a 404
  for 288 of 297 people, and nothing reported it. Put the normalizing in one
  helper (`lib/referral-code.ts`), never at each call site.

## Pending / In Progress

> **One "Pick up here", replaced, never stacked.** Until Nov 4 every session added
> its own dated entry on top, and six of them piled up, half stale. Edit this list
> in place: remove what is done, add what is new. What happened goes in the dated
> entries above.

**Pick up here (updated Nov 27, 2026).** #786 through #843 are merged.

**Nov 27: the slow pages Speed Insights Plus showed, and the sign-in callback
(#842).** Read before Plus ends on Dec 19, for the 7 days to Nov 27:
- Phones have no Poor route (RES 99). On desktop (RES 97) /onboarding, 42 on
  17 events, is the only Poor route with real traffic. The rest have 1 to 6
  events each. /accounts' 45.6 s LCP is our own visit from a built-in browser
  pane that loaded while hidden (traced Nov 20), and /for/agencies' 48.8 s
  looks the same. /soma/dashboard's CLS 2.02 moved `body` on 2 events.
  /signup's INP of 2.2 s was 2 presses of its submit button between Nov 21 and
  23, and the chart has been flat since.
- The desktop homepage's TTFB is 2.0 s at p75 over 43 events. curl from
  Indiana gets 0.3 to 0.45 s from the cache (`PRERENDER`), so the cause is
  distant visitors and their networks, not the server.
- /onboarding's TTFB (6.23 s desktop, 3.14 s phones, p75) counts every hop:
  Google, Supabase, `/auth/callback` and then the page. Vercel Observability
  for those 7 days:
  - `/auth/callback`: 12 calls, p75 1.31 s.
  - /onboarding itself: 232 ms.
  - The proxy: 12 ms.
- The callback awaited up to ten queries in a row. With #842 it waits for the
  code exchange, then two reads side by side: `ensurePersonalWorkspace` and
  the onboarding status. Everything else is `recordSignIn` in `lib/sign-in.ts`,
  run with `after()`: the referral, the welcome sequence and
  `signup_completed`, the newsletter choice, the login count and the signup
  source.
- The workspace check was `.single()`, so two personal workspaces or a failed
  read made another one. It is now `limit(1).maybeSingle()`, and a failed read
  makes none (the post routes create one when it is needed).
- `scripts/test-sign-in.mjs` covers it; its wiring check fails on the old
  callback.
- **After #842 deploys:** read the next sign-ins in production.
  - A returning sign-in moves `login_count` and `last_active`.
  - A new account gets `funnel_signup_completed`, `welcome_email_sent` and its
    source.
  - All of that now runs in `after()`, which this app has never been seen to
    run in production (#793's webhooks were never walked).
  - Then check Observability's `/auth/callback` p75 (1.31 s before).
- **Referral links (#843, Joshua: "Yes, fix it").** /refer/CODE credited a
  partner only if the visitor pressed its button, because the page set only
  `ref_code` (7 days, for onboarding's banner). The proxy now sets `sm_ref`
  (60 days) there too, via `referralCodeFromUrl` in `lib/referral-code.ts`.
  - The page itself was a 404 for 288 of 297 codes, the one active partner's
    included: it looked codes up in capitals, and every code is stored in
    lowercase. The /z/CODE ZENITH card had the same bug.
  - /refer, /z and the sign-in step now look codes up through
    `referralCodeCandidates` (as given, in lowercase, in uppercase).
  - `scripts/test-referral-code.mjs` covers it; 3 of its checks fail on the
    old code.
  - Nobody has signed up through a referral link yet (`referral_conversions`
    has no rows).

**Nov 27: the setup check (#840, docs only).** Joshua let sessions use his
Chrome ("work on whatever you need to"). What his Chrome is signed in to, and
what it showed:
- **Vercel.** $3.62 of the $20 included in the cycle to Dec 19. **Speed
  Insights Plus ($10 a month on top of Pro's $20) is off:** Joshua said "Turn
  it off" (Nov 27, #841), so it runs to Dec 19 and doesn't renew, and the
  upcoming invoice reads $20 (it was $30). From Dec 19 Speed Insights shows
  only the Real Experience Score of routes rated Great or Needs Improvement:
  no Core Web Vitals, no Poor routes, no countries. It keeps collecting within
  the team's allowance and pauses when that runs out, so
  `components/VercelInsights.tsx` stays. Until Dec 19 the detail is still
  there; desktop, 7 days to Nov 27 (RES 97): the Poor routes were /onboarding
  42 (17 events), /forgot-password 36 (4), /for/agencies 35 (3), /accounts 6
  (6) and /soma/dashboard 1 (6); the entry above reads them. Spend Management:
  $200 budget, alerts at 50, 75 and
  100%, pausing off. Functions: 0% errors over 12 hours. **Speed Insights,
  Mobile, Nov 21 to 26** (289 events, our visits excluded): RES 99, no page
  poor. App pages since the Nov 20 baseline: /compose 66 to 98,
  /tiktok/studio 49 to 87, /dashboard 54 to 83, /accounts 55 to 66,
  /onboarding 51 to 59. /onboarding's TTFB is 3.14 s and /accounts' 2.04 s:
  most of it is the sign-in and OAuth redirects that land on them, and
  visitors far from the US (Tajikistan, India, Nigeria, Pakistan lead the
  mobile list); /onboarding's own server work is two cookie reads.
  /for/tiktok-creators is 90, with CLS 0.15 at p75 over 30 events; a clean
  headless phone load and full scroll (`playwright-core` with the installed
  Chrome, throttled) measured 0, so it could not be reproduced.
- **Stripe (live).** The webhook listens to exactly the 4 events the handler
  handles (`checkout.session.completed`, `customer.subscription.updated` and
  `.deleted`, `invoice.payment_succeeded`), 0% errors, no deliveries this week.
- **Inngest.** All 36 functions show no failures in 24 hours. The free plan
  keeps 1 day of run history, so older runs can't be read there; the database
  says every scheduled admin post since Nov 21 went out within a minute of its
  time, so the sleeping `post/scheduled` runs exist (72 still ahead).
- **Auth email works.** Not via the dashboard (Supabase is signed out in
  Chrome): 19 of 25 email signups in 30 days confirmed, within 0 to 4 minutes;
  the 6 unconfirmed are 4 to 30 days old. Google is 40 of 65 signups.
- **Signed out or not on this account:** Supabase, Resend, Meta for
  Developers, and Search Console (this Google account has no properties;
  socialmate.studio's is likely under socialmatehq@gmail.com).

**Nov 27: where signups come from, and LinkedIn's false errors (#839).**
Read-only, outside accounts, since Oct 15 (when sources started being
recorded): 67 signups, 7 to 15 a week (15 the week of Nov 16; 4 so far in
Thanksgiving week). ChatGPT sent 38 (29 connected, 6 published), no referrer
17, Google 10 (3 connected, 0 published). One page, `/for/tiktok-creators`,
landed 29 of the 67: 23 connected TikTok and opened Studio, 12 added a video,
4 pressed Post, 3 have a published video, and only 2 of the 29 did anything
after their first day. So the first session is the whole chance. Since #813
(Nov 19), 9 signups: 3 added a video, 2 posted. **LinkedIn:** all four people
who saw "invalid state" since Oct 1 were connected; the error came 3 to 4
minutes after a connect that worked, once three times in a row (the one-time
state cookie was spent). TikTok and the Meta callbacks already answered such a
repeat with success (`lib/oauth-state.ts`, a 2-minute window); LinkedIn and X
never did. #839: both use `connectedJustNow` with a 10-minute window
(`SLOW_REPEAT_WINDOW_MS`), report `state_missing` / `state_mismatch` instead
of `invalid_state`, and set `updated_at` on a reconnect; LinkedIn's reconnect
no longer throws away its update error. `app/api/accounts/linkedin/callback`
is an older copy nothing sends people to (the connect route uses
`/api/linkedin/callback`); left in place.

**Nov 27: Black Friday reaches TikTok Studio (#838).** Read-only, from the
deal's start (Nov 26, 05:00 UTC) to 04:00 UTC Nov 27: one outside person
opened the Dashboard, where the deal banner was, and nobody viewed /pricing
or clicked the deal. TikTok creators are most of the people who publish, and
they live in Studio. Studio's screen after a post now shows the same
dismissible `BlackFridayBanner` to Free (`promo_clicked` with `from:
tiktok_studio`), never under a rejection, pinned to dark colours because
Studio is always dark. It ends with the deal on Dec 4. Also found: nothing
ever sends `ai_tool_used` (it is only in `FUNNEL_EVENTS`); the `ai_credit`
event is the real record, and outside accounts spent AI credits 9 times in 30
days.

**Nov 27: what's coming, and what Free gets, said truthfully (#837).** The
last of what #835 saw and left, plus what the same search turned up:
- **Pinterest and Reddit "coming".** Both declined SocialMate's applications,
  and /pricing's FAQ, /features (all nine languages), /roadmap, /best-times,
  /templates, six /for FAQs and a static blog post still called them coming
  or planned. Eleven /for pages kept their own "Coming soon" lists: they
  named Pinterest, LinkedIn (live since May) and Kick (nothing supports it).
  `SOON_PLATFORMS` in `lib/site-facts.ts` (Instagram, Facebook, Threads,
  YouTube) is now the one list, with `SENTENCES.soon` for prose. /best-times
  had filed TikTok and X under "Planned" and said "4 platforms" live; it
  derives the count and lists Pinterest and Reddit under "Post these by hand".
  /roadmap's "YouTube Community Posts" became "YouTube video uploads" (the
  API cannot post to the Community tab; uploads are what wait on Google).
- **SOMA and the AI tools on Free.** About 20 /vs pages listed SOMA with
  "starting free", and two on /vs/socialoomph listed it among the free AI
  tools; every /vs page says Pro now. 94 "15+ AI tools free" cells and items
  on /vs pages say "15+ AI tools, 50 credits a month free" (Post Score is
  Pro). /vs/later-free said Free was "50 credits, that's 50 posts" with
  several accounts per platform; it is 250 posts and one account.
- /for/linkedin-creators said LinkedIn images and video were on the roadmap
  (a post carries up to 9 images or a video today) and promised expiry
  reminders that shipped in October. A static blog post listed AI image generation, which
  does not exist.
- `scripts/test-platform-status-claims.mjs` (in `npm test`) fails on all of
  it: on the old code, 6 of its checks fail.

**Nov 27: TikTok Studio, read and fixed (#836).** Outside accounts, read-only.
Since Nov 21, 7 people opened Studio (all on phones), 6 added a video, 5
attempted a post and 5 got one out; nobody's video was rejected, so the first
step is no longer where people stop. Since Oct 22: 38 attempts by 10 people, 27
posted, 11 failed. The upload failures (5, plus 1 scheduled save) all came
before #813; since then there have been two failures:
- **Nov 25, `confirm`, "Failed to fetch":** the upload finished, the page went
  away (a reload or the phone dropping it) before `/api/tiktok/confirm-upload`
  answered, and the creator never came back. TikTok had the video; SocialMate
  kept no row, so no follow-up, no notification, nothing in Studio, and the
  error read like a reason to post it again (a duplicate on TikTok). #836: the
  confirm goes out with `keepalive` (it finishes after the page is gone) and
  is resent on a dropped connection or a 5xx (`confirmTiktokUpload` in
  `lib/tiktok-upload.ts`, tested); the route answers a confirm it already has
  as done (no second row, count or follow-up; the Inngest event carries an
  id); and when it never lands, the creator is told the video reached TikTok
  and to check their profile before posting again.
- **Nov 22, `export`, "The operation was aborted.":** an iPhone (WebKit's
  wording) applying edits stalled for 2 minutes, then failed; the creator
  posted a different video 4 minutes later. Not fixed: one case, and the
  cause (a play() or AudioContext waiting on a tap) needs an iPhone to test.
- **The quota refused after the fact.** confirm-upload checked the monthly
  TikTok cap after TikTok already had the video: past the cap, the video went
  out, Studio said "quota reached", and no row was kept. One outside creator
  is at 17 of Free's 20 this month. #836 makes confirm record and count every
  video TikTok has. Decided the same day (`TODO.md`): Post now and drafts are
  never refused at the cap (they cost us nothing); scheduled videos are, by
  `/api/tiktok/post`, whose message no longer tells people to buy a TikTok
  booster (no such product).
- **Every picker tap was recorded twice** (66 `tiktok_picker_opened` for 33
  taps): `input.click()` bubbles to the stage, whose own click opens the
  picker again. The inputs stop the click now. Halve the old picker counts.

**After #836 deploys:** optional, Joshua's or a session's to run (additive,
both audits clean Nov 27): `supabase/tiktok_posts_publish_id_unique_nov27.sql`,
one unique index on `tiktok_posts (tiktok_post_id)` that closes the last race
(a resend reaching the route while the first confirm is still inside it).

**Nov 26: Black Friday, BLACKFRIDAY through Dec 4.** Joshua set the dates
(Nov 26 to Dec 4) and left the amount to Claude: 50% off the first 12 months
of Pro or Agency, monthly or annual (Pro $4 a month for 12 months, or $40 for
the first year; Agency $14.50 or $145). Live Stripe: coupon `XYLnid2Q`
(repeating, 12 months, limited to the four Pro and Agency products, redeem_by
Dec 5 04:59:59 UTC, 11:59:59 PM Eastern Dec 4) behind promotion code
`promo_1Ug43u7OMwDowUuUMJGVIkwh`, and a `coupons` row so the pricing page's
box takes it; live `/api/coupons/validate` accepted it right away. Stripe test
clocks proved the length first: monthly bills $4 twelve times, then $8; yearly
bills $40, then $80 at the renewal. `lib/promos.ts` holds the dates and the
math. The /pricing banner (it replaces the welcome and birthday offers while it
runs) and a dismissible Dashboard banner for Free hide themselves when it ends,
as the code expires on its own: nothing to undo on Dec 5. `/pricing?code=X`
applies a code on arrival. `promo_clicked` and `checkout_started { code }`
show it on `/admin/funnel`. Found while wiring it, fixed in the same PR:
- Backing out of Stripe's page burned a code: `/api/stripe/checkout` writes
  `coupon_redemptions` when it opens the page, and both routes refused anyone
  with a row. A row now counts only when one of the person's completed Checkout
  Sessions carried the code (`lib/coupon-redemption.ts`). No pricing-page code
  had ever reached that table (0 rows; the August customer typed BDAY31 on
  Stripe's own page).
- NONPROFIT50 and STUDENT25 never had a Stripe promotion code, so the box said
  "50% off applied" and Stripe would charge the full price. The box now refuses
  such a code and gives the support email; how long they should last is in
  `TODO.md`. /for/nonprofits said "$2.50/month" (half of the old $5) and now
  works it out from `PLAN_PRICES`.
- The Dashboard's "Coming very soon" card named Pinterest and Reddit (both
  declined); it lists Instagram, Facebook, Threads and YouTube.
- **Announced, with Joshua's yes (Nov 26, "Yes, schedule them"):** four
  socialmatehq posts carry BLACKFRIDAY, all 9 or 10 AM Eastern: Nov 27 X and
  Bluesky (c6669da2) and Nov 30 X and Bluesky (56757161), whose text was
  swapped from BDAY31 in place (time and platforms kept; the publish job reads
  the text when it fires), plus two made in Compose so they queued the normal
  way: Nov 27 Discord and Telegram (5c06cc2d) and Dec 4 X and Bluesky, the
  last day (dcdd6add). All four show on the Schedule page with no "Not
  connected" badge. The BDAY31 posts from Dec 6 on stay as they are.
  **Checked Nov 27:** the first one (c6669da2) went out at 14:00:04 UTC with
  both X and Bluesky post ids.

**Nov 25: Joshua's 500 autonomy answers are standing orders** (confirmed in
chat Nov 25; the page is https://claude.ai/artifact/SwEPTVSAw1SF6xBxjsnSbA,
answers in its `answers` collection; Claude's local memory holds the distilled
list). His rule on about 300 of them: if it costs us nothing, do it ("if it's
free for me it's free for them"); if it costs money, later or Claude's
judgment. What changed for sessions:
- Claude merges its own PRs once checks pass and the preview checks out.
- Additive SQL on production (new tables, columns, indexes) runs from a
  session once both audits pass, and Claude may publish blog posts itself.
- Claude may resync Inngest and do Joshua's to-do items in his Chrome, except
  sign-ins, payments, tax forms and accepting terms.

Still Joshua's yes first: changing what a plan includes or costs, removing a
feature, money, emailing or messaging users, anything posted publicly in his
name, deleting data, dashboard settings, and the ask-first list below.

**Nov 25: what an outside tester found (#830, merged by Claude).** A builder from r/vibecoding walked a
fresh account on Nov 21 and reported five things, all confirmed in code:
Compose scheduled to a platform with nothing connected (his two posts in
`/admin/failure-log` failed "No Bluesky account connected"), the Dashboard
streak counted any post made that day (a failed one too), Coming up gave no
warning, the homepage grid marked X "Live" with the free six, the Free sidebar
read "0 / 0, Limit reached", and /pricing's Pro list never mentioned X. Fixed
together, plus the same "7 live platforms" claim on the Free plan of nine
`/for` pages. The Queue badge and the /streak page followed in #832 (Nov 26,
below).

**Nov 26: the rest of the "7 platforms free" claim (#835).** Done: it was
far more than 20 `/vs` pages. About 600 sentences said Free covers all seven
or that X is free: every `/vs` page and layout (the comparison CTAs, "free with
7 platforms" meta descriptions, and the X-tool pages, which said X itself was
free), 30 audience answers in `lib/audiences.ts`, 45 `/for` locale strings in
all nine languages plus the Free pricing card (`common.free_plan_platforms`),
/faq, /support, /press, guides, static blog posts, `ai-plugin.json` and
`BRAND.summary`. Statusbrew's page also put Instagram, Facebook, Pinterest and
Reddit on the free plan. `scripts/test-free-platform-claims.mjs` (in
`npm test`) now fails on a sentence that ties the live count to free without
saying X needs Pro (559 hits on the old code, 0 now). **Joshua's yes needed:**
`supabase/blog_free_platforms_nov26.sql` fixes the same claim in 20 sentences
of 19 database posts (checked read-only against the live rows; then
revalidate and IndexNow). What it saw and left (Pinterest and Reddit "coming",
SOMA and "all tools" free, /vs/later-free's Free numbers, LinkedIn media "on
the roadmap") was fixed on Nov 27 in #837 (above).

**Checked live after #830 deployed (Nov 26, 01:50 UTC), signed in as the
admin:** the homepage grid shows X as Pro with the "Six are free" line (served
from cache); a zero-write request to `/api/posts/create` naming Mastodon (not
connected on the admin) with a past time came back 400 "No Mastodon account
connected..." before the old past-time check; ticking Mastodon in Compose
shows the red warning and "Connect Mastodon to post", and Untick clears both;
every Dashboard request answers 200. The Free sidebar card was not seen live
(the admin's X allowance is unlimited).

**Same night: the Dashboard read the oldest 1,000 posts.** PostgREST answers
with at most 1,000 rows and the Dashboard ordered by `scheduled_at` ascending,
so the admin (1,828 posts) saw "Scheduled 0", an empty Coming up and a zero
streak with 53 posts queued. It now reads the newest 1,000 by `created_at`,
sorts Coming up by due time, and takes the Published total from a count when
the page is full. Outside accounts were never near the cap. Merged as #831 and
checked live Nov 26: the admin's Dashboard shows 52 scheduled, Coming up in
due order and a 13-day streak.

**Nov 26: the Queue and /streak (#832).** In the Queue, a scheduled post that
names a platform with nothing connected gets the Dashboard's red "Not
connected" badge (a press opens Accounts) and its platform chip turns red,
only in a workspace the viewer owns; a TikTok Studio post gets it when its
author has no TikTok account at all. Two reads per page load
(`connectionRowsFor`), none per post. `/api/streak` counts through
`streakDayMap` (`streakTimeOf` plus the same check, server-side). Moving it
over found two more: it windowed on `scheduled_at`, which Post Now leaves
empty, so no Post Now post ever counted (9 people's /streak page was empty),
and it read one page of 1,000 rows, so the admin (1,733 posts in the year)
saw a current streak of 0 (it is 13). `streakTimeOf` now counts a published
post on the day it was due, as /streak always had: 274 of 1,712 published
posts went out on a later day than planned, and counting them by
`published_at` piled them onto the day each backlog flushed. Checked
read-only before merging: no owner's Queue flags a post today (78 scheduled
posts in 4 Queues), and nobody's /streak numbers drop.

**Nov 20: AI works, and quickly (#818, #819).** Every Gemini call tries
`GEMINI_MODELS` (3.8 Flash, 3.6 Flash, 3.5 Flash-Lite) in order, 10 s a model,
and a model that just failed is asked last for 3 minutes. Checked live after
#819 deployed (03:24 UTC): three rewrites in a row took 17.1 s, 4.8 s and
10.9 s, all with real output, and Vercel's `[gemini]` log lines showed 3.8
skipped after its failure and 3.5 Flash-Lite answering when 3.6 stalled too.
Google sheds the free tier per model. Joshua said not now to a billed Gemini
project (Nov 20): raise it again only if every model in the chain refuses,
not when AI is merely slow.

**Nov 20: app pages on phones (PR #820).** Speed Insights (7 days) had
marketing pages fast on phones and app pages slow: `/settings` 42,
`/tiktok/studio` 49, `/onboarding` 51, `/dashboard` 54, `/accounts` 55,
`/compose` 66. Measured on /accounts: its HTML was a spinner (see the Nov 20
rules), nine `auth/v1/user` requests ran back to back, and the layout shifted
0.37 to 0.40 when the list arrived. #820: one shared sign-in check per page
load (`lib/shared-user.ts`, tested); the sidebar builds only the copy on screen
(phone drawer or desktop rail), after mount, which also lets pages render on
the server; the workspace provider's four reads run at once; /accounts renders
on the server (the build's `accounts.html` now holds the page) with the connect
cards first and nothing waiting on the list, no stat cards on phones (the line
under the title says the same), the title clear of the menu button, one read of
the accounts per visit instead of two, and the Pinterest and Reddit "coming
soon" copy corrected (both declined). /onboarding already rendered on the
server and loads its connect forms lazily; it gains from the shared fixes.
**Checked live after #820 deployed (12:56 UTC), signed in as the admin on a
desktop, with Speed Insights' beacons blocked in that tab:** one
`auth/v1/user` request instead of nine, every query starting together, the
account list in at 0.9 s on a reload (HTML 41 ms from Vercel's cache), layout
shift 0.065 on a cold load and 0.03 on a reload, no console errors, and the
list below the connect cards. Not checked on a phone in production, since
phone emulation lands in the mobile numbers (see the Nov 19-20 rules).

**Nov 20: the other app pages (#821, checked live) and PR #822.** #821:
/dashboard, /settings, /compose, /queue and /drafts send the page's title and a
skeleton (`components/AppPageSkeleton.tsx`) instead of a bare spinner, as do
their own loading states and, since #822, the `loading.tsx` of those pages and
/accounts (shown when moving between pages); a rule in
`app/globals.css` gives every `md:ml-56 p-4` main column (and `phone-menu-room`,
which compose uses) room for the phone menu button, which covered the start of
the title on about 37 pages. Checked live after it deployed (13:29 UTC): all
five render, each server HTML carries its title, no console errors. #822:
- **/tiktok/studio** (49 on phones, 37 visits in 7 days, the busiest app page
  there) showed a full-screen "Checking TikTok connection…" spinner until
  TikTok answered creator_info, about 1.5 s into a desktop load. The server
  page now also reads whether a TikTok row exists in `connected_accounts`
  (`initialConnected`), so the first HTML is the studio or the connect screen;
  only the account name in the header waits for TikTok, and the post form says
  "Checking your TikTok account…" until it has answered. TikTok's answer still
  wins if it disagrees.
- **/settings** renders per request (`app/settings/layout.tsx`), so it arrives
  as the real page with the `?tab=` tab open; its sign-in gate is gone (it
  already filled the fields in as data arrived), and credit counts format as
  en-US so the server and a German browser agree.
- **/compose** asks for the workspace's accounts, the saved default platforms
  and a reopened draft at once instead of one after another. Its editor is
  still drawn after that data arrives, on purpose: typing into it earlier
  would race a draft or default platforms loading over the person's input.
- **Our own visits leave Vercel's numbers.** `/api/workspaces/accessible` says
  `internal: true` for our accounts (`isInternalEmail`, reviewer logins
  included), the workspace provider marks the browser
  (`lib/internal-device.ts`), and `components/VercelInsights.tsx` drops its
  Speed Insights and Web Analytics events. Each of our browsers is excluded
  from its first signed-in app page on; checked locally (Analytics logs "Page
  view would be ignored by `beforeSend`").
- `/studio-stax` stays at `revalidate = 60`: it only rebuilds when visited,
  and approvals, featuring, renewals and SM-Give donations all change it, so an
  hour would need a refresh in each of those. Since #824 the Stripe webhook
  refreshes it the moment a paid listing goes live.

**Checked live after #822 deployed (14:05 UTC):** /settings?tab=Plan arrives
with the Plan tab in its HTML; /tiktok/studio arrives with "Choose a video to
start" and no spinner, and the header fills in when TikTok answers (0.6 s; one
first answer was slower); compose's accounts and default-platform reads start
together (0.92 s); no console errors; `/api/workspaces/accessible` says
`internal: true` for the admin and the browser is marked. **Compared Nov 27**
(Speed Insights, Mobile, Nov 21 to 26, our visits excluded): see "Nov 27: the
setup check" at the top of this list.

**Nov 20: where connected people stop, and PR #823.** Read-only, 30 days,
outside accounts: 99 have a connection, 65 of them TikTok only. TikTok-only: 23
opened Studio, 12 added a video, 5 pressed Post, 3 got one out, 4 hit a failure
(phone uploads cut off, an upload 500, a staging error; all before #813, and no
outside attempt since). Text platforms: 13 connected, 8 opened Compose, 3
tried, 3 to 4 published. Compose's "TikTok takes video" card works: of 20
Compose exits by TikTok-only people with nothing to pick, 14 opened Studio
within 10 minutes. The biggest drop is Studio's first step: 11 of 23 never
added a video, and nothing said why. #823:
- **Studio:** `tiktok_picker_opened` and `tiktok_picker_cancelled`
  (`lib/analytics.ts`), and `pick_ms` on `tiktok_video_added` and
  `_rejected` (opening the picker to getting a file, which includes an iPhone
  preparing a big video). A video the browser cannot decode used to do nothing
  at all (only success was handled); it now says so and records
  `tiktok_video_rejected` with reason `unreadable`. The header clears the phone
  menu button.
- **Compose on a phone:** the box to write in started 1.68 screens down, under
  the automated-posting note, a platform list with five unusable "Soon" chips
  and fifteen template buttons. The note is one line on phones (the rest behind
  "More"), the templates fold behind "Start from one", and the Pinterest,
  Reddit (both declined), Snapchat, Lemon8 and BeReal "Soon" chips are gone;
  Instagram, Facebook, Threads and YouTube stay "Soon" (built, in review).
- **The unread badge** is shared between a person's tabs
  (`lib/unread-cache.ts`, tested): the tab that asks stores the answer in
  localStorage, the others use it while fresh and hear it at once, so about one
  request a minute per person, not per open tab (two Reddit commenters'
  suggestion).

**Checked live after #823 deployed (17:46 UTC), signed in at 375 px:** Compose's
box to write in starts at 0.97 screens (was 1.68), with the note on one line,
the templates folded and no "Soon" chips; the Studio header clears the menu
button. From Nov 21, `/admin/funnel` shows how many open the picker, cancel it,
or hit `unreadable`. Read Nov 27 (see "Nov 27" at the top of this list).

**Nov 20: PR #824 (Stripe webhook okayed by Joshua by name, and onboarding for
TikTok-only people).**
- The webhook's two email sends (the Studio Stax "you're live" email to a
  paying customer, and the white-label request notice to the admin) now go
  through `logIfRejected`: Resend reports a refused send without throwing, so
  their catch blocks never saw one. `scripts/test-bulk-email.mjs` no longer
  exempts the webhook.
- When a paid listing goes live, the webhook logs a failed write to
  `curated_listings` and refreshes `/studio-stax` (`revalidatePath`, in a
  try/catch so it can never fail the webhook). No payment logic changed.
- Onboarding: someone who connected only TikTok was given a text starter at
  step 4 that could only become a draft, then sent to Compose to open it,
  where nothing they had connected could take it. Step 4 now says their first
  TikTok is a video, and step 5's main button is "Make Your First TikTok →"
  to `/tiktok/studio?from=onboarding` (`tiktok_studio_opened` with `via:
  onboarding`).

**After #824 deploys:** nothing to click; the next Studio Stax sale or white
label request shows a `[mail] stripe webhook: ...` line in Vercel's logs only
if Resend refuses the email.

**Nov 20: content to Jan 1, the shop sells merch only, and the guide PDFs are
free (#825, merged and checked live Nov 20).**
- Content: 60 posts from Nov 21 to Jan 1 are scheduled in socialmatehq (42
  X+Bluesky, 12 LinkedIn, 6 Discord+Telegram) and 22 shop posts in the
  Gilgamesh account (X+Bluesky+Mastodon, Nov 23 to Jan 1: 10 for Black
  Friday, then 12 merch posts Mon/Wed/Fri from Dec 7), all imported through
  Bulk on Nov 20 with Joshua's yes. The same night, at his
  ask, every post was made platform-native: no links in any post ("Link in
  bio." instead), 1 to 2 CamelCase hashtags on X and Bluesky, 2 on the shop
  posts, CamelCase on LinkedIn, none on Discord or Telegram, and BDAY31
  worded as "31% off your first payment" (the Stripe coupon is "Once").
  Rules in memory (`feedback_native_posts`). The CSVs in Joshua's
  `Videos\SocialMate content` folder match what is scheduled; the 18-video
  TikTok plan is still his to post in Studio.
- **Bluesky hashtags (#828, deployed 02:26 UTC Nov 21):** SocialMate sent
  Bluesky link facets only, so every #hashtag posted to Bluesky was plain
  text, not a tag. `postFacets()` in `lib/bluesky-facets.ts` adds tag facets
  by Bluesky's own rule, used by the publisher and inbox replies; tested in
  `scripts/test-bluesky-facets.mjs`. **Checked Nov 27:** all 6 scheduled
  Bluesky posts with hashtags since the deploy (Nov 21 to 24) carry `#tag`
  facets matching their text (`app.bsky.feed.getPosts` on each URI).
- **Bios:** every account behind a "Link in bio." post shows its link (the
  shop's Bluesky has profile link buttons, its X a website field, its Mastodon
  a Shop field). The shop's Bluesky bio was rewritten merch-only on Nov 20 with
  Joshua's OK. Still old: the shop's X and Mastodon bios ("Business, marketing
  and AI guides") and SocialMate's X and Bluesky bios, which list four
  platforms ("More platforms coming").
- **Deleted Nov 20 (Joshua's yes):** the 6 shop campaign posts from Nov 4 to
  Nov 20 that sold PDFs, on X, Bluesky and Mastodon (18 copies); each answers
  404 now.
- Shopify (Joshua's go-ahead, Nov 20): the 8 PDF products are drafts, so the
  store sells merch only; streamer and creator gear comes later. Black Friday
  weekend is an automatic 20% off all merch, Nov 26 12:00 AM to Nov 30 11:59 PM
  Eastern, and the announcement bar says so. Menu, homepage, search title,
  FAQ, About and the entrepreneur gift-guide post no longer sell PDFs. The
  store's own log is Joshua's `Downloads\Gilgamesh Shop\SHOP-LOG.md`.
- **After Nov 30:** put the shop's announcement bar back (Online Store >
  Themes > Customize > Announcement bar). The discount ends by itself.
- #825: the 7 PDFs download free from `public/downloads`
  (`lib/guide-pdfs.ts`, checked by `scripts/test-guide-pdfs.mjs`, which fails
  when a size label stops matching its file). Each guide ends with its PDF
  (`components/GuidePdfCard.tsx`), `/guides#downloads` lists all seven, and
  `guide_pdf_downloaded` records each download (GA4 only for signed-out
  readers). `lib/shop/merch-shop.ts` keeps only the merch shop link; the SM-Give
  lines say merch profit only. Checked live after it deployed: all seven files
  answer 200 `application/pdf` (the Complete Edition downloads in full, 3,089,539
  bytes), `/guides` has the downloads section, and the first-30-days guide
  carries the free card with no shop listing links (the test covers the rest).
- The PDFs still say "licensed for the buyer's personal use" and end with a
  pointer to the shop; harmless, but say so if Joshua asks for a re-render.
- Joshua ended the "Gilgamesh Shop" campaign himself. Checked in production:
  status `ended`, its 20 sent posts kept, no queued posts left on that account,
  and no scheduled or draft post anywhere links a drafted PDF listing. The empty
  "Guides and Digital Downloads" collection is unpublished from all four
  channels (its page answers 404); the storefront lists 24 products, all merch.
- gilgameshenterprise.com still sold the PDFs (its /guides card, its homepage
  shop card and its llms.txt): renewalmateupdates/gilgameshenterprise#25
  points them at the free downloads. renewalmate.com had nothing to change.
- **Fixed Nov 20, okayed by Joshua by name ("Yes, fix it"):** a queued post
  deleted while it waited (a campaign ended, a Queue delete) used to fall
  through `.single()` to a 404 publish call and three retries. Both reads in
  `publishScheduledPost` now use `.maybeSingle()`: no row ends the run as
  skipped (`post_deleted`); a failed first read throws so the step retries; a
  failed second read carries on to the publish route as before, so a hiccup
  can't drop a live post. `scripts/test-publish-guard.mjs` covers it and fails
  on the old code. **After it deploys:** resync Inngest (Apps > Resync), then
  look at the next run for one of the ended campaign's deleted posts (they
  were due daily at 15:00 UTC through about Nov 27): it should end as
  skipped, not failed.

**Nov 19-20: Vercel paused the site; the team is on Pro now.** On Nov 19 the
Hobby team went over its 4 CPU-hours and every route answered `402
DEPLOYMENT_DISABLED` until Joshua upgraded, about 01:45 UTC Nov 20. The three
posts due during the outage went out once it was back: the admin's 23:00 post
and an outside user's 01:00 LinkedIn post through the backstop workflow (run by
hand, 01:49 UTC, every platform), and the admin's 23:00 TikTok video on the
02:01 hourly run, settled published at 02:06. #817 (merged, deployed 02:15
UTC Nov 20) cuts what Vercel's Observability showed: the unread count is one shared
request a minute per tab and none from a hidden tab
(`hooks/useUnreadNotifications.ts`), the bell fetches its list only when
opened, the sidebar's other fetches are shared (`lib/shared-fetch.ts`), the
proxy matches pages only, and the homepage is cached again (`ReferralBanner`
reads `?ref=` in the browser). The same PR fixes the notifications page, which
read and wrote a `read` column while the bell, the badges and
`/api/notifications` use `is_read` (257 read from the bell still showed unread
there; 5 read there, all the admin's, still counted in the badge), and showed
`body`, which the table does not have, instead of `message`. The `read`
column is now unused. **Checked live after deploy:** `/` answers from the
cache (`x-vercel-cache: PRERENDER`, then `HIT`) and `?ref=` still sets
`sm_ref`; logged-out `/compose` still redirects to sign-in; API calls no longer
pass through the proxy; `/notifications` says "12 unread", the same as the
count route, with each notification's text showing; a page load fetches the
count, X quota, SOMA credits and approvals once each. Checked Nov 20: opening
one notification from the bell took the count route and `/notifications` from
12 unread to 11 (the bell shows "9+" above 9). **Checked Nov 27 (Observability,
last 12 hours):** `/api/notifications/count` 723 calls and `/api/notifications`
714, about one a minute each (one open tab), 15 s of CPU each, 0% errors. Spend
Management is set: a $200 budget with alerts at 50, 75 and 100%, and pausing
off. "Mark all read" is left to Joshua: the admin has 13 unread now, not the 5
old rows.

**Nov 19, evening: AI was down; #816 moved to 3.8 Flash (deployed Nov 20 with
#817, since Vercel refused its own deploy while the team was paused).**
A walk of Schedule, Compose and Bulk on the admin account found every Write
with AI request hanging for 300 seconds or failing; the last AI result saved
was Nov 17, 02:12 UTC. #815 (deployed 14:45 UTC) put a 40 s limit and a refund
on the seven `/api/ai` routes, one model name in `lib/gemini.ts`, and a real
Gemini request in `/api/admin/health`. That check showed the key is fine (it
lists 27 Flash models) but `gemini-3.6-flash` never answers within 20 s.
Google Cloud retired 3.6 Flash on Nov 19 and names 3.8 Flash, the stable Flash
model on the Gemini API since Sept 2. The branch sets `GEMINI_MODEL` to
`gemini-3.8-flash` (no call site sets a parameter 3.8 rejects), and the health
check now asks every stable Flash model the key lists whenever the main one
fails (`?try=a,b` names others). Once deployed, 3.8 Flash turned out to be
overloaded too; the chain above replaces picking one model. Also from #815, checked live:
a reopened draft keeps its poll (the walk's test draft is deleted), and the
Queue's Scheduled card stays 375 px wide on a phone (it was 801 px). Not
checked: the red Failed section (the admin has no failure in 30 days) and
Bulk's Save (it schedules real posts).

**Nov 19:** #812 deployed at 02:30 UTC and Inngest was resynced (its API lists
`settle-tiktok-publishes`). The 3 stuck TikTok rows were settled through the
follow-up at 02:50 UTC: 2 published and mirrored into posts with their TikTok
links, 1 in drafts, each with a notification. The first scheduled video after
the deploy went out at 17:00 UTC and the follow-up settled it at 17:03:
published, mirrored into posts, with a "Your TikTok video is live"
notification. The 23:00 UTC one was held by the outage and went out on the
02:01 UTC hourly run, settled published at 02:06. #813 (merged, deployed 13:25 UTC) attacks where
people stop: of 99 outside accounts that connected a platform, 7 ever
published and 82 never tried; 62 connected TikTok only. In TikTok Studio, 16
added a video and 10 never pressed Post. On a phone the tab names were hidden,
the editor opened on Filters, and the post form sat in a small scroll box with
a greyed-out button that explained itself only in a tooltip. Now the tabs are
named, a "Next: caption and post" bar is pinned to the bottom on phones, the
form gets the full page, and a press with something missing says what and
jumps to it (`postBlocker` in `lib/tiktok-studio.ts`; `tiktok_post_blocked`
says which choice stops people on `/admin/funnel`). Drafts no longer need an
audience or disclosure, which TikTok's inbox upload ignores. Uploads: 10 MB
pieces from 20 MB (was 64 MB), a dropped or 5xx piece is sent again, with a
percentage and the screen kept awake (`lib/tiktok-upload.ts`, tested), and a
scheduled video's save says what storage objected to. Checked live at phone
size (375 px, touch) on the admin account: the empty Studio says "Choose a
video", the Next bar opens the full form, and Post with no audience jumps to
"Who can see this" and records `tiktok_post_blocked` (reason `privacy`). The
same check found the feedback button covering the Next bar's right end; it now
sits above the bar on `/tiktok/studio` below `lg` (`components/FeedbackWidget.tsx`).

**Nov 17-18:** #805 to #809 built Instagram, Facebook Pages, Threads and YouTube
posting, gated to the admin and the reviewer logins until Meta App Review and
Google's verification pass (`META_SETUP.md`). Joshua connected all four on the
admin account. The update email is finished. The Nov 17 scheduled run hit the
usage limit, and before the last batch went out its audience turned out to
ignore the newsletter opt-out and to include the Meta reviewer login (#810
fixed both). The last 61 went out Nov 18 at 8:50 PM ET with 0 failures,
checked against production: 245 people have it, and the 9 newsletter opt-outs
and 2 unsubscribes were held back. Replies go to socialmatehq@gmail.com. The
streamer tester signed up Nov 17 (Pro comped); Twitch alerts and tips are not
set up yet. Found Nov 18: TikTok Studio rows stayed `publishing` forever when
the creator left before the Studio's two-minute poll settled them (3 rows, one
creator). Fixed in #812: every path that hands TikTok a video (`confirm-upload`,
the scheduled publisher, `/api/tiktok/post`) sends `tiktok/uploaded`, and
`settleTiktokPublishes` (`lib/inngest.ts`) asks TikTok 3, 13 and 43 minutes and
about 2.7 hours later, records the answer, mirrors a published video into
posts, notifies the creator, and sweeps daily at 08:15 UTC, giving up a week
after the send. Scheduled videos used to be marked published the moment TikTok
accepted them; now they read "Sending" for a few minutes until TikTok confirms.
The check and the write are one module (`lib/tiktok-publish-status.ts`,
tested) shared with the Studio's route. Deployed and resynced Nov 19 (above).
#793 (batches 1 and 2) rebuilt Queue and Calendar (range picker, collapsible
days, red Failed section, TikTok posts in the day lists, week view, Calendar
opens on today), delivered webhooks with `after()` and from Post Now too, added
`feature_opened` tracking read on `/admin/usage`, put Terms and Privacy at 18+
(Privacy now discloses Google Analytics, which the site loads), and made the
sidebar short: Schedule (Calendar and List tabs), More tools, Customize, a
one-time guide. Branch `feat/compose-modes-bulk-csv-nov13` is batch 3: Compose
Simple and Full modes (`sm_compose_mode`; a draft already using a Full-only
tool opens in Full), one "Write with AI" menu, One post / Bulk tabs
(`components/ComposeTabs.tsx`), CSV import and a CSV template on Bulk
(`lib/bulk-csv.ts`, tested), plain subtitles beside SOMA, HERMES, HESTIA,
ZENITH, SM-Pulse and SM-Radar, SIGIL shown as "Link in bio", and the new
sidebar strings in all nine locale files. HereNow's own list is in its
CLAUDE.md. Branch `claude/photo-tools-becee7` adds two free image tools,
`/tools/quote-card` and `/tools/image-resizer` (canvas only, nothing uploaded;
size math in `lib/tools/image-sizes.ts`, tested), listed in the tools catalog
and under More tools, with "Use in a post" handing the image to Compose
through IndexedDB (`lib/tool-image.ts`, `/start?from=tool-image`).

**Nov 16:** #794 to #798 are merged (#798 is the homepage demo, also on YouTube
at youtu.be/aNYEvhoSPIY). #799 (merged) added the November
update email to every confirmed outside account (what changed, what's next, and
one question: what stops you using SocialMate every week). It sends nothing on
its own: `/api/admin/update-email` GET previews, `POST ?to=` sends a test copy,
`POST { unsubscribe: [...] }` records "unsubscribe" replies as
`email_unsubscribed` events (every send skips them), and
`POST { confirm }` sends the next batch of 50. Copy and audience are in
`lib/emails/product-update-nov2026.ts`, tested. Found while building it: Resend
reports a rejected send in its return value without throwing, so the TikTok
email routes count a failed send as sent; the new route checks the error.
It went to 184 of 246 on Nov 16 before Resend's daily quota stopped it (a
spent quota blocks all app mail until it resets); the rest went out Nov 18.
Since then every one-shot admin email (update, reactivation, both TikTok
emails, unblocked) sends through `lib/bulk-email.ts`: a rejected send throws
and is never recorded, one POST sends at most 50, all of them together stop at
`BULK_EMAIL_DAILY_CAP` (default 100) per rolling 24 hours, and a batch stops at
the first quota error. `scripts/test-bulk-email.mjs` fails if a bulk route
calls `sendMail` directly (#802). Then `sendMailOrThrow` in `lib/mail.ts`
(bulk-email builds on it) went into the three `sendMail` calls that sat in a
try/catch expecting a throw (SOMA generate, SOMA autopilot, token-expiry), and
the Quick guide, Customize dialog and the Schedule and Compose tab bars got
their strings in all nine locales (#803). Then the 52 direct
`resend.emails.send` calls that ignored Resend's error were wrapped in
`logIfRejected(label, ...)` (`lib/mail.ts`), which logs a rejection and
returns the result unchanged, so no route behaves differently. A test fails if
a new direct call skips it. The Stripe webhook's two sends followed on Nov
20 (#824), once Joshua okayed it by name; on Nov 19 a session's safety check
had refused the edit under a general "do all of it". The first reply came from someone who signed
up expecting "Substack for paid subscribers", which led to `/vs/substack`: it
pitched Creator Hub fan subs (unannounced since Nov 5) and said RSS import
posts each issue automatically (it imports drafts by hand). Fixed in #800
(merged), with the page's Repurpose price (now `REPURPOSE_COST`) and its
scheduled-Bluesky-threads claim (threads post at once). Then
`public/og-image.png`, the share card for the whole site and every blog post,
turned out to still say "Pro $5/mo, Agency $20/mo", "Launching on Product
Hunt" and four platforms. It is now drawn by `scripts/make-og-image.mjs` from
`lib/plan.ts` and `lib/site-facts.ts`, and `scripts/test-og-image-facts.mjs`
fails when a price, the free cap or the platform list moves without a redraw.

**Nov 16, earlier:** #794 to #797 are merged. #797 fixed four bugs found while capturing
the demo, all checked live afterwards: Write with AI buttons looked disabled in
dark mode, the Compose preview ignored thread mode, Bulk said "1 failed" for a
bad CSV row nothing had sent, and X handles showed "@@". Branch
`feat/homepage-demo-nov16` puts the demo on the homepage: a 4:13 walkthrough
built from real screens of the live app (`public/demo/socialmate-demo.mp4`,
self-hosted, `preload="none"` so it costs nothing until played), with clickable
chapters (`components/landing/DemoVideo.tsx`, times in `DEMO_CHAPTERS` in
`components/pages/Landing.tsx`). The full-quality video, 9 vertical clips for
TikTok and Shorts, the YouTube chapter list and the render scripts live in
Joshua's `Videos\SocialMate demo` folder, outside the repo. Polls are left out
of the video on purpose: they save but don't publish yet.

*Claude, after the batch 3 branch deploys:*
- Compose signed in: opening a draft with a poll or tags shows Full. Already
  seen live Nov 16: the Simple and Full toggle, the Write with AI menu, thread
  mode in Full. Seen Nov 20: all six Write with AI tools (caption, hook,
  rewrite, thread, repurpose, hashtags) return real output through the Gemini
  chain.
- Bulk: a sheet saved from Google Sheets (M/D/YYYY dates, 12-hour times), and a
  bad row saves once fixed. Seen Nov 16: CSV import, a bad date arrives red
  with the reason.
- Batch 4: the homepage demo ships in `feat/homepage-demo-nov16`. Still to do:
  per-platform how-to videos (each needs that platform's connect flow on
  screen). If the demo is re-rendered, update `DEMO_CHAPTERS` from its
  chapters.txt.
- Image tools: on an iPhone, download saves the file. Seen Nov 20, signed in:
  "Use in a post" on the quote card and on the resizer (a 1600x900 X size)
  each land on `/compose?from=tool-image` with the image attached and the
  "Your image from the free ... is attached" banner. IndexNow took the two
  tool pages and `/tools` the same night.

*Claude, after #793 deployed (Joshua walks these signed in):*
- Walk Schedule signed in: List keeps its range after a reload; a failed post
  shows red with Retry; each summary card opens its details. Seen Nov 16:
  Calendar on today, Week view, TikTok Studio posts in the day lists, List.
- Walk the sidebar on desktop and phone: the guide shows once, More tools opens,
  + adds a tool, Customize opens on screen inside the mobile drawer.
- Webhooks: one Post Now and one scheduled post each reach a test endpoint with
  `X-SocialMate-Signature`.
- `/admin/usage` "App areas" fills in from the first day after deploy.

*Claude, after a deploy or when asked:*
- Test the free-tool path once (#771): in a private window write a post in
  `/tools/character-counter`, press "Schedule this post", sign up with a fresh
  email, check onboarding step 4 shows that text; then, signed in, press it again
  and check Compose opens with it.
- Test team posting with an owner on Free plus an Editor (#767–#769): the owner
  opens the Editor's draft from Drafts, edits, saves, schedules it, and the
  original leaves Drafts.
- Try the Bluesky domain helper with a real handle (its two lookups could not be
  reached from the sandbox), check `https://socialmate.studio/robots.txt` has no
  bare `/affiliate` prefix, and run `node scripts/indexnow-submit.mjs` (covers the
  14 new `/for` pages, the four tools and the 8 Nov 3 posts). Optional: submit
  `/blog/feed.xml` in Search Console as an extra sitemap.
- When Ellen (the Nov 1 team-posting feedback in `/admin/feedback`) sends her
  testimonial, add it to `TESTIMONIALS` in `app/wall-of-love/page.tsx` (name,
  company, title, link to her site) and remove the page's noindex. Her email is
  the permission.
- Only when Joshua says go: the next RenewalMate cancel guides (Nintendo Switch
  Online, Discord Nitro, Google One, Canva Pro, Dropbox, Peloton, Tidal; skip the
  New York Times, it blocks AI tools); a shop marketing account in SocialMate;
  campaign mode phase 2; the nightly random-sample delivery check (needs a table).
- Watch whether the `/for` pages keep landing ChatGPT signups (`/admin/funnel`,
  "Where signups came from").

*Joshua's decisions:* in `TODO.md` (one list, kept current there).
- Standing rule: the fan-platform pages are safe-for-work promotion only. Stripe
  restricts adult-content businesses, so never market SocialMate as one.

*Joshua's side:*
- Numbers: local sessions can read production with the keys in `.env.local`
  (read-only queries; since Nov 25 also additive schema SQL once both audits
  pass, and blog post inserts; any other production write needs Joshua's yes). Screenshots
  of `/admin/funnel`, `/admin/overview` and `/admin/feedback` also work.
- Inbox (socialmatehq@gmail.com): replies to the TikTok-live email (Oct 23), the
  Sept 25 emails to the 38, the Oct 15 confirmation resends, and the November
  update email. Replies to the Aug 30 reactivation send went only to Resend's
  Receiving tab and expired there (Resend keeps mail 30 days); every email since
  sets a reply-to. Resend is under `renewalmate.updates@gmail.com`: signing in
  with socialmatehq@gmail.com opens a different, empty team.
- Run the SOMA removal SQL from Oct 23 if it hasn't run.
- Creator Hub tips and Twitch go-live alerts stay unannounced until a streamer
  uses them for real (Joshua's plan, Nov 5: onboard one streamer to try both).
- Run `supabase/blog_accuracy_nov5.sql` (blog accuracy pass, in `TODO.md`).
  It updates existing rows, which sessions don't do without his yes.
- Search Console for renewalmate.com (DNS TXT at GoDaddy, then `sitemap.xml`),
  Indiana sales tax for the shop, Google Merchant approvals in the Shopify Google &
  YouTube app, the Wyoming LLC annual report.
- The Shopify promo images: attach them in chat.

**Activation, latest (Oct 29).** 231 external accounts, 3 external publishers
(Discord, Bluesky, LinkedIn), 1,657 published posts, no paying subscribers. None of
the 48 TikTok users emailed Oct 23 had posted to TikTok. ChatGPT sent 12 of the 21
signups since Oct 15. Earlier measurements (Aug 30, Oct 14, Oct 23) are in the
dated entries; always exclude `lib/internal-accounts.ts`.

**First paying customer.** A Pro Annual subscriber (identity in local memory and
the Aug 28–30 entry of the history log), Aug 29,
cancelled 68 minutes in after the plan bug (#579). Apology and 2,000 credits sent;
their complaints are all fixed (Sept 11). Do not re-litigate the refund.

- **Creator Hub payments: fee pass-through, $3 floor, Connect capability fix (Sept 24, merged in #683).** Decision (Joshua): SocialMate does not absorb Stripe's fee. Tip, unlock and subscription checkouts now carry an application fee equal to Stripe's fee (`application_fee_amount` for one-time payments, `transfer_data.amount_percent` for subscriptions, which cannot use `application_fee_percent`), so SocialMate keeps nothing and creators net what any Stripe merchant would. The landing page already says "Just Stripe (~2.9% + 30c)". `lib/creator-pricing.ts` holds the math; verified against real test-mode charges to the cent at $3/$5/$10/$25 for US cards. **Found while testing:** Connect accounts were created with no capabilities requested, so Stripe rejects every destination-charge checkout with "missing the required capabilities: transfers" and `charges_enabled` could never become true; Creator Hub could not have taken a payment. Accounts now request `transfers` only (5 onboarding requirements vs 13 with `card_payments`) and onboarding-complete means `transfers` is active. Payouts are set to weekly because Connect bills 0.25% + 25c per payout. One shared $3 minimum for tips, unlocks and subscriptions (server-enforced; tip presets now $3/$5/$10/$25). **Still true:** international cards cost 1.5% more and currency conversion 1%, absorbed by SocialMate (about 7c on a $5 tip); Stripe Billing adds 0.7% on subscriptions (included in the subscription fee); Connect charges $2 per active creator per month, covered by the creator's Pro plan. Zero creators exist, so nothing needs grandfathering. **Not verifiable in test mode** (Custom accounts need a Connect platform-profile setting): a full transfer with a real active account. Run one real live-mode tip end to end before announcing Creator Hub. #679's `on_behalf_of` attempt was wrong and reverted in #681.

**Dormant or later (no action now):**
- **Google Play closed testing.** v1.0.7 uploaded, 1 tester opted in, passive CTA
  on the signup page. Needs 12 testers for 14 days before production.
- **LinkedIn Company Pages.** Needs `r_organization_social` +
  `w_organization_social`. Personal profiles cover most users.
- **Instagram / Facebook / Threads.** Built and gated (Nov 17, #805 to #807); next
  is the Meta App Review submission (`META_SETUP.md`). Plan 4 to 8 weeks for review.
- **Apple App Store (SocialMate).** Deferred.
- **Cofounder search.** Marketing cofounder, ~10% sweat equity over a 24-month
  vest, 2-week trial, real contract.
- **Black Friday BLACKFRIDAY.** 50% off the first 12 months, through Dec 4,
  2026 (`promo_1Ug43u7OMwDowUuUMJGVIkwh`; see Pick up here).
- **Birthday promo BDAY31.** Active through Dec 15, 2026
  (`promo_1TX2Ay7OMwDowUuUiLXH4Fe3`).
- **Discord community** at discord.gg/2se6FGrbRU, as a tester and feedback pool.
- **SocialMatePR** (a video content brand Joshua is helping launch): mentor prompt delivered May 16.

Everything finished before November 2026 ("Confirmed Done, stop asking about
these") is in `docs/history/claude-log-2026.md`. Check it before rebuilding
anything that sounds familiar.

---

## SOMA content and the weekly content system

Moved to `docs/soma-content.md`.

---

## Coding Rules

- **Always consider infrastructure cost** — if it hits an external API, it needs quota gating
- **Use prebuilt/existing patterns** — don't reinvent. Reuse existing auth, RLS, Inngest, Stripe patterns already in the codebase
- **Token efficiency matters** — run focused, targeted tasks. Use plan mode (Shift+Tab) for complex multi-file work before writing code
- **Mobile first** — always check iPhone notch, touch targets (44×44px min), safe area insets
- **No hardcoded wrong numbers** — check the Stripe price IDs in the "Stripe Live Price IDs" table below before touching payment code
- **Don't break what works** — UI/UX must flow cleanly. If unsure, ask before touching working flows
- **Commit frequently** with descriptive messages
- **One branch + one PR per fix** — never accumulate changes from multiple fixes onto one branch
- **Always open a PR after pushing** — push + PR is one step, always provide the direct PR link
- **Never discard a Supabase error.** `const { data } = await ...` is how nine
  shipped features silently did nothing for months. Destructure `error` and log it
- **Run `python scripts/audit-schema-drift.py`** before shipping anything that
  touches the database. It compares every column the code names against the live
  schema
- **Update CLAUDE.md** every time a significant feature ships

---

## Stripe Live Price IDs (DO NOT GUESS THESE)

**Current (created Aug 12, 2026 — use these):**

| Product | Price ID | Amount |
|---|---|---|
| Pro Monthly | price_1U3jSI7OMwDowUuUm0oMEpiT | $8.00/mo |
| Agency Monthly | price_1U3jSJ7OMwDowUuUjK3igDLr | $29.00/mo |
| Pro Annual | price_1U3jSJ7OMwDowUuUO3utSP0R | $80.00/yr |
| Agency Annual | price_1U3jSJ7OMwDowUuUTMLaC9Fu | $290.00/yr |

**Legacy (retired from checkout, still mapped in the webhook — do not delete):**

| Product | Price ID | Amount |
|---|---|---|
| Pro Monthly (old) | price_1T9S2v7OMwDowUuULHznqUD5 | $5.00/mo |
| Agency Monthly (old) | price_1TFMHp7OMwDowUuUgeLAeJNY | $20.00/mo |
| Pro Annual (old) | price_1TFMHx7OMwDowUuUl9PqWxMs | $55.00/yr |
| Agency Annual (old) | price_1TFMI07OMwDowUuUoHfKJEpo | $209.00/yr |

The legacy IDs stay in `PRICE_TO_PLAN` in the Stripe webhook forever. That table
turns a Stripe event back into a plan; dropping a row would silently drop a
paying customer to free. They are removed from the checkout side only
(pricing / onboarding / settings / sidebar).

**Unchanged by the repricing:** White Label ($20 / $40), all credit packs, all
donation tiers, X Boosters, SOMA Autopilot ($10) and Full Send ($20), HERMES
($12 / $25), Studio Stax, and every Enki tier. When correcting pricing copy,
these are the decoys that make a blind find-and-replace dangerous.
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
| HERMES Starter | price_1UEHaA7OMwDowUuUJ2OA4jic | $12.00/mo |
| HERMES Pro | price_1UEHcB7OMwDowUuUFwqE1Hk6 | $25.00/mo |

---

## What NOT to Touch Without Asking

- Stripe webhook handler — live payments depend on it. The intentional additions are the coupon affiliate commission block (April 2026) and, okayed by Joshua on Nov 20, 2026, `logIfRejected` on its two emails and the `/studio-stax` refresh when a listing goes live (#824). Don't touch the rest without his OK by name
- RLS policies — they're in place for security, don't remove or bypass
- Inngest publish jobs — idempotency guards are critical, don't remove them. The deleted-post skip in `publishScheduledPost` (Nov 20, 2026) was okayed by Joshua by name
- The three-pool credit system logic — complex, tested, working. As of July 26, 2026 (PR #535) deduction is atomic via the `deduct_ai_credits` / `refund_ai_credits` Postgres RPCs (`lib/ai-credits.ts`); keep the pool/preference math in sync with the RPC if you ever change either
- Any env vars — don't suggest hardcoding these

---

## Context: The Human Behind This

Joshua works tree service by day (he left the Walmart deli in June 2026) and builds this nights and weekends. He's solo, bootstrapped, budget-conscious. Every decision needs to consider:

1. Does this cost money at scale?
2. Can we use a free tier, prebuilt solution, or existing pattern instead?
3. Does this break anything that's already working?

He's not building features for features' sake. He's building toward 2,000–4,000 paying Pro users and $10k–$20k MRR in 12 months. Every task should move the needle on stability, growth, or user trust.

**Goal: Power to the people. Build the door.**
