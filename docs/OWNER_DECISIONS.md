# Owner decisions

Things a session should not decide alone, with a recommendation. Most urgent first.

1. **Reconnect X before the promo posts (today, Nov 13).** The admin failure log
   shows the Nov 12 shop post failed on X: "X needs one more permission to post
   images." Every X post with an image or video from that account will fail the
   same way until X is reconnected on the Accounts page. Two minutes, no code.

2. **Run the blog check against the database.** `npm run verify:content -- --db`
   reads all 648 posts (read-only) and lists every wrong price, platform or
   "unlimited" claim. Corrections come back as a SQL file for you to run. Also
   confirm whether `supabase/blog_accuracy_nov5.sql` (TODO.md) has run.
   Recommendation: yes, next session.

3. **Go-live alerts and Creator Hub on public pages.** They are meant to stay
   unannounced until a streamer uses them, but `/for/streamers` and `/monetize`
   still describe them publicly. This branch took them out of llms.txt and the
   structured data only. Recommendation: leave the pages up (they are honest
   about what the feature does) unless you want them hidden; say which.

4. **AI training wording in /ai.txt.** It says training on the site needs written
   permission, while robots.txt lets every AI crawler in (on purpose, ChatGPT
   sends most signups). Kept as you wrote it. Recommendation: keep both; they do
   not conflict, since crawling for answers is allowed and training is a request.

5. **Make `npm run verify:content` part of `npm test`** once its open findings
   (docs/CONTENT_AUDIT.md) are zero, so a wrong price cannot merge.
