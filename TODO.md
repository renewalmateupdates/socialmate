# TODO: decisions that need Joshua

Things a session should not guess at. Each needs a product or business call;
once made, the change itself is small. Delete an item when it's decided and
done. Engineering follow-ups live in CLAUDE.md under "Pick up here".

## Needs Joshua (a click or a query, not a decision)

(Vercel Spend Management is done: checked Nov 27, a $200 budget with alerts at
50, 75 and 100%, pausing off. `supabase/blog_accuracy_nov5.sql` ran: checked Nov 16, the old $5 price is
gone. The November update email finished Nov 18; Resend's Receiving tab no
longer needs a look, because Resend keeps mail only 30 days and the Aug 30
replies expired long ago.)

## Waiting on a decision

1. **NONPROFIT50 and STUDENT25 (found Nov 26).** /discount, /for/nonprofits and
   all nine locale files advertise them, but neither has a Stripe promotion
   code, so from May to Nov 26 the pricing page said "50% off applied" and
   Stripe would have charged the full price (nobody tried). Since Nov 26 the
   code box refuses them and gives the support email. To make them work,
   decide: how long each discount lasts (every payment, the first 12 months,
   or the first payment), and whether the honor system stays (in May Joshua
   wanted a verification step: .edu for students). Then a session creates the
   two Stripe codes, links them in the `coupons` table and updates the pages.
2. **Keep Speed Insights Plus ($10 a month)? (found Nov 27)** Vercel bills it
   as its own line on top of Pro's $20, so the bill is $30 a month; the
   usage itself ($3.62 so far this cycle) fits inside Pro's included $20.
   It measured the Nov 20 phone fixes (app pages from the 50s to the 80s and
   90s on phones). Keep it while the app pages are still being worked on, or
   turn it off in the project's Speed Insights settings and lose the
   real-visitor numbers.
3. **An AI video editor of our own (Vyra-style).** Joshua wants SocialMate to be the
   one creator OS. Vyra has no public API (only an MCP server with per-person
   sign-in) and its terms forbid reselling access, so integrating it for our users
   is out. A low-cost first step: in Creator Studio, upload a video, Gemini reads it
   and proposes cuts and captions (AI credits), the cut happens in the browser
   (ffmpeg.wasm, no server video bills), then schedule it. Say go to plan it properly.

## Decided (Nov 27, 2026)

1. **TikTok Studio's Post now and Send to drafts are never refused at the
   monthly TikTok cap.** Asked which way to go, Joshua said "do whatever you
   think it best moving forward", and Claude kept them unrefused. They upload
   from the creator's browser straight to TikTok and cost SocialMate nothing,
   which is his rule for staying free. They are still recorded and counted
   (#836). Scheduled videos cost storage and egress, and `/api/tiktok/post`
   still refuses one past the cap. The copy keeps 20 / 60 / 200 a month, which
   holds for scheduled videos. Past the cap, Post now still works and
   scheduling stops until the 1st. Revisit if Post now starts costing money,
   or if the cap should become an upgrade reason.

## Decided (Nov 13, 2026)

1. **18 and over only.** Terms and Privacy say so from the Nov 13 branch (they
   said 13+ with a parental-consent promise nothing checked). What adults
   schedule within each platform's rules is their business, but SocialMate is
   never marketed as an adult tool: it is a creator OS. Fan-platform copy stays
   safe for work.
2. **The free tier is as free as it is to run.** Anything that costs nothing to
   serve stays free; anything with a running cost (video rendering, clipping, AI,
   storage) is credits, an add-on or Pro.
3. **No feature is removed until `/admin/usage` shows what people use.** Until
   then the sidebar starts short and the rest waits under More tools.
4. **The Calendar always opens on today.**

## Decided (Nov 5, 2026)

1. **RenewalMate PRs #13 and #6 closed (Nov 5).** #13's fixes were already on master;
   Speed Insights can be added from the Vercel dashboard later.
2. **The former growth partner's two logins were deleted (Nov 5)** by Joshua in
   Supabase; nothing was left behind in any table.
3. **Pro includes 1 client workspace.** `lib/plan.ts`, `/pricing`, the CLAUDE.md
   plan table, `llms.txt`, `ai.txt`, `/vs/buffer` and `/vs/hootsuite` all agree.
   (The home page also said Agency includes 10; it's 5, fixed in all nine
   languages.)
4. **Creator Hub tips and Twitch go-live alerts stay unannounced.** Next step is
   to onboard one streamer to use them for real (an alert on a real stream, a real
   tip), and announce after that works.
5. **Enki code is out of SocialMate.** Removed Nov 9 (#775), saved at the tag
   `archive/enki-2026-11-09`; `docs/archive/enki.md` says how to restore it.
6. **No one is identified in this public repo.** Customer, partner, contractor,
   family and commenter details were redacted from the docs, the roadmap page and
   a code comment on Nov 5. Git history still has the old text.
7. `stripe.exe` (the 31 MB Stripe CLI binary) is no longer tracked and `*.exe` is
   ignored. If you ran it from the repo folder, reinstall the Stripe CLI
   (https://docs.stripe.com/stripe-cli). The old copy is in git history and in the
   backup tags.
8. Merged branches get deleted (local and remote) once the backup tags exist.
   Unmerged branches stay.
9. Cloud sessions are retired; work happens in local sessions on Joshua's PC, so
   installing the Claude GitHub App on `gilgameshenterprisellc-pixel` is no longer
   needed.
10. `npm run lint` is a gate: 0 errors. Style-only rules are off and `any` plus the
   React Compiler advisories are warnings (see `eslint.config.mjs`).
