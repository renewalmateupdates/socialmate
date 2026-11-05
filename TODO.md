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
- **Reset or delete the former growth partner's login.** Its temporary password
  was written into the public CLAUDE.md in April. It was redacted on Nov 5, but it
  is still in git history, so anyone can read it. In Supabase Auth, reset that
  user's password or delete the user (the affiliate has been inactive since May).
- **Enki code still lives here.** Enki left SocialMate's UI on Oct 26 (#751) and
  its Inngest jobs are unregistered, but `app/enki/` (13 files), `app/api/enki/`
  (16), `lib/enki/` (9) and the Enki functions in `lib/inngest.ts` remain, and
  `/enki` still serves the waitlist by direct link. Delete them once the
  standalone Enki has what it needs (git history keeps them), or keep them.
- **Customer and partner emails in the public history log.**
  `docs/history/claude-log-2026.md` is the old CLAUDE.md word for word, so it
  names customers and partners by email. Redact them, or accept it (they are
  already in this public repo's history either way).

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
- `npm run lint` is a gate: 0 errors. Style-only rules are off and `any` plus the
  React Compiler advisories are warnings (see `eslint.config.mjs`).

## Needs you (one command, not a decision)

- The old worktree `.claude/worktrees/confident-austin-ce0947` holds 1.3 GB of
  build cache; its commit is already on main. The Nov 5 session was not allowed
  to delete it. From `C:\Users\jbost\socialmate`:
  `git worktree remove --force .claude/worktrees/confident-austin-ce0947`
