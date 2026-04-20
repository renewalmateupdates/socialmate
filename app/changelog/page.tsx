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
