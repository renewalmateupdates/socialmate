'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useWorkspace, PLAN_CONFIG, PLATFORMS_TOTAL } from '@/contexts/WorkspaceContext'

const STRIPE_PRO_PRICE_ID    = 'price_1T9pay7OMwDowUuU7S3G3lNX'
const STRIPE_AGENCY_PRICE_ID = 'price_1T9qAd7OMwDowUuUpzjxLlG2'

const NAV_BASE = [
  {
    section: 'Content',
    items: [
      { icon: '🏠', label: 'Dashboard',      href: '/dashboard'      },
      { icon: '✏️', label: 'Compose',        href: '/compose'        },
      { icon: '📅', label: 'Calendar',       href: '/calendar'       },
      { icon: '📆', label: 'Bulk Scheduler', href: '/bulk-scheduler' },
      { icon: '⏳', label: 'Queue',          href: '/queue'          },
      { icon: '📂', label: 'Drafts',         href: '/drafts'         },
      { icon: '📝', label: 'Templates',      href: '/templates'      },
      { icon: '#️⃣', label: 'Hashtags',       href: '/hashtags'       },
      { icon: '🖼️', label: 'Media Library',  href: '/media'          },
      { icon: '🔗', label: 'Link in Bio',    href: '/link-in-bio'    },
    ],
  },
  {
    section: 'Insights',
    items: [
      { icon: '📊', label: 'Analytics',  href: '/analytics'  },
      { icon: '🔍', label: 'Best Times', href: '/best-times' },
    ],
  },
  {
    section: 'Grow',
    items: [
      { icon: '🤖', label: 'AI Features',    href: '/ai-features'            },
      { icon: '🔥', label: 'SM-Pulse',       href: '/sm-pulse'               },
      { icon: '📡', label: 'SM-Radar',       href: '/sm-radar'               },
      { icon: '🕳️', label: 'Content Gaps',  href: '/content-gap'            },
      { icon: '🔭', label: 'Competitors',    href: '/competitor-tracking'    },
      { icon: '📬', label: 'Social Inbox',   href: '/social-inbox'           },
      { icon: '🎁', label: 'Referrals',      href: '/settings?tab=Referrals' },
      { icon: '🤝', label: 'Affiliate',      href: '/affiliate'              },
    ],
  },
  {
    section: 'Manage',
    items: [
      { icon: '🔗', label: 'Accounts',      href: '/accounts'      },
      { icon: '👥', label: 'Team',          href: '/team'          },
      { icon: '♻️', label: 'Evergreen',     href: '/evergreen'     },
      { icon: '📡', label: 'RSS Import',    href: '/rss-import'    },
      { icon: '✅', label: 'Approvals',     href: '/approvals'     },
    ],
  },
  {
    section: 'Account',
    items: [
      { icon: '⚙️', label: 'Settings',      href: '/settings'      },
      { icon: '🔔', label: 'Notifications', href: '/notifications'  },
      { icon: '🔎', label: 'Search',        href: '/search'         },
      { icon: '💛', label: 'Our Story',     href: '/story'          },
    ],
  },
]

