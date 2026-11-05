# TODO: decisions that need Joshua

Things a session should not guess at. Each needs a product or business call;
once made, the change itself is small. Delete an item when it's decided and
done. Engineering follow-ups live in CLAUDE.md under "Pick up here".

## Needs Joshua (a click or a query, not a decision)

1. **Ban the former growth partner's two logins.** A temporary password for one
   of them sat in the public CLAUDE.md from April to Nov 5 and is still in git
   history. Both logins have been unused since Apr 21. Joshua said "get rid of"
   on Nov 5, but sessions are not allowed to change production auth, so: in
   Supabase, Authentication, Users, open each account and choose Ban user (or
   Delete user to remove it for good). The account ids are in the Nov 5 handoff
   and local memory, not here, because this repo is public.
2. **Fix the one live blog post with a wrong contact address.** The
   `cofounder-search-sweat-equity-startup` post tells readers to email
   `socialmate.updates@gmail.com`, which is not a SocialMate address. The repo's
   SQL file is fixed; the live row needs this in the Supabase SQL editor, then
   `POST /api/admin/revalidate` for `/blog/cofounder-search-sweat-equity-startup`:

   ```sql
   UPDATE blog_posts
   SET content = replace(content, 'socialmate.updates@gmail.com', 'socialmatehq@gmail.com')
   WHERE slug = 'cofounder-search-sweat-equity-startup';
   ```

## Waiting on a decision

1. **RenewalMate PRs** (in `gilgameshenterprisellc-pixel/renewalmate`, which
   `renewalmateupdates/renewalmate` now redirects to). #13 (Jun 19, waitlist data
   loss and sitemap fixes) is superseded: master already has both fixes, and the
   PR conflicts. Recommendation: close it. #6 (Jun 12, from Vercel's bot) adds
   Vercel Speed Insights, three files and free on the Hobby plan. Recommendation:
   merge it after a fresh build, or close it if speed scores for renewalmate.com
   don't matter.

## Decided (Nov 5, 2026)

1. **Pro includes 1 client workspace.** `lib/plan.ts`, `/pricing`, the CLAUDE.md
   plan table, `llms.txt`, `ai.txt`, `/vs/buffer` and `/vs/hootsuite` all agree.
   (The home page also said Agency includes 10; it's 5, fixed in all nine
   languages.)
2. **Creator Hub tips and Twitch go-live alerts stay unannounced.** Next step is
   to onboard one streamer to use them for real (an alert on a real stream, a real
   tip), and announce after that works.
3. **Enki code gets deleted from SocialMate later**, when Joshua says go:
   `app/enki/` (13 files), `app/api/enki/` (16), `lib/enki/` (9) and the Enki
   functions in `lib/inngest.ts`. `/enki` still serves the waitlist until then.
4. **No one is identified in this public repo.** Customer, partner, contractor,
   family and commenter details were redacted from the docs, the roadmap page and
   a code comment on Nov 5. Git history still has the old text.
5. `stripe.exe` (the 31 MB Stripe CLI binary) is no longer tracked and `*.exe` is
   ignored. If you ran it from the repo folder, reinstall the Stripe CLI
   (https://docs.stripe.com/stripe-cli). The old copy is in git history and in the
   backup tags.
6. Merged branches get deleted (local and remote) once the backup tags exist.
   Unmerged branches stay.
7. Cloud sessions are retired; work happens in local sessions on Joshua's PC, so
   installing the Claude GitHub App on `gilgameshenterprisellc-pixel` is no longer
   needed.
8. `npm run lint` is a gate: 0 errors. Style-only rules are off and `any` plus the
   React Compiler advisories are warnings (see `eslint.config.mjs`).
