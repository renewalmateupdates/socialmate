# SocialMate — Claude Code Project Context

> Read automatically at the start of every session. Kept short on purpose: the
> dated session log that used to live here (March to November 2026) is in
> `docs/history/claude-log-2026.md`, verbatim. Open decisions are in `TODO.md`.
> How to run, build and test: `README.md`.

## Start here (local sessions)

Work happens in local sessions on Joshua's PC, in `C:\Users\jbost\socialmate`.
Cloud sessions were retired on Nov 5, 2026.

1. `git status` and `git pull` on `main` first. One branch and one PR per fix;
   Joshua merges PRs unless he says otherwise.
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
**Not available yet (Sept 24, 2026):** YouTube (waiting on Google's review), Pinterest (built, application declined), Reddit (application declined; no connect or publish code exists), Instagram / Facebook / Threads (need Meta app review, not started)
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

## Pending / In Progress

> **One "Pick up here", replaced, never stacked.** Until Nov 4 every session added
> its own dated entry on top, and six of them piled up, half stale. Edit this list
> in place: remove what is done, add what is new. What happened goes in the dated
> entries above.

**Pick up here (updated Nov 5, 2026).** #769 through #773 and the cloud session's
consolidation branch are merged; nothing is open in this repo. On Nov 5 the
merged branches were deleted (every one is tagged `backup/<branch>-2026-11-05`
on GitHub) and lint became a gate (0 errors). HereNow's own list is in its
CLAUDE.md.

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
  (read-only queries only; any production write needs Joshua's yes). Screenshots
  of `/admin/funnel`, `/admin/overview` and `/admin/feedback` also work.
- Inbox (socialmatehq@gmail.com): replies to the TikTok-live email (Oct 23), the
  Sept 25 emails to the 38, the Oct 15 confirmation resends. Replies to the Aug 30
  reactivation send land in Resend's **Receiving** tab (Resend is under
  `renewalmate.updates@gmail.com`).
- Run the SOMA removal SQL from Oct 23 if it hasn't run.
- Supabase dashboard: do auth emails go through custom SMTP (Resend) or the
  built-in mailer, which delivers worse and caps low?
- Before announcing: one real live-mode Creator Hub tip, one real Twitch go-live.
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
- **Instagram / Facebook / Threads.** Meta App Review, not started; plan 4–8 weeks.
- **Apple App Store (SocialMate).** Deferred.
- **Cofounder search.** Marketing cofounder, ~10% sweat equity over a 24-month
  vest, 2-week trial, real contract.
- **Birthday promo BDAY31.** Active through Dec 15, 2026
  (`promo_1TX2Ay7OMwDowUuUiLXH4Fe3`).
- **Discord community** at discord.gg/2se6FGrbRU, as a tester and feedback pool.
- **SocialMatePR** (girlfriend's video brand): mentor prompt delivered May 16.

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

- Stripe webhook handler — live payments depend on it. The coupon affiliate commission block (added April 2026) is the only intentional addition; don't touch the rest
- RLS policies — they're in place for security, don't remove or bypass
- Inngest publish jobs — idempotency guards are critical, don't remove them
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
