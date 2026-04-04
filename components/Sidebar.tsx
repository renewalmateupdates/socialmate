'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useWorkspace, PLAN_CONFIG } from '@/contexts/WorkspaceContext'
import ThemeToggle from '@/components/ThemeToggle'
import ComposeShortcut from '@/components/ComposeShortcut'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const COLLAPSED_KEY  = 'sidebar_collapsed_sections'
const ORDER_KEY      = 'sidebar_section_order'
const STATS_VIS_KEY  = 'sidebar_stats_visible'

function getStoredCollapsed(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(COLLAPSED_KEY) || '{}') } catch { return {} }
}

function getStoredOrder(defaultOrder: string[]): string[] {
  if (typeof window === 'undefined') return defaultOrder
  try {
    const stored = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]') as string[]
    // Only use stored order if it has the same sections (handles new sections being added)
    if (stored.length === defaultOrder.length && defaultOrder.every(s => stored.includes(s))) {
      return stored
    }
  } catch {}
  return defaultOrder
}

const STRIPE_PRO_PRICE_ID    = 'price_1T9S2v7OMwDowUuULHznqUD5'
const STRIPE_AGENCY_PRICE_ID = 'price_1TFMHp7OMwDowUuUgeLAeJNY'

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
      { icon: '🤖', label: 'AI Features',  href: '/ai-features'            },
      { icon: '🔥', label: 'SM-Pulse',     href: '/sm-pulse'               },
      { icon: '📡', label: 'SM-Radar',     href: '/sm-radar'               },
      { icon: '🕳️', label: 'Content Gaps', href: '/content-gap'            },
      { icon: '🔭', label: 'Competitors',  href: '/competitor-tracking'    },
      { icon: '📬', label: 'Social Inbox', href: '/social-inbox'           },
      { icon: '🎁', label: 'Referrals',    href: '/affiliate'  },
      { icon: '🤝', label: 'Partners',     href: '/partners'   },
      { icon: '🗺️', label: 'Roadmap',      href: '/roadmap'                },
    ],
  },
  {
    section: 'Manage',
    items: [
      { icon: '🔗', label: 'Accounts',     href: '/accounts'              },
      { icon: '📍', label: 'Destinations', href: '/accounts/destinations' },
      { icon: '👥', label: 'Team',         href: '/team'                  },
      { icon: '♻️', label: 'Evergreen',    href: '/evergreen'             },
      { icon: '📡', label: 'RSS Import',   href: '/rss-import'            },
      { icon: '✅', label: 'Approvals',    href: '/approvals'             },
    ],
  },
  {
    section: 'Account',
    items: [
      { icon: '⚙️', label: 'Settings',      href: '/settings'     },
      { icon: '🔔', label: 'Notifications', href: '/notifications' },
      { icon: '🔎', label: 'Search',        href: '/search'        },
      { icon: '💛', label: 'Our Story',     href: '/story',  newTab: true },
    ],
  },
]

// ── Sortable section header ───────────────────────────────────────────────────
function SortableSectionHeader({
  section, isCollapsed, onToggle, showBorder,
}: {
  section: string
  isCollapsed: boolean
  onToggle: () => void
  showBorder: boolean
}) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: section })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderTop: showBorder ? '1px solid var(--sidebar-border)' : 'none',
  }

  return (
    <div ref={setNodeRef} style={style}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 mt-1 rounded-lg transition-all hover:opacity-70 group"
      >
        {/* Drag handle — only visible on hover */}
        <span
          {...attributes}
          {...listeners}
          className="mr-1.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity text-xs select-none flex-shrink-0"
          style={{ color: 'var(--sidebar-faint)', touchAction: 'none' }}
          onClick={e => e.stopPropagation()}
          title="Drag to reorder"
        >⠿</span>
        <span className="text-xs font-extrabold uppercase tracking-widest flex-1 text-left"
          style={{ color: 'var(--sidebar-faint)' }}>
          {section}
        </span>
        <span className="text-xs" style={{ color: 'var(--sidebar-faint)' }}>
          {isCollapsed ? '▸' : '▾'}
        </span>
      </button>
    </div>
  )
}

