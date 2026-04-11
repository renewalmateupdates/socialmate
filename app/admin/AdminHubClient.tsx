'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface HubStats {
  total_users: number
  posts_today: number
  active_affiliates: number
  stax_listings: number
}

const NAV_CARDS = [
  { emoji: '👥', label: 'Users',          sub: 'Manage all accounts',           href: '/admin/users'          },
  { emoji: '💰', label: 'Partner Admin',   sub: 'Affiliates, payouts & invites', href: '/admin/partners'       },
  { emoji: '🏪', label: 'Studio Stax',    sub: 'Listings & approvals',          href: '/admin/studio-stax'    },
  { emoji: '👑', label: 'Invites & VIP',  sub: 'Invite partners · VIP codes',   href: '/admin/invites'        },
  { emoji: '💬', label: 'Feedback',       sub: 'Bug reports & suggestions',     href: '/admin/feedback'       },
  { emoji: '🚩', label: 'Feature Flags',  sub: 'Enable / disable features',     href: '/admin/feature-flags'  },
  { emoji: '📊', label: 'Platform Stats', sub: 'Posts by platform & trends',    href: '/admin/platform-stats' },
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

  const STAT_CARDS = [
    { label: 'Total Users',       value: stats?.total_users      ?? '—', color: 'text-blue-600 dark:text-blue-400',   sub: 'registered accounts'    },
    { label: 'Posts Today',       value: stats?.posts_today      ?? '—', color: 'text-green-600 dark:text-green-400', sub: 'published today'         },
    { label: 'Active Affiliates', value: stats?.active_affiliates ?? '—', color: 'text-purple-600 dark:text-purple-400', sub: 'earning commissions'  },
    { label: 'Stax Listings',     value: stats?.stax_listings    ?? '—', color: 'text-amber-600 dark:text-amber-400', sub: 'live in directory'       },
  ]

  return (
    <div className="min-h-dvh bg-theme p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Hub</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">SocialMate command center</p>
          </div>
          <button onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            ← Dashboard
          </button>
        </div>

        {/* Live Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map((c, i) => (
            <div key={i} className="bg-surface border border-theme rounded-2xl p-5">
              <div className={`text-3xl font-black mb-1 ${c.color} ${statsLoading ? 'opacity-40' : ''}`}>
                {statsLoading ? '…' : c.value}
              </div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{c.label}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Navigation Grid */}
        <div className="mb-4">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Sections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {NAV_CARDS.map(card => (
              <a key={card.href} href={card.href}
                className="bg-surface border border-theme rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all block group">
                <div className="text-2xl mb-2">{card.emoji}</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm group-hover:text-black dark:group-hover:text-white transition-colors">
                  {card.label}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.sub}</div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
