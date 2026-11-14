# TODO: decisions that need Joshua

Things a session should not guess at. Each needs a product or business call;
once made, the change itself is small. Delete an item when it's decided and
done. Engineering follow-ups live in CLAUDE.md under "Pick up here".

## Needs Joshua (a click or a query, not a decision)

1. **Run `supabase/blog_accuracy_nov5.sql` in the Supabase SQL editor.** It fixes
   21 wrong claims in 16 blog posts (a $5 Pro price, Instagram and YouTube posting,
   TikTok "pending", the SIGIL address, Enki as a SocialMate feature, a 50-post free
   cap) and removes 11 trading posts that sell Enki plans on the SocialMate blog.
   Originals are backed up in the git-excluded `blog_price_backup_nov5_accuracy.json`.
   The next deploy (or `/api/admin/revalidate`) refreshes the pages.

## Waiting on a decision

1. **An AI video editor of our own (Vyra-style).** Joshua wants SocialMate to be the
   one creator OS. Vyra has no public API (only an MCP server with per-person
   sign-in) and its terms forbid reselling access, so integrating it for our users
   is out. A low-cost first step: in Creator Studio, upload a video, Gemini reads it
   and proposes cuts and captions (AI credits), the cut happens in the browser
   (ffmpeg.wasm, no server video bills), then schedule it. Say go to plan it properly.

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
5. **Enki code gets deleted from SocialMate later**, when Joshua says go:
   `app/enki/` (13 files), `app/api/enki/` (16), `lib/enki/` (9) and the Enki
   functions in `lib/inngest.ts`. `/enki` still serves the waitlist until then.
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
