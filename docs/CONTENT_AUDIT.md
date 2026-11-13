# Content audit (Nov 12-13, 2026)

How to reproduce: `npm run verify:content` (static), `npm run verify:content -- --db`
(adds every blog post, read-only), `npm run verify:content -- --crawl http://localhost:3000`
(fetches every sitemap URL from a running build). Rules: `scripts/lib/content-rules.mjs`.

## Nov 13 follow-up: the 648 blog posts checked against the database

Ran `npm run verify:content -- --db`. 283 findings on the first pass; after
fixing the real ones and allow-listing confirmed false positives, 188 remain
(same shape as the static-only count: mostly accurate historical/competitor
text, see "Still open" below for the honest breakdown).

**Fixed (SQL, `supabase/blog_accuracy_nov13.sql`, pasted in chat for Joshua to run):**
- 7 blog posts quoted the AI credit system wrong: the repurposer at 1 or 5
  credits (it is 10), the hashtag tool at 1 credit (it is 5), caption writing
  at 2 credits (it is 5).
- `hootsuite-alternative-with-tiktok-linkedin` said Instagram/Facebook
  scheduling is "SocialMate coming" and something SocialMate "is still
  working toward." Per CLAUDE.md, Meta's app review has not started and
  Pinterest outright declined SocialMate's application; reworded to the real
  status instead of implying active progress.
- `soma-projects-multiple-brands` linked to `/soma/projects`, which has no
  page (only `/soma/projects/new` and `/soma/projects/[id]` exist) and 404s.
  Pointed at `/soma/dashboard`, which lists projects.

**Fixed in code (no SQL needed):** `app/blog/[slug]/page.tsx` rendered the raw
`excerpt` column under every post's headline with no fallback. 56 of 648 posts
have no excerpt, so those pages showed an empty teaser line. The index page
and the meta description already fell back to `describePost()` (the opening
paragraph); the post page itself did not. Now it does, for all three.

**A checker bug, not a content bug:** the link-extraction regex matched
`${variableName}` inside template literals as if it were a literal path
(`https://socialmate.studio/${automated ? 'queue' : ...}` read as a broken
link to `/${automated`). Fixed in `scripts/verify-site-content.mjs`; this
produced several false "broken link" findings in earlier runs that are gone
now, not actually broken.

**Needs an editorial decision, not fixed here (see `docs/OWNER_DECISIONS.md`):**
nine blog posts share a title with another post:

| This slug | Shares a title with |
|---|---|
| `repurpose-content-across-platforms` | `repurpose-content-across-6-platforms` |
| `bluesky-vs-twitter-2026` | `bluesky-vs-twitter-creators-2026` |
| `creator-economy-2026` | `creator-economy-2026-whats-changed` |
| `how-to-build-a-personal-brand-on-social-media` | `how-to-build-personal-brand-social-media-2026` |
| `caption-writing-formula` | `write-social-media-captions-get-engagement` |
| `social-media-strategy-small-business-2026` | `small-business-social-media-strategy-2026` |
| `how-to-write-social-media-captions-that-get-engagement` | `write-social-media-captions-get-engagement` |
| `how-to-schedule-tiktok-posts-free` | `schedule-tiktok-posts-free` |
| `free-social-media-tools-2026` | `best-free-social-media-tools-creators-2026` |

Same title does not always mean duplicate content (these may be different
angles that happened to converge on the same headline), but it is worth a
human read before two pages keep competing for the same search result.
Merging or 301-redirecting either side is an editorial and SEO call this
session did not make unprompted.

**Reviewed and left alone, with why (allow-listed in
`scripts/verify-content-allow.json`):** a sample of the larger buckets
(`unlimited` 57, `coming-soon` 43, `stale-year` 42, `plan-limit` 24,
`plan-price` 7) was read in full. Every one checked was either a competitor's
own number in a comparison table/post, a historical fact ("Hootsuite removed
their free plan in 2023"), or SM-Give's 2% charity cut being mismatched for an
affiliate rate by a sentence that mentions both. The remaining unread ones in
these buckets were not individually re-verified this session; treat them as
likely-fine based on this sample, not confirmed.

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

- **The 9 duplicate-title blog pairs above.** Needs a human read, not a script.
- **Competitor prices on most of the ~95 hand-written /vs pages.** 10 were
  re-verified against vendor pricing pages Nov 13 (`docs/COMPETITIVE_BENCHMARK.md`);
  the rest were not. The rule is: from their own page, with the date shown.
- **Platform specs in guides** (character limits, video specs) against official docs.
- **A full crawl of a production build** (`--crawl`) and Lighthouse before/after.

Resolved this pass: `supabase/blog_accuracy_nov5.sql` ran Nov 13 (confirmed by
Joshua); the 648-post database check above ran against the live table.