const PLAN_BADGE: Record<string, { label: string; color: string }> = {
  free:   { label: 'Free',   color: 'bg-gray-100 text-gray-500'     },
  pro:    { label: 'Pro',    color: 'bg-blue-100 text-blue-600'     },
  agency: { label: 'Agency', color: 'bg-purple-100 text-purple-600' },
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const [user, setUser] = useState<any>(null)
  const [wsOpen, setWsOpen] = useState(false)
  const [showUpgradeNudge, setShowUpgradeNudge] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    plan,
    credits,
    creditsTotal,
    seatsUsed,
    seatsTotal,
    platformsConnected,
    loading,
  } = useWorkspace()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      if (data.error === 'Unauthorized') router.push('/login')
    } catch {
      console.error('Checkout failed')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const NAV = NAV_BASE.map(group => {
    if (group.section === 'Manage' && plan === 'agency') {
      const hasWs = group.items.find(i => i.href === '/workspaces')
      if (!hasWs) {
        return {
          ...group,
          items: [
            { icon: '🏢', label: 'Workspaces', href: '/workspaces' },
            ...group.items,
          ],
        }
      }
    }
    return group
  })

  const badge       = PLAN_BADGE[plan] || PLAN_BADGE.free
  const creditsBar  = creditsTotal > 0 ? Math.max(0, Math.min((credits / creditsTotal) * 100, 100)) : 0
  const seatsBar    = seatsTotal   > 0 ? Math.min(100, (seatsUsed / seatsTotal) * 100) : 0

  const clientWorkspaces  = workspaces.filter((w: any) => !w.is_personal)
  const personalWorkspace = workspaces.find((w: any) => w.is_personal)

  const isActive = (href: string) => {
    const base = href.split('?')[0]
    return pathname === base || pathname === href
  }

  return (
    <div className="w-56 bg-white border-r border-gray-100 flex flex-col h-full">

      {/* HEADER */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {/* WORKSPACE SWITCHER */}
        <div className="relative">
          <button
            onClick={() => { setWsOpen(p => !p); setShowUpgradeNudge(false) }}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-700 hover:border-gray-300 transition-all">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{activeWorkspace?.is_personal ? '🏠' : '🏢'}</span>
              <span className="truncate">{activeWorkspace?.name || 'My Workspace'}</span>
            </div>
            <span className="text-gray-400 flex-shrink-0 ml-1">{wsOpen ? '▲' : '▼'}</span>
          </button>

          {wsOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
              {personalWorkspace && (
                <button
                  onClick={() => { setActiveWorkspace(personalWorkspace); setWsOpen(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-left hover:bg-gray-50 transition-all ${activeWorkspace?.id === personalWorkspace.id ? 'bg-gray-50 text-black' : 'text-gray-600'}`}>
                  <span>🏠</span>
                  <span className="truncate">My Workspace</span>
                  {activeWorkspace?.id === personalWorkspace.id && <span className="ml-auto text-black">✓</span>}
                </button>
              )}

              {plan === 'agency' && clientWorkspaces.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest border-t border-gray-50">
                    Clients
                  </div>
                  {clientWorkspaces.map((ws: any) => (
                    <button key={ws.id}
                      onClick={() => { setActiveWorkspace(ws); setWsOpen(false) }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-left hover:bg-gray-50 transition-all ${activeWorkspace?.id === ws.id ? 'bg-gray-50 text-black' : 'text-gray-600'}`}>
                      <span>🏢</span>
                      <span className="truncate">{ws.client_name || ws.name}</span>
                      {activeWorkspace?.id === ws.id && <span className="ml-auto text-black">✓</span>}
                    </button>
                  ))}
                </>
              )}

              {plan === 'agency' && (
                <Link href="/workspaces/new" onClick={() => setWsOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-gray-400 hover:text-black hover:bg-gray-50 transition-all border-t border-gray-50">
                  <span>+</span> Add client workspace
                </Link>
              )}

              {plan !== 'agency' && (
                <>
                  <button
                    onClick={() => setShowUpgradeNudge(p => !p)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-purple-500 hover:bg-purple-50 transition-all border-t border-gray-50">
                    <span>🏢</span>
                    <span>Client workspaces</span>
                    <span className="ml-auto text-purple-300 text-xs">Agency</span>
                  </button>
                  {showUpgradeNudge && (
                    <div className="px-3 py-3 bg-purple-50 border-t border-purple-100">
                      <p className="text-xs text-purple-700 font-semibold mb-1">Manage client workspaces</p>
                      <p className="text-xs text-purple-500 mb-2 leading-relaxed">
                        Separate workspaces per client — their own accounts, posts, and analytics.
                      </p>
                      <button
                        onClick={() => { setWsOpen(false); handleCheckout(STRIPE_AGENCY_PRICE_ID) }}
                        disabled={checkoutLoading}
                        className="w-full text-center bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-80 transition-all disabled:opacity-60">
                        {checkoutLoading ? 'Loading...' : 'Upgrade to Agency →'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(group => (
          <div key={group.section}>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-2 mt-1">
              {group.section}
            </div>
            {group.items.map(item => {
              const active = isActive(item.href)
              return (
                <Link key={item.label} href={item.href}
                  onClick={onNavClick}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active ? 'bg-gray-100 text-black font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                  }`}>
                  <span>{item.icon}</span>{item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* BOTTOM STATS */}
      <div className="p-3 border-t border-gray-100 space-y-2.5 flex-shrink-0">

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-500">AI Credits</span>
            <span className="text-xs font-bold text-gray-700">{loading ? '...' : `${credits}/${creditsTotal}`}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full transition-all ${
              creditsBar < 20 ? 'bg-red-400' : creditsBar < 50 ? 'bg-yellow-400' : 'bg-black'
            }`} style={{ width: `${creditsBar}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{loading ? 'Loading...' : `${credits} remaining`}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-500">Team Seats</span>
            <span className="text-xs font-bold text-gray-700">{loading ? '...' : `${seatsUsed}/${seatsTotal}`}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full transition-all ${seatsUsed >= seatsTotal ? 'bg-red-400' : 'bg-black'}`}
              style={{ width: `${seatsBar}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {loading ? 'Loading...' : `${seatsTotal - seatsUsed} seat${seatsTotal - seatsUsed !== 1 ? 's' : ''} left`}
          </p>
        </div>

        {plan === 'free' && (
          <button onClick={() => handleCheckout(STRIPE_PRO_PRICE_ID)} disabled={checkoutLoading}
            className="w-full text-center bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
            {checkoutLoading ? 'Loading...' : '⚡ Upgrade to Pro — $5/mo'}
          </button>
        )}
        {plan === 'pro' && (
          <button onClick={() => handleCheckout(STRIPE_AGENCY_PRICE_ID)} disabled={checkoutLoading}
            className="w-full text-center bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
            {checkoutLoading ? 'Loading...' : '🏢 Upgrade to Agency'}
          </button>
        )}

        <div className="px-1 pt-1">
          <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
          <button onClick={handleSignOut}
            className="text-xs text-gray-400 hover:text-black transition-all">
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* MOBILE HAMBURGER */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm hover:border-gray-400 transition-all">
        <span className="text-lg">☰</span>
      </button>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MOBILE DRAWER */}
      <div className={`md:hidden fixed top-0 left-0 z-50 h-full overflow-y-auto transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="relative">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-3 right-3 z-10 w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-gray-200 transition-all">
            ✕
          </button>
          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:block fixed left-0 top-0 h-screen z-40 overflow-y-auto">
        <SidebarContent />
      </div>
    </>
  )
}