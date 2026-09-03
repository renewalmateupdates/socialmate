'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity, AlertTriangle, ArrowLeft, BarChart3, Crown, Filter, Flag, HandCoins, Lock, MessageSquare, Radar, Send, Share2, Store, Tag, Ticket, Users, type LucideIcon,
} from 'lucide-react'

interface HubStats {
  total_users: number
  posts_today: number
  posts_today_internal: number
  active_affiliates: number
  stax_listings: number
}

// Emoji were the loudest "built by an AI in an afternoon" tell on this screen,
// and this is the one page the founder looks at every day. Lucide marks match
// the public site (PR #522 did the same swap there).
const NAV_CARDS: { icon: LucideIcon; label: string; sub: string; href: string }[] = [
  { icon: Filter,        label: 'Funnel',            sub: 'Signup → connect → publish → paid',          href: '/admin/funnel'         },
  { icon: Radar,         label: 'God Mode Overview', sub: 'Full metrics — users, revenue, churn',       href: '/admin/overview'       },
  { icon: Users,         label: 'Users',             sub: 'Manage all accounts',                        href: '/admin/users'          },
  { icon: HandCoins,     label: 'Partner Admin',     sub: 'Affiliates, payouts & invites',              href: '/admin/partners'       },
  { icon: Share2,        label: 'Affiliates',        sub: 'Payout management',                          href: '/admin/affiliates'     },
  { icon: Ticket,        label: 'Coupons',           sub: 'Create & manage discount codes',             href: '/admin/coupons'        },
  { icon: Store,         label: 'Studio Stax',       sub: 'Listings & approvals',                       href: '/admin/studio-stax'    },
  { icon: Crown,         label: 'Invites & VIP',     sub: 'Invite partners · VIP codes',                href: '/admin/invites'        },
  { icon: MessageSquare, label: 'Feedback',          sub: 'Bug reports & suggestions',                  href: '/admin/feedback'       },
  { icon: Flag,          label: 'Feature Flags',     sub: 'Enable / disable features',                  href: '/admin/feature-flags'  },
  { icon: BarChart3,     label: 'Platform Stats',    sub: 'Posts by platform & trends',                 href: '/admin/platform-stats' },
  { icon: Lock,          label: 'Account Jail',      sub: 'Cooling-period platform accounts',           href: '/admin/platform-jail'  },
  { icon: Tag,           label: 'White Label',       sub: 'Review & approve white label requests',      href: '/admin/white-label'    },
  { icon: Send,          label: 'IRIS Dispatch',     sub: 'Send weekly build-in-public newsletter',     href: '/admin/iris'           },
  { icon: AlertTriangle, label: 'Failure Log',       sub: 'Post failures with per-platform errors',     href: '/admin/failure-log'    },
  { icon: Activity,      label: 'Usage & Errors',    sub: 'AI tools, agents & grouped publish errors',  href: '/admin/usage'          },
]

export default function AdminHubClient() {
  const router = useRouter()
  const [stats, setStats] = useState<HubStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(j => {
        if (j.error) return
        setStats(j)
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [])

  // Colour is a language here, same as the public site: amber is the brand and
  // anything money-shaped, jade is live activity. Nothing gets a colour just to
  // look varied.
  const STAT_CARDS = [
    { label: 'Total Users',       value: stats?.total_users       ?? '—', tone: 'text-amber',        sub: 'real accounts, ours excluded' },
    // Our own SOMA output is shown beside this, never inside it. Every post
    // published in the week to 3 September was ours; folded into one number it
    // read as product usage.
    { label: 'Posts Today',       value: stats?.posts_today       ?? '—', tone: 'text-jade',
      sub: stats && stats.posts_today_internal > 0
        ? `by users · ${stats.posts_today_internal} ours`
        : 'published by users' },
    { label: 'Active Affiliates', value: stats?.active_affiliates ?? '—', tone: 'text-amber',        sub: 'earning commissions' },
    { label: 'Stax Listings',     value: stats?.stax_listings     ?? '—', tone: 'text-ink-high',     sub: 'live in directory'   },
  ]

  return (
    <div className="dark min-h-dvh bg-void">
      {/* A single hairline of gold across the top — the cheapest way to make a
          utility screen feel deliberate rather than scaffolded. */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber to-transparent opacity-60" />

      <div className="max-w-6xl mx-auto px-6 py-10 md:px-8 md:py-14">

        {/* Header */}
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber mb-2">
              Command Center
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-high tracking-tight">
              Admin Hub
            </h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-edge px-4 py-2 text-sm text-ink-muted hover:text-ink-high hover:border-edge-lit transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {STAT_CARDS.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-edge bg-panel p-5 transition-colors hover:border-edge-lit"
            >
              <div className={`font-display text-4xl font-semibold tracking-tight mb-1 ${c.tone} ${statsLoading ? 'opacity-30' : ''}`}>
                {statsLoading ? '—' : c.value}
              </div>
              <div className="text-sm font-medium text-ink-body">{c.label}</div>
              <div className="text-xs text-ink-faint mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint mb-4">
          Sections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_CARDS.map(({ icon: Icon, label, sub, href }) => (
            <a
              key={href}
              href={href}
              className="group relative overflow-hidden rounded-2xl border border-edge bg-panel p-5 transition-all hover:border-amber/45 hover:bg-raised"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-edge bg-raised text-amber transition-colors group-hover:border-amber/40">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="text-sm font-semibold text-ink-high">{label}</div>
              <div className="mt-1 text-xs leading-relaxed text-ink-muted">{sub}</div>
            </a>
          ))}
        </div>

      </div>
    </div>
  )
}
