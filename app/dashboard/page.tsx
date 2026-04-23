'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import DashboardTour from '@/components/DashboardTour'
import { useWorkspace, PLAN_CONFIG } from '@/contexts/WorkspaceContext'
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
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const PLATFORM_ICONS: Record<string, string> = {
  discord: '💬', bluesky: '🦋', telegram: '✈️', mastodon: '🐘',
  linkedin: '💼', youtube: '▶️', pinterest: '📌', reddit: '🤖',
  instagram: '📸', tiktok: '🎵', twitter: '🐦', facebook: '📘',
}

// Platforms shown on the plan card (live platforms only)
const PLAN_CARD_PLATFORMS = ['bluesky', 'discord', 'telegram', 'mastodon', 'twitter'] as const

const LS_CARD_ORDER_KEY = 'dashboard_card_order'
const DEFAULT_CARD_ORDER = ['scheduled', 'drafts', 'published', 'this-week']

type StatCardDef = {
  id: string
  label: string
  icon: string
  color: string
  value: number
}

function SortableStatCard({ card }: { card: StatCardDef }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-surface border border-theme rounded-2xl p-3 flex flex-col justify-between relative group select-none"
    >
      {/* Drag handle — 6-dot grip, visible on hover */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-40 hover:!opacity-70 cursor-grab active:cursor-grabbing transition-opacity p-1 touch-none"
        aria-label="Drag to reorder"
      >
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" className="text-gray-500">
          <circle cx="2.5" cy="2.5" r="1.5" />
          <circle cx="7.5" cy="2.5" r="1.5" />
          <circle cx="2.5" cy="7" r="1.5" />
          <circle cx="7.5" cy="7" r="1.5" />
          <circle cx="2.5" cy="11.5" r="1.5" />
          <circle cx="7.5" cy="11.5" r="1.5" />
        </svg>
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400 dark:text-gray-500">{card.label}</span>
        <span className="text-sm">{card.icon}</span>
      </div>
      <span className={`text-2xl font-extrabold ${card.color}`}>{card.value}</span>
    </div>
  )
}

type Post = {
  id: string
  content: string
  platforms: string[]
  status: string
  scheduled_at: string
  created_at: string
}

type DashStats = {
  scheduled: number
  drafts: number
  thisWeek: number
  published: number
  todayCount: number
  upcomingCount: number
}

function CreditSuccessModal({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-extrabold mb-2">Credits Added!</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-2">
          Your AI credits have been added and are ready to use right now.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Thank you for supporting SocialMate 🙏
        </p>
        <button onClick={onDismiss}
          className="w-full py-3 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all">
          Let's go! →
        </button>
      </div>
    </div>
  )
}

function DashboardInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [stats, setStats] = useState<DashStats>({
    scheduled: 0, drafts: 0, thisWeek: 0, published: 0, todayCount: 0, upcomingCount: 0,
  })
  const [upcomingPosts, setUpcomingPosts] = useState<Post[]>([])
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [weekCounts, setWeekCounts] = useState<number[]>([0,0,0,0,0,0,0])
  const [streak, setStreak] = useState(0)
  const [creditSource, setCreditSource] = useState<'monthly_first' | 'earned_first' | 'paid_first'>('monthly_first')
  const [welcomeDismissed, setWelcomeDismissed] = useState(true) // default true to avoid flash
  const [xBannerDismissed, setXBannerDismissed] = useState(true) // default true to avoid flash
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [xBoosterBalance, setXBoosterBalance] = useState<number>(0)
  // Plan card — seat roster
  const [seatMembers, setSeatMembers] = useState<{ email: string; role: string }[]>([])
  // Drag-and-drop card order
  const [cardOrder, setCardOrder] = useState<string[]>(DEFAULT_CARD_ORDER)
  const { plan, credits, activeWorkspace, monthlyCredits, earnedCredits, paidCredits } = useWorkspace()

  // DnD sensors — must be declared before any early returns (Rules of Hooks)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => {
    if (searchParams.get('credits') === 'added') setShowCreditModal(true)
  }, [searchParams])

  const handleCreditModalDismiss = () => {
    setShowCreditModal(false)
    window.location.href = '/dashboard'
  }

  useEffect(() => {
    if (!user) return
    supabase.from('user_settings').select('credit_source_preference').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data?.credit_source_preference) setCreditSource(data.credit_source_preference as any)
      })
  }, [user])

  const handleCreditSourceChange = async (source: typeof creditSource) => {
    setCreditSource(source)
    if (user) {
      await supabase.from('user_settings').update({ credit_source_preference: source }).eq('user_id', user.id)
    }
  }

  const applyPosts = (posts: Post[]) => {
    const now        = new Date()
    const weekAgo    = new Date(now); weekAgo.setDate(now.getDate() - 7)
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
    const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999)

    // Treat failed posts that have platform_post_ids as published (repair display only)
    const normalised = posts.map(p =>
      p.status === 'failed' && (p as any).platform_post_ids && Object.keys((p as any).platform_post_ids).length > 0
        ? { ...p, status: 'published' }
        : p
    )

    setStats({
      scheduled:     normalised.filter(p => p.status === 'scheduled' && new Date(p.scheduled_at) > now).length,
      drafts:        normalised.filter(p => p.status === 'draft').length,
      thisWeek:      normalised.filter(p => new Date(p.created_at) >= weekAgo).length,
      published:     normalised.filter(p => p.status === 'published').length,
      todayCount:    normalised.filter(p => p.status === 'scheduled' && new Date(p.scheduled_at) >= todayStart && new Date(p.scheduled_at) <= todayEnd).length,
      upcomingCount: normalised.filter(p => p.status === 'scheduled' && new Date(p.scheduled_at) > now).length,
    })

    setAllPosts(normalised)
    setUpcomingPosts(normalised.filter(p => p.status === 'scheduled' && new Date(p.scheduled_at) > now).slice(0, 4))
    setRecentPosts(
      normalised
        .filter(p => p.status === 'draft' || p.status === 'published')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
    )

    const counts = [0,0,0,0,0,0,0]
    normalised.forEach(p => {
      const d = new Date(p.created_at)
      if (d >= weekAgo) counts[d.getDay()]++
    })
    setWeekCounts(counts)
  }

  useEffect(() => {
    let currentUserId: string | null = null

    const loadPosts = async (uid: string) => {
      const { data: posts } = await supabase
        .from('posts')
        .select('id, content, platforms, status, scheduled_at, created_at, platform_post_ids')
        .eq('user_id', uid)
        .order('scheduled_at', { ascending: true })
      if (posts) applyPosts(posts as Post[])
    }

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      currentUserId = user.id

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile?.onboarding_completed) { router.push('/onboarding'); return }

      await loadPosts(user.id)

      // Load posting streak
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('current_streak')
        .eq('user_id', user.id)
        .single()
      if (settingsData?.current_streak) setStreak(settingsData.current_streak)

      setUser(user)
      setProfile(profile)
      setLoading(false)

      // Restore card order from localStorage
      try {
        const saved = localStorage.getItem(LS_CARD_ORDER_KEY)
        if (saved) {
          const parsed: string[] = JSON.parse(saved)
          // Validate — must contain all 4 default IDs
          if (Array.isArray(parsed) && DEFAULT_CARD_ORDER.every(id => parsed.includes(id))) {
            setCardOrder(parsed)
          }
        }
      } catch {
        // ignore parse errors — use default
      }

      // Show welcome banner for brand-new users who haven't dismissed it
      const dismissed = localStorage.getItem('sm-welcome-dismissed')
      if (!dismissed) setWelcomeDismissed(false)

      // Load connected platforms for X banner AND plan card platform icons
      const { data: accounts } = await supabase
        .from('connected_accounts')
        .select('platform')
        .eq('user_id', user.id)
      const platforms = (accounts || []).map((a: { platform: string }) => a.platform)
      setConnectedPlatforms(platforms)

      // Load seat roster for plan card
      const { data: teamData } = await supabase
        .from('team_members')
        .select('email, role')
        .eq('owner_id', user.id)
        .order('joined_at', { ascending: true })
      setSeatMembers(teamData || [])

      // Show X banner if X not connected and not dismissed
      const xDismissed = localStorage.getItem('sm-x-banner-dismissed')
      if (!xDismissed && !platforms.includes('twitter')) setXBannerDismissed(false)

      // Fetch X Booster balance
      try {
        const quotaRes = await fetch('/api/accounts/twitter/quota')
        if (quotaRes.ok) {
          const quotaData = await quotaRes.json()
          setXBoosterBalance(quotaData.boosterBalance ?? 0)
        }
      } catch {
        // Non-fatal — booster balance defaults to 0
      }
    }
    init()

    // Realtime: re-fetch stats whenever any post changes status
    const channel = supabase
      .channel('dashboard-posts')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        () => { if (currentUserId) loadPosts(currentUserId) }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  const displayName  = profile?.display_name || user?.email?.split('@')[0] || 'there'
  const hour         = new Date().getHours()
  const greeting     = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const planConfig   = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
  const todayDayIdx  = new Date().getDay()
  const DAYS         = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const DAYS_XS      = ['S','M','T','W','T','F','S']
  const maxWeekCount = Math.max(...weekCounts, 1)

  // Streak calculation from posts
  const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0)
  const postedToday = allPosts.some(p => { const pd = new Date(p.created_at); pd.setHours(0,0,0,0); return pd.getTime() === todayMidnight.getTime() })
  // If not posted today, start streak scan from yesterday so an active streak
  // stays visible as "X days — post today to keep it going!"
  const streakStartOffset = postedToday ? 0 : 1
  let currentStreak = 0, tempStreak = 0, currentStreakDone = false
  for (let i = streakStartOffset; i < 365 + streakStartOffset; i++) {
    const d = new Date(todayMidnight); d.setDate(todayMidnight.getDate() - i)
    const hasPost = allPosts.some(p => { const pd = new Date(p.created_at); pd.setHours(0,0,0,0); return pd.getTime() === d.getTime() })
    if (hasPost) { tempStreak++; if (!currentStreakDone) currentStreak = tempStreak }
    else { if (!currentStreakDone) currentStreakDone = true; tempStreak = 0 }
  }
  const trailDays: boolean[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(todayMidnight); d.setDate(todayMidnight.getDate() - i)
    trailDays.push(allPosts.some(p => { const pd = new Date(p.created_at); pd.setHours(0,0,0,0); return pd.getTime() === d.getTime() }))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = cardOrder.indexOf(active.id as string)
    const newIndex = cardOrder.indexOf(over.id as string)
    const newOrder = arrayMove(cardOrder, oldIndex, newIndex)
    setCardOrder(newOrder)
    try { localStorage.setItem(LS_CARD_ORDER_KEY, JSON.stringify(newOrder)) } catch { /* ignore */ }
  }

  // Plan card — seat info
  const planSeatLimit   = planConfig?.seats ?? 2
  // +1 for the owner themselves
  const totalSeatsUsed  = 1 + seatMembers.length
  // All members including owner (for avatar row)
  const planCardMembers = [
    ...(user ? [{ email: user.email ?? '', role: 'owner' }] : []),
    ...seatMembers,
  ]

  // Credits display — monthly bar shows monthly pool usage
  const monthlyLimit = planConfig?.credits ?? 50
  const bankCap      = planConfig?.creditBank ?? 150
  const creditPct    = monthlyLimit > 0 ? Math.min((monthlyCredits / monthlyLimit) * 100, 100) : 0
  const creditColor  = creditPct > 50 ? 'bg-green-500' : creditPct > 20 ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <div className="flex min-h-dvh bg-theme">
      {showCreditModal && <CreditSuccessModal onDismiss={handleCreditModalDismiss} />}
      {user && <DashboardTour userId={user.id} />}
      <Sidebar />
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold tracking-tight">{greeting}, {displayName} 👋</h1>
                {activeWorkspace && !activeWorkspace.is_personal && (
                  <span className="text-xs font-bold px-2.5 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                    🏢 {activeWorkspace.client_name || activeWorkspace.name}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {stats.todayCount > 0
                  ? `${stats.todayCount} post${stats.todayCount !== 1 ? 's' : ''} scheduled today · ${stats.upcomingCount} coming up`
                  : 'Nothing scheduled today — want to change that?'}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link href="/bulk-scheduler"
                className="px-3 py-2 border border-gray-200 bg-white dark:bg-gray-800 dark:text-white rounded-xl text-xs font-semibold hover:border-gray-400 transition-all">
                📅 Bulk Schedule
              </Link>
              <Link href="/compose" id="tour-compose"
                className="px-4 py-2 bg-black text-white rounded-xl text-xs font-semibold hover:opacity-80 transition-all">
                ✏️ Compose
              </Link>
            </div>
          </div>

          {/* WELCOME BANNER — first-time users only */}
          {!welcomeDismissed && stats.published === 0 && stats.scheduled === 0 && (
            <div className="relative bg-gradient-to-r from-black to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 mb-6 text-white overflow-hidden">
              {/* subtle texture */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <button
                onClick={() => { setWelcomeDismissed(true); localStorage.setItem('sm-welcome-dismissed', '1') }}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white/60 hover:text-white text-sm"
                aria-label="Dismiss">✕</button>
              <div className="relative">
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Welcome to SocialMate 🎉</p>
                <h2 className="text-lg font-extrabold mb-4">Let's get your first post out there.</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { step: '1', title: 'Connect an account', sub: 'Link Bluesky, Discord, Telegram, or Mastodon', href: '/accounts', cta: 'Connect →' },
                    { step: '2', title: 'Write your first post', sub: 'Use AI tools to craft the perfect caption', href: '/compose', cta: 'Compose →' },
                    { step: '3', title: 'Schedule or publish', sub: 'Pick a time or go live instantly', href: '/compose', cta: 'Schedule →' },
                  ].map(s => (
                    <a key={s.step} href={s.href}
                      className="bg-white/10 hover:bg-white/15 transition-all rounded-xl p-4 group cursor-pointer">
                      <div className="w-6 h-6 rounded-full bg-white/20 text-white text-xs font-extrabold flex items-center justify-center mb-2">{s.step}</div>
                      <p className="text-sm font-bold mb-0.5">{s.title}</p>
                      <p className="text-xs text-white/60 mb-2 leading-snug">{s.sub}</p>
                      <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{s.cta}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* X/TWITTER BANNER — show if X not connected and not dismissed */}
          {!xBannerDismissed && !connectedPlatforms.includes('twitter') && (
            <div className="relative flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-2xl px-5 py-3.5 mb-4">
              <span className="text-xl flex-shrink-0">🐦</span>
              <p className="text-sm font-semibold text-sky-800 flex-1">
                X/Twitter is now live —{' '}
                <a href="/accounts" className="underline font-bold hover:text-sky-600 transition-colors">
                  connect your account to schedule tweets →
                </a>
              </p>
              <button
                onClick={() => { setXBannerDismissed(true); localStorage.setItem('sm-x-banner-dismissed', '1') }}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-100 hover:bg-sky-200 transition-all text-sky-500 hover:text-sky-700 text-sm flex-shrink-0"
                aria-label="Dismiss">✕</button>
            </div>
          )}

          {/* STREAK CARD */}
          <div className="bg-surface border border-theme rounded-2xl p-4 mb-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentStreak > 0 ? '🔥' : '💤'}</span>
                <div>
                  <div className="text-2xl font-extrabold text-orange-500 leading-none">
                    {currentStreak} day{currentStreak !== 1 ? 's' : ''} streak
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {currentStreak > 0 && !postedToday
                      ? 'Post today to keep it going!'
                      : 'Keep showing up — consistency wins.'}
                  </div>
                </div>
              </div>
              {/* 14-day trail with day letters */}
              <div className="flex items-end gap-1">
                {trailDays.map((active, i) => {
                  const isToday   = i === 13
                  const dayOffset = 13 - i
                  const d = new Date(todayMidnight); d.setDate(todayMidnight.getDate() - dayOffset)
                  const dayLetter = ['S','M','T','W','T','F','S'][d.getDay()]
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                        active
                          ? 'bg-orange-400'
                          : isToday && currentStreak > 0
                            ? 'bg-transparent ring-1 ring-orange-400'
                            : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                      <span className={`text-[8px] font-semibold ${
                        isToday ? 'text-orange-400' : 'text-gray-300 dark:text-gray-600'
                      }`}>{dayLetter}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-3">
              {postedToday ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-full">
                  ✓ Posted today — streak safe
                </span>
              ) : currentStreak > 0 ? (
                <Link href="/compose"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-700 px-3 py-1.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all">
                  🔥 Post today to extend your {currentStreak}-day streak →
                </Link>
              ) : (
                <Link href="/compose"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  Start your streak — post today →
                </Link>
              )}
            </div>
          </div>

          {/* TOP STRIP — Plan + Credits + Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">

            {/* Plan card */}
            <div className={`col-span-2 rounded-2xl px-4 py-3 border ${
              plan === 'free'   ? 'bg-gray-50 border-gray-200'   :
              plan === 'pro'    ? 'bg-blue-50 border-blue-100'   :
              'bg-purple-50 border-purple-100'
            }`}>
              {/* Top row: plan name + upgrade button */}
              <div className="flex items-center justify-between mb-2.5">
                <p className={`text-xs font-extrabold ${
                  plan === 'agency' ? 'text-purple-700' : plan === 'pro' ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {plan === 'free' && '🔓 Free Plan'}
                  {plan === 'pro'  && '⚡ Pro Plan'}
                  {plan === 'agency' && '🏢 Agency Plan'}
                </p>
                {plan === 'free' && (
                  <Link href="/settings?tab=Plan" id="tour-upgrade"
                    className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all flex-shrink-0">
                    Upgrade
                  </Link>
                )}
              </div>

              {/* Connected platforms row */}
              <div className="flex items-center gap-2 mb-2.5">
                {PLAN_CARD_PLATFORMS.map(platform => {
                  const isConnected = connectedPlatforms.includes(platform)
                  return (
                    <span
                      key={platform}
                      title={isConnected ? `${platform} connected` : `${platform} not connected`}
                      className={`relative text-base transition-opacity ${isConnected ? 'opacity-100' : 'opacity-25'}`}
                    >
                      {PLATFORM_ICONS[platform]}
                      {isConnected && (
                        <span className="absolute -bottom-0.5 -right-0.5 text-[8px] leading-none text-green-600 font-black">✓</span>
                      )}
                    </span>
                  )
                })}
                <Link href="/accounts" className={`text-xs ml-auto ${
                  plan === 'agency' ? 'text-purple-500 hover:text-purple-700' :
                  plan === 'pro'    ? 'text-blue-500 hover:text-blue-700'     :
                  'text-gray-400 hover:text-gray-600'
                } transition-colors`}>
                  Manage →
                </Link>
              </div>

              {/* Seat roster */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Avatar bubbles — max 5 shown */}
                {planCardMembers.slice(0, 5).map((m, i) => {
                  const initials = (m.email?.[0] ?? '?').toUpperCase()
                  const colors = ['bg-black text-white', 'bg-blue-600 text-white', 'bg-purple-600 text-white', 'bg-green-600 text-white', 'bg-orange-500 text-white']
                  return (
                    <span
                      key={i}
                      title={m.role === 'owner' ? `${m.email} (owner)` : `${m.email} (${m.role})`}
                      className={`w-5 h-5 rounded-full text-[9px] font-extrabold flex items-center justify-center flex-shrink-0 ${colors[i % colors.length]}`}
                    >
                      {initials}
                    </span>
                  )
                })}
                {planCardMembers.length > 5 && (
                  <span className="text-xs text-gray-400">+{planCardMembers.length - 5}</span>
                )}
                <span className={`text-xs ml-auto font-semibold ${
                  plan === 'agency' ? 'text-purple-500' : plan === 'pro' ? 'text-blue-500' : 'text-gray-500'
                }`}>
                  {totalSeatsUsed === 1
                    ? '1 seat (just you)'
                    : `${totalSeatsUsed} / ${planSeatLimit} seats`}
                </span>
              </div>
            </div>

            {/* Credits card */}
            <div id="tour-ai-credits" className="col-span-2 bg-surface border border-theme rounded-2xl px-4 py-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">AI Credits</span>
                <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{credits.toLocaleString()}</span>
              </div>

              {/* Visual pool blocks */}
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                {/* Monthly — always shown */}
                <div className="flex-1 rounded-lg p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">📅 Monthly</div>
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{monthlyCredits.toLocaleString()}</div>
                  <div className="text-xs text-blue-500 dark:text-blue-500">/ {monthlyLimit.toLocaleString()} this month</div>
                  <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-1 mt-2">
                    <div className="bg-blue-500 h-1 rounded-full transition-all" style={{ width: `${Math.min(100, (monthlyCredits / Math.max(1, monthlyLimit)) * 100)}%` }} />
                  </div>
                </div>

                {/* Earned — only if > 0 */}
                {earnedCredits > 0 && (
                  <div className="flex-1 rounded-lg p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">🎁 Earned</div>
                    <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{earnedCredits.toLocaleString()}</div>
                    <div className="text-xs text-amber-500">from referrals &amp; bonuses</div>
                  </div>
                )}

                {/* Paid — only if > 0 */}
                {paidCredits > 0 && (
                  <div className="flex-1 rounded-lg p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                    <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">💳 Purchased</div>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{paidCredits.toLocaleString()}</div>
                    <div className="text-xs text-purple-500">one-time credit pack</div>
                  </div>
                )}
              </div>

              {creditPct < 20 && (
                <Link href="/settings?tab=Plan" className="text-xs font-bold text-blue-600 hover:underline block mb-2">
                  Get more credits →
                </Link>
              )}

              {/* Credit source toggle */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400 mb-1.5">Draw from:</p>
                <div className="flex gap-1 flex-wrap">
                  {(['monthly_first', 'earned_first', 'paid_first'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleCreditSourceChange(opt)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all border ${
                        creditSource === opt
                          ? 'bg-black dark:bg-white text-white dark:text-black border-transparent'
                          : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {opt === 'monthly_first' ? '📅 Monthly' : opt === 'earned_first' ? '🎁 Earned' : '💳 Paid'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* X Booster card — only shown when X/Twitter is connected or balance > 0 */}
            {(connectedPlatforms.includes('twitter') || xBoosterBalance > 0) && (
              <div className={`col-span-2 rounded-2xl px-4 py-3 border flex items-center justify-between ${
                xBoosterBalance > 0
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
                  : 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
              }`}>
                <div>
                  <p className={`text-xs font-extrabold ${
                    xBoosterBalance > 0 ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    ⚡ X Booster Posts
                  </p>
                  <p className={`text-2xl font-extrabold mt-0.5 ${
                    xBoosterBalance > 0 ? 'text-green-700 dark:text-green-300' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {xBoosterBalance.toLocaleString()}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    xBoosterBalance > 0 ? 'text-green-600 dark:text-green-500' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {xBoosterBalance > 0 ? 'extra posts available' : '0 remaining'}
                  </p>
                </div>
                {xBoosterBalance === 0 && (
                  <Link href="/settings?tab=plan#x-booster"
                    className="text-xs font-bold px-3 py-1.5 bg-black text-white dark:bg-gray-700 dark:text-white rounded-xl hover:opacity-80 transition-all flex-shrink-0">
                    Get more →
                  </Link>
                )}
              </div>
            )}

            {/* Stat cards — drag-and-drop reorderable */}
            {(() => {
              const cardDefs: Record<string, StatCardDef> = {
                'scheduled':  { id: 'scheduled',  label: 'Scheduled', value: stats.scheduled,  icon: '📅', color: 'text-blue-600'   },
                'drafts':     { id: 'drafts',      label: 'Drafts',    value: stats.drafts,     icon: '📁', color: 'text-yellow-600' },
                'published':  { id: 'published',   label: 'Published', value: stats.published,  icon: '✅', color: 'text-green-600'  },
                'this-week':  { id: 'this-week',   label: 'This Week', value: stats.thisWeek,   icon: '✏️', color: 'text-purple-600' },
              }
              return (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={cardOrder} strategy={horizontalListSortingStrategy}>
                    {cardOrder.map(id => (
                      <SortableStatCard key={id} card={cardDefs[id]} />
                    ))}
                  </SortableContext>
                </DndContext>
              )
            })()}

          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT — 2 cols */}
            <div className="lg:col-span-2 space-y-5">

              {/* WEEK ACTIVITY */}
              <div className="bg-surface rounded-2xl border border-theme p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold">This Week's Activity</h2>
                  <Link href="/analytics" className="text-xs text-gray-400 dark:text-gray-500 hover:text-black transition-all">Full analytics →</Link>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map((day, i) => {
                    const isToday = i === todayDayIdx
                    const count   = weekCounts[i]
                    const pct     = count > 0 ? Math.max((count / maxWeekCount) * 100, 12) : 0
                    return (
                      <div key={day} className="flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center" style={{ height: '48px' }}>
                          {count > 0
                            ? <div className={`w-full rounded-t-lg ${isToday ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`} style={{ height: `${pct}%` }} />
                            : <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded" />}
                        </div>
                        <span className={`text-xs font-semibold ${isToday ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                          <span className="hidden sm:inline">{day}</span>
                          <span className="sm:hidden">{DAYS_XS[i]}</span>
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{count > 0 ? count : ''}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* UPCOMING POSTS */}
              <div className="bg-surface rounded-2xl border border-theme p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold">Upcoming Posts</h2>
                  <Link href="/queue" className="text-xs text-gray-400 dark:text-gray-500 hover:text-black transition-all">View all →</Link>
                </div>
                {upcomingPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">📭</div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Queue is empty</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Schedule posts to build your content pipeline.</p>
                    <Link href="/compose" className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all">
                      Write a post →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcomingPosts.map(post => (
                      <div key={post.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
                            {post.content?.slice(0, 100)}{post.content?.length > 100 ? '…' : ''}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {post.platforms?.slice(0, 4).map(p => (
                              <span key={p} className="text-xs">{PLATFORM_ICONS[p] || '📱'}</span>
                            ))}
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                              {new Date(post.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full flex-shrink-0">Scheduled</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECENT ACTIVITY */}
              <div className="bg-surface rounded-2xl border border-theme p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold">Recent Activity</h2>
                  <Link href="/drafts" className="text-xs text-gray-400 dark:text-gray-500 hover:text-black transition-all">View drafts →</Link>
                </div>
                {recentPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">✍️</div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nothing here yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Every post you draft or publish will show up here.</p>
                    <Link href="/compose" className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all">
                      Write your first post →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentPosts.map(post => (
                      <div key={post.id} className="flex items-start gap-3 p-3 border border-gray-50 dark:border-gray-700 rounded-xl hover:border-gray-200 dark:hover:border-gray-600 transition-all">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
                            {post.content?.slice(0, 80)}{post.content?.length > 80 ? '…' : ''}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {post.platforms?.slice(0, 3).map(p => (
                              <span key={p} className="text-xs">{PLATFORM_ICONS[p] || '📱'}</span>
                            ))}
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          post.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}>
                          {post.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT — 1 col */}
            <div className="space-y-5">

              {/* QUICK ACTIONS */}
              <div className="bg-surface rounded-2xl border border-theme p-5">
                <h2 className="text-sm font-extrabold mb-3">Quick Actions</h2>
                <div className="space-y-1">
                  {[
                    { label: 'Write a post',    sub: 'Compose & schedule',      href: '/compose',        icon: '✏️', featured: true  },
                    { label: 'Bulk schedule',   sub: 'Schedule many at once',   href: '/bulk-scheduler', icon: '📅', featured: false },
                    { label: 'View calendar',   sub: 'See all scheduled posts', href: '/calendar',       icon: '🗓️', featured: false },
                    { label: 'Use a template',  sub: 'Start from a saved format', href: '/templates',    icon: '📋', featured: false },
                    { label: 'Explore AI tools',sub: '12 tools available',      href: '/ai-features',    icon: '🤖', featured: false },
                    { label: 'Connect accounts',sub: 'Add social platforms',    href: '/accounts',       icon: '📱', featured: false },
                  ].map(a => (
                    <Link key={a.href} href={a.href}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                        a.featured ? 'bg-black text-white hover:opacity-80 dark:bg-gray-800 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                      <span className="text-base">{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${a.featured ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>{a.label}</p>
                        <p className={`text-xs truncate ${a.featured ? 'text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>{a.sub}</p>
                      </div>
                      <span className={`text-xs ${a.featured ? 'text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}>→</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* SM-PULSE PROMO */}
              <div className="bg-black rounded-2xl p-5 text-white">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Featured Tool</p>
                    <h2 className="text-sm font-extrabold">SM-Pulse</h2>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Scan Reddit & YouTube for trending topics in your niche before they peak.
                    </p>
                  </div>
                  <span className="text-2xl">🔥</span>
                </div>
                <Link href="/sm-pulse"
                  className="text-xs font-bold px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl hover:opacity-80 transition-all inline-block">
                  Try SM-Pulse — 20 cr
                </Link>
              </div>

              {/* REFERRAL NUDGE — pro/agency only */}
              {plan !== 'free' && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-5 text-white">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Earn free credits</p>
                  <p className="text-sm font-extrabold mb-1">Invite a friend</p>
                  <div className="space-y-1 mb-4 mt-2">
                    {[
                      { event: 'First post',      credits: '+10 cr' },
                      { event: 'Upgrade to Pro',  credits: '+50 cr' },
                      { event: 'Upgrade to Agency', credits: '+100 cr' },
                    ].map(r => (
                      <div key={r.event} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{r.event}</span>
                        <span className="font-bold">{r.credits}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/settings?tab=Referrals"
                    className="text-xs font-bold px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl hover:opacity-80 transition-all inline-block w-full text-center">
                    Get your referral link →
                  </Link>
                </div>
              )}

              {/* COMING SOON */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-blue-700 mb-2">🔜 Coming very soon</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { name: 'LinkedIn',  icon: '💼' },
                    { name: 'YouTube',   icon: '▶️' },
                    { name: 'Pinterest', icon: '📌' },
                    { name: 'Reddit',    icon: '🤖' },
                  ].map(p => (
                    <div key={p.name} className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
                      <span>{p.icon}</span>{p.name}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-500 mt-2">Awaiting platform approval.</p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    }>
      <DashboardInner />
    </Suspense>
  )
}