const PLAN_BADGE: Record<string, { label: string; color: string }> = {
  free:   { label: 'Free',   color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'         },
  pro:    { label: 'Pro',    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'       },
  agency: { label: 'Agency', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' },
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const [user, setUser]                         = useState<any>(null)
  const [wsOpen, setWsOpen]                     = useState(false)
  const [showUpgradeNudge, setShowUpgradeNudge] = useState(false)
  const [checkoutLoading, setCheckoutLoading]   = useState(false)
  const [collapsed, setCollapsed]               = useState<Record<string, boolean>>({})
  const [sectionOrder, setSectionOrder]         = useState<string[]>(NAV_BASE.map(g => g.section))
  const [statsVisible, setStatsVisible]         = useState(true)
  const [scheduledCount, setScheduledCount]     = useState(0)
  const pathname = usePathname()
  const router   = useRouter()

  useEffect(() => {
    setCollapsed(getStoredCollapsed())
    setSectionOrder(getStoredOrder(NAV_BASE.map(g => g.section)))
    try {
      const stored = localStorage.getItem(STATS_VIS_KEY)
      if (stored !== null) setStatsVisible(stored !== 'false')
    } catch {}
  }, [])

  const toggleStats = useCallback(() => {
    setStatsVisible(prev => {
      const next = !prev
      try { localStorage.setItem(STATS_VIS_KEY, String(next)) } catch {}
      return next
    })
  }, [])

  const toggleSection = useCallback((section: string) => {
    setCollapsed(prev => {
      const next = { ...prev, [section]: !prev[section] }
      try { localStorage.setItem(COLLAPSED_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSectionOrder(prev => {
      const oldIndex = prev.indexOf(active.id as string)
      const newIndex = prev.indexOf(over.id as string)
      const next = arrayMove(prev, oldIndex, newIndex)
      try { localStorage.setItem(ORDER_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const {
    workspaces, activeWorkspace, setActiveWorkspace,
    plan, credits, creditsTotal, monthlyCredits, earnedCredits, paidCredits, seatsUsed, seatsTotal, loading,
  } = useWorkspace()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  // Scheduled post count badge on Queue link
  useEffect(() => {
    let uid: string | null = null

    const fetchCount = async (userId: string) => {
      const now = new Date().toISOString()
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'scheduled')
        .gt('scheduled_at', now)
      setScheduledCount(count ?? 0)
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      uid = data.user.id
      fetchCount(uid)
    })

    const channel = supabase
      .channel('sidebar-scheduled')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' },
        () => { if (uid) fetchCount(uid) }
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' },
        () => { if (uid) fetchCount(uid) }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(true)
    try {
      const res  = await fetch('/api/stripe/checkout', {
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

  const clientWorkspaces  = workspaces.filter((w: any) => !w.is_personal)
  const personalWorkspace = workspaces.find((w: any) => w.is_personal)
  const wsLimit           = PLAN_CONFIG[plan]?.clientWorkspaces ?? 0
  const atWsLimit         = clientWorkspaces.length >= wsLimit

  const NAV_ENRICHED = NAV_BASE.map(group => {
    if (group.section === 'Manage' && (plan === 'agency' || plan === 'pro')) {
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

  // Apply user-defined section order
  const NAV = sectionOrder
    .map(s => NAV_ENRICHED.find(g => g.section === s))
    .filter(Boolean) as typeof NAV_ENRICHED

  const badge         = PLAN_BADGE[plan] || PLAN_BADGE.free
  const monthlyLimit  = PLAN_CONFIG[plan]?.credits ?? 50
  const totalCredits  = credits  // already sum of all pools from context
  const creditsBar    = monthlyLimit > 0 ? Math.max(0, Math.min((monthlyCredits / monthlyLimit) * 100, 100)) : 0
  // Credit bar color — red/yellow/accent based on monthly remaining
  const creditBarColor = monthlyCredits < 10 ? '#f87171' : monthlyCredits < 20 ? '#facc15' : 'var(--accent, #22c55e)'
  const seatsBar      = seatsTotal > 0 ? Math.min(100, (seatsUsed / seatsTotal) * 100) : 0

  const ADMIN_EMAIL   = 'socialmatehq@gmail.com'
  const isAdminUser   = user?.email === ADMIN_EMAIL

  const isActive = (href: string) => {
    const base = href.split('?')[0]
    return pathname === base || pathname === href
  }

  return (
    <div className="w-56 flex flex-col h-full" style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', color: 'var(--sidebar-fg)' }}>

      {/* HEADER */}
      <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--sidebar-fg)', color: 'var(--sidebar-bg)' }}>S</div>
            <span className="font-bold text-base tracking-tight" style={{ color: 'var(--sidebar-fg)' }}>SocialMate<span className="text-[10px] font-semibold bg-pink-500 text-white px-1.5 py-0.5 rounded-full align-super ml-1">Beta</span></span>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'var(--sidebar-active)', color: 'var(--sidebar-muted)' }}>
            {badge.label}
          </span>
        </div>

        {/* WORKSPACE SWITCHER */}
        <div className="relative">
          <button
            onClick={() => { setWsOpen(p => !p); setShowUpgradeNudge(false) }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'var(--sidebar-active)', border: '1px solid var(--sidebar-border)', color: 'var(--sidebar-muted)' }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{activeWorkspace?.is_personal ? '🏠' : '🏢'}</span>
              <span className="truncate">{activeWorkspace?.name || 'My Workspace'}</span>
            </div>
            <span className="flex-shrink-0 ml-1" style={{ color: 'var(--sidebar-faint)' }}>{wsOpen ? '▲' : '▼'}</span>
          </button>

          {wsOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg z-50 overflow-hidden"
              style={{ background: 'var(--sidebar-active)', border: '1px solid var(--sidebar-border)' }}>
              {personalWorkspace && (
                <button
                  onClick={() => { setActiveWorkspace(personalWorkspace); setWsOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-left transition-all hover:opacity-80"
                  style={{
                    background: activeWorkspace?.id === personalWorkspace.id ? 'var(--sidebar-border)' : 'transparent',
                    color: activeWorkspace?.id === personalWorkspace.id ? 'var(--sidebar-fg)' : 'var(--sidebar-muted)',
                  }}>
                  <span>🏠</span>
                  <span className="truncate">My Workspace</span>
                  {activeWorkspace?.id === personalWorkspace.id && <span className="ml-auto" style={{ color: 'var(--sidebar-fg)' }}>✓</span>}
                </button>
              )}

              {(plan === 'pro' || plan === 'agency') && clientWorkspaces.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ borderTop: '1px solid var(--sidebar-border)', color: 'var(--sidebar-faint)' }}>
                    Clients
                  </div>
                  {clientWorkspaces.map((ws: any) => (
                    <button key={ws.id}
                      onClick={() => { setActiveWorkspace(ws); setWsOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-left transition-all hover:opacity-80"
                      style={{
                        background: activeWorkspace?.id === ws.id ? 'var(--sidebar-border)' : 'transparent',
                        color: activeWorkspace?.id === ws.id ? 'var(--sidebar-fg)' : 'var(--sidebar-muted)',
                      }}>
                      <span>🏢</span>
                      <span className="truncate">{ws.client_name || ws.name}</span>
                      {activeWorkspace?.id === ws.id && <span className="ml-auto" style={{ color: 'var(--sidebar-fg)' }}>✓</span>}
                    </button>
                  ))}
                </>
              )}

              {plan === 'pro' && !atWsLimit && (
                <Link href="/workspaces/new" onClick={() => setWsOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-all hover:opacity-80"
                  style={{ borderTop: '1px solid var(--border)', color: 'var(--text-faint)', display: 'flex' }}>
                  <span>+</span> Add client workspace
                </Link>
              )}
              {plan === 'pro' && atWsLimit && (
                <Link href="/settings?tab=Plan" onClick={() => setWsOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-blue-500 hover:opacity-80 transition-all"
                  style={{ borderTop: '1px solid var(--border)', display: 'flex' }}>
                  <span>⚡</span> Upgrade for more workspaces
                </Link>
              )}
              {plan === 'agency' && !atWsLimit && (
                <Link href="/workspaces/new" onClick={() => setWsOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-all hover:opacity-80"
                  style={{ borderTop: '1px solid var(--border)', color: 'var(--text-faint)', display: 'flex' }}>
                  <span>+</span> Add client workspace
                </Link>
              )}
              {plan === 'agency' && atWsLimit && (
                <a href="mailto:support@socialmate.studio" onClick={() => setWsOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-purple-500 hover:opacity-80 transition-all"
                  style={{ borderTop: '1px solid var(--border)', display: 'flex' }}>
                  <span>✉️</span> Contact us for more
                </a>
              )}
              {plan === 'free' && (
                <>
                  <button
                    onClick={() => setShowUpgradeNudge(p => !p)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-purple-500 hover:opacity-80 transition-all"
                    style={{ borderTop: '1px solid var(--border)' }}>
                    <span>🏢</span>
                    <span>Client workspaces</span>
                    <span className="ml-auto text-purple-300 text-xs">Pro+</span>
                  </button>
                  {showUpgradeNudge && (
                    <div className="px-3 py-3 bg-purple-50 dark:bg-purple-900/20" style={{ borderTop: '1px solid var(--border)' }}>
                      <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold mb-1">Client workspaces</p>
                      <p className="text-xs text-purple-500 dark:text-purple-400 mb-2 leading-relaxed">
                        1 client workspace on Pro. Up to 5 on Agency.
                      </p>
                      <button
                        onClick={() => { setWsOpen(false); handleCheckout(STRIPE_PRO_PRICE_ID) }}
                        disabled={checkoutLoading}
                        className="w-full text-center bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-80 transition-all disabled:opacity-60">
                        {checkoutLoading ? 'Loading...' : 'Upgrade to Pro →'}
                      </button>
                    </div>
                  )}
                </>
              )}
              {plan === 'pro' && (
                <button
                  onClick={() => { setWsOpen(false); router.push('/settings/plan') }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                  style={{ borderTop: '1px solid var(--border)' }}>
                  🚀 Upgrade to Agency — $20/mo
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
            {NAV.map((group, gi) => {
              const isCollapsed = !!collapsed[group.section]
              return (
                <div key={group.section}>
                  <SortableSectionHeader
                    section={group.section}
                    isCollapsed={isCollapsed}
                    onToggle={() => toggleSection(group.section)}
                    showBorder={gi > 0}
                  />
                  {!isCollapsed && group.items.map(item => {
                    // Admin: Partners link goes directly to the admin portal
                    const href   = isAdminUser && item.href === '/partners' ? '/admin' : item.href
                    const active = isActive(href)
                    return (
                      <Link key={item.label} href={href}
                        onClick={onNavClick}
                        {...((item as any).newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background:  active ? 'var(--sidebar-active)' : 'transparent',
                          color:       active ? 'var(--sidebar-fg)' : 'var(--sidebar-muted)',
                          fontWeight:  active ? '700' : '500',
                          borderLeft:  active ? '3px solid var(--sidebar-accent)' : '3px solid transparent',
                          paddingLeft: active ? '10px' : '12px',
                        }}>
                        <span>{item.icon}</span>
                        <span className="flex-1">{item.label}{isAdminUser && item.href === '/partners' ? ' ⚙️' : ''}</span>
                        {item.href === '/ai-features' && !loading && (
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                            credits < 10 ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' :
                            credits < 20 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          }`}>{credits}</span>
                        )}
                        {item.href === '/queue' && scheduledCount > 0 && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            {scheduledCount}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )
            })}
          </SortableContext>
        </DndContext>
      </nav>

      {/* BOTTOM STATS */}
      <div className="p-3 space-y-2.5 flex-shrink-0" style={{ borderTop: '1px solid var(--sidebar-border)' }}>

        {/* Stats section collapse toggle */}
        <button
          id="tour-sidebar-collapse"
          onClick={toggleStats}
          className="w-full flex items-center gap-1.5 px-1 py-0.5 transition-all hover:opacity-70"
          title={statsVisible ? 'Hide stats' : 'Show stats'}
        >
          <span className="text-xs" style={{ color: 'var(--sidebar-faint)' }}>
            {statsVisible ? '▾' : '▸'}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--sidebar-faint)' }}>
            Stats
          </span>
        </button>

        {statsVisible && (
          <>
            <div className="rounded-xl p-3" style={{ background: 'var(--sidebar-active)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold" style={{ color: 'var(--sidebar-muted)' }}>AI Credits</span>
                <span className="text-xs font-bold" style={{ color: 'var(--sidebar-fg)' }}>
                  {loading ? '...' : `${totalCredits} left`}
                </span>
              </div>
              <div className="w-full rounded-full h-1.5 mb-2" style={{ background: 'var(--sidebar-border)' }}>
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${creditsBar}%`, background: creditBarColor }} />
              </div>

              {/* Three pools */}
              <div className="space-y-1 mt-1">
                <div className="flex justify-between text-xs" style={{ color: 'var(--sidebar-faint)' }}>
                  <span>📅 Monthly</span>
                  <span>{loading ? '...' : `${monthlyCredits} / ${monthlyLimit}`}</span>
                </div>
                {!loading && earnedCredits > 0 && (
                  <div className="flex justify-between text-xs" style={{ color: 'var(--sidebar-faint)' }}>
                    <span>🎁 Earned</span>
                    <span>{earnedCredits}</span>
                  </div>
                )}
                {!loading && paidCredits > 0 && (
                  <div className="flex justify-between text-xs" style={{ color: 'var(--sidebar-faint)' }}>
                    <span>💳 Purchased</span>
                    <span>{paidCredits}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl p-3" style={{ background: 'var(--sidebar-active)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold" style={{ color: 'var(--sidebar-muted)' }}>Team Seats</span>
                <span className="text-xs font-bold" style={{ color: 'var(--sidebar-fg)' }}>
                  {loading ? '...' : `${seatsUsed}/${seatsTotal}`}
                </span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ background: 'var(--sidebar-border)' }}>
                <div className="h-1.5 rounded-full transition-all"
                  style={{ width: `${seatsBar}%`, background: seatsUsed >= seatsTotal ? '#f87171' : 'var(--sidebar-accent)' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--sidebar-faint)' }}>
                {loading ? 'Loading...' : `${seatsTotal - seatsUsed} seat${seatsTotal - seatsUsed !== 1 ? 's' : ''} left`}
              </p>
            </div>
          </>
        )}

        {plan === 'free' && (
          <button onClick={() => handleCheckout(STRIPE_PRO_PRICE_ID)} disabled={checkoutLoading}
            className="w-full text-center bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
            {checkoutLoading ? 'Loading...' : '⚡ Upgrade to Pro — $5/mo'}
          </button>
        )}
        {plan === 'pro' && (
          <button onClick={() => handleCheckout(STRIPE_AGENCY_PRICE_ID)} disabled={checkoutLoading}
            className="w-full text-center bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
            {checkoutLoading ? 'Loading...' : '🏢 Upgrade to Agency'}
          </button>
        )}

        {/* STUDIO STAX SUGGESTIVE — pro & agency only */}
        {(plan === 'pro' || plan === 'agency') && (
          <Link href="/studio-stax/apply"
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all hover:opacity-80"
            style={{ background: 'var(--sidebar-active)', border: '1px solid var(--sidebar-border)' }}>
            <span className="text-base flex-shrink-0">📦</span>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight" style={{ color: 'var(--sidebar-fg)' }}>Get listed in Studio Stax</p>
              <p className="text-[10px] leading-tight mt-0.5 truncate" style={{ color: 'var(--sidebar-faint)' }}>Founder-approved directory · from $100/yr</p>
            </div>
          </Link>
        )}

        {/* THEME TOGGLE */}
        <ThemeToggle />

        <div className="px-1 pt-1">
          <div className="text-xs truncate mb-1" style={{ color: 'var(--sidebar-faint)' }}>{user?.email}</div>
          <button onClick={handleSignOut}
            className="text-xs transition-all hover:opacity-70"
            style={{ color: 'var(--sidebar-muted)' }}>
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
      <ComposeShortcut />
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-all hover:opacity-80"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}
        aria-label="Open navigation menu">
        <span className="text-lg">☰</span>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 max-w-[85vw] overflow-y-auto transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="relative">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:opacity-80"
            style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}
            aria-label="Close navigation menu">
            ✕
          </button>
          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-screen z-40 overflow-y-auto">
        <SidebarContent />
      </div>
    </>
  )
}
