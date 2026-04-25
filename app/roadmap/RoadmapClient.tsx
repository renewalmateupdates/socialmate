'use client'
import { useState } from 'react'

type RoadmapItem = {
  title:    string
  desc:     string
  status:   'in-progress' | 'coming-soon' | 'planned' | 'shipped'
  category: string
}

const ROADMAP: RoadmapItem[] = [
  // ── IN PROGRESS ──────────────────────────────────────────
  { title: 'Media Library',              desc: 'Upload, compress, and reuse images and videos across posts. Grid view, filter by type, copy URL, delete. Storage limits per plan.',     status: 'shipped',  category: 'Media'         },

  // ── COMING SOON ───────────────────────────────────────────
  { title: 'Streak notifications',       desc: 'Automated streak tracking with at-risk alerts — get notified when your posting streak is about to break.',        status: 'shipped',  category: 'Analytics'     },
  { title: 'LinkedIn publishing',        desc: 'Full UGC Posts API integration. Requires LinkedIn developer app approval (r/w_member_social).',                 status: 'coming-soon',  category: 'Platforms'     },
  { title: 'YouTube Community Posts',    desc: 'Post to YouTube Community tab (requires 500+ subscribers). OAuth token management complete.',                    status: 'coming-soon',  category: 'Platforms'     },
  { title: 'Pinterest publishing',       desc: 'Pin creation via Pinterest v5 API with board selection. OAuth complete.',                                        status: 'coming-soon',  category: 'Platforms'     },
  { title: 'Blog auto-generation',       desc: 'Gemini writes a blog feature post for each Studio Stax lister once past the refund window. Lister gets notified by email when it\'s live.', status: 'coming-soon', category: 'Platform' },
  { title: 'Creator Monetization Hub',   desc: 'Fan subscriptions, tip jars, and paywalled content for creators — all handled through SocialMate with Stripe.',  status: 'coming-soon',  category: 'Monetization'  },
  { title: 'Content DNA',                desc: 'Cross-platform performance fingerprinting — tells you exactly which formats, lengths, and topics win for your audience.', status: 'coming-soon', category: 'Analytics' },
  { title: 'Unified inbox',              desc: 'Reply to comments, DMs, and mentions across all connected platforms from one inbox inside SocialMate.',          status: 'coming-soon',  category: 'Engagement'    },

  // ── PLANNED ───────────────────────────────────────────────
  { title: 'Instagram publishing',       desc: 'Instagram Graph API integration. Requires Facebook Business account and Meta app review.',                       status: 'planned',      category: 'Platforms'     },
  { title: 'TikTok publishing',          desc: 'TikTok Content Posting API. Requires TikTok developer app approval.',                                            status: 'planned',      category: 'Platforms'     },
  { title: 'Facebook Pages',             desc: 'Facebook Graph API for posting to Business Pages. Requires Meta app review.',                                    status: 'planned',      category: 'Platforms'     },
  { title: 'Threads',                    desc: 'Threads API integration once the API becomes publicly available.',                                                status: 'planned',      category: 'Platforms'     },
  { title: 'Reddit',                     desc: 'Reddit API integration for posting to subreddits. Respects rate limits and flair requirements.',                 status: 'planned',      category: 'Platforms'     },
  { title: 'Browser extension',          desc: 'Save content from any webpage directly to SocialMate drafts or queue with one click.',                           status: 'planned',      category: 'Tools'         },
  { title: 'Post analytics per platform', desc: 'Platform-specific engagement data (impressions, clicks, follows) returned from each platform API.',             status: 'planned',      category: 'Analytics'     },
  { title: 'Native iOS & Android apps',  desc: 'Full mobile apps for iOS and Android. Schedule, compose, and manage posts on the go.',                           status: 'planned',      category: 'Mobile'        },
  { title: 'SOC 2 compliance',           desc: 'Security certification for enterprise white label clients. Required for larger agency contracts.',                status: 'planned',      category: 'Platform'      },

  // ── SHIPPED ───────────────────────────────────────────────
  { title: 'SOMA — Self-Optimizing Media Agent', desc: 'AI agent that diffs your weekly master doc and generates platform-native posts for Twitter, Bluesky, Mastodon, Discord, and Telegram. Named Projects system for agencies. Three modes: Safe (drafts), Autopilot ($10/mo), Full Send ($20/mo). Separate credit pool (Pro: 500/mo, Agency: 2,000/mo). Voice profile interview + approve/edit/skip queue.', status: 'shipped', category: 'AI' },
  { title: 'FAQ page',                           desc: 'Comprehensive FAQ at /faq covering General, SOMA, Enki, Studio Stax, Billing, and Privacy — 30+ questions with straight answers.', status: 'shipped', category: 'Platform' },
  { title: 'Creator Studio video editor', desc: 'Full in-browser video editor — trim (range sliders), 8 CSS filters, caption overlay (size/position/color/bg), volume control, MediaRecorder export at platform-native dimensions, thumbnail capture. At /create.', status: 'shipped', category: 'Media' },
  { title: 'Social Inbox (read)',         desc: 'Unified read-only inbox at /inbox pulling Bluesky notifications, Mastodon mentions/boosts/favourites, Telegram updates, and Discord. Read state via localStorage. X tab shows coming-soon.', status: 'shipped', category: 'Engagement' },
  { title: 'Collapsible sidebar',         desc: 'Desktop sidebar collapses to icon-only mode (w-14) via hamburger toggle. State persists to localStorage. Tooltips on hover in collapsed mode.', status: 'shipped', category: 'Platform' },
  { title: 'Dashboard card reorder',      desc: 'The 4 stat cards (Scheduled, Drafts, Published, This Week) are drag-and-drop reorderable. Order persists to localStorage via @dnd-kit.', status: 'shipped', category: 'Platform' },
  { title: 'AI Brand Voice',             desc: 'Define your tone, style, vocabulary rules, and example posts. Every AI tool automatically writes in your voice. Pro+ feature.', status: 'shipped', category: 'AI' },
  { title: 'Content Repurposing',        desc: 'Turn any post into a thread, email newsletter, caption, long-form article, hook, or LinkedIn post with one click. 1 credit.', status: 'shipped', category: 'AI' },
  { title: 'Smart Queue — Auto-schedule', desc: 'Auto-schedule all drafts at optimal times per platform (Bluesky 9am, Discord 5pm, etc). Pro+ feature. Best-time picker also available in Compose.', status: 'shipped', category: 'Scheduling' },
  { title: 'X-style Analytics Dashboard', desc: '30-day area chart, platform breakdown bars, best-times heatmap, Bluesky engagement sync (likes/reposts/replies), and post history table.', status: 'shipped', category: 'Analytics' },
  { title: 'Browser Push Notifications', desc: 'Real-time browser alerts for Enki trade signals, post published, and X quota warnings. Service worker + VAPID. Enable in Settings → Notifications.', status: 'shipped', category: 'Platform' },
  { title: 'Studio Stax renewal emails', desc: '30/14/7-day Inngest email drip via Resend for expiring listings. Timestamped idempotency guards. 20% renewal discount code STAX20.', status: 'shipped', category: 'Platform' },
  { title: 'Gilgamesh\'s Guide',         desc: 'Free creator/entrepreneur guide at /gils-guide. Email capture via Resend, donation section linked to SM-Give. Three pillars: Build, Create, Become.', status: 'shipped', category: 'Platform' },
  { title: 'Partial post retry',         desc: 'Posts that partially fail (some platforms succeed, others don\'t) now show a Retry button that re-attempts only the failed platforms.', status: 'shipped', category: 'Platform' },
  { title: 'X Booster packs',            desc: 'One-time purchase packs that stack on top of monthly X quota and roll over forever: Spark 50/$1.99, Boost 120/$4.99, Surge 250/$9.99, Storm 500/$19.99.', status: 'shipped', category: 'Platform' },
  { title: 'Platform account jail',      desc: '45-day global cooldown when you disconnect a Twitter/X account — prevents quota gaming by cycling accounts. Admin override available.', status: 'shipped', category: 'Platform' },
  { title: 'Enki Truth Mode',            desc: 'Paper trading validation experiment with Start/Stop control, equity curve vs SPY overlay, sanity warnings, per-strategy stats, and CSV export.', status: 'shipped', category: 'Enki' },
  { title: 'Enki citizen onboarding',    desc: '3-step onboarding flow for new Citizen (paper trading) users explaining Guardian, Truth Mode, and how to go live.', status: 'shipped', category: 'Enki' },
  { title: 'Studio Stax per-lister pages', desc: 'Individual detail pages at /studio-stax/[slug] with NSFW blur-reveal, click tracking, Garrison badge, and SEO metadata.', status: 'shipped', category: 'Platform' },
  { title: 'Discord management hub',     desc: 'Word filter, server automations API, and Manage Server quick-link — all from the SocialMate dashboard.',             status: 'shipped',      category: 'Platforms'     },
  { title: 'X/Twitter quota visibility',  desc: 'Monthly post usage and reset date shown in the sidebar stats section for all plan tiers. Bar turns yellow >80%, red at cap.', status: 'shipped', category: 'Platform' },
  { title: 'Content Approval workflows', desc: 'Team members submit posts for review. Owner approves (schedules) or rejects with a note. Live at /approvals.', status: 'shipped', category: 'Teams' },
  { title: 'Merch store — Printify POD', desc: 'Live merch store at /merch powered by Printify global print-on-demand. Variant image switching, Stripe checkout, auto-fulfillment via webhook. 75% of gross profit → SM-Give.', status: 'shipped', category: 'Platform' },
  { title: 'Weekly content batch system', desc: 'Archive CLAUDE.md weekly as a diff doc, generate 140 posts/week (10/day × 2 platforms × 7 days) from the delta. First batch Apr 20–26 written and saved.', status: 'shipped', category: 'Growth' },
  { title: 'Growth partner program launch', desc: 'First external growth partner (Abdus Sohag) onboarded with full tracking: affiliates + affiliate_profiles records, referral link (?ref=SOHAG), 10% trial commission, partner dashboard access.', status: 'shipped', category: 'Growth' },
  { title: 'SM-Give Stripe webhook integration', desc: 'sm_give_allocations writes added to Stripe webhook: 2% of subscription checkouts recorded as subscription source, 100% of donation checkouts recorded as donation source. Non-fatal, won\'t break payment flow.', status: 'shipped', category: 'Platform' },
  { title: 'Growth partner affiliate account', desc: 'First external growth partner onboarded manually — affiliate record created, user account provisioned, referral tracking linked. Trial commission rate: 10%.', status: 'shipped', category: 'Growth' },
  { title: 'Enki Truth Mode',             desc: 'Paper trading validation experiment for Enki. 50-trade minimum per strategy, equity curve vs SPY overlay, sanity warnings, CSV export, and parameter locks during experiment.', status: 'shipped', category: 'Enki' },
  { title: 'Coupon & partner attribution system', desc: 'Affiliate-linked discount codes with Stripe promo auto-creation, idempotency guards, no double-redemption, coupon input on pricing/onboarding/settings, and commission tracking in webhook.', status: 'shipped', category: 'Growth' },
  { title: '/affiliates public landing page', desc: 'Public partner program page with commission tiers (30%/40%), how-it-works, FAQ, and apply CTA linked to the partner portal.', status: 'shipped', category: 'Growth' },
  { title: 'SM-Give live fund tracker',   desc: 'Pulsing live counter on /give showing real-time dollars allocated to SM-Give by source (subscriptions, donations, affiliate unclaimed, merch).', status: 'shipped', category: 'Platform' },
  { title: 'Disposable email blocker',    desc: 'Blocks 150+ known throwaway email domains at signup and on the magic-link path, preventing free-tier credit farming via temp email re-registration.', status: 'shipped', category: 'Platform' },
  { title: 'Onboarding activation push',  desc: 'Step 8 hero CTA ("Schedule Your First Post") + Day-1 Inngest nudge (20h after signup) that checks for zero posts and sends in-app notification + email if unactivated.', status: 'shipped', category: 'Growth' },
  { title: '/admin/coupons',              desc: 'Admin UI to create and manage affiliate coupon codes. Supports percent, fixed, and trial-extension types. Stripe promo codes auto-created for percent/fixed.', status: 'shipped', category: 'Platform' },
  { title: 'Landing pages in nav',       desc: 'Direct links to For Streamers, For Agencies, For Small Business, and Enki in the top nav — no dropdown, just visible links with a clean divider.', status: 'shipped', category: 'Design' },
  { title: '4-column footer redesign',   desc: 'Organized footer with Product / Solutions / Company / Legal columns across all public pages (PublicLayout + PublicFooter).', status: 'shipped', category: 'Design' },
  { title: 'For Streamers landing page', desc: 'SEO landing page targeting streamers — Twitch clip scheduling, platform grid, how-it-works section, pricing cards, and FAQ.', status: 'shipped', category: 'Growth' },
  { title: 'For Agencies landing page',  desc: 'SEO landing page for agencies — competitor comparison table vs Sprout/Hootsuite/Sendible, white label callout, feature grid.', status: 'shipped', category: 'Growth' },
  { title: 'For Small Business landing page', desc: 'SEO landing page targeting local businesses — persona pills, pain point comparison, pricing grid, and CTA.', status: 'shipped', category: 'Growth' },
  { title: 'Referral page redesign',     desc: 'Auth-aware referral page: logged-in users see their live referral link, 3-stat dashboard, milestone progress bar, and payout history.', status: 'shipped', category: 'Growth' },
  { title: 'Live user stats counter',    desc: 'Public-facing stats pill on the home page showing total users by plan and posts published — updates in real time from Supabase.', status: 'shipped', category: 'Growth' },
  { title: 'Onboarding email sequence',  desc: '3-email drip via Inngest + Resend: welcome on Day 0, AI tools showcase on Day 3, personal upgrade nudge from Joshua on Day 7.', status: 'shipped', category: 'Growth' },
  { title: 'Gilgamesh\'s Guide waitlist', desc: 'Landing page at /gilgamesh for Joshua\'s free entrepreneurship guide. Email waitlist with Supabase capture.', status: 'shipped', category: 'Platform' },
  { title: '/support page',              desc: 'Public FAQ with 10-question accordion, contact card, and quick links to pricing, features, partners, and blog.', status: 'shipped', category: 'Platform' },
  { title: '/changelog page',            desc: 'Public-facing release history in timeline layout with color-coded New/Improved/Fixed badges. Fully static, ships with every update.', status: 'shipped', category: 'Platform' },
  { title: 'Affiliate activity dashboard', desc: 'Admin view showing last referral date, total conversions, and active paying referrals per affiliate. Includes warning email system and deactivate button.', status: 'shipped', category: 'Growth' },
  { title: 'Studio Stax featured spots', desc: 'Admin one-click featured placement + age-weighted donation formula for organic ranking. Admin toggle UI in /admin/studio-stax.', status: 'shipped', category: 'Platform' },
  { title: 'Twitch clip scheduling',     desc: 'OAuth connect flow, clip browser with thumbnail grid, and one-click scheduling of Twitch clips directly to any platform.', status: 'shipped', category: 'Media' },
  { title: 'YouTube clip browser',       desc: 'RSS-based YouTube clip discovery — no API key required. Browse any channel\'s videos and schedule them in one click.', status: 'shipped', category: 'Media' },
  { title: 'Public Twitch clip search',  desc: '"Search Any Channel" on /clips — browse any Twitch channel\'s clips without connecting an account. Quota-gated with progress bar.', status: 'shipped', category: 'Media' },
  { title: 'Discord Hub',               desc: 'Manage multiple Discord servers, view per-server analytics, and post to any server from the SocialMate dashboard.', status: 'shipped', category: 'Platforms' },
  { title: 'X (Twitter) publishing',    desc: 'X API v2 pay-per-use ($0.01/tweet) with monthly quotas (Free: 50, Pro: 200, Agency: 500). Per-workspace quota enforcement.', status: 'shipped', category: 'Platforms' },
  { title: 'Notifications system',       desc: 'Bell icon with unread badge in sidebar. Post published/failed alerts fired via Inngest and delivered in real time.', status: 'shipped', category: 'Platform' },
  { title: 'Competitor tracking',        desc: 'Track up to 3 competitor accounts on Bluesky/Mastodon on the free plan. Inngest fetches and surfaces their content every 6 hours.', status: 'shipped', category: 'Intelligence' },
  { title: 'Evergreen recycling engine', desc: 'Mark posts as evergreen. Inngest daily cron auto-queues them when your schedule runs dry so you never go silent.', status: 'shipped', category: 'Scheduling' },
  { title: 'RSS / Blog Import',          desc: 'Fetch and parse any RSS or Atom feed. Turn entries into scheduled posts in one click.',                          status: 'shipped',      category: 'Import'        },
  { title: 'Calendar view',              desc: 'Monthly calendar showing all scheduled, published, and draft posts. Click any day to see what\'s queued.',       status: 'shipped',      category: 'Scheduling'    },
  { title: 'Studio Stax directory',      desc: 'Founder-curated directory of tools, creators, and projects. Ranked by SM-Give donations + age-weighted formula. Annual listings from $100/yr.', status: 'shipped', category: 'Platform' },
  { title: 'Image & video upload',       desc: 'Attach images and videos directly in the compose screen. Uploads to Supabase Storage and publishes to Discord, Bluesky, Mastodon, and Telegram.', status: 'shipped', category: 'Media' },
  { title: 'SM-Give charity program',    desc: 'Charity initiative embedded in Gilgamesh Enterprise — a portion of revenue funds homeless care, school supplies, and single parent support.', status: 'shipped', category: 'Platform' },
  { title: 'Dark mode',                  desc: 'Full dark mode across all pages with Tailwind dark: variants, system preference detection, and Supabase sync.',  status: 'shipped',      category: 'Design'        },
  { title: 'Mobile layout',             desc: 'Fully responsive across all pages — hamburger nav, proper touch targets (44×44px), iPhone notch safe area, mobile-optimized compose.', status: 'shipped', category: 'Mobile' },
  { title: 'Bulk Scheduler',            desc: 'CSV upload with PapaParse, row validation, preview table with inline editing, per-platform char limits, and batch scheduling.',  status: 'shipped', category: 'Scheduling' },
  { title: 'AI Image Generation',        desc: 'Generate on-brand social images from your post content using Gemini Imagen. Pro+ feature, 25 credits.',          status: 'shipped',      category: 'AI'            },
  { title: 'Bluesky publishing',         desc: 'Full AT Protocol integration with token refresh and post URI tracking.',                                         status: 'shipped',      category: 'Platforms'     },
  { title: 'Discord publishing',         desc: 'Webhook-based posting to Discord channels. Multiple destination support.',                                       status: 'shipped',      category: 'Platforms'     },
  { title: 'Telegram publishing',        desc: 'Bot token + chat ID based posting. HTML parse mode support.',                                                    status: 'shipped',      category: 'Platforms'     },
  { title: 'Mastodon publishing',        desc: 'Per-instance OAuth with token exchange. Supports any Mastodon instance.',                                        status: 'shipped',      category: 'Platforms'     },
  { title: 'Stripe billing',             desc: 'Free, Pro ($5/mo), and Agency ($20/mo) plans with annual options, white label add-ons, and credit pack purchases.', status: 'shipped', category: 'Platform' },
  { title: 'Affiliate & partner program', desc: 'Full affiliate portal with application flow, 30% recurring commissions (40% after 100 referrals), admin activity dashboard, and warning email system.', status: 'shipped', category: 'Growth' },
  { title: 'Collapsible sidebar',        desc: 'Every sidebar section is collapsible and drag-to-reorder. 29 color themes, dark mode toggle — all persisted per user.',  status: 'shipped', category: 'Design' },
  { title: 'Queue drag-to-reorder',      desc: 'Drag posts within a day group to reorder them. Scheduled times redistribute automatically to match the new order.',  status: 'shipped', category: 'Scheduling' },
  { title: 'Analytics dashboard',        desc: '14-day streak trail, streak milestone messages, today highlighted in daily activity chart, best-day callout, per-platform stats.', status: 'shipped', category: 'Analytics' },
  { title: 'AI caption tools',           desc: '12 AI tools: caption generator, hashtag generator, post rewriter, viral hook generator, thread builder, and more. All powered by Google Gemini.', status: 'shipped', category: 'AI' },
  { title: 'Link in Bio builder',        desc: 'Bio page builder with profile, links, themes, and a public URL at /[username]. Free on all plans.',              status: 'shipped',      category: 'Tools'         },
  { title: 'Workspace system',           desc: 'Personal workspace auto-created on signup. Client workspaces on Agency plan. Cookie-scoped isolation.',          status: 'shipped',      category: 'Teams'         },
  { title: 'AI credits system',          desc: 'Three-pool credit system: monthly (resets), earned (referrals), purchased (never expire). Consumed in that order. Real-time sidebar updates.', status: 'shipped', category: 'Platform' },
  { title: 'Scheduled publishing',       desc: 'Inngest-powered scheduling with sleepUntil, retry logic, idempotency guards, and atomic status tracking.',       status: 'shipped',      category: 'Scheduling'    },
  { title: 'Onboarding flow',            desc: '5-step onboarding tour with SM-Give card on final step. Referral system grants +25 credits per paying referral.', status: 'shipped',     category: 'Platform'      },
]

