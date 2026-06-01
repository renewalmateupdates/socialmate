import { Metadata } from 'next'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: 'Changelog — SocialMate',
  description: 'Every update, improvement, and fix — tracked publicly. See what we\'ve shipped at SocialMate.',
}

type BadgeType = 'New' | 'Improved' | 'Fixed'

interface ChangeItem {
  type: BadgeType
  text: string
}

interface ChangelogEntry {
  date: string
  version: string
  changes: ChangeItem[]
}

const CHANGELOG: ChangelogEntry[] = [
  {
    date: 'June 1, 2026',
    version: 'Full Site i18n — 9 Languages, Every Public Page',
    changes: [
      { type: 'New',      text: 'Full i18n across every public-facing page — 74 namespaces, 9 locales (en/es/de/fr/pt/ru/zh/ja/ko). Pricing, FAQ, glossary, features, all 15 audience pages, all 75 comparison pages, and 10+ misc public pages now translate when you switch language. Content translates, not just the nav.' },
      { type: 'Improved', text: 't() interpolation support — the translate function now accepts optional params so strings like "X results for {search}" work correctly in all 9 languages.' },
      { type: 'Fixed',    text: 'metadata + use client conflict resolved across all /for/* and /vs/* pages — metadata moved to per-route layout.tsx files, the correct Next.js 15 pattern. Zero conflicts remaining.' },
    ],
  },
  {
    date: 'May 31, 2026',
    version: 'FCP Performance Fix — Dashboard, Onboarding, Blog',
    changes: [
      { type: 'Fixed',    text: 'Dashboard FCP fixed — loading spinner used border-black which is invisible on dark mode backgrounds. Changed to border-amber-500. Was causing measured FCP of 3+ seconds because the browser painted nothing visible.' },
      { type: 'New',      text: 'Dashboard and Onboarding loading skeletons — added loading.tsx to both routes. Next.js App Router now shows a server-rendered skeleton instantly during navigation instead of waiting for the full JS bundle to execute.' },
      { type: 'Improved', text: 'Blog post ISR cache extended from 1 hour to 24 hours — hourly cache expiry was causing international CDN nodes to hit the US East origin server on cache miss, resulting in 3s+ FCP for visitors in Argentina, France, China, and Singapore.' },
      { type: 'Improved', text: 'Blog index now cached — /blog was doing a fresh 500-row Supabase query on every single page load with no revalidation. Now cached for 24 hours.' },
    ],
  },
  {
    date: 'May 29, 2026',
    version: 'i18n Full Parity — 9 Locales, Mobile Sweep',
    changes: [
      { type: 'New',      text: 'Japanese (ja) and Korean (ko) added as full locales — complete translations for all landing page sections including hero, platforms, free tier, clips, AI tools, features, comparison, bio link, guides, story, SM-Give, and final CTA.' },
      { type: 'Improved', text: 'i18n parity sweep — all remaining hardcoded English strings replaced with t() calls. SM-Pulse and SM-Radar card descriptions in LocalizedLanding now translate. Mobile nav labels (Menu, Language, Merch, SM-Give) fully translated. All 9 locale files validated in sync.' },
      { type: 'Improved', text: 'Mobile nav labels translated — "Menu", "Language", "👕 Merch", and "❤️ SM-Give" in the mobile drawer now use t() and render in the user\'s chosen language.' },
      { type: 'Fixed',    text: 'Landing page locale files — critical missing keys backfilled for es/de/fr/pt/ru/zh (hero_headline, cta_primary, cta_no_card, more_coming, built_by_desc, and all CTA buttons). These were present but had English placeholder values that would not trigger auto-fallback.' },
    ],
  },
  {
    date: 'May 28, 2026',
    version: 'Enterprise Tier, Full Send Daily Cron, White Label, i18n Completion, SOMA Video URL',
    changes: [
      { type: 'New',      text: 'Enterprise tier — new /enterprise landing page with contact form. Enterprise plan card added to /pricing (custom pricing, unlimited seats, SLA, White Label Pro included, dedicated onboarding). Inquiries saved to DB and emailed to Joshua. No Stripe checkout — provisioned manually.' },
      { type: 'New',      text: 'SOMA Full Send daily auto-run — Full Send users now get a daily 9am EDT cron (somaFullSendDailyRun). Max 7 posts/day per platform, 30 runs/month cap. Autopilot keeps its weekly Monday schedule. 🚀 Full Send active banner on SOMA dashboard.' },
      { type: 'New',      text: 'SOMA video URL attachment — add a video URL per SOMA project. Injected into Gemini prompts so generated posts reference the video naturally. Cyan URL input + saved state with remove button on project page.' },
      { type: 'Improved', text: 'White Label settings fully built — logo URL, custom brand name, primary color picker, remove-branding Pro toggle, and custom domain input (Pro only). File upload via /api/white-label/logo-upload to Supabase media bucket. Default accent color corrected to amber.' },
      { type: 'Improved', text: 'i18n completed — Settings Scheduling tab, SOMA Weekly page, and SOMA Upgrade gate fully wired with useI18n(). 54 new translation keys across all 7 locale files (en/es/de/fr/pt/ru/zh). Full-app translation coverage now complete.' },
      { type: 'Fixed',    text: 'Build error fixed — somaFullSendDailyRun was imported in route.ts but never written. Full function added to lib/inngest.ts. Vercel deploy unblocked.' },
    ],
  },
  {
    date: 'May 27, 2026',
    version: 'SOMA Media, Enki i18n, Landing Redesign, Blog Speed Fix',
    changes: [
      { type: 'New',      text: 'SOMA media toggle — enable Unsplash images per project. Each generated post gets a relevant photo attached automatically. Photographer attribution displayed inline per Unsplash API guidelines.' },
      { type: 'New',      text: 'Unsplash image preview in Queue and Calendar — posts with attached images now show a thumbnail and "Photo by X on Unsplash" attribution link in post cards.' },
      { type: 'New',      text: 'Compose media preview — opening a SOMA-generated post with an attached image in Compose now shows the Unsplash thumbnail and attribution in the media section.' },
      { type: 'Improved', text: 'Enki pages fully translated — Truth Mode, Trade History, and Doctrines pages are now wired with i18n. All 7 languages (en/es/de/fr/pt/ru/zh) supported. 207 translation keys added.' },
      { type: 'Improved', text: 'Landing page redesign — new headline "Post everywhere. All at once." with amber gradient. Platform pills in hero. Visual depth glows. Amber CTA button. Stats now white. Less flat, more alive.' },
      { type: 'Improved', text: 'Signup page cleanup — age gate checkbox removed and replaced with a proper ToS/Privacy acceptance checkbox. Newsletter opt-in updated to reference IRIS Dispatch by name.' },
      { type: 'Improved', text: 'Blog pages now pre-render at build time — all 500+ blog posts are generated as static HTML at deploy time instead of hitting Supabase on every first load. Significant FCP improvement.' },
      { type: 'New',      text: 'SOMA autopilot cron now respects the media toggle — projects with include_media enabled will receive Unsplash images on Monday auto-runs, not just manual generate runs.' },
    ],
  },
  {
    date: 'May 22, 2026',
    version: 'FeedHive Comparison Page',
    changes: [
      { type: 'New', text: 'vs/FeedHive — new competitor comparison page covering pricing, platform gaps (no Discord, Telegram, Bluesky, or TikTok), and AI tool comparison. Sitemap and llms.txt updated.' },
    ],
  },
  {
    date: 'May 22, 2026',
    version: 'Hashtag Collections, Zapier Webhooks, Roadmap Green',
    changes: [
      { type: 'New',      text: 'Hashtag Collections — save and reuse named hashtag sets. Manage collections at /hashtag-collections. Compose now has AI Suggest / My Collections tabs in the hashtag panel — "Add all" inserts a full collection with no-duplicate check.' },
      { type: 'New',      text: 'Zapier / Outbound Webhooks — fire signed POST requests on post.published and post.failed events. Add webhook URLs in Settings → Integrations. HMAC-SHA256 signed payloads, compatible with Zapier, Make, n8n, and any custom receiver. Docs at /integrations.' },
      { type: 'New',      text: 'Blog auto-generation (Studio Stax) — Gemini writes a blog feature post for each Studio Stax lister at the 90-day mark, then every 90 days while active. Lister gets notified by email when live. Cron: /api/cron/stax-blog-gen.' },
      { type: 'Improved', text: 'Roadmap voting section removed — too early. Will revisit when user base grows. Roadmap is now nearly all green — only API-gated platforms (Instagram, Facebook, Threads, iOS) remain.' },
      { type: 'Improved', text: 'All remaining Gemini 1.5-flash calls upgraded to 2.5-flash across stax-blog-gen, HERMES discover, and HERMES generate routes.' },
    ],
  },
  {
    date: 'May 22, 2026',
    version: 'IRIS AI Draft, Docs Rule, vs/ Expansion',
    changes: [
      { type: 'New',      text: 'IRIS Dispatch AI auto-generate — "Generate draft with AI" button in the /admin/iris compose UI. Gemini 2.5-flash writes a complete newsletter draft (subject, intro, what shipped, real numbers, what\'s next, closing) using Joshua\'s voice rules. Passes previous subject lines to avoid repeated angles. Fields pre-fill on success.' },
      { type: 'New',      text: 'Docs update rule — whenever llms.txt is updated, CLAUDE.md + changelog + roadmap are all updated in the same flow. No more out-of-sync project context.' },
      { type: 'Improved', text: 'New vs/ comparison pages added — TweetHunter, Circleboom, Postly, PromoRepublic, SocialOomph, and more. Sitemap updated.' },
      { type: 'Improved', text: 'Blog batch 13 — 30 posts covering LinkedIn scheduling, TikTok scheduling, and multi-platform content strategy. All live in DB.' },
    ],
  },
  {
    date: 'May 21, 2026',
    version: 'LinkedIn Now Live — 7 Platforms',
    changes: [
      { type: 'New',      text: 'LinkedIn OAuth integration live. Connect your personal LinkedIn profile at /accounts and schedule posts directly from /compose.' },
      { type: 'New',      text: 'Platform count updated to 7. LinkedIn joins Discord, Bluesky, Telegram, Mastodon, X/Twitter, and TikTok as a fully live platform.' },
      { type: 'Improved', text: 'Bluesky character limit now counts graphemes (not UTF-16 code units), so posts with emojis no longer get incorrectly rejected before reaching Bluesky.' },
      { type: 'Fixed',    text: 'Enki: pending trades are now bulk-cancelled when switching to autonomous mode. The pending approvals banner is hidden in autonomous mode.' },
      { type: 'New',      text: 'SocialMate Discord community server launched. Join at discord.gg/2se6FGrbRU — linked in the sidebar under Community.' },
    ],
  },
  {
    date: 'May 20, 2026',
    version: 'HESTIA, SIGIL, Guides PDF, Achievements, Scheduling Windows + More',
    changes: [
      { type: 'New',      text: 'HESTIA — community tab at /community. Post wins, questions, tips, feedback, and intros. Emoji reactions, threaded replies, and a connected-account gate to keep it real.' },
      { type: 'New',      text: 'SIGIL — Link in Bio renamed to SIGIL. Same feature, new identity consistent with the SocialMate mythology naming system (HERMES, ENKI, SOMA, IRIS, SIGIL, HESTIA).' },
      { type: 'New',      text: 'Guides PDF download — "Download as PDF" button on all 5 Gilgamesh Guides. Opens native print dialog with a faint SocialMate watermark baked into the background. No external services.' },
      { type: 'New',      text: 'Achievements — 13 badges across Posts, Streaks, Tenure, and Account categories. Unlocking awards earned credits. Progress bars for locked badges. Accessed at /achievements and linked in the Grow section of the sidebar.' },
      { type: 'New',      text: '30-day Creator Challenge — post every day for 30 days and earn 50 bonus credits. Daily progress heatmap and day counter at /challenge.' },
      { type: 'New',      text: 'Scheduling window — set your posting hours (e.g. 9am–9pm) and a Do-Not-Disturb window in Settings → Scheduling. Smart Queue now respects your configured window.' },
      { type: 'New',      text: 'Post Score — AI quality scorer for post drafts (Pro+, 5 credits). Rates 0–100 with feedback on hook, clarity, and engagement potential.' },
      { type: 'New',      text: 'Built with SocialMate badge — embeddable SVG badge at /badge.svg. Copy the embed code from Settings → Profile to show it on your site.' },
      { type: 'New',      text: 'Discount page at /discount — NONPROFIT50 (50% off Pro) and STUDENT25 (25% off Pro). Honor system, no email verification required.' },
      { type: 'Improved', text: 'Goal-based onboarding — Step 1 now asks your goal (schedule content / grow audience / manage clients). Saved to your profile.' },
      { type: 'Improved', text: 'UpgradeNudge dismiss now monthly instead of 7-day — dismissing resets at the start of each month.' },
      { type: 'Improved', text: 'HERMES upgraded to Gemini 2.5-flash — faster, smarter content generation.' },
      { type: 'Improved', text: 'AI rate limiting — 10 AI requests per minute per user to prevent abuse.' },
    ],
  },
  {
    date: 'May 19, 2026',
    version: 'Bluesky Fix + Error Visibility',
    changes: [
      { type: 'Fixed',    text: 'Bluesky token rotation race condition — when Inngest fired multiple Bluesky posts concurrently, the second post would fail with "authentication failed" because the first post had already rotated the shared refresh token. Fixed by re-reading the freshest token from the database on refresh failure.' },
      { type: 'Fixed',    text: 'SOMA post scheduling jitter — all morning/afternoon/evening posts were scheduled at exactly the same second (09:00:00, 14:00:00, 19:00:00), causing the token race condition. Posts now spread randomly across a 44-minute window within each slot.' },
      { type: 'Improved', text: 'Publish error visibility — failure reasons per platform are now saved to the database. Hovering over a failed or partial post in the calendar now shows the actual error message (e.g. "Bluesky failed: session expired") instead of just a red X.' },
      { type: 'Fixed',    text: 'Calendar platform breakdown now also renders for fully-failed posts, not just partial ones.' },
    ],
  },
  {
    date: 'May 18, 2026',
    version: 'Nav Polish + Bug Sweep',
    changes: [
      { type: 'New',      text: 'TikTok Studio added to header nav — now accessible from the main nav on desktop and mobile Products section.' },
      { type: 'New',      text: 'TikTok Creators and Video Creators added to the Audiences dropdown in nav.' },
      { type: 'Fixed',    text: 'Calendar status badges now correctly handle pending_approval posts — added purple styling so approval-queue posts are visible on the calendar instead of falling through to an unstyled fallback.' },
      { type: 'Fixed',    text: 'blog_batch_11.sql — corrected INTERVAL syntax (doubled single-quotes) that would cause an error when running in Supabase.' },
      { type: 'Fixed',    text: 'Social media glossary and vs/ comparison pages (Canva, Plann, Social Champ, Ripl, Preview App, Gain, Kontentino, Unum, Planly, Vista Social, Flick) added to sitemap and llms.txt.' },
    ],
  },
  {
    date: 'May 18, 2026',
    version: 'TikTok Now Live — 6 Platforms',
    changes: [
      { type: 'New',      text: 'TikTok Production API approved. SocialMate now supports 6 live platforms. Connect your TikTok account at /accounts and schedule videos from TikTok Studio at /tiktok/studio.' },
      { type: 'Improved', text: 'Platform count updated to 6 across all pages, marketing copy, and metadata.' },
      { type: 'Fixed',    text: 'TikTok Studio sandbox banner removed. All sandbox restrictions lifted.' },
    ],
  },
  {
    date: 'May 18, 2026',
    version: 'TikTok Script Generator + GIF Export + 30 Blog Posts',
    changes: [
      { type: 'New', text: 'TikTok Script Generator — AI tool at /ai-features/tiktok-script. Generates hook + body + CTA for 15s/30s/60s TikToks. 5 credits, Gemini-powered.' },
      { type: 'New', text: 'GIF Export in Creator Studio — export any trimmed/filtered clip as an animated GIF. Capped at 5 seconds, 480px wide. No external services.' },
      { type: 'New', text: 'AI Features page — new Video & TikTok Tools section with TikTok Script Generator, Creator Studio, and Clips Studio cards. TikTok live banner added.' },
      { type: 'New', text: '30 new blog posts covering TikTok scheduling, Twitch/YouTube clip repurposing, short-form video strategy, GIFs for social media, and creator tool stacks. 270+ total posts.' },
    ],
  },
  {
    date: 'May 17, 2026',
    version: "Full-App i18n Complete + Guide Vol. 5 + Calendar Fix",
    changes: [
      { type: 'New',      text: "Gilgamesh's Guide Vol. 5 — Creator Monetization live at /guides/creator-monetization. 8 chapters covering tip jars, fan subscriptions, digital products, brand deals, affiliate income, and a realistic 12-month $5K/month roadmap. Free, no gate, no upsell." },
      { type: 'New',      text: 'Full-app i18n complete — all major app pages now translate in 7 languages (en/es/de/fr/pt/ru/zh). Covers Dashboard, Queue, Calendar, Compose, Analytics, Accounts, Inbox, Team, Drafts, Streak, Links, Activity, Media, AI Features, Agents, SOMA, Enki, Creator Hub, and public creator pages.' },
      { type: 'New',      text: 'Birthday promo BDAY31 now active — 31% off any plan through December 15, 2026. Code: BDAY31. Apply at /pricing.' },
      { type: 'Fixed',    text: 'Calendar definitively fixed — explicit column select caused silent null returns when any column was missing. Changed to select(*) with a wsLoading guard throughout. All scheduled posts now load correctly.' },
      { type: 'Fixed',    text: 'Language switcher on public landing pages — now navigates to the correct locale URL instead of only writing to localStorage (which had no effect on server-rendered pages).' },
      { type: 'New',      text: 'TikTok Production API approved — TikTok is now a fully live platform. Connect at /accounts, schedule and publish videos from TikTok Studio at /tiktok/studio. Platform count updated to 6. Sandbox restrictions lifted.' },
    ],
  },
  {
    date: 'May 16, 2026',
    version: 'i18n Architecture Rewrite',
    changes: [
      { type: 'Fixed',    text: 'Removed next-intl plugin from next.config.ts — createNextIntlPlugin injects a webpack alias that Turbopack silently ignores, causing a runtime "config not found" error. Rewrote LocalizedLanding.tsx with direct JSON imports and a createT() helper function.' },
      { type: 'Improved', text: 'Public landing pages now server-render correctly in 7 languages via locale URL routes (/es, /de, /fr, /pt, /ru, /zh). TypeScript enforces all locale files match the en.json shape at build time.' },
    ],
  },
  {
    date: 'May 14, 2026',
    version: 'Admin Insights + Growth Infrastructure',
    changes: [
      { type: 'New',      text: 'IRIS Dispatch — biweekly build-in-public newsletter. Admin compose UI at /admin/iris with live preview, recipient count, send history. Subscribers manage opt-in in Settings → Notifications. One-click unsubscribe in every email.' },
      { type: 'New',      text: 'Monthly credits reset email — automatic Resend email on the 1st of each month reminding users their credits refreshed. Free users get a soft Pro upgrade nudge.' },
      { type: 'New',      text: 'Admin God Mode improvements — stat cards are now clickable (drill into filtered user lists). Platform distribution section shows connected account counts per platform across all real users.' },
      { type: 'New',      text: 'Open Graph metadata for link-in-bio and creator pages — each public bio and creator page now generates its own og:title, og:description, and twitter card. Blog posts now include og:image.' },
      { type: 'Improved', text: '"Made with SocialMate" badge on link-in-bio pages — upgraded from near-invisible to a proper amber-accented pill that adapts to light and dark page backgrounds.' },
      { type: 'Improved', text: 'Admin overview stats now exclude the admin account — Pro count, Agency count, MRR, SOMA autopilot count, churn signals, and recent signups all reflect real paying users only.' },
      { type: 'Fixed',    text: 'Admin users page — useSearchParams wrapped in Suspense boundary to fix Next.js 15 build error.' },
    ],
  },
  {
    date: 'May 9, 2026',
    version: 'SOMA Voice DNA + Project Memory + Google Play',
    changes: [
      { type: 'New',      text: 'SOMA Voice DNA Builder — 40-question personality interview in 3 tiers (Foundation / Deep Dive / Advanced). Gemini writes a 150–200 word Voice DNA summary injected into every content prompt. SOMA stops guessing and starts sounding like you.' },
      { type: 'New',      text: 'SOMA Project Memory — each project tracks running manager notes, topics covered, angles used, and total posts generated. Ingest reads memory and tells Gemini what NOT to repeat. Clear memory button for fresh start.' },
      { type: 'New',      text: 'Post-publish feedback modal — "Give feedback" button after generate runs. 3 questions from a pool of 8 (voice match, more-of, what missed). Every response rebuilds Voice DNA from last 20 answers.' },
      { type: 'New',      text: 'SOMA project ingest now supports up to 500k character documents — full doc, no truncation or slicing.' },
      { type: 'Improved', text: 'Google Play closed testing active — internal + closed test tracks live. App requires 12 opted-in testers + 14-day run before production.' },
      { type: 'Fixed',    text: 'Voice DNA done screen linked to /soma/dashboard (was 404). Voice DNA tier badge + "saved" state added to SOMA dashboard identity card.' },
    ],
  },
  {
    date: 'May 6, 2026',
    version: "Gilgamesh's Guides Complete + TikTok + Android + 30 Blog Posts",
    changes: [
      { type: 'New',      text: "Gilgamesh's Guides Vol. 3 — Business Credit, Legal Foundations & Tax Breaks. 7 chapters: DUNS numbers, PAYDEX scores, Net-30 vendors, licenses, Section 179, home office, QBI, S-Corp election, SEP-IRA, banking, and insurance. Free." },
      { type: 'New',      text: "Gilgamesh's Guides Vol. 4 — Vibe Coding with AI. 7 chapters: the full free stack (Next.js/Supabase/Vercel/Stripe/Inngest/Claude Code), build loop workflow, prompting patterns, debugging without panic, first deploy checklist, and the mindset of building in stolen hours. Free." },
      { type: 'New',      text: "Gilgamesh's Guides series complete — all 4 volumes live at /guides. Starting a Business · Marketing on Zero Budget · Business Credit & Tax · Vibe Coding with AI." },
      { type: 'New',      text: 'Google Play CI/CD — GitHub Actions workflow builds a signed Android AAB on every git tag. No Android Studio required. SocialMate is Android-ready.' },
      { type: 'New',      text: 'TikTok Studio live — OAuth connect, video editor (trim, 8 filters, caption overlay), FILE_UPLOAD posting, scheduled publish via Inngest. Production API approved May 17, 2026.' },
      { type: 'New',      text: '30 new blog posts published — business credit, tax strategy, founder story, platform guides, vibe coding, AI builder stack. All indexed in sitemap.' },
      { type: 'Improved', text: 'SocialMate logo fixed site-wide — canonical three-circle icon now displays correctly in nav, footer, Privacy page, and Terms page.' },
      { type: 'Improved', text: 'Privacy policy overhauled for TikTok developer review — per-scope disclosure for user.info.basic, video.upload, and video.publish. App name reconciliation documented.' },
      { type: 'Improved', text: 'Landing page — always dark background. Founder credibility card added. Guides CTA section added. Hero copy tightened.' },
    ],
  },
  {
    date: 'May 1, 2026',
    version: 'Creator Monetization Complete + Paywalled Posts',
    changes: [
      { type: 'New',      text: 'Paywalled posts — 3rd pillar of Creator Monetization. Lock content behind fan subscriptions or one-time unlock payments. Preview visible to all, full content for fans only.' },
      { type: 'New',      text: 'One-time post unlock via Stripe — non-subscribers can pay a set price to unlock a single post without subscribing.' },
      { type: 'New',      text: 'Fan email verification — subscribers enter their payment email on the creator page to unlock all exclusive content. Access persists in browser storage.' },
      { type: 'New',      text: 'SOMA credit packs fully live — Starter (75cr/$4.99), Growth (225cr/$12.99), Pro (500cr/$24.99). Buy in-app from the SOMA dashboard.' },
      { type: 'Improved', text: 'Link in Bio — tip jar and fan subscribe quick-add buttons. One click to add monetization links to your bio page.' },
      { type: 'Improved', text: 'Creator Hub — share section with QR code, copy tip/subscribe links, and Link in Bio shortcut.' },
    ],
  },
  {
    date: 'April 30, 2026',
    version: 'Creator Monetization Hub + Mobile Safety',
    changes: [
      { type: 'New',      text: 'Creator Monetization Hub — tip jars and fan subscriptions powered by Stripe Connect Express. 0% platform cut. Dashboard at /monetize/hub. Public creator page at /creator/[handle].' },
      { type: 'New',      text: 'Stripe Connect Express onboarding — connect your Stripe account in ~2 minutes and start accepting payments immediately.' },
      { type: 'New',      text: 'Capacitor Android wrapper — SocialMate packaged as a native Android app pointed at socialmate.studio. Google Play Store submission guide included.' },
      { type: 'Fixed',    text: 'Toast safe-area fix — all notification toasts now respect the iPhone home indicator. No more overlapping UI on mobile.' },
    ],
  },
  {
    date: 'April 29, 2026',
    version: 'Agents Hub — 8 Autonomous AI Workers',
    changes: [
      { type: 'New', text: 'Agents Hub at /agents — 8 fully autonomous AI agents, each running on its own schedule with zero manual intervention.' },
      { type: 'New', text: 'Email Outreach Agent — Gemini-powered subject + body generation, draft history, 5 credits/email.' },
      { type: 'New', text: 'Growth Scout — analyzes competitor posts and your own content, surfaces growth insights and cadence charts.' },
      { type: 'New', text: 'Newsletter Agent — Sunday 9am cron. Draft mode emails you to review, auto mode sends to your full subscriber list.' },
      { type: 'New', text: 'Client Report Agent — Monday 9am, Agency-only. Generates HTML email reports for clients automatically.' },
      { type: 'New', text: 'Repurpose Agent — Wednesday 9am. Picks your best recent post and repurposes it across 5 formats as drafts.' },
      { type: 'New', text: 'Caption Agent — Daily 11am. Watches your configured RSS feeds and drafts social posts from new articles.' },
      { type: 'New', text: 'Trend Scout — Daily 7am. Analyzes competitor posts and returns 5 trending angles with sample captions and Draft Post buttons.' },
      { type: 'New', text: 'Inbox Agent — Every 2h. Fetches unread Bluesky mentions and generates AI reply drafts with one-click send from /agents/inbox-agent.' },
      { type: 'New', text: 'Schedule Templates — /schedules page with full CRUD. Save and reuse posting schedules across projects.' },
      { type: 'New', text: 'PWA Install Prompt — installable as a home screen app on Android and desktop Chrome.' },
      { type: 'Improved', text: 'Workspace activity logging wired into post publish.' },
    ],
  },
  {
    date: 'April 27-28, 2026',
    version: 'SOMA Per-Platform Scheduling + Queue Bulk Select',
    changes: [
      { type: 'New',      text: 'SOMA per-platform schedule — set different posts/day counts and day-of-week patterns per platform in each project.' },
      { type: 'New',      text: 'SOMA connected-platform filter — new project form only shows platforms you actually have connected.' },
      { type: 'New',      text: 'Queue bulk select — Gmail-style checkboxes, Select All, Select Day, sticky action bar for bulk move/delete.' },
      { type: 'Improved', text: 'SOMA Full Send modal — purchased tiers show "Already Active" instead of a buy button. Full Send badge hidden when active.' },
      { type: 'Fixed',    text: 'Queue mobile safe-area — bulk action bar no longer overlaps iPhone home indicator.' },
    ],
  },
  {
    date: 'April 26, 2026',
    version: 'Content DNA + Inbox + Link Shortener + Streak + A/B Testing',
    changes: [
      { type: 'New',      text: 'Content DNA at /analytics/dna — engagement fingerprint showing best day, time, length, format, top 5 posts, and platform breakdown.' },
      { type: 'New',      text: 'Unified Inbox with replies — Bluesky and Mastodon mentions in one feed. Inline reply composer with char counter and send confirmation.' },
      { type: 'New',      text: 'Compose thread builder — numbered post cards, per-card char counter, auto-split by platform limit. Posts publish 30s apart.' },
      { type: 'New',      text: 'Save as Template — save any compose draft as a reusable template with title and category.' },
      { type: 'New',      text: 'Per-platform compose preview — see how your post will look on Bluesky, Mastodon, X, Discord, and Telegram before publishing.' },
      { type: 'New',      text: 'Link Shortener at /links — create, copy, and track short links at socialmate.studio/go/[slug]. Click counter included.' },
      { type: 'New',      text: 'Posting Streak Heatmap at /streak — GitHub-style 365-day contribution graph, current/longest streak, total posts.' },
      { type: 'New',      text: 'Unread notification badge — 🔔 sidebar bell polls every 60s, red badge capped at 99+.' },
      { type: 'New',      text: 'A/B post variant testing (Pro+) — two variants publish 24h apart, winner declared by engagement automatically.' },
      { type: 'New',      text: 'Recurring posts — Daily/Weekly/Bi-weekly/Monthly repeat toggle in compose with optional end date. 🔁 badge in queue.' },
      { type: 'New',      text: 'Post as image — export any post as a branded 1200×630 PNG card from compose or queue. No dependencies.' },
      { type: 'New',      text: 'Hashtag suggestions — Gemini-powered panel, 12 clickable chips, 1 credit.' },
      { type: 'New',      text: 'Referral landing page at /refer/[code] — personalized page with affiliate name, benefits, and signup CTA.' },
      { type: 'New',      text: 'Weekly digest email — Sunday 8am, posts this week, streak, scheduled count, top post preview.' },
      { type: 'New',      text: 'Enki trade history at /enki/trades — FIFO P&L, win rate, Open/Closed tabs, 25/page. Monday P&L summary email.' },
      { type: 'New',      text: 'Upgrade nudges — dismissible prompts in sidebar, compose, and settings for free users near credit limits.' },
      { type: 'Fixed',    text: 'Enki paper trading — removed non-existent total column from trade inserts. All paper trades were silently failing since launch. Now fixed.' },
    ],
  },
  {
    date: 'April 22-25, 2026',
    version: 'SOMA + Analytics + Creator Studio + Compose',
    changes: [
      { type: 'New',      text: 'SOMA (Self-Optimizing Media Agent) — AI content autopilot. Learns your brand voice, ingests a master doc, generates a full week of platform-native content. Safe / Autopilot / Full Send modes.' },
      { type: 'New',      text: 'SOMA Named Projects — create multiple projects with independent platforms, schedules, and master docs. Agencies can run one project per client.' },
      { type: 'New',      text: 'SOMA credit packs — separate credit pool from AI credits. Pro plan: 500/mo, Agency: 2,000/mo.' },
      { type: 'New',      text: 'Creator Studio video editor at /create — trim, 8 CSS filters, caption overlay, volume, canvas export, thumbnail capture.' },
      { type: 'New',      text: 'Analytics overhaul — SVG area chart, platform breakdown bars, best-times heatmap, Bluesky/Mastodon engagement sync.' },
      { type: 'New',      text: 'Social Inbox at /inbox — unified Bluesky, Mastodon, Telegram, Discord feed. X tab shows coming soon.' },
      { type: 'New',      text: 'Collapsible sidebar — desktop hamburger toggle, icon-only collapsed mode with tooltips, persisted via localStorage.' },
      { type: 'New',      text: 'Dashboard drag-and-drop stat cards — reorder Scheduled/Drafts/Published/This Week. Order persists.' },
      { type: 'New',      text: 'Media Library at /media — upload, browse, and reuse images and videos across posts.' },
      { type: 'New',      text: 'FAQ page at /faq — 6 sections, 30+ questions, straight answers on General, SOMA, Enki, Studio Stax, Billing, Privacy.' },
      { type: 'New',      text: 'Workspace Activity Feed at /activity — last 50 events with actor, action, and relative timestamps.' },
      { type: 'Improved', text: '10 new compose templates — Milestone, Hot Take, Storytime, Value Drop, Question/Poll, Behind the Numbers, Day in My Life, Lesson Learned, Appreciation Post, Promotion.' },
      { type: 'Fixed',    text: 'Dashboard crash fix — dnd-kit hooks moved before early return. Dashboard fully stable.' },
    ],
  },
  {
    date: 'April 20-21, 2026',
    version: 'X Booster + AI Brand Voice + Push Notifications + Smart Queue',
    changes: [
      { type: 'New',      text: 'X Booster one-time packs — Spark (50/$1.99), Boost (120/$4.99), Surge (250/$9.99), Storm (500/$19.99). Credits stack and roll over forever.' },
      { type: 'New',      text: 'AI Brand Voice — define tone, style, vocabulary, and examples. Every AI tool writes in your voice automatically. Pro+ feature.' },
      { type: 'New',      text: 'Smart Queue / Auto-schedule — fills your 14 or 30-day window at platform-optimal times with one click. Pro+ only.' },
      { type: 'New',      text: 'Browser Push Notifications — real-time alerts for post published/failed, Enki trade signals, and X quota warnings. Enable in Settings.' },
      { type: 'New',      text: 'Content Repurposing — turn any post into a thread, email, caption, long-form article, hook, or LinkedIn post. 1 credit, 6 formats.' },
      { type: 'New',      text: 'Platform account jail — 45-day cooldown when disconnecting Twitter/X to prevent quota gaming.' },
      { type: 'New',      text: 'Partial post retry — posts that fail on some platforms show a Retry button to re-attempt only the failed ones.' },
      { type: 'New',      text: 'Enki Guardian toggle on dashboard — Fortress Guard now togglable directly from the Enki dashboard.' },
      { type: 'New',      text: 'Studio Stax per-lister pages at /studio-stax/[slug] — criteria checklist on apply page.' },
      { type: "New",      text: "Gilgamesh's Guide at /gils-guide — free creator/entrepreneur guide. Email capture, donation section." },
      { type: 'Improved', text: 'X/Twitter quotas restructured — Free: 28/mo, Pro: 150/mo, Agency: 400/mo.' },
      { type: 'Improved', text: 'Studio Stax renewal emails — 30/14/7-day Resend drip with STAX20 discount code.' },
    ],
  },
  {
    date: 'April 19, 2026',
    version: 'Quant Engine + Merch + Approvals',
    changes: [
      { type: 'New',      text: 'Enki Quant Engine — ADX filter, TP Ladder (TP1/TP2 partial exits), Kelly position sizing, Correlation Guard, DCA averaging, Sharpe/Sortino tracking, ATR trailing stops. Live for Commander/Emperor tiers.' },
      { type: 'New',      text: 'Merch Store live at /merch — real products via Printify print-on-demand, Stripe checkout, auto-fulfillment, variant image switching.' },
      { type: 'New',      text: 'Content Approval Workflows — team members can submit posts for owner review at /approvals.' },
      { type: 'New',      text: 'X/Twitter Quota Widget — monthly post count, limit, and reset date visible in sidebar stats for all plans. Bar turns yellow at 80%, red at cap.' },
      { type: 'Improved', text: 'SM-Give merch allocation — every merch order now routes 75% of gross revenue to SM-Give.' },
    ],
  },
  {
    date: 'April 12, 2026',
    version: 'The Foundation',
    changes: [
      { type: 'New',      text: "Gilgamesh's Guide landing page + email waitlist (/gilgamesh)" },
      { type: 'New',      text: 'Affiliate activity dashboard in admin — last referral date, total conversions, active count' },
      { type: 'New',      text: 'Warning email system for inactive affiliates' },
      { type: 'New',      text: 'Studio Stax "Approve Free (1yr)" button for admin' },
      { type: 'New',      text: 'Application notification emails for Studio Stax and affiliate applications' },
    ],
  },
  {
    date: 'April 10, 2026',
    version: 'Discord Hub + Analytics',
    changes: [
      { type: 'New',      text: 'Discord Hub — manage multiple Discord servers, analytics per server' },
      { type: 'New',      text: 'Platform stats admin page (/admin/platform-stats)' },
      { type: 'New',      text: 'Inngest polling improvements — better reliability on scheduled posts' },
      { type: 'New',      text: '/support page + /partners explainer page' },
      { type: 'New',      text: 'Admin role management' },
    ],
  },
  {
    date: 'April 5, 2026',
    version: 'Clips + Notifications',
    changes: [
      { type: 'New',      text: 'Twitch clip scheduling — browse clips, one-click schedule' },
      { type: 'New',      text: 'YouTube clips via RSS — no API key required, search any channel' },
      { type: 'New',      text: 'Notification bell in sidebar — post success/failure alerts' },
      { type: 'New',      text: 'Public Twitch clip search — quota-gated, works without auth' },
      { type: 'Improved', text: '/clips page — Twitch/YouTube tab switcher, connected state, quota progress bar' },
    ],
  },
  {
    date: 'April 2, 2026',
    version: 'Studio Stax + White Label',
    changes: [
      { type: 'New',      text: 'Studio Stax public directory (/studio-stax) with ranking algorithm' },
      { type: 'New',      text: 'White label add-on (Basic $20/mo, Pro $40/mo) — custom logo, colors, domain' },
      { type: 'New',      text: 'Studio Stax lister portal (/studio-stax/apply)' },
      { type: 'New',      text: 'Admin Studio Stax management (/admin/studio-stax)' },
      { type: 'Improved', text: 'Pricing page — ROI-focused copy for white label' },
    ],
  },
  {
    date: 'March 30, 2026',
    version: 'Bulk Scheduler + X/Twitter',
    changes: [
      { type: 'New',      text: 'Bulk scheduler — schedule up to 50 posts at once, CSV support' },
      { type: 'New',      text: 'X/Twitter scheduling (pay-per-use, $0.01/tweet) with monthly quotas' },
      { type: 'New',      text: 'Per-platform character limits in composer' },
      { type: 'New',      text: 'Day-of-week auto-fill in bulk scheduler' },
      { type: 'New',      text: 'Media upload in bulk scheduler' },
      { type: 'Improved', text: 'Discord no-account warning in composer' },
    ],
  },
  {
    date: 'March 26, 2026',
    version: 'Launch Day 🚀',
    changes: [
      { type: 'New', text: 'SocialMate officially launches at socialmate.studio' },
      { type: 'New', text: 'Schedule to Bluesky, Discord, Telegram, Mastodon' },
      { type: 'New', text: '12 AI tools (caption, rewrite, hook, thread + more) powered by Google Gemini' },
      { type: 'New', text: 'Three-pool credit system (monthly, earned, purchased)' },
      { type: 'New', text: 'Workspace isolation (personal + client workspaces)' },
      { type: 'New', text: '5-step onboarding tour' },
      { type: 'New', text: '29 sidebar color themes' },
      { type: 'New', text: 'Referral system (+25 credits per paying referral)' },
      { type: 'New', text: 'Link in bio builder (free on all plans)' },
      { type: 'New', text: 'Competitor tracking (3 accounts on free plan)' },
      { type: 'New', text: 'Evergreen content recycling' },
      { type: 'New', text: 'RSS/blog import' },
      { type: 'New', text: 'Calendar view, queue, drafts, bulk scheduling' },
    ],
  },
]

