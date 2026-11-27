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

1. **NONPROFIT50 and STUDENT25: decided Nov 27, waiting on Joshua's Stripe
   step.** Joshua: "students should verify with a .edu email" and "however
   long you think it should last". Both last every payment while subscribed,
   which is what the pages already promise ("makes it $4/month"). NONPROFIT50
   stays on the honor system. STUDENT25 needs a school email on the account
   (`schoolEmailProblem` in `lib/coupon-redemption.ts`, checked by the code box
   and again at checkout; #849). Left to do:
   - **Joshua, in Stripe (live):** two coupons, 50% and 25%, duration
     Forever, applied to the four Pro and Agency products (like BLACKFRIDAY).
     The 50% one gets promotion code `NONPROFIT50`. The 25% one gets a private
     code nobody can guess (not `STUDENT25`), so it can't be typed on Stripe's
     own page past the email check. Send the two `promo_...` IDs.
   - **Then a session:** set `stripe_promo_id` on the two `coupons` rows (both
     exist, active), try each code in the pricing page's box, and check that
     STUDENT25 refuses a non-school account.
2. **An AI video editor of our own (Vyra-style).** Joshua wants SocialMate to be the
   one creator OS. Vyra has no public API (only an MCP server with per-person
   sign-in) and its terms forbid reselling access, so integrating it for our users
   is out. A low-cost first step: in Creator Studio, upload a video, Gemini reads it
   and proposes cuts and captions (AI credits), the cut happens in the browser
   (ffmpeg.wasm, no server video bills), then schedule it. Say go to plan it properly.
3. **Three "unlimited" and "coming soon" promises (found Nov 27 by `verify:content`).**
   Each is accepted in `scripts/verify-content-allow.json` with a reason that
   points here, so the check passes while it waits. Decide each:
   - HERMES's Enterprise card says "Unlimited campaigns" and "Unlimited
     prospects", and the Enterprise page says "unlimited scale". Enterprise is
     custom-priced, but prospects cost Hunter.io credits. Keep, or change to
     "custom limits"?
   - Creator Studio (`/create`) shows six disabled editing buttons (Crop,
     Filter, Brightness/Contrast, Text Overlay, Stickers, Background) and six
     image templates, each "Coming soon". Nobody is building them. Keep, label
     them "planned", or hide them?
   - `lib/publish/index.ts` (ask-first) tells someone that a platform the
     publisher can't post to has "support coming soon". Reword it to say the
     platform isn't available?

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
2. **Speed Insights Plus is off.** Asked whether to keep it at $10 a month,
   Joshua said "Turn it off", and its renewal was cancelled the same day in
   the project's Speed Insights page ("..." menu). Plus runs to Dec 19 (no
   refund for the cycle already paid); after that Speed Insights shows only
   the Real Experience Score of routes rated Great or Needs Improvement and
   keeps collecting within the team's allowance. The Vercel bill goes from
   $30 to $20 a month. Turn it back on there (Upgrade) if a speed problem
   needs Core Web Vitals or the Poor routes again.
3. **/refer/CODE credits partners for 60 days, like `?ref=` links (#843).**
   Joshua said "Yes, fix it". The proxy sets the `sm_ref` cookie on
   /refer/CODE too, so a visitor who leaves the page and signs up within 60
   days is credited. Fixing it turned up a bigger bug: the page looked codes
   up in capitals, while every code is stored in lowercase, so /refer/CODE
   and the /z/CODE ZENITH card were a 404 for 288 of the 297 codes, the one
   active partner's included. All lookups go through
   `lib/referral-code.ts` now.

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
