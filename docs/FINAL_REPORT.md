# SocialMate — Overnight Build Session Report

**Branch:** `claude/laughing-poitras`
**Build status:** ✅ Clean (`next build` passes, 56 static pages generated)
**Commits:** 2 (Phase 1-2 work + this session's fixes)

---

## What Was Done

### Phase 1 — Critical Bug Fixes

**Dark mode overhaul**
- `app/globals.css`: Added `@variant dark (&:where(.dark, .dark *))` for Tailwind v4 + combined `.dark, [data-theme="dark"]` CSS variable selectors
- `contexts/ThemeContext.tsx`: Full rewrite — adds both `.dark` class AND `data-theme="dark"` attribute, Supabase sync (load on mount, save on change), system preference fallback
- `app/layout.tsx`: Anti-flash inline script before React hydration (reads localStorage, applies class synchronously)
- `components/Sidebar.tsx`: Rewrote to use `var(--bg)`, `var(--text)`, `var(--border)` CSS variables via inline `style={}` props (fully dark-mode-aware)
- `components/ThemeToggle.tsx`: Updated to use CSS variables

**Admin link gated**
- `app/page.tsx`: Removed 'Admin' from `FOOTER_LINKS` array entirely. Added server-side `ADMIN_USER_ID` env check. Admin link only rendered server-side when `user.id === process.env.ADMIN_USER_ID`.

**Personal workspace auto-creation**
- `app/auth/callback/route.ts`: Auto-creates `workspaces` row + `workspace_members` row on first login (already implemented in previous session).

---

### Phase 2 — Publishing Reliability

**Platform character limits enforced:**
- Bluesky: 300 chars
- Telegram: 4096 chars
- Discord: 2000 chars
- Mastodon: 500 chars
- LinkedIn: 3000 chars (documented 60-day token expiry warning)
- YouTube: API approval required (subscriber requirement documented)

**Specific error messages:**
- All publishers now return `userError` (human-readable string for the UI) alongside the technical `error` field
- 401 → "Access token expired — reconnect your account"
- 429 → "Rate limit hit — Inngest will retry automatically"
- 404 → "Channel/chat not found — check your connection settings"

**Inngest hardening (`lib/inngest.ts`):**
- Added `retries: 3` and `concurrency: { limit: 10 }` to `publishScheduledPost`
- Added explicit per-platform success/failure logging

**Pinterest publisher (`lib/publish/pinterest.ts`):**
- New file — complete Pinterest v5 API implementation with board selection, token refresh, sandbox URL (change to `api.pinterest.com` after production approval)

---

### Phase 3 — Mobile Fixes

**`md:ml-56` breakpoint applied to 6 pages** that had hardcoded `ml-56 flex-1 p-8`:
- `app/ai-features/page.tsx`
- `app/approvals/page.tsx`
- `app/competitor-tracking/page.tsx`
- `app/content-gap/page.tsx`
- `app/evergreen/page.tsx`
- `app/rss-import/page.tsx`

All now use `md:ml-56 flex-1 p-4 md:p-8` — properly collapsed on mobile.

---

### Phase 4 — Features (Already Implemented — Audit Confirms)

All feature pages exist with full implementations:
- ✅ `/analytics` — posting heatmap, platform breakdown, plan-gated range selectors
- ✅ `/social-inbox` — Bluesky mentions fetched live, read/unread state, filters
- ✅ `/bulk-scheduler` — multi-row bulk posting with plan limits
- ✅ `/evergreen` — mark published posts as evergreen for auto-requeue
- ✅ `/rss-import` — RSS/Atom feed fetching via rss2json
- ✅ `/hashtags` — hashtag collection manager (CRUD, copy-all)
- ✅ `/media` — upload/delete files, storage quota bar by plan
- ✅ `/approvals` — post approval workflow UI
- ✅ `/link-in-bio` — bio page builder with themes and link management
- ✅ `/best-times` — posting time heatmap + platform-specific recommendations
- ✅ `/competitor-tracking` — track competitor handles
- ✅ `/notifications` — read/unread notifications with types
- ✅ `/templates` — template library with categories

---

### Phase 5 — Infrastructure

**Build system fixed (critical):**
- All module-level Supabase admin client calls replaced with `getSupabaseAdmin()` lazy getter (`lib/supabase-admin.ts`)
- `lib/stripe.ts`: Replaced module-level `new Stripe()` with `getStripe()` lazy function
- All Resend `new Resend()` calls moved inside handler functions as `getResend()`
- All API routes have `export const dynamic = 'force-dynamic'`
- `src/lib/supabase.ts`: Browser client uses build-safe fallback URL/key
- Result: `next build` now passes cleanly ✅

**Image compression library (`lib/compress-image.ts`):**
- Canvas API-based compression: max 1920×1920, max 2MB, JPEG quality 85
- Rejects HEIC/RAW/BMP/TIFF, animated GIF passthrough
- Exports `compressImage(file)` and `formatFileSize(bytes)`

**Rate limiting:** SQL provided in `docs/ACTION_REQUIRED_SQL.md`

**Stripe live mode checklist:** See `docs/ACTION_REQUIRED_SQL.md` — 10-step checklist

---

### Phase 6 — Content & SEO

**Comparison pages (5 new):**
- `/vs/buffer` — 20-row feature table, 5 reasons to switch, FAQ
- `/vs/hootsuite` — honest comparison with team-seat focus
- `/vs/later` — Instagram-first context + when-Later-makes-sense
- `/vs/zoho-social` — Zoho ecosystem context
- `/vs/socialrails` — decentralized platform focused comparison

**Public roadmap (`/roadmap`):**
- 30+ items across 4 status categories (in-progress/coming-soon/planned/shipped)
- Status legend with item counts
- Feature request form → saves to `feature_requests` table

**Blog posts** (added to `app/blog/[slug]/page.tsx`):
- `why-we-built-socialmate`
- `best-free-social-media-scheduler-2025`
- `how-to-use-ai-for-social-media-captions`
- `why-your-hashtag-strategy-isnt-working`
- `schedule-30-days-of-content-in-one-sitting`
- `real-cost-of-social-media-management-tools-2025`
- `best-times-to-post-2026`

**Sitemap (`app/sitemap.ts`):** Updated with all new pages — 22 URLs total

---

## ACTION REQUIRED — Supabase SQL

**You must run these SQL statements.** See `docs/ACTION_REQUIRED_SQL.md` for the full script.

Summary of what needs to be created:

| Table / Column | Required For |
|---|---|
| `user_settings.theme_mode` + `theme_accent` columns | Dark mode sync |
| `feature_requests` table | Roadmap feature request form |
| `hashtag_collections` table | /hashtags page |
| `media_files` table + `media` storage bucket | /media page |
| `notifications` table | /notifications page |
| `bio_pages` table | /link-in-bio + /[username] public pages |
| `posts.evergreen` column | /evergreen recycling |
| `posts.approval_status` + `approval_note` columns | /approvals workflow |
| `posts.analytics` + `platform_post_ids` columns | Analytics engagement sync |
| `post_templates` table | /templates page |
| `inbox_messages` table | /social-inbox persistence |
| `rate_limit_counters` table | Publishing rate limiting |
| `competitors` table | /competitor-tracking |

---

## Known Limitations

1. **Pinterest**: Using sandbox API URL (`api-sandbox.pinterest.com`). Change to `api.pinterest.com` after production API approval from Pinterest. File: `lib/publish/pinterest.ts` line 3.

2. **LinkedIn**: Requires developer app with `r_liteprofile` + `w_member_social` scopes. Tokens expire after 60 days. Full workflow documented in `lib/publish/linkedin.ts`.

3. **YouTube**: Requires 500+ subscribers for Community Posts. Documented in `lib/publish/youtube.ts`.

4. **Inngest**: The `lib/inngest.ts` file initializes the Inngest client with `INNGEST_EVENT_KEY` env var. Verify this is set in Vercel.

5. **Blog**: Blog posts are currently hardcoded in `app/blog/[slug]/page.tsx`. A full MDX pipeline (installing `next-mdx-remote`, moving content to `/content/blog/*.mdx`) would be the next upgrade but would require the markdown files to be written.

6. **RSS Import**: Uses the free `rss2json.com` API which has rate limits. For production scale, consider a self-hosted parser or `fast-xml-parser` via an API route.

---

## Environment Variables Needed

All must be in Vercel (or `.env.local` for local dev):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://socialmate.studio
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
STRIPE_AGENCY_PRICE_ID=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
RESEND_API_KEY=
GEMINI_API_KEY=
ADMIN_USER_ID=          ← your Supabase user UUID
CRON_SECRET=            ← any random secret for Vercel cron auth
```

---

## PR Checklist Before Merging

- [ ] Run SQL from `docs/ACTION_REQUIRED_SQL.md` in Supabase
- [ ] Create `media` storage bucket in Supabase (public, 50MB limit)
- [ ] Verify all env vars are set in Vercel
- [ ] Test dark mode toggle in production
- [ ] Test a scheduled post end-to-end (Bluesky is the most reliable)
- [ ] Verify the Inngest dashboard shows events being processed
- [ ] Check `/roadmap` page renders correctly
- [ ] Check all 5 `/vs/*` comparison pages
- [ ] Verify sitemap at `https://socialmate.studio/sitemap.xml` includes new pages
