# Content audit (Nov 12-13, 2026)

How to reproduce: `npm run verify:content` (static), `npm run verify:content -- --db`
(adds every blog post, read-only), `npm run verify:content -- --crawl http://localhost:3000`
(fetches every sitemap URL from a running build). Rules: `scripts/lib/content-rules.mjs`.

## Fixed on this branch

| Where | Was | Now |
|---|---|---|
| JSON-LD on every page (`app/layout.tsx`) | Pro $5, Agency $20; "all 7 platforms" on Free; a Bluesky profile that does not exist (`socialmate.studio`); a site search action pointing at a blog query the blog ignores; links to `/favicon.ico` and `/apple-touch-icon.png`, both 404 | Prices and limits from site-facts; real profiles only; no search action; icons from `app/icon.png` and `app/apple-icon.png` |
| Root title and description | Description left out LinkedIn; keywords included "instagram scheduler" | Generated from site-facts |
| `/llms.txt`, `/ai.txt` | Hashtags 1 credit (5), repurposer 5 (10), "Around 200 registered accounts", "730+ blog posts", go-live alerts and Creator Hub tips described | Generated from site-facts; beta features left out; no counts |
| `/sitemap.xml` | Hand list, every lastmod = today, listed /login, /beta, sign-in screens; missed /hermes and the six free tools | Generated route list with git dates; blog posts with their own dates |
| `/pricing` | AI Content Calendar "25 credits" (it charges 5); "AI Image Generation, coming soon" (no code exists); "3 more coming soon" platforms | 5 credits; line removed; "X needs Pro" |
| Compose | Hashtags button "1 cr" (charges 5), second Repurpose "5 cr" (charges 10); descriptions only on hover, so phones could not tell Hook from Caption | Real costs from `lib/ai-tool-costs.ts`; a visible one-line hint on each tool |
| Compose GIF panel | Told customers to "add TENOR_API_KEY to Vercel env vars" | Plain message that GIF search is unavailable |
| Upgrade email (`lib/inngest.ts`, credits low) | "unlimited scheduling ... Just $5/month" | 1,000 posts, 5 seats, a month ahead, $8/month |
| `/faq`, `/support`, `/privacy` | Instagram, Facebook, Threads, Pinterest, Reddit "coming soon"; privacy listed LinkedIn as coming | What is true: Meta review not started, Google review pending, Pinterest and Reddit declined; LinkedIn live |
| `/for/small-business` | "Pro and Agency have no limit" on scheduling ahead | Pro a month, Agency 3 months |
| `/vs/vista-social` | "free tier with no posting caps" | 250 posts a month |
| `/vs/postplanner`, `/vs/nuelink` | "No limit", "No hard cap" | 250 posts/month; 1 per platform |
| `/vs/combin` | "SocialMate covers the Instagram scheduling part" | SocialMate does not post to Instagram |
| `/vs/zoho-social` | "Pro from $12/month", "SocialMate supports 16" | $8; 7 |
| `/vs/eclincher`, `/vs/napoleon-cat` | Inbox "coming soon" (it exists); moderation "coming soon" (not planned) | Inbox platforms listed; moderation ❌ |
| AI tools guide | Repurposing "1 credit per format" | 10 credits a use |
| Enterprise copy, 9 locales | "Unlimited client workspaces" | Client workspaces set by contract |
| Clips copy (en) | "schedule them to 5 platforms" | all your connected platforms |
| Two static blog posts | X "coming soon"; "all 5 platforms" | X needs Pro; every platform you use |
| Links | `/competitors` (Trend Scout), `/sm-give` (Studio Stax portal) | `/competitor-tracking`, `/give` |
| Metadata | 20 public pages with no canonical (14 guides, /faq, /integrations, /privacy, /terms, /soma, /studio-stax); /hermes had no metadata at all | Canonicals added; /hermes layout with title and description |
| Locale pages (48) | Inherited the home page title | English page's title, description and canonical |

## Still open (188 findings at the last run)

Counts by rule: `unlimited` 42, `ai-tool-count` 42, `coming-soon` 41,
`plan-limit` 22, `stale-year` 17, `plan-price` 7, `enki` 6, `mailbox` 3,
`unavailable-platform` 3, `link` 2, `affiliate-rate` 1, `platform-count` 1, `metadata` 1.

What they are, honestly:
- **`ai-tool-count` (42): real.** Twelve older /vs pages say "20+ AI tools". There
  are 15. A find-and-replace is safe; it was left for the next pass only for time.
- **`unlimited` (42): mostly fine, some real.** Third-party products in guides,
  referral credits ("no cap", true), Enterprise seats, hashtag groups. Still to
  read one by one: the static blog post table at `lib/blog/static-posts.ts:1603`.
- **`coming-soon` (41): mixed.** Most are badge labels in locale files for things
  that are honestly not live. Still to check: `/features` "Coming soon" items,
  `/for/video-creators` badge, `/ai-features` credits "Coming soon".
- **`plan-limit` (22) and `plan-price` (7): almost all false alarms.** Competitor
  sentences that never name the competitor ("The Agency plan is $97/month").
  They need allow entries or a smarter rule.
- **`stale-year` (17): fine.** Historical facts ("rebranded to X in 2023"). The
  2025 mileage rate and SEP limit in the business credit guide should be updated
  to the 2026 IRS figures when someone can check irs.gov.
- **`enki` (6):** `lib/stripe-catalog.ts` labels for admin reporting. Fine.

## Not checked yet

- **The 648 blog posts in the database.** Run `npm run verify:content -- --db`.
  Earlier sweeps found $5 prices and Instagram claims there; `supabase/blog_accuracy_nov5.sql`
  (in TODO.md) has not been confirmed as run. Fixes there are SQL for Joshua, never
  a write from a session.
- **Competitor prices on the ~95 hand-written /vs pages.** Not re-verified against
  each competitor's live pricing page in this pass. The rule is: from their own
  page, with the date shown.
- **Platform specs in guides** (character limits, video specs) against official docs.
- **A full crawl of a production build** (`--crawl`) and Lighthouse before/after.
