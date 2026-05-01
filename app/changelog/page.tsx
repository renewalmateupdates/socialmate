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