const STATUS_CONFIG = {
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500'   },
  'coming-soon': { label: 'Coming Soon', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  'planned':     { label: 'Planned',     color: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400'   },
  'shipped':     { label: 'Shipped ✅',  color: 'bg-green-100 text-green-700',  dot: 'bg-green-500'  },
}

const ORDER: RoadmapItem['status'][] = ['in-progress', 'coming-soon', 'planned', 'shipped']

export default function RoadmapClient() {
  const [feedbackText, setFeedbackText]   = useState('')
  const [feedbackEmail, setFeedbackEmail] = useState('')
  const [feedbackSent, setFeedbackSent]   = useState(false)
  const [sending, setSending]             = useState(false)

  async function submitRequest() {
    if (!feedbackText.trim()) return
    setSending(true)
    try {
      await fetch('/api/feature-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: feedbackText.trim(),
          email:   feedbackEmail.trim() || null,
        }),
      })
      setFeedbackSent(true)
      setFeedbackText('')
      setFeedbackEmail('')
    } catch {
      setFeedbackSent(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">

      {/* HERO */}
      <div className="mb-14">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Public roadmap</p>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-gray-100">What we're building</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl leading-relaxed mb-8">
          SocialMate is built in public. This is what's in progress, what's coming next, what's planned,
          and what's already shipped. Feature requests welcome at the bottom.
        </p>

        {/* Beta milestone */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Beta milestone — exit to v1.0</p>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Goal: 500 users</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div className="bg-black dark:bg-white h-2 rounded-full transition-all" style={{ width: '4%' }} />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
            When we hit 500 users, SocialMate exits beta — full v1.0 release, expanded platform support, and locked-in pricing for everyone who joined early.
          </p>
        </div>
      </div>

      {/* STATUS LEGEND */}
      <div className="flex flex-wrap gap-3 mb-12">
        {ORDER.map(s => {
          const cfg = STATUS_CONFIG[s]
          const count = ROADMAP.filter(i => i.status === s).length
          return (
            <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color}`}>
              <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {cfg.label} ({count})
            </div>
          )
        })}
      </div>

      {/* SECTIONS */}
      {ORDER.map(status => {
        const items = ROADMAP.filter(i => i.status === status)
        const cfg   = STATUS_CONFIG[status]
        return (
          <div key={status} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <h2 className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-gray-100">{cfg.label}</h2>
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-gray-200 dark:hover:border-gray-600 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{item.title}</p>
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{item.category}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* FEATURE REQUEST FORM */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 mt-8">
        <h2 className="text-lg font-extrabold tracking-tight mb-2 text-gray-900 dark:text-gray-100">Request a feature</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
          Have an idea that's not on the roadmap? Tell us. We read every submission and it genuinely shapes what we build.
        </p>
        {feedbackSent ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-3">🙏</div>
            <p className="text-sm font-extrabold mb-1">Got it — thank you!</p>
            <p className="text-xs text-gray-500">We read every request.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="What should we build? Be specific — the more detail, the better."
              rows={4}
              className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-xl resize-none focus:outline-none focus:border-gray-400 dark:focus:border-gray-400"
            />
            <input
              type="email"
              value={feedbackEmail}
              onChange={e => setFeedbackEmail(e.target.value)}
              placeholder="Your email (optional — we'll update you when it ships)"
              className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-xl focus:outline-none focus:border-gray-400 dark:focus:border-gray-400"
            />
            <button
              onClick={submitRequest}
              disabled={!feedbackText.trim() || sending}
              className="bg-pink-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
              {sending ? 'Sending...' : 'Submit idea →'}
            </button>
          </div>
        )}
      </div>

      {/* SM-Give strip */}
      <div className="border-t border-gray-100 dark:border-gray-800 mt-16 pt-10 pb-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ❤️ <span className="font-semibold text-gray-700 dark:text-gray-300">2% of every SocialMate subscription</span> goes to SM-Give — our charity initiative.{' '}
          <a href="/give" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">Learn about SM-Give →</a>
        </p>
      </div>

    </div>
  )
}
