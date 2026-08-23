'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import BehaviorSurvey from '@/components/BehaviorSurvey'
import DashboardTour from '@/components/DashboardTour'
import DidYouKnow from '@/components/DidYouKnow'
import DashboardWidgets from '@/components/DashboardWidgets'
import WelcomeOfferBanner from '@/components/WelcomeOfferBanner'
import WhatsNewBanner from '@/components/WhatsNewBanner'
import PlatformIcon from '@/components/landing/PlatformIcon'
import { useWorkspace, PLAN_CONFIG } from '@/contexts/WorkspaceContext'
import { useI18n } from '@/contexts/I18nContext'
import { localeToBCP47 } from '@/lib/i18n'
import {
  ArrowRight, ArrowUpRight, Bot, CalendarDays, CheckCircle2, ChevronRight,
  Clock, FileText, Flame, FolderOpen, Gift, GripVertical, Inbox,
  Layers, Moon, PenLine, Plug, Radar, Sparkles, Users, X, Zap,
} from 'lucide-react'
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

/* Platforms shown on the plan card (live platforms only). `twitter` is the
   value stored in connected_accounts; PlatformIcon indexes that mark as `x`. */
const PLAN_CARD_PLATFORMS = ['bluesky', 'discord', 'telegram', 'mastodon', 'twitter', 'linkedin', 'tiktok'] as const
const ICON_KEY: Record<string, string> = { twitter: 'x' }

const LS_CARD_ORDER_KEY = 'dashboard_card_order'
const DEFAULT_CARD_ORDER = ['scheduled', 'drafts', 'published', 'this-week']

/* ── Local chrome ───────────────────────────────────────────────────────────
   Three primitives so no card in this file writes its own surface, label or
   numeral. That is the whole reason the page reads as one instrument rather
   than eleven separately-styled boxes. */

function Panel({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`bg-surface border border-theme rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

/** Mono, uppercase, wide-tracked. Every card is labeled the way a piece of
    equipment is labeled, not the way a blog post is. */
function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-[10px] uppercase tracking-[0.16em] text-app-muted ${className}`}>
      {children}
    </span>
  )
}

/** Numerals are mono and tabular everywhere. A count that shifts width as it
    ticks is the difference between a dashboard and a readout. */
function Readout({ value, className = '' }: { value: string | number; className?: string }) {
  return <span className={`font-mono tabular-nums ${className}`}>{value}</span>
}

type StatCardDef = {
  id: string
  label: string
  Icon: typeof CalendarDays
  color: string
  value: number
}

