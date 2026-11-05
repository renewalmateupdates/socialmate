# TODO: decisions that need Joshua

Things a session should not guess at. Each needs a product or business call;
once made, the change itself is small. Delete an item when it's decided and
done. Engineering follow-ups live in CLAUDE.md under "Pick up here".

## SocialMate

- **Pro client workspaces: 1 or 0.** `/pricing`, `lib/plan.ts` and the app say 1;
  the plan table in CLAUDE.md, `public/llms.txt` and `/vs/buffer` say 0. Pick
  one, then change `PLAN_CLIENT_WORKSPACES` in `lib/plan.ts` and the copy that
  disagrees.
- **Creator Hub go-live.** The fee pass-through is built and tested in Stripe test
  mode, but no real live-mode tip has ever gone through. Run one real tip before
  announcing Creator Hub, or keep it unannounced.
- **Twitch go-live alerts.** Built and wired, never seen firing on a real stream.
  Watch one real stream before announcing it.

## Elsewhere (noted here because it came up in SocialMate sessions)

- **RenewalMate PRs:** close #13 (superseded); keep or close #6 (Speed Insights).

## Decided (Nov 5, 2026 consolidation)

- `stripe.exe` (the 31 MB Stripe CLI binary) is no longer tracked and `*.exe` is
  ignored. If you ran it from the repo folder, reinstall the Stripe CLI
  (https://docs.stripe.com/stripe-cli). The old copy is in git history and in the
  backup tags.
- Merged branches get deleted (local and remote) once the backup tags exist.
  Unmerged branches stay; the consolidation report lists them.
- Cloud sessions are retired; work happens in local sessions on Joshua's PC, so
  installing the Claude GitHub App on `gilgameshenterprisellc-pixel` is no longer
  needed.
