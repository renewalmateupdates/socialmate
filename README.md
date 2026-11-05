# SocialMate

A multi-platform social media scheduler and AI "Creator OS", live at
[socialmate.studio](https://socialmate.studio). Schedule and publish to Bluesky,
Discord, Telegram, Mastodon, X, TikTok and LinkedIn; AI writing tools; SOMA
(automated posting from a master document); campaigns, go-live alerts, a link-in-bio
page and creator tips. Free tier plus Pro ($8/mo) and Agency ($29/mo).

Built by Joshua Bostic (Gilgamesh Enterprise LLC). Project context for Claude Code
sessions is in [`CLAUDE.md`](CLAUDE.md); open decisions are in [`TODO.md`](TODO.md).

## Stack

Next.js 16 (App Router) · TypeScript · React 19 · Tailwind CSS 4 · Supabase
(Postgres, Auth, RLS) · Inngest (scheduled jobs) · Stripe · Google Gemini · Resend ·
Vercel.

## Run it locally

Requirements: Node.js 20.9 or newer (22 recommended), npm, Git. Python 3 for the
audit scripts.

```bash
npm install
cp .env.example .env.local      # then fill in the values (Windows: copy .env.example .env.local)
npm run dev                     # http://localhost:3000
```

`.env.local` is gitignored. Fill it from the Vercel project settings, or pull the
development values with `npx vercel env pull .env.local` (needs a Vercel login).
At minimum the app needs the three Supabase variables.

## Build, test, lint

| What | Command |
|---|---|
| Production build | `npm run build`, then `npm start` |
| Script tests (no network, no keys) | `npm test` |
| Audit script's own tests | `python scripts/test-audit-schema-drift.py` |
| Type check | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Columns the code names vs the live schema | `python scripts/audit-schema-drift.py` (needs production keys) |
| Upsert targets vs real unique indexes | `python scripts/audit-dead-features.py` (needs production keys) |

Run the two audits before shipping anything that touches the database; CLAUDE.md
explains why ("THE failure mode of this codebase").

## Deploy

- **Web:** Vercel builds every push. `main` goes to production at socialmate.studio;
  other branches get preview URLs.
- **Database:** SQL in `supabase/` is run by hand in the Supabase SQL editor. Each
  change's PR or CLAUDE.md entry says which file and in what order.
- **Background jobs:** Inngest serves functions from `/api/inngest`. After a deploy
  that adds or renames a function, resync the app in the Inngest dashboard.
- **Android:** a signed AAB builds on GitHub Actions when you push a `v*` tag
  (`.github/workflows/android-release.yml`). Setup: [`docs/GOOGLE_PLAY_SETUP.md`](docs/GOOGLE_PLAY_SETUP.md).

## Repository layout

```
app/                 pages and API routes (App Router)
components/          shared UI; components/instrument/ is the public design system
contexts/ hooks/     React context and hooks
lib/                 shared logic (plans, publishing, credits, mail, tools)
messages/            the nine locale files (a new key goes in all nine)
supabase/            SQL migrations and one-off SQL
scripts/             tests, audits, migration helpers
public/              static files, llms.txt, ai.txt
android/             Capacitor wrapper for Google Play
browser-extension/   the Chrome extension
docs/                setup guides and notes
  sql/               hand-run SQL notes
  marketing/         launch and content drafts
  history/           the dated session log (docs/history/claude-log-2026.md)
```

## Working with Claude Code

Open a terminal in this folder and run `claude`. It reads `CLAUDE.md` automatically.
Keep that file current when something significant ships, and put anything that
needs a product decision in `TODO.md` rather than guessing.
