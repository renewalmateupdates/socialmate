export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined): string {
  if (n == null) return '—'
  return n.toLocaleString()
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtMRR(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`
}

// ─── page ───────────────────────────────────────────────────────────────────

export default async function AdminOverviewPage() {
  // ── auth check ─────────────────────────────────────────────────────────
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'socialmatehq@gmail.com') redirect('/dashboard')

  const admin = getSupabaseAdmin()
  const now = new Date()
  const minus7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const minus24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const minus14d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const minus30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Exclude admin's own account from all business metrics so stats reflect real paying users
  const adminUserId = user.id

  // ── 1. Growth snapshot ────────────────────────────────────────────────
  let totalUsers = 0
  let newUsers7d = 0
  let proCount = 0
  let agencyCount = 0

  try {
    // Total users via admin auth API — Supabase returns total in the pagination object
    const { data: authList } = await admin.auth.admin.listUsers({ perPage: 1 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    totalUsers = (authList as any)?.total ?? 0
  } catch { /* graceful fallback */ }

  try {
    // New users last 7d — count from workspaces created (personal workspaces proxy for new users)
    const { count } = await admin
      .from('workspaces')
      .select('id', { count: 'exact', head: true })
      .eq('is_personal', true)
      .neq('owner_id', adminUserId)
      .gte('created_at', minus7d)
    newUsers7d = count ?? 0
  } catch { /* graceful fallback */ }

  try {
    const { count } = await admin
      .from('workspaces')
      .select('id', { count: 'exact', head: true })
      .in('plan', ['pro', 'pro_annual'])
      .eq('is_personal', true)
      .neq('owner_id', adminUserId)
    proCount = count ?? 0
  } catch { /* graceful fallback */ }

  try {
    const { count } = await admin
      .from('workspaces')
      .select('id', { count: 'exact', head: true })
      .in('plan', ['agency', 'agency_annual'])
      .eq('is_personal', true)
      .neq('owner_id', adminUserId)
    agencyCount = count ?? 0
  } catch { /* graceful fallback */ }

  // ── 2. Revenue signals ────────────────────────────────────────────────
  let activePaidCount = 0
  let autopilotCount = 0

  try {
    const { count } = await admin
      .from('workspaces')
      .select('id', { count: 'exact', head: true })
      .neq('plan', 'free')
      .eq('is_personal', true)
      .neq('owner_id', adminUserId)
    activePaidCount = count ?? 0
  } catch { /* graceful fallback */ }

  try {
    const { count } = await admin
      .from('workspaces')
      .select('id', { count: 'exact', head: true })
      .eq('soma_autopilot_enabled', true)
      .neq('owner_id', adminUserId)
    autopilotCount = count ?? 0
  } catch { /* graceful fallback */ }

  const estimatedMRR = (proCount * 5) + (agencyCount * 20) + (autopilotCount * 10)

  // ── 3. Platform health (last 24h) ─────────────────────────────────────
  let published24h = 0
  let failed24h = 0
  let partial24h = 0

  try {
    const { count } = await admin
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('published_at', minus24h)
    published24h = count ?? 0
  } catch { /* graceful fallback */ }

  try {
    const { count } = await admin
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('updated_at', minus24h)
    failed24h = count ?? 0
  } catch { /* graceful fallback */ }

  try {
    const { count } = await admin
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'partial')
      .gte('updated_at', minus24h)
    partial24h = count ?? 0
  } catch { /* graceful fallback */ }

  const totalAttempted24h = published24h + failed24h + partial24h
  const successRate = totalAttempted24h > 0
    ? Math.round((published24h / totalAttempted24h) * 100)
    : 100

  // ── 4. SOMA activity ──────────────────────────────────────────────────
  let somaProjects = 0
  let somaActiveProjects = 0
  let somaCreditsMTD = 0
  let lastAutopilotRun: string | null = null

  try {
    const { count } = await admin
      .from('soma_projects')
      .select('id', { count: 'exact', head: true })
    somaProjects = count ?? 0
  } catch { /* soma_projects may not exist yet */ }

  try {
    const { count } = await admin
      .from('soma_projects')
      .select('id', { count: 'exact', head: true })
      .in('mode', ['autopilot', 'full_send'])
    somaActiveProjects = count ?? 0
  } catch { /* graceful fallback */ }

  try {
    const { data: creditRows } = await admin
      .from('workspaces')
      .select('soma_credits_used')
    somaCreditsMTD = (creditRows ?? []).reduce((acc, r) => acc + (r.soma_credits_used ?? 0), 0)
  } catch { /* graceful fallback */ }

  try {
    const { data: lastRun } = await admin
      .from('soma_weekly_ingestion')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    lastAutopilotRun = lastRun?.created_at ?? null
  } catch { /* graceful fallback */ }

  // ── 5. Churn signals ──────────────────────────────────────────────────
  let churnCount = 0
  let churnEmails: string[] = []

  try {
    // Paid users who joined > 30 days ago and have no post in 14+ days
    const { data: paidWorkspaces } = await admin
      .from('workspaces')
      .select('id, owner_id')
      .in('plan', ['pro', 'pro_annual', 'agency', 'agency_annual'])
      .eq('is_personal', true)
      .neq('owner_id', adminUserId)
      .lte('created_at', minus30d)

    if (paidWorkspaces && paidWorkspaces.length > 0) {
      const ownerIds = paidWorkspaces.map(w => w.owner_id)

      // Get owner emails from auth
      const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const emailMap = new Map((authUsers ?? []).map(u => [u.id, u.email ?? '']))

      // For each, check their last post
      const atRisk: string[] = []
      for (const ws of paidWorkspaces) {
        const { data: lastPost } = await admin
          .from('posts')
          .select('published_at')
          .eq('user_id', ws.owner_id)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const isAtRisk = !lastPost || (lastPost.published_at && lastPost.published_at < minus14d)
        if (isAtRisk) {
          const email = emailMap.get(ws.owner_id)
          if (email) atRisk.push(email)
        }
      }

      churnCount = atRisk.length
      churnEmails = atRisk.slice(0, 10)
    }
  } catch { /* graceful fallback */ }

  // ── 6. Recent signups ─────────────────────────────────────────────────
  interface RecentUser {
    email: string
    plan: string
    created_at: string
    posts_count: number
  }
  let recentUsers: RecentUser[] = []

  try {
    const { data: recentWorkspaces } = await admin
      .from('workspaces')
      .select('owner_id, plan, created_at')
      .eq('is_personal', true)
      .neq('owner_id', adminUserId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentWorkspaces && recentWorkspaces.length > 0) {
      const ownerIds = recentWorkspaces.map(w => w.owner_id)

      const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const emailMap = new Map((authUsers ?? []).map(u => [u.id, u.email ?? '']))

      // Batch post counts
      const postCountMap = new Map<string, number>()
      for (const ownerId of ownerIds) {
        const { count } = await admin
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', ownerId)
        postCountMap.set(ownerId, count ?? 0)
      }

      recentUsers = recentWorkspaces.map(ws => ({
        email: emailMap.get(ws.owner_id) ?? '(unknown)',
        plan: ws.plan ?? 'free',
        created_at: ws.created_at,
        posts_count: postCountMap.get(ws.owner_id) ?? 0,
      }))
    }
  } catch { /* graceful fallback */ }

  // ── render ─────────────────────────────────────────────────────────────
  const PLAN_BADGE: Record<string, string> = {
    free:          'bg-gray-700 text-gray-400',
    pro:           'bg-blue-900/50 text-blue-400',
    pro_annual:    'bg-blue-900/50 text-blue-300',
    agency:        'bg-purple-900/50 text-purple-400',
    agency_annual: 'bg-purple-900/50 text-purple-300',
  }

  const QUICK_LINKS = [
    { label: 'Users',          href: '/admin/users'          },
    { label: 'Affiliates',     href: '/admin/affiliates'     },
    { label: 'Coupons',        href: '/admin/coupons'        },
    { label: 'Studio Stax',    href: '/admin/studio-stax'    },
    { label: 'Feedback',       href: '/admin/feedback'       },
    { label: 'Platform Stats', href: '/admin/platform-stats' },
    { label: 'Account Jail',   href: '/admin/platform-jail'  },
    { label: 'Admin Hub',      href: '/admin'                },
  ]

  const successColor =
    successRate >= 95 ? 'text-emerald-400' :
    successRate >= 80 ? 'text-amber-400' :
    'text-red-400'

  return (
    <div className="min-h-dvh bg-gray-950 text-gray-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full">God Mode</span>
            </div>
            <h1 className="text-3xl font-black text-white">Admin Overview</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              SocialMate · {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <Link href="/dashboard"
            className="text-sm text-gray-500 hover:text-white transition-colors mt-1">
            ← Dashboard
          </Link>
        </div>

        {/* ── Quick links ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all border border-gray-700/60">
              {l.label}
            </Link>
          ))}
        </div>

        {/* ── Section 1: Growth snapshot ───────────────────────────────── */}
        <section>
          <SectionLabel>Growth Snapshot</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={fmt(totalUsers)} accent="text-blue-400" sub="registered accounts" />
            <StatCard label="New Last 7d" value={fmt(newUsers7d)} accent="text-emerald-400" sub="new signups" />
            <StatCard label="Pro Subscribers" value={fmt(proCount)} accent="text-sky-400" sub="pro + pro annual" />
            <StatCard label="Agency Subscribers" value={fmt(agencyCount)} accent="text-purple-400" sub="agency + annual" />
          </div>
        </section>

        {/* ── Section 2: Revenue signals ───────────────────────────────── */}
        <section>
          <SectionLabel>Revenue Signals</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Active Paid Workspaces"
              value={fmt(activePaidCount)}
              accent="text-amber-400"
              sub="non-free personal workspaces"
            />
            <StatCard
              label="SOMA Autopilot"
              value={fmt(autopilotCount)}
              accent="text-violet-400"
              sub="soma_autopilot_enabled = true"
            />
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="text-3xl font-black text-amber-400 mb-1">{fmtMRR(estimatedMRR)}/mo</div>
              <div className="text-sm font-semibold text-gray-300">Est. MRR</div>
              <div className="text-xs text-gray-600 mt-0.5">pro×$5 + agency×$20 + autopilot×$10</div>
              <div className="text-xs text-amber-600 mt-1 font-medium">est. — excludes admin account · does not include add-ons or annual</div>
            </div>
          </div>
        </section>

        {/* ── Section 3: Platform health (24h) ────────────────────────── */}
        <section>
          <SectionLabel>Platform Health — Last 24h</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Published" value={fmt(published24h)} accent="text-emerald-400" sub="status = published" />
            <StatCard label="Failed" value={fmt(failed24h)} accent={failed24h > 0 ? 'text-red-400' : 'text-gray-500'} sub="status = failed" />
            <StatCard label="Partial" value={fmt(partial24h)} accent={partial24h > 0 ? 'text-amber-400' : 'text-gray-500'} sub="status = partial" />
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className={`text-3xl font-black mb-1 ${successColor}`}>{successRate}%</div>
              <div className="text-sm font-semibold text-gray-300">Success Rate</div>
              <div className="text-xs text-gray-600 mt-0.5">{fmt(totalAttempted24h)} total attempts</div>
              {/* progress bar */}
              <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${successRate >= 95 ? 'bg-emerald-500' : successRate >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: SOMA activity ─────────────────────────────────── */}
        <section>
          <SectionLabel>SOMA Activity</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Projects" value={fmt(somaProjects)} accent="text-violet-400" sub="all soma projects" />
            <StatCard label="Active (autopilot/full)" value={fmt(somaActiveProjects)} accent="text-fuchsia-400" sub="autopilot or full_send" />
            <StatCard label="Credits Used (MTD)" value={fmt(somaCreditsMTD)} accent="text-indigo-400" sub="sum across all workspaces" />
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="text-base font-black text-gray-300 mb-1 truncate">
                {lastAutopilotRun ? fmtDate(lastAutopilotRun) : '—'}
              </div>
              <div className="text-sm font-semibold text-gray-300">Last Ingestion</div>
              <div className="text-xs text-gray-600 mt-0.5">most recent soma_weekly_ingestion</div>
            </div>
          </div>
        </section>

        {/* ── Section 5: Churn signals ─────────────────────────────────── */}
        <section>
          <SectionLabel>Churn Signals</SectionLabel>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`text-2xl font-black ${churnCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {churnCount}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-300">Paid users at risk</div>
                <div className="text-xs text-gray-600">Joined &gt;30d ago — no post in 14+ days</div>
              </div>
            </div>
            {churnEmails.length > 0 ? (
              <div className="space-y-1">
                {churnEmails.map(email => (
                  <div key={email} className="flex items-center gap-2 py-1.5 border-b border-gray-800/60 last:border-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span className="text-sm text-gray-400 font-mono">{email}</span>
                  </div>
                ))}
                {churnCount > 10 && (
                  <p className="text-xs text-gray-600 pt-1">…and {churnCount - 10} more</p>
                )}
              </div>
            ) : churnCount === 0 ? (
              <p className="text-sm text-emerald-500 font-medium">All clear — no at-risk users detected.</p>
            ) : null}
          </div>
        </section>

        {/* ── Section 6: Recent signups ────────────────────────────────── */}
        <section>
          <SectionLabel>Recent Signups</SectionLabel>
          {recentUsers.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-600 text-sm">
              No data
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/40">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Plan</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Joined</th>
                    <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Posts</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u, i) => (
                    <tr key={u.email + i}
                      className={`hover:bg-gray-800/30 transition-colors ${i < recentUsers.length - 1 ? 'border-b border-gray-800/60' : ''}`}>
                      <td className="px-5 py-3">
                        <span className="text-gray-300 font-mono text-xs truncate block max-w-[260px]">{u.email}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_BADGE[u.plan] ?? PLAN_BADGE.free}`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDate(u.created_at)}</td>
                      <td className="px-5 py-3 text-right text-gray-400 font-semibold">{u.posts_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Footer spacer ────────────────────────────────────────────── */}
        <div className="pb-8" />

      </div>
    </div>
  )
}

// ─── sub-components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">
      {children}
    </h2>
  )
}

function StatCard({
  label,
  value,
  accent,
  sub,
}: {
  label: string
  value: string
  accent: string
  sub: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className={`text-3xl font-black mb-1 ${accent}`}>{value}</div>
      <div className="text-sm font-semibold text-gray-300">{label}</div>
      <div className="text-xs text-gray-600 mt-0.5">{sub}</div>
    </div>
  )
}