const BADGE_STYLES: Record<BadgeType, string> = {
  New:      'bg-purple-900/50 text-purple-300 border border-purple-700/50',
  Improved: 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
  Fixed:    'bg-green-900/50 text-green-300 border border-green-700/50',
}

export default function ChangelogPage() {
  return (
    <PublicLayout>
      <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        {/* Hero */}
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
          <div
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5 uppercase tracking-widest"
            style={{ backgroundColor: '#1a0f2e', color: '#a78bfa', border: '1px solid #3b1f6e' }}
          >
            Changelog
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            What&apos;s New
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Every update, improvement, and fix — tracked publicly. We ship fast.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto px-6 pb-24">
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-0 top-0 bottom-0 w-px hidden sm:block"
              style={{ backgroundColor: '#222222', left: '11px' }}
            />

            <div className="space-y-12">
              {CHANGELOG.map((entry, index) => (
                <div key={index} className="relative sm:pl-10">
                  {/* Timeline dot */}
                  <div
                    className="absolute hidden sm:block w-6 h-6 rounded-full border-2 -left-[1px]"
                    style={{
                      backgroundColor: '#0a0a0a',
                      borderColor: '#7C3AED',
                      top: '4px',
                      left: '0px',
                    }}
                  >
                    <div
                      className="absolute inset-1 rounded-full"
                      style={{ backgroundColor: '#7C3AED' }}
                    />
                  </div>

                  {/* Card */}
                  <div
                    className="rounded-xl p-6"
                    style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ backgroundColor: '#1a0f2e', color: '#a78bfa', border: '1px solid #3b1f6e' }}
                      >
                        {entry.date}
                      </span>
                      <span className="text-white font-semibold text-base">
                        {entry.version}
                      </span>
                    </div>

                    {/* Changes list */}
                    <ul className="space-y-2.5">
                      {entry.changes.map((change, ci) => (
                        <li key={ci} className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_STYLES[change.type]}`}
                          >
                            {change.type}
                          </span>
                          <span className="text-gray-300 text-sm leading-relaxed">
                            {change.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div
            className="mt-16 rounded-xl p-6 text-center"
            style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
          >
            <p className="text-gray-400 text-sm">
              We ship updates weekly. Follow along on{' '}
              <a
                href="https://bsky.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
              >
                Bluesky
              </a>{' '}
              or{' '}
              <a
                href="/gilgamesh"
                className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
              >
                join the waitlist
              </a>{' '}
              to stay in the loop.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
