# Owner decisions

Things a session should not decide alone, with a recommendation. Most urgent first.

## Decided (Nov 13, 2026)

1. **X reconnected** on the Accounts page; LinkedIn also reconnected (its
   token had expired). Both should post normally again.
2. **`supabase/blog_accuracy_nov5.sql` ran.** Confirmed.
3. **Go-live alerts and Creator Hub stay on their public pages** (`/for/streamers`,
   `/monetize`) as-is.
4. **`/ai.txt`'s training-permission line stays, alongside robots.txt allowing
   every AI crawler.**
5. **Publer's live pricing confirmed** (`publer.com/plans`, checked directly):
   Free $0, Professional $5/mo, Business $10/mo, Enterprise custom.
   `docs/COMPETITIVE_BENCHMARK.md` updated.

## Open

1. **Nine blog posts share a title with another post** (full list in
   `docs/CONTENT_AUDIT.md`, "Nov 13 follow-up"). Not fixed here: merging two
   posts or 301-redirecting one means picking a winner, which is an editorial
   call. Recommendation: skim each pair; where one is clearly the better or
   newer version, redirect the other to it with a 301 (keeps its backlinks and
   search history) rather than deleting it outright.

2. **Make `npm run verify:content` part of `npm test`** once its open findings
   (`docs/CONTENT_AUDIT.md`) are at zero, so a wrong price cannot merge again.
