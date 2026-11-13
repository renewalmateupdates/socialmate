# Decisions

Choices made without asking, with the reason and what else was considered.
Newest first. Anything that needs Joshua's call goes in `docs/OWNER_DECISIONS.md`.

## Nov 12-13, 2026 (accuracy pass, branch `feat/premium-accuracy-nov12`)

**One facts module, `lib/site-facts.ts`.** Plans, prices, platforms, AI tool
costs, features and brand facts in one typed file. Limits are not typed there:
they come from `lib/plan.ts`, which is what the server enforces. Seats, AI
credits, the X and TikTok quotas and the plan prices moved into `lib/plan.ts`
from the per-route copies.
- Why: the site-wide JSON-LD still priced Pro at $5 and Agency at $20, three
  months after the repricing. Every copy of a number had drifted at least once.
- Alternatives: a JSON file (no types, no derived sentences); leaving the copies
  and only adding a checker (the copies keep drifting, the checker keeps failing).
- Not moved: the copies inside the Stripe webhook, the credit reset cron, the
  publish pipeline (`lib/publish/twitter.ts`) and `lib/inngest.ts`. Those are
  ask-first files. `npm run verify:content` fails if any of them disagrees.

**The sitemap is generated.** `scripts/gen-route-manifest.mjs` lists every public
page from `app/` (minus sign-in pages, app screens, locale copies and noindex
pages) with its last git date; `app/sitemap.ts` reads that list, the audience
data and the blog table. `lastmod` is the page's real date, not "now".
- Why: the old sitemap was a hand list of 160 URLs, every one dated today, which
  teaches crawlers to ignore lastmod. It also listed /signup's neighbours /login
  and /beta, and missed /hermes and all six free tools.
- Alternative: crawl the build. Slower, and needs a running server.

**Locale copies (/de/pricing etc.) carry the English canonical.** They are the
same page translated in the browser, so one URL is indexed, not nine. They are
not in the sitemap.

**/llms.txt, /llms-full.txt and /ai.txt are routes, generated from site-facts**
(`lib/llms.ts`). llms.txt follows llmstxt.org: H1, blockquote, sections of links,
an "Optional" section. llms-full.txt adds every limit, cost and page.
- Why: the hand-kept files quoted the hashtag tool at 1 credit (5), the
  repurposer at 5 (10), a stale account count, and described go-live alerts and
  Creator Hub tips, which stay unannounced until a streamer has used them.
- Features marked `beta` in site-facts are left out of llms.txt and JSON-LD.

**AI crawlers are allowed on public content.** robots.txt has one rule for every
crawler (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot included):
public pages open, sign-in pages, `/api` and `/admin` closed.
- Why: ChatGPT sends most signups (12 of 21 between Oct 15 and Oct 29).
  Blocking assistants would cut the best channel there is.
- Kept: ai.txt's line that training use needs written permission. That is
  Joshua's stated policy; robots.txt cannot express it, and it was not changed.

**`npm run verify:content`** (`scripts/verify-site-content.mjs`) checks prices,
limits, platform claims, "unlimited", trial and refund wording, AI tool costs,
stale "coming soon", internal links, the route manifest, robots.txt, llms.txt
links and per-page metadata. `--db` adds every blog post (read-only), `--crawl
<url>` fetches every sitemap URL from a running build. It is not part of `npm
test` yet, because it still reports open findings (see `docs/CONTENT_AUDIT.md`);
it should join `npm test` once those reach zero.
- Rules judge only SocialMate's side of a comparison table row, so competitor
  prices on /vs pages are not reported as ours.
- Accepted exceptions live in `scripts/verify-content-allow.json`, each with a
  reason. The changelog and roadmap are exempt: they are dated records.

**Compose AI tools show what they do on every screen.** Each button now has a
one-line hint under its name (Caption: "Writes the whole post", Hook: "3 opening
lines"). The second "Repurpose" button is now "Formats", so two buttons no longer
share a name, and the Hashtags and Formats buttons show their real cost (5 and
10 credits, from `lib/ai-tool-costs.ts`; they said 1 and 5).