function SortableStatCard({ card, dragLabel }: { card: StatCardDef; dragLabel: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }
  const { Icon } = card
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-surface border border-theme hover:border-theme-md rounded-2xl px-4 py-3.5 relative group select-none transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 hover:!opacity-100 cursor-grab active:cursor-grabbing transition-opacity p-1 touch-none text-app-faint"
        aria-label={dragLabel}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={`w-3.5 h-3.5 ${card.color}`} strokeWidth={2} />
        <Label>{card.label}</Label>
      </div>
      <Readout value={card.value.toLocaleString()} className={`text-3xl font-semibold leading-none ${card.color}`} />
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

function CreditSuccessModal({ onDismiss, t }: { onDismiss: () => void; t: (k: string, p?: Record<string, string | number>) => string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-theme rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-violet/12 border border-violet/25 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-violet-ink" />
        </div>
        <h2 className="font-display text-xl font-semibold mb-2 text-theme">{t('app_dashboard.credits_added')}</h2>
        <p className="text-sm text-app-muted leading-relaxed mb-2">{t('app_dashboard.credits_added_sub')}</p>
        <p className="text-xs text-app-faint mb-6">{t('app_dashboard.credits_added_thanks')}</p>
        <button onClick={onDismiss}
          className="w-full py-3 bg-gradient-to-b from-amber-bright to-amber text-void text-sm font-semibold rounded-xl hover:from-amber-bright hover:to-amber-bright transition-all">
          {t('app_dashboard.lets_go')}
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
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0)
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [xBoosterBalance, setXBoosterBalance] = useState<number>(0)
  // Plan card — seat roster
  const [seatMembers, setSeatMembers] = useState<{ email: string; role: string }[]>([])
  // Drag-and-drop card order
  const [cardOrder, setCardOrder] = useState<string[]>(DEFAULT_CARD_ORDER)
  const { plan, credits, activeWorkspace, monthlyCredits, earnedCredits, paidCredits } = useWorkspace()
  const { t, locale } = useI18n()
  const bcp47 = localeToBCP47(locale)

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

      // Pending approval count banner — only for workspace owners (pro/agency)
      try {
        const approvalRes = await fetch('/api/posts/pending-approvals')
        if (approvalRes.ok) {
          const approvalData = await approvalRes.json()
          setPendingApprovalCount(approvalData.count ?? 0)
        }
      } catch {
        // Non-fatal
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  const displayName  = profile?.display_name || user?.email?.split('@')[0] || t('app_dashboard.there')
  const now          = new Date()
  const hour         = now.getHours()
  const greeting     = hour < 12 ? t('app_dashboard.good_morning') : hour < 17 ? t('app_dashboard.good_afternoon') : t('app_dashboard.good_evening')
  const planConfig   = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
  const todayDayIdx  = now.getDay()
  const maxWeekCount = Math.max(...weekCounts, 1)

  // Weekday and date strings come from Intl in the active locale rather than a
  // hardcoded English array. This is the difference between "the greeting is
  // translated" and "the page is translated".
  const dayName = (idx: number, style: 'short' | 'narrow') => {
    const d = new Date(2024, 8, 1 + idx) // 2024-09-01 was a Sunday
    return new Intl.DateTimeFormat(bcp47, { weekday: style }).format(d)
  }
  const fmtDate = (d: Date) => new Intl.DateTimeFormat(bcp47, { month: 'short', day: 'numeric' }).format(d)
  const fmtTime = (d: Date) => new Intl.DateTimeFormat(bcp47, { hour: 'numeric', minute: '2-digit' }).format(d)

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
  const creditPct    = monthlyLimit > 0 ? Math.min((monthlyCredits / monthlyLimit) * 100, 100) : 0

  const showBooster  = connectedPlatforms.includes('twitter') || xBoosterBalance > 0
  const planName     = plan === 'free' ? t('app_dashboard.plan_free')
                     : plan === 'pro'  ? t('app_dashboard.plan_pro')
                     : t('app_dashboard.plan_agency')

  const quickActions = [
    { label: t('app_dashboard.qa_write'),    sub: t('app_dashboard.qa_write_sub'),    href: '/compose',        Icon: PenLine,      featured: true  },
    { label: t('app_dashboard.qa_bulk'),     sub: t('app_dashboard.qa_bulk_sub'),     href: '/bulk-scheduler', Icon: Layers,       featured: false },
    { label: t('app_dashboard.qa_calendar'), sub: t('app_dashboard.qa_calendar_sub'), href: '/calendar',       Icon: CalendarDays, featured: false },
    { label: t('app_dashboard.qa_template'), sub: t('app_dashboard.qa_template_sub'), href: '/templates',      Icon: FileText,     featured: false },
    { label: t('app_dashboard.qa_ai'),       sub: t('app_dashboard.qa_ai_sub'),       href: '/ai-features',    Icon: Bot,          featured: false },
    { label: t('app_dashboard.qa_accounts'), sub: t('app_dashboard.qa_accounts_sub'), href: '/accounts',       Icon: Plug,         featured: false },
  ]

  return (
    <div className="flex min-h-dvh bg-theme">
      {showCreditModal && <CreditSuccessModal onDismiss={handleCreditModalDismiss} t={t} />}
      {user && <DashboardTour userId={user.id} />}
      <Sidebar />
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">

          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-2">
                <Label>{new Intl.DateTimeFormat(bcp47, { weekday: 'long', month: 'short', day: 'numeric' }).format(now)}</Label>
                {activeWorkspace && !activeWorkspace.is_personal && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-md bg-violet/12 text-violet-ink border border-violet/25">
                    {activeWorkspace.client_name || activeWorkspace.name}
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-theme leading-none">
                {greeting}, {displayName}
              </h1>
              <p className="text-sm text-app-muted mt-2">
                {stats.todayCount > 0
                  ? t('app_dashboard.today_summary', { count: stats.todayCount, upcoming: stats.upcomingCount })
                  : t('app_dashboard.nothing_today')}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
              <Link href="/bulk-scheduler"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-theme-md text-theme rounded-xl text-xs font-semibold hover:border-amber/50 hover:bg-app-raised transition-all">
                <CalendarDays className="w-3.5 h-3.5" />
                {t('app_dashboard.bulk_schedule')}
              </Link>
              <Link href="/compose" id="tour-compose"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-amber-bright to-amber text-void rounded-xl text-xs font-bold hover:from-amber-bright hover:to-amber-bright transition-all">
                <PenLine className="w-3.5 h-3.5" />
                {t('app_dashboard.compose')}
              </Link>
            </div>
          </div>

          {/* ── WELCOME BANNER — first-time users only ─────────────────── */}
          {!welcomeDismissed && stats.published === 0 && stats.scheduled === 0 && (
            <Panel className="relative p-5 mb-4 overflow-hidden">
              <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 85% 40%, var(--color-amber) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
              <button
                onClick={() => { setWelcomeDismissed(true); localStorage.setItem('sm-welcome-dismissed', '1') }}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-app-faint hover:text-theme hover:bg-app-fill transition-all"
                aria-label={t('app_common.close')}><X className="w-3.5 h-3.5" /></button>
              <div className="relative">
                <Label className="!text-amber-ink">{t('app_dashboard.welcome_eyebrow')}</Label>
                <h2 className="font-display text-lg font-semibold mt-1.5 mb-4 text-theme">{t('app_dashboard.welcome_title')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { step: '1', title: t('app_dashboard.welcome_step1'), sub: t('app_dashboard.welcome_step1_sub'), href: '/accounts', cta: t('app_dashboard.welcome_cta_connect') },
                    { step: '2', title: t('app_dashboard.welcome_step2'), sub: t('app_dashboard.welcome_step2_sub'), href: '/compose',  cta: t('app_dashboard.welcome_cta_compose') },
                    { step: '3', title: t('app_dashboard.welcome_step3'), sub: t('app_dashboard.welcome_step3_sub'), href: '/compose',  cta: t('app_dashboard.welcome_cta_schedule') },
                  ].map(s => (
                    <Link key={s.step} href={s.href}
                      className="bg-app-raised border border-theme hover:border-amber/40 transition-all rounded-xl p-4 group">
                      <Readout value={s.step} className="text-amber-ink text-xs font-semibold block mb-2" />
                      <p className="text-sm font-semibold mb-1 text-theme">{s.title}</p>
                      <p className="text-xs text-app-muted mb-2.5 leading-snug">{s.sub}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-ink">
                        {s.cta}<ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </Panel>
          )}

          <WhatsNewBanner />

          {user && plan === 'free' && (
            <WelcomeOfferBanner
              createdAt={user.created_at}
              plan={plan}
              onApplyOffer={() => window.location.href = '/pricing'}
            />
          )}

          {/* ── PENDING APPROVALS ──────────────────────────────────────── */}
          {pendingApprovalCount > 0 && (plan === 'pro' || plan === 'agency') && (
            <Link href="/approvals"
              className="flex items-center gap-3 bg-amber/[0.07] border border-amber/25 rounded-2xl px-5 py-3.5 mb-4 hover:bg-amber/[0.12] transition-all">
              <CheckCircle2 className="w-4 h-4 text-amber-ink flex-shrink-0" />
              <p className="text-sm text-theme flex-1">
                {t('app_dashboard.approvals_waiting', { count: pendingApprovalCount })}{' '}
                <span className="text-amber-ink font-semibold">{t('app_dashboard.review_now')} →</span>
              </p>
            </Link>
          )}

          {/* ── X/TWITTER NUDGE ────────────────────────────────────────── */}
          {!xBannerDismissed && !connectedPlatforms.includes('twitter') && (
            <div className="relative flex items-center gap-3 bg-surface border border-theme rounded-2xl px-5 py-3.5 mb-4">
              <PlatformIcon name="x" size={14} mono className="text-theme flex-shrink-0" />
              <p className="text-sm text-app-muted flex-1">
                {t('app_dashboard.x_live')}{' '}
                <Link href="/accounts" className="text-amber-ink font-semibold hover:underline">
                  {t('app_dashboard.x_connect')} →
                </Link>
              </p>
              <button
                onClick={() => { setXBannerDismissed(true); localStorage.setItem('sm-x-banner-dismissed', '1') }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-app-faint hover:text-theme hover:bg-app-fill transition-all flex-shrink-0"
                aria-label={t('app_common.close')}><X className="w-3.5 h-3.5" /></button>
            </div>
          )}

          {/* ── STREAK ─────────────────────────────────────────────────── */}
          <Panel className="p-5 mb-4">
            <div className="flex items-start justify-between flex-wrap gap-5">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                  currentStreak > 0 ? 'bg-amber/12 border-amber/30' : 'bg-app-raised border-theme'
                }`}>
                  {currentStreak > 0
                    ? <Flame className="w-5 h-5 text-amber-ink" />
                    : <Moon className="w-5 h-5 text-app-faint" />}
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <Readout value={currentStreak} className={`text-3xl font-semibold leading-none ${currentStreak > 0 ? 'text-amber-ink' : 'text-app-faint'}`} />
                    <Label className={currentStreak > 0 ? '!text-amber-ink/70' : ''}>
                      {currentStreak === 1 ? t('app_dashboard.streak_unit_one') : t('app_dashboard.streak_unit_other')}
                    </Label>
                  </div>
                  <div className="text-xs text-app-muted mt-1.5">
                    {currentStreak > 0 && !postedToday
                      ? t('app_dashboard.streak_keep_going')
                      : t('app_dashboard.streak_consistency')}
                  </div>
                </div>
              </div>
              {/* 14-day trail */}
              <div className="flex items-end gap-1">
                {trailDays.map((active, i) => {
                  const isToday   = i === 13
                  const dayOffset = 13 - i
                  const d = new Date(todayMidnight); d.setDate(todayMidnight.getDate() - dayOffset)
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-2.5 h-2.5 rounded-[3px] transition-all ${
                        active
                          ? 'bg-amber'
                          : isToday
                            ? 'bg-transparent ring-1 ring-amber/50'
                            : 'bg-app-fill'
                      }`} />
                      <span className={`font-mono text-[8px] ${isToday ? 'text-amber-ink' : 'text-app-ghost'}`}>
                        {dayName(d.getDay(), 'narrow')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-theme">
              {postedToday ? (
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-jade-ink">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('app_dashboard.streak_posted_today')}
                </span>
              ) : currentStreak > 0 ? (
                <Link href="/compose" className="inline-flex items-center gap-2 text-xs font-semibold text-amber-ink hover:opacity-80 transition-opacity">
                  <Flame className="w-3.5 h-3.5" />
                  {t('app_dashboard.streak_extend', { count: currentStreak })} <ArrowRight className="w-3 h-3" />
                </Link>
              ) : (
                <Link href="/compose" className="inline-flex items-center gap-2 text-xs font-semibold text-app-muted hover:text-theme transition-colors">
                  {t('app_dashboard.streak_start')} <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </Panel>

          {/* ── COMMAND ROW — Plan · Credits · Booster ──────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">

            {/* Plan */}
            <Panel className="md:col-span-4 px-5 py-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className={`w-3.5 h-3.5 ${plan === 'free' ? 'text-app-faint' : 'text-amber-ink'}`} />
                  <Label className={plan === 'free' ? '' : '!text-amber-ink'}>{planName}</Label>
                </div>
                {plan === 'free' ? (
                  <Link href="/settings?tab=Plan" id="tour-upgrade"
                    className="text-[11px] font-bold px-3 py-1.5 bg-gradient-to-b from-amber-bright to-amber text-void rounded-lg hover:from-amber-bright hover:to-amber-bright transition-all flex-shrink-0">
                    {t('app_dashboard.upgrade')}
                  </Link>
                ) : (
                  <Link href="/settings?tab=Plan" className="text-[11px] text-app-muted hover:text-theme transition-colors">
                    {t('app_dashboard.manage')} →
                  </Link>
                )}
              </div>

              {/* Connected platforms */}
              <div className="flex items-center gap-2.5 mb-4">
                {PLAN_CARD_PLATFORMS.map(platform => {
                  const isConnected = connectedPlatforms.includes(platform)
                  return (
                    <span
                      key={platform}
                      title={isConnected
                        ? t('app_dashboard.platform_connected', { platform })
                        : t('app_dashboard.platform_not_connected', { platform })}
                      className={`relative transition-opacity ${isConnected ? 'opacity-100' : 'opacity-25'}`}
                    >
                      <PlatformIcon name={ICON_KEY[platform] ?? platform} size={15} mono className="text-theme" />
                      {isConnected && (
                        <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 rounded-full bg-jade" />
                      )}
                    </span>
                  )
                })}
                <Link href="/accounts" className="text-[11px] ml-auto text-app-muted hover:text-theme transition-colors">
                  {t('app_dashboard.manage')} →
                </Link>
              </div>

              {/* Seat roster */}
              <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-3 border-t border-theme">
                <Users className="w-3 h-3 text-app-faint mr-0.5" />
                {planCardMembers.slice(0, 5).map((m, i) => (
                  <span
                    key={i}
                    title={`${m.email} (${m.role})`}
                    className="w-5 h-5 rounded-full bg-app-fill border border-theme-md text-[9px] font-mono font-semibold text-theme flex items-center justify-center flex-shrink-0"
                  >
                    {(m.email?.[0] ?? '?').toUpperCase()}
                  </span>
                ))}
                {planCardMembers.length > 5 && (
                  <span className="font-mono text-[10px] text-app-faint">+{planCardMembers.length - 5}</span>
                )}
                <span className="text-[11px] ml-auto text-app-muted">
                  {totalSeatsUsed === 1
                    ? t('app_dashboard.seat_just_you')
                    : t('app_dashboard.seats_used', { used: totalSeatsUsed, limit: planSeatLimit })}
                </span>
              </div>
            </Panel>

            {/* Credits */}
            <Panel id="tour-ai-credits" className={`px-5 py-4 ${showBooster ? 'md:col-span-5' : 'md:col-span-8'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-ink" />
                  <Label>{t('app_dashboard.ai_credits')}</Label>
                </div>
                <Readout value={credits.toLocaleString()} className="text-2xl font-semibold text-theme leading-none" />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                {/* Monthly */}
                <div className="flex-1 rounded-xl p-3 bg-app-raised border border-theme">
                  <Label>{t('app_dashboard.credits_monthly')}</Label>
                  <div className="mt-1.5">
                    <Readout value={monthlyCredits.toLocaleString()} className="text-lg font-semibold text-theme" />
                    <span className="font-mono text-[10px] text-app-faint ml-1">/ {monthlyLimit.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-app-fill rounded-full h-1 mt-2 overflow-hidden">
                    <div className="bg-violet h-1 rounded-full transition-all" style={{ width: `${creditPct}%` }} />
                  </div>
                </div>

                {/* Earned */}
                {earnedCredits > 0 && (
                  <div className="flex-1 rounded-xl p-3 bg-app-raised border border-theme">
                    <Label>{t('app_dashboard.credits_earned')}</Label>
                    <div className="mt-1.5">
                      <Readout value={earnedCredits.toLocaleString()} className="text-lg font-semibold text-jade-ink" />
                    </div>
                    <p className="text-[10px] text-app-faint mt-1.5 leading-tight">{t('app_dashboard.credits_from_referrals')}</p>
                  </div>
                )}

                {/* Purchased */}
                {paidCredits > 0 && (
                  <div className="flex-1 rounded-xl p-3 bg-app-raised border border-theme">
                    <Label>{t('app_dashboard.credits_purchased')}</Label>
                    <div className="mt-1.5">
                      <Readout value={paidCredits.toLocaleString()} className="text-lg font-semibold text-amber-ink" />
                    </div>
                    <p className="text-[10px] text-app-faint mt-1.5 leading-tight">{t('app_dashboard.credits_one_time')}</p>
                  </div>
                )}
              </div>

              {creditPct < 20 && (
                <Link href="/settings?tab=Plan" className="text-xs font-semibold text-violet-ink hover:underline block mb-3">
                  {t('app_dashboard.get_more_credits')} →
                </Link>
              )}

              {/* Credit source toggle */}
              <div className="pt-3 border-t border-theme">
                <Label className="block mb-2">{t('app_dashboard.draw_from')}</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {([
                    ['monthly_first', t('app_dashboard.credits_monthly')],
                    ['earned_first',  t('app_dashboard.credits_earned')],
                    ['paid_first',    t('app_dashboard.credits_paid')],
                  ] as const).map(([opt, label]) => (
                    <button
                      key={opt}
                      onClick={() => handleCreditSourceChange(opt)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                        creditSource === opt
                          ? 'bg-violet/15 text-violet-ink border-violet/40'
                          : 'bg-transparent text-app-muted border-theme hover:border-theme-md hover:text-theme'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </Panel>

            {/* X Booster */}
            {showBooster && (
              <Panel className="md:col-span-3 px-5 py-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className={`w-3.5 h-3.5 ${xBoosterBalance > 0 ? 'text-jade-ink' : 'text-app-faint'}`} />
                  <Label>{t('app_dashboard.x_booster_posts')}</Label>
                </div>
                <Readout value={xBoosterBalance.toLocaleString()}
                  className={`text-3xl font-semibold leading-none ${xBoosterBalance > 0 ? 'text-jade-ink' : 'text-app-faint'}`} />
                <p className="text-[11px] text-app-faint mt-1.5">
                  {xBoosterBalance > 0 ? t('app_dashboard.x_booster_available') : t('app_dashboard.x_booster_none')}
                </p>
                {xBoosterBalance === 0 && (
                  <Link href="/settings?tab=plan#x-booster"
                    className="mt-auto pt-3 text-[11px] font-semibold text-amber-ink hover:opacity-80 transition-opacity inline-flex items-center gap-1">
                    {t('app_dashboard.get_more')} <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </Panel>
            )}
          </div>

          {/* ── STAT CARDS — drag-and-drop reorderable ──────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
            {(() => {
              const cardDefs: Record<string, StatCardDef> = {
                'scheduled': { id: 'scheduled', label: t('app_dashboard.scheduled'), value: stats.scheduled, Icon: CalendarDays, color: 'text-amber-ink'    },
                'drafts':    { id: 'drafts',    label: t('app_dashboard.drafts'),    value: stats.drafts,    Icon: FolderOpen,   color: 'text-app-ink' },
                'published': { id: 'published', label: t('app_dashboard.published'), value: stats.published, Icon: CheckCircle2, color: 'text-jade-ink'     },
                'this-week': { id: 'this-week', label: t('app_dashboard.this_week'), value: stats.thisWeek,  Icon: PenLine,      color: 'text-violet-ink'   },
              }
              return (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={cardOrder} strategy={horizontalListSortingStrategy}>
                    {cardOrder.map(id => (
                      <SortableStatCard key={id} card={cardDefs[id]} dragLabel={t('app_dashboard.drag_to_reorder')} />
                    ))}
                  </SortableContext>
                </DndContext>
              )
            })()}
          </div>

          <DidYouKnow />

          <DashboardWidgets />

          {/* ── MAIN GRID ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* LEFT — 2 cols */}
            <div className="lg:col-span-2 space-y-4">

              {/* WEEK ACTIVITY */}
              <Panel className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <Label>{t('app_dashboard.this_week')}</Label>
                  <Link href="/analytics" className="text-[11px] text-app-muted hover:text-theme transition-colors">
                    {t('app_dashboard.full_analytics')} →
                  </Link>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {[0,1,2,3,4,5,6].map(i => {
                    const isToday = i === todayDayIdx
                    const count   = weekCounts[i]
                    const pct     = count > 0 ? Math.max((count / maxWeekCount) * 100, 12) : 0
                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className="w-full flex items-end justify-center" style={{ height: '56px' }}>
                          {count > 0
                            ? <div className={`w-full rounded-t-md transition-all ${isToday ? 'bg-amber' : 'bg-app-bar'}`} style={{ height: `${pct}%` }} />
                            : <div className="w-full h-[2px] bg-app-fill rounded" />}
                        </div>
                        <span className={`font-mono text-[10px] ${isToday ? 'text-amber-ink' : 'text-app-faint'}`}>
                          <span className="hidden sm:inline">{dayName(i, 'short')}</span>
                          <span className="sm:hidden">{dayName(i, 'narrow')}</span>
                        </span>
                        <Readout value={count > 0 ? count : ''} className="text-[10px] text-app-faint h-3" />
                      </div>
                    )
                  })}
                </div>
              </Panel>

              {/* UPCOMING POSTS */}
              <Panel className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <Label>{t('app_dashboard.upcoming')}</Label>
                  <Link href="/queue" className="text-[11px] text-app-muted hover:text-theme transition-colors">
                    {t('app_common.view_all')} →
                  </Link>
                </div>
                {upcomingPosts.length === 0 ? (
                  <div className="text-center py-9">
                    <Inbox className="w-7 h-7 text-app-ghost mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-sm font-semibold text-theme mb-1">{t('app_dashboard.queue_empty')}</p>
                    <p className="text-xs text-app-faint mb-5">{t('app_dashboard.queue_empty_sub')}</p>
                    <Link href="/compose"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-b from-amber-bright to-amber text-void text-xs font-bold rounded-xl hover:from-amber-bright hover:to-amber-bright transition-all">
                      <PenLine className="w-3.5 h-3.5" />{t('app_dashboard.write_a_post')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {upcomingPosts.map(post => (
                      <Link key={post.id} href="/queue"
                        className="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-theme hover:bg-app-raised transition-all">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-app-ink line-clamp-1">
                            {post.content?.slice(0, 100)}{post.content?.length > 100 ? '…' : ''}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {post.platforms?.slice(0, 4).map(p => (
                              <PlatformIcon key={p} name={ICON_KEY[p] ?? p} size={11} mono className="text-app-faint" />
                            ))}
                            <span className="font-mono text-[10px] text-app-faint tabular-nums">
                              {fmtDate(new Date(post.scheduled_at))} · {fmtTime(new Date(post.scheduled_at))}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber-ink bg-amber/10 border border-amber/20 px-2 py-1 rounded-md flex-shrink-0">
                          {t('app_common.status_scheduled')}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </Panel>

              {/* RECENT POSTS */}
              <Panel className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <Label>{t('app_dashboard.recent_posts')}</Label>
                  <Link href="/drafts" className="text-[11px] text-app-muted hover:text-theme transition-colors">
                    {t('app_dashboard.view_drafts')} →
                  </Link>
                </div>
                {recentPosts.length === 0 ? (
                  <div className="text-center py-9">
                    <PenLine className="w-7 h-7 text-app-ghost mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-sm font-semibold text-theme mb-1">{t('app_dashboard.nothing_yet')}</p>
                    <p className="text-xs text-app-faint mb-5">{t('app_dashboard.nothing_yet_sub')}</p>
                    <Link href="/compose"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-b from-amber-bright to-amber text-void text-xs font-bold rounded-xl hover:from-amber-bright hover:to-amber-bright transition-all">
                      <PenLine className="w-3.5 h-3.5" />{t('app_dashboard.write_first_post')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {recentPosts.map(post => (
                      <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-theme transition-all">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-app-ink line-clamp-1">
                            {post.content?.slice(0, 80)}{post.content?.length > 80 ? '…' : ''}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {post.platforms?.slice(0, 3).map(p => (
                              <PlatformIcon key={p} name={ICON_KEY[p] ?? p} size={11} mono className="text-app-faint" />
                            ))}
                            <span className="font-mono text-[10px] text-app-faint tabular-nums">
                              {fmtDate(new Date(post.created_at))}
                            </span>
                          </div>
                        </div>
                        <span className={`font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded-md flex-shrink-0 border ${
                          post.status === 'published'
                            ? 'text-jade-ink bg-jade/10 border-jade/20'
                            : 'text-app-muted bg-app-raised border-theme'
                        }`}>
                          {post.status === 'published' ? t('app_common.status_published') : t('app_common.status_draft')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

            </div>

            {/* RIGHT — 1 col */}
            <div className="space-y-4">

              {/* QUICK ACTIONS */}
              <Panel className="p-5">
                <Label className="block mb-4">{t('app_dashboard.quick_actions')}</Label>
                <div className="space-y-1">
                  {quickActions.map(a => (
                    <Link key={a.href} href={a.href}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all group ${
                        a.featured
                          ? 'bg-amber/[0.09] border border-amber/25 hover:bg-amber/[0.14]'
                          : 'border border-transparent hover:bg-app-raised hover:border-theme'
                      }`}>
                      <a.Icon className={`w-4 h-4 flex-shrink-0 ${a.featured ? 'text-amber-ink' : 'text-app-faint'}`} strokeWidth={1.75} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${a.featured ? 'text-amber-ink' : 'text-theme'}`}>{a.label}</p>
                        <p className="text-[11px] text-app-faint truncate">{a.sub}</p>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${a.featured ? 'text-amber-ink/60' : 'text-app-ghost'}`} />
                    </Link>
                  ))}
                </div>
              </Panel>

              {/* SM-PULSE */}
              <Panel className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <Label className="!text-violet-ink">{t('app_dashboard.featured_tool')}</Label>
                    <h2 className="font-display text-base font-semibold mt-1.5 text-theme">SM-Pulse</h2>
                    <p className="text-xs text-app-muted mt-1.5 leading-relaxed">{t('app_dashboard.pulse_desc')}</p>
                  </div>
                  <Radar className="w-5 h-5 text-violet-ink flex-shrink-0" strokeWidth={1.5} />
                </div>
                <Link href="/sm-pulse"
                  className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 bg-violet/12 border border-violet/30 text-violet-ink rounded-xl hover:bg-violet/20 transition-all">
                  {t('app_dashboard.pulse_cta')} <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </Panel>

              {/* REFERRAL — pro/agency only */}
              {plan !== 'free' && (
                <Panel className="p-5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Gift className="w-3.5 h-3.5 text-jade-ink" />
                    <Label className="!text-jade-ink">{t('app_dashboard.earn_free_credits')}</Label>
                  </div>
                  <p className="font-display text-base font-semibold mb-3 text-theme">{t('app_dashboard.invite_a_friend')}</p>
                  <div className="space-y-2 mb-4">
                    {[
                      { event: t('app_dashboard.ref_first_post'),     credits: '+10' },
                      { event: t('app_dashboard.ref_upgrade_pro'),    credits: '+50' },
                      { event: t('app_dashboard.ref_upgrade_agency'), credits: '+100' },
                    ].map(r => (
                      <div key={r.event} className="flex items-center justify-between text-xs">
                        <span className="text-app-muted">{r.event}</span>
                        <Readout value={`${r.credits} cr`} className="text-jade-ink font-semibold" />
                      </div>
                    ))}
                  </div>
                  <Link href="/settings?tab=Referrals"
                    className="flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 border border-theme-md text-theme rounded-xl hover:border-jade/50 hover:bg-jade/[0.06] transition-all">
                    {t('app_dashboard.get_referral_link')} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Panel>
              )}

              {/* COMING SOON */}
              <Panel className="p-5">
                <div className="flex items-center gap-2 mb-3.5">
                  <Clock className="w-3.5 h-3.5 text-app-faint" />
                  <Label>{t('app_dashboard.coming_very_soon')}</Label>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {['youtube', 'pinterest', 'reddit', 'instagram'].map(p => (
                    <div key={p} className="flex items-center gap-2 text-xs text-app-muted">
                      <PlatformIcon name={p} size={12} mono className="text-app-faint" />
                      <span className="capitalize">{p}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-app-faint mt-3.5 pt-3.5 border-t border-theme">
                  {t('app_dashboard.awaiting_approval')}
                </p>
              </Panel>

            </div>
          </div>
        </div>
      </main>
      <BehaviorSurvey />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    }>
      <DashboardInner />
    </Suspense>
  )
}
