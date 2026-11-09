# Enki (archived November 9, 2026)

Enki was Gilgamesh Enterprise's AI trading research project: paper trading
driven by technical signals, a "Truth Mode" experiment to test whether the
strategies had a real edge, and optional live trading through a user's own
Alpaca or Coinbase account. It was built inside the SocialMate app in
April 2026, wound down as a public SocialMate product in July 2026, and its
background jobs were switched off on October 22, 2026. On November 9, 2026 its
code was removed from SocialMate so the app only carries what it uses. Joshua
plans to come back to it as its own product.

Nothing is lost. The whole codebase as it stood that day is saved at a git tag
on GitHub, and this note says where everything was and how to bring it back.

## Where the code is

Tag `archive/enki-2026-11-09` (commit `7e09ca48`) in
`renewalmateupdates/socialmate`. Tags are permanent unless someone deletes the
tag on purpose, and they cost nothing on this computer.

About 10,800 lines in all:

| What | Where it lived | Size |
|---|---|---|
| Pages: landing, dashboard, trades, truth, doctrines, leaderboard, settings, copilot | `app/enki/` | 12 files |
| API routes: brokers (Alpaca, Coinbase), checkout, copilot, doctrines, export, leaderboard, notifications, profile, snapshots, trades, truth, waitlist | `app/api/enki/` | 17 files |
| Strategy code: indicators, signal fusion, strategy engine, strategies, risk supervisor, capital allocator, decay detector, truth mode, types | `lib/enki/` | 9 files |
| The four background jobs | `lib/inngest.ts` | 1,861 lines |
| Text in nine languages (`app_enki_*`, plus nav, footer, FAQ and sidebar entries) | `messages/*.json` | 10 keys per file |

## Bring it back

Into a new folder (for example a new Enki repo), without touching SocialMate:

```bash
mkdir ../enki && git archive archive/enki-2026-11-09 app/enki app/api/enki lib/enki messages | tar -x -C ../enki
```

The four jobs, from the old `lib/inngest.ts`:

```bash
git show archive/enki-2026-11-09:lib/inngest.ts > ../enki/inngest-with-enki.ts
```

Back into SocialMate (not the plan, but possible):

```bash
git checkout archive/enki-2026-11-09 -- app/enki app/api/enki lib/enki
```

## The background jobs

| Job | Schedule | What it did |
|---|---|---|
| `enkiPaperTradingScan` | every 15 minutes | Scored signals (RSI, MACD, EMA, Bollinger, ATR, volume, Fear and Greed, congressional trades, Reddit mentions) and placed paper trades, or queued them for approval |
| `enkiCloudRunnerScan` | hourly | The same scan for Cloud Runner subscribers only |
| `enkiTruthModeScan` | every 15 minutes | Long-only momentum and mean-reversion trades into `enki_truth_trades`, 50 trades minimum per strategy before judging it |
| `enkiWeeklySummary` | Mondays 09:00 UTC | Weekly P&L email |

Lesson for the rebuild: two 15-minute scans ran about 6,500 times a month for
one dormant profile, out of the Inngest Hobby plan's 50,000. Scan only for
users with open positions or active doctrines, or run Enki on its own Inngest
account.

## Data, keys and prices

- **Tables** (still in SocialMate's Supabase; nothing was dropped):
  `enki_profiles`, `enki_doctrines`, `enki_trades`, `enki_trailing_stops`,
  `enki_snapshots`, `enki_leaderboard`, `enki_notifications`, `enki_copilots`,
  `enki_truth_trades`, `enki_truth_strategy_stats`, `enki_waitlist`.
- **Environment variable:** `ENKI_ENCRYPTION_KEY` (64 hex characters, AES-256
  key for stored broker credentials). It can be removed from Vercel; keep a copy
  somewhere safe if any `enki_profiles` row still holds encrypted broker keys.
- **Outside services:** Alpaca (live and paper), Coinbase, Yahoo Finance price
  bars, the House Stock Watcher dataset.
- **Stripe prices** (live, never deleted): Commander $15/mo
  `price_1TMthL7OMwDowUuUndSIejcJ`, Commander $120/yr
  `price_1TMthy7OMwDowUuURnoHc2Qq`, Emperor $29/mo
  `price_1TMtiN7OMwDowUuUU5rzK88L`, Emperor $240/yr
  `price_1TMtis7OMwDowUuUpQ2hZamc`, Cloud Runner $10/mo
  `price_1TMtkc7OMwDowUuU8aepieuq`.

## Left in SocialMate on purpose

- The Stripe webhook's Enki price handling (`app/api/stripe/webhook/route.ts`).
  CLAUDE.md says not to touch the webhook without asking, and it keeps any
  leftover Enki subscription event from being dropped.
- The price labels in `lib/stripe-catalog.ts`, so an old Enki payment still
  shows as Enki on /admin/hq.
- The Enki entries in the changelog and roadmap, which are history.
- The eleven trading blog posts were deleted by `supabase/blog_accuracy_nov5.sql`.

## Decisions to carry over

- Paper trading on by default for every new signup, whatever the tier.
- Truth Mode's 50-trade minimum per strategy before any verdict.
- Enki moves to its own domain and stack, under Gilgamesh Enterprise, not
  SocialMate (decided June 22, 2026).
