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
      const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const emailMap = new Map((listData?.users ?? []).map(u => [u.id, u.email ?? '']))

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

  // ── 6. Platform distribution ─────────────────────────────────────────
  interface PlatformCount { platform: string; count: number }
  let platformDist: PlatformCount[] = []

  try {
    const { data: accounts } = await admin
      .from('connected_accounts')
      .select('platform, user_id')
      .neq('user_id', adminUserId)
    if (accounts) {
      const pm = new Map<string, number>()
      for (const acc of accounts) {
        pm.set(acc.platform, (pm.get(acc.platform) ?? 0) + 1)
      }
      platformDist = Array.from(pm.entries())
        .map(([platform, count]) => ({ platform, count }))
        .sort((a, b) => b.count - a.count)
    }
  } catch { /* graceful fallback */ }

  // ── 7. Signup attribution ─────────────────────────────────────────────
  interface SourceCount { source: string; count: number }
  let signupSources: SourceCount[] = []
  let signupReferrers: SourceCount[] = []
  let blogAttribution: SourceCount[] = []
  let attributedCount = 0
  let totalTracked = 0

  try {
    const { data: sourceRows } = await admin
      .from('user_settings')
      .select('signup_source, signup_medium, signup_campaign, signup_referrer')
      .neq('user_id', adminUserId)

    if (sourceRows) {
      totalTracked = sourceRows.length
      const sourceMap = new Map<string, number>()
      const refMap = new Map<string, number>()
      const blogMap = new Map<string, number>()

      for (const row of sourceRows) {
        const src = row.signup_source
        const ref = row.signup_referrer

        if (src) {
          attributedCount++
          const label = row.signup_campaign
            ? `${src} / ${row.signup_campaign}`
            : row.signup_medium
            ? `${src} / ${row.signup_medium}`
            : src
          sourceMap.set(label, (sourceMap.get(label) ?? 0) + 1)
        }

        if (ref) {
          try {
            const url = new URL(ref)
            const host = url.hostname.replace('www.', '')
            refMap.set(host, (refMap.get(host) ?? 0) + 1)

            const blogMatch = url.pathname.match(/^\/blog\/([^/]+)/)
            if (blogMatch && host.includes('socialmate.studio')) {
              blogMap.set(blogMatch[1], (blogMap.get(blogMatch[1]) ?? 0) + 1)
            }
          } catch {
            refMap.set(ref.slice(0, 40), (refMap.get(ref.slice(0, 40)) ?? 0) + 1)
          }
        }
      }

      signupSources = Array.from(sourceMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      signupReferrers = Array.from(refMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      blogAttribution = Array.from(blogMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    }
  } catch { /* graceful fallback */ }

  // ── 8. Recent signups ─────────────────────────────────────────────────
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

      const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const emailMap = new Map((listData?.users ?? []).map(u => [u.id, u.email ?? '']))

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

  // ── 8. Activation funnel ─────────────────────────────────────────────
  let funnelConnected = 0
  let funnelPosted    = 0
  let funnelPublished = 0
  let funnelRetained  = 0

  try {
    const { data } = await admin
      .from('connected_accounts')
      .select('user_id')
      .neq('user_id', adminUserId)
    if (data) funnelConnected = new Set(data.map(r => r.user_id)).size
  } catch { /* graceful fallback */ }

  try {
    const { data } = await admin
      .from('posts')
      .select('user_id')
      .neq('user_id', adminUserId)
    if (data) funnelPosted = new Set(data.map(r => r.user_id)).size
  } catch { /* graceful fallback */ }

  try {
    const { data } = await admin
      .from('posts')
      .select('user_id')
      .eq('status', 'published')
      .neq('user_id', adminUserId)
    if (data) funnelPublished = new Set(data.map(r => r.user_id)).size
  } catch { /* graceful fallback */ }

  try {
    const { data } = await admin
      .from('posts')
      .select('user_id')
      .eq('status', 'published')
      .gte('published_at', minus7d)
      .neq('user_id', adminUserId)
    if (data) funnelRetained = new Set(data.map(r => r.user_id)).size
  } catch { /* graceful fallback */ }

  // ── 9. Power users (most active by login count) ───────────────────────
  interface PowerUser { user_id: string; email: string; login_count: number; last_active: string | null; posts_count: number }
  let powerUsers: PowerUser[] = []

  try {
    const { data: pwSettings } = await admin
      .from('user_settings')
      .select('user_id, login_count, last_active')
      .neq('user_id', adminUserId)
      .gt('login_count', 0)
      .order('login_count', { ascending: false })
      .limit(10)

    if (pwSettings && pwSettings.length > 0) {
      const pwIds = pwSettings.map(s => s.user_id)
      const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const emailMap = new Map((listData?.users ?? []).map(u => [u.id, u.email ?? '']))

      const postCountMap = new Map<string, number>()
      const { data: postRows } = await admin
        .from('posts')
        .select('user_id, status')
        .in('user_id', pwIds)
      for (const p of postRows ?? []) {
        if (p.status === 'published') postCountMap.set(p.user_id, (postCountMap.get(p.user_id) ?? 0) + 1)
      }

      powerUsers = pwSettings.map(s => ({
        user_id:     s.user_id,
        email:       emailMap.get(s.user_id) ?? '(unknown)',
        login_count: s.login_count ?? 0,
        last_active: s.last_active ?? null,
        posts_count: postCountMap.get(s.user_id) ?? 0,
      }))
    }
  } catch { /* graceful fallback */ }

  // ── render ─────────────────────────────────────────────────────────────
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

  // Activation cascade, derived from the funnel counts above. Severity is
  // COMPUTED from the actual drop between stages — never hardcoded — so the
  // colour always reflects the live numbers:
  //   under 30% -> low · 30–60% -> mid · over 60% -> high · negative -> gain
  const stages = [
    { name: 'Signed up',           value: totalUsers      },
    { name: 'Connected a platform', value: funnelConnected },
    { name: 'Created a post',       value: funnelPosted    },
    { name: 'Published a post',     value: funnelPublished },
    { name: 'Active last 7 days',   value: funnelRetained  },
  ]

  const cascade = stages.map((s, i) => {
    const prev    = i === 0 ? null : stages[i - 1].value
    const pctBase = totalUsers > 0 ? Math.round((s.value / totalUsers) * 100) : 0
    // Stages can rise (SOMA can create posts for users who never connected),
    // so a "drop" may be negative — that's a gain, not a severity.
    const dropPct = prev && prev > 0 ? Math.round(((prev - s.value) / prev) * 100) : 0
    const lost    = prev !== null ? prev - s.value : 0
    const sev =
      prev === null   ? null  :
      dropPct <= 0    ? 'gain':
      dropPct < 30    ? 'low' :
      dropPct <= 60   ? 'mid' : 'high'
    return { ...s, pctBase, dropPct, lost, sev }
  })

  const activationPct = totalUsers > 0 ? (funnelPublished / totalUsers) * 100 : 0
  const notActivated  = Math.max(0, totalUsers - funnelPublished)
  // Ring geometry: r=68 -> circumference 427. Offset shrinks as the value grows.
  const RING_C   = 427
  const ringFill = RING_C - (RING_C * Math.min(activationPct, 100)) / 100

  const platformsInUse = platformDist.filter(p => p.count > 0).length
  const LIVE_PLATFORMS = 7 // bluesky, discord, telegram, mastodon, twitter, tiktok, linkedin
  const topReferrer    = signupReferrers[0] ?? null
  const maxPlatform    = Math.max(1, ...platformDist.map(p => p.count))
  const maxReferrer    = Math.max(1, ...signupReferrers.map(r => r.count))

  return (
    <div className="hud">
      <style>{`
        .hud{
          --obsidian:#060607; --panel:#0C0C0E; --raised:#141418;
          --hair:rgba(212,160,23,.20); --hair-lit:rgba(212,160,23,.48);
          --gold-deep:#8B6914; --gold:#D4A017; --gold-bright:#EAC020; --gold-pale:#F9EAC0;
          --pos-bright:#8FDCB4; --pos:#5FC894;
          --sev-low:#EFD05A; --sev-mid:#F09A56; --sev-high:#E4655E;
          --ink-high:#FFFFFF; --ink-body:#E6E2DA; --ink-muted:#B3ACA1; --ink-faint:#8B8478;
          --mono:ui-monospace,"SF Mono",SFMono-Regular,"Cascadia Mono",Menlo,Consolas,monospace;
          background:var(--obsidian); color:var(--ink-body);
          font-family:var(--mono); font-size:16px; line-height:1.6;
          min-height:100dvh; padding:clamp(20px,3.4vw,44px);
          position:relative; overflow-x:hidden;
        }
        .hud::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;
          background:
            radial-gradient(ellipse 70% 44% at 50% -8%,rgba(212,160,23,.14),transparent 62%),
            radial-gradient(ellipse 42% 30% at 88% 8%,rgba(212,160,23,.05),transparent 70%);}
        .hud-shell{position:relative;z-index:1;max-width:min(1180px,100%);margin:0 auto}

        .hud-rail{display:flex;flex-wrap:wrap;align-items:center;gap:12px 34px;
          border-top:1px solid var(--hair);border-bottom:1px solid var(--hair);
          padding:16px 2px;margin-bottom:44px}
        .hud-sig{display:flex;align-items:center;gap:10px;font-size:13px;letter-spacing:.09em;color:var(--ink-muted)}
        .hud-sig b{color:var(--ink-high);font-weight:500;letter-spacing:.03em}
        .hud-dot{width:7px;height:7px;border-radius:50%;background:var(--gold);
          box-shadow:0 0 10px var(--gold);animation:hudPulse 3s ease-in-out infinite}
        .hud-spacer{margin-left:auto}
        @keyframes hudPulse{0%,100%{opacity:1}50%{opacity:.35}}

        .hud-kicker{font-size:12px;letter-spacing:.34em;text-transform:uppercase;
          color:var(--gold-bright);margin:0 0 20px;font-weight:500}
        .hud-mast{display:flex;flex-wrap:wrap;align-items:flex-end;gap:22px;margin-bottom:8px}
        .hud-mast h1{margin:0;font-size:clamp(32px,5.6vw,60px);line-height:1;font-weight:300;
          letter-spacing:.1em;text-transform:uppercase;
          background:linear-gradient(172deg,var(--gold-pale) 4%,var(--gold-bright) 32%,var(--gold) 58%,var(--gold-deep) 98%);
          -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:var(--gold)}
        .hud-stamp{margin-left:auto;font-size:13px;color:var(--ink-muted);letter-spacing:.08em;text-align:right;line-height:1.7}
        .hud-rule{height:1px;background:linear-gradient(90deg,var(--gold),var(--hair) 42%,transparent);margin:22px 0 0}

        .hud-sec{font-size:14px;letter-spacing:.26em;text-transform:uppercase;color:var(--gold-bright);
          margin:54px 0 20px;display:flex;align-items:center;gap:18px;font-weight:500}
        .hud-sec::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--hair),transparent)}

        .hud-card{border:1px solid var(--hair);background:var(--panel);position:relative}
        .hud-card::before{content:"";position:absolute;top:-1px;left:0;right:0;height:1px;
          background:linear-gradient(90deg,transparent,var(--hair-lit) 22%,var(--hair-lit) 78%,transparent)}

        .hud-core{display:grid;grid-template-columns:minmax(0,330px) minmax(0,1fr);gap:18px;align-items:stretch}
        @media(max-width:860px){.hud-core{grid-template-columns:1fr}}
        .hud-reactor{padding:34px 26px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
        .hud-reactor svg{width:100%;max-width:236px;height:auto;display:block}
        .hud-note{font-size:15px;color:var(--ink-body);margin:22px 0 0;letter-spacing:.03em;line-height:1.6}
        .hud-note b{color:var(--gold-bright);font-weight:500}
        .hud-track{stroke:rgba(212,160,23,.13);fill:none;stroke-width:5}
        .hud-live{fill:none;stroke-width:5;stroke-linecap:round;stroke:url(#hudGoldArc);
          filter:drop-shadow(0 0 9px rgba(234,192,32,.6));transform:rotate(-90deg);transform-origin:50% 50%}
        .hud-tick{stroke:rgba(212,160,23,.34);stroke-width:1}

        .hud-cascade{padding:26px 30px;display:flex;flex-direction:column}
        .hud-stage{display:grid;grid-template-columns:1fr auto;gap:7px 18px;padding:17px 0;
          border-bottom:1px solid rgba(212,160,23,.09)}
        .hud-stage:last-child{border-bottom:0}
        .hud-name{font-size:15px;color:var(--ink-high);letter-spacing:.04em}
        .hud-nums{font-size:18px;color:var(--ink-high);font-variant-numeric:tabular-nums;
          letter-spacing:.02em;white-space:nowrap;font-weight:500}
        .hud-nums em{font-style:normal;color:var(--ink-muted);margin-left:12px;font-size:14px;font-weight:400}
        .hud-bar{grid-column:1/-1;height:3px;background:rgba(212,160,23,.1);position:relative;overflow:hidden}
        .hud-bar i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,var(--gold-deep),var(--gold-bright))}
        .hud-bar i.s-low{background:linear-gradient(90deg,#7A6820,var(--sev-low))}
        .hud-bar i.s-mid{background:linear-gradient(90deg,#7A4A24,var(--sev-mid))}
        .hud-bar i.s-high{background:linear-gradient(90deg,#7A2E29,var(--sev-high));box-shadow:0 0 9px rgba(228,101,94,.5)}
        .hud-bar i.s-gain{background:linear-gradient(90deg,#2C6B4F,var(--pos))}

        .hud-loss{grid-column:1/-1;font-size:13px;letter-spacing:.07em;margin-top:8px;
          display:flex;align-items:center;gap:8px}
        .hud-loss::before{content:"";width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent}
        .hud-loss.s-low{color:var(--sev-low)}  .hud-loss.s-low::before{border-top:6px solid var(--sev-low)}
        .hud-loss.s-mid{color:var(--sev-mid)}  .hud-loss.s-mid::before{border-top:6px solid var(--sev-mid)}
        .hud-loss.s-high{color:var(--sev-high)}.hud-loss.s-high::before{border-top:6px solid var(--sev-high)}
        .hud-loss.s-gain{color:var(--pos)}     .hud-loss.s-gain::before{border-bottom:6px solid var(--pos)}

        .hud-legend{display:flex;flex-wrap:wrap;gap:12px 28px;align-items:center;padding:18px 2px;margin-bottom:6px}
        .hud-key{display:flex;align-items:center;gap:9px;font-size:13px;letter-spacing:.07em;color:var(--ink-muted)}
        .hud-key span{width:20px;height:3px;display:block;border-radius:1px}

        .hud-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
        .hud-tile{padding:24px 22px;display:block;text-decoration:none;transition:border-color .18s}
        a.hud-tile:hover{border-color:var(--hair-lit)}
        .hud-n{font-size:40px;line-height:1;font-variant-numeric:tabular-nums;font-weight:400;
          background:linear-gradient(168deg,var(--gold-pale),var(--gold) 60%,var(--gold-deep));
          -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:var(--gold)}
        .hud-n.dim{background:none;-webkit-text-fill-color:var(--ink-muted);color:var(--ink-muted)}
        .hud-l{font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-high);margin-top:14px;font-weight:500}
        .hud-s{font-size:13px;color:var(--ink-muted);margin-top:5px;letter-spacing:.03em}
        .hud-chip{display:inline-flex;align-items:center;margin-top:13px;font-size:12px;letter-spacing:.12em;
          text-transform:uppercase;padding:5px 11px;border:1px solid currentColor;border-radius:2px;font-weight:500}
        .hud-chip.pos{color:var(--pos)} .hud-chip.low{color:var(--sev-low)}
        .hud-chip.mid{color:var(--sev-mid)} .hud-chip.high{color:var(--sev-high)}
        .hud-chip.idle{color:var(--ink-faint)}

        .hud-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px}
        .hud-dist{padding:26px 30px;display:flex;flex-direction:column;gap:18px}
        .hud-row{display:grid;grid-template-columns:118px 1fr 40px;align-items:center;gap:16px}
        .hud-row .k{font-size:14px;letter-spacing:.08em;color:var(--ink-high);text-transform:capitalize}
        .hud-row .v{font-size:15px;color:var(--gold-bright);text-align:right;font-variant-numeric:tabular-nums;font-weight:500}
        .hud-meter{height:3px;background:rgba(212,160,23,.1);position:relative;overflow:hidden}
        .hud-meter i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,var(--gold-deep),var(--gold-bright))}
        .hud-caption{font-size:14px;color:var(--ink-body);margin:2px 0 0;letter-spacing:.02em;line-height:1.65}
        .hud-empty{font-size:14px;color:var(--ink-faint);letter-spacing:.03em}

        .hud-tablewrap{overflow-x:auto}
        .hud table{width:100%;border-collapse:collapse;min-width:600px}
        .hud th{text-align:left;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-muted);
          font-weight:500;padding:18px 24px;border-bottom:1px solid var(--hair)}
        .hud td{padding:16px 24px;font-size:14px;border-bottom:1px solid rgba(212,160,23,.07);letter-spacing:.02em}
        .hud tbody tr:last-child td{border-bottom:0}
        .hud tbody tr{transition:background .18s}
        .hud tbody tr:hover{background:var(--raised)}
        .hud td.id{color:var(--ink-high)}
        .hud td.num{color:var(--gold-bright);font-variant-numeric:tabular-nums;font-weight:500}
        .hud td.zero{color:var(--ink-muted);font-variant-numeric:tabular-nums}
        .hud-act{color:var(--gold-bright);text-decoration:none;border-bottom:1px solid transparent;
          font-size:13px;letter-spacing:.1em;text-transform:uppercase;font-weight:500;transition:border-color .18s}
        .hud-act:hover,.hud-act:focus-visible{border-bottom-color:var(--gold-bright);outline:none}

        .hud-links{display:flex;flex-wrap:wrap;gap:10px}
        .hud-link{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-muted);
          text-decoration:none;border:1px solid var(--hair);padding:10px 16px;transition:color .18s,border-color .18s}
        .hud-link:hover{color:var(--gold-bright);border-color:var(--hair-lit)}

        .hud-foot{margin-top:52px;padding-top:22px;border-top:1px solid var(--hair);font-size:12px;
          color:var(--ink-faint);letter-spacing:.14em;text-transform:uppercase;
          display:flex;flex-wrap:wrap;gap:10px 32px}

        @media(prefers-reduced-motion:reduce){.hud *{animation:none!important}}
      `}</style>

      <div className="hud-shell">

        {/* ── Status rail ──────────────────────────────────────────────── */}
        <div className="hud-rail">
          <span className="hud-sig"><span className="hud-dot" />Systems <b>{failed24h === 0 ? 'nominal' : 'degraded'}</b></span>
          <span className="hud-sig">Publish 24h <b>{successRate}%</b></span>
          <span className="hud-sig">Revenue <b>{fmtMRR(estimatedMRR)}/mo</b></span>
          <span className="hud-sig hud-spacer">Operator <b>{user.email?.split('@')[0] ?? 'admin'}</b></span>
        </div>

        <p className="hud-kicker">Command Deck · God Mode</p>
        <div className="hud-mast">
          <h1>SocialMate</h1>
          <div className="hud-stamp">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            <br />{fmt(totalUsers)} accounts tracked
          </div>
        </div>
        <div className="hud-rule" />

        {/* ── Activation ───────────────────────────────────────────────── */}
        <h2 className="hud-sec">Activation</h2>
        <div className="hud-core">
          <div className="hud-card hud-reactor">
            <svg viewBox="0 0 160 160" role="img" aria-label={`Activation rate ${activationPct.toFixed(1)} percent`}>
              <defs>
                <linearGradient id="hudGoldArc" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F9EAC0" /><stop offset="48%" stopColor="#EAC020" /><stop offset="100%" stopColor="#8B6914" />
                </linearGradient>
                <linearGradient id="hudGoldTxt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F9EAC0" /><stop offset="68%" stopColor="#EAC020" /><stop offset="100%" stopColor="#A87C15" />
                </linearGradient>
              </defs>
              <circle className="hud-track" cx="80" cy="80" r="68" />
              <circle className="hud-live" cx="80" cy="80" r="68"
                      strokeDasharray={RING_C} strokeDashoffset={ringFill} />
              <line className="hud-tick" x1="80" y1="4" x2="80" y2="14" />
              <line className="hud-tick" x1="156" y1="80" x2="146" y2="80" />
              <line className="hud-tick" x1="80" y1="156" x2="80" y2="146" />
              <line className="hud-tick" x1="4" y1="80" x2="14" y2="80" />
              <text x="80" y="84" textAnchor="middle" fill="url(#hudGoldTxt)"
                    style={{ fontFamily: 'var(--mono)', fontSize: '38px', fontWeight: 500, letterSpacing: '-.5px' }}>
                {activationPct.toFixed(1)}%
              </text>
              <text x="80" y="104" textAnchor="middle" fill="#B3ACA1"
                    style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '2.4px' }}>
                SIGNUP → PUBLISHED
              </text>
            </svg>
            <p className="hud-note"><b>{fmt(notActivated)} accounts</b> ready to activate</p>
          </div>

          <div className="hud-card hud-cascade">
            {cascade.map(s => (
              <div className="hud-stage" key={s.name}>
                <span className="hud-name">{s.name}</span>
                <span className="hud-nums">{fmt(s.value)} <em>{s.pctBase}%</em></span>
                <span className="hud-bar">
                  <i className={s.sev ? `s-${s.sev}` : ''} style={{ width: `${Math.max(s.pctBase, 1)}%` }} />
                </span>
                {s.sev && (
                  <span className={`hud-loss s-${s.sev}`}>
                    {s.sev === 'gain'
                      ? `${Math.abs(s.dropPct)}% gain · ${fmt(Math.abs(s.lost))} accounts`
                      : `${s.dropPct}% drop · ${fmt(s.lost)} account${s.lost === 1 ? '' : 's'}`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="hud-legend">
          <span className="hud-key"><span style={{ background: 'var(--pos)' }} />Gain</span>
          <span className="hud-key"><span style={{ background: 'var(--sev-low)' }} />Mild · under 30%</span>
          <span className="hud-key"><span style={{ background: 'var(--sev-mid)' }} />Moderate · 30–60%</span>
          <span className="hud-key"><span style={{ background: 'var(--sev-high)' }} />Severe · over 60%</span>
        </div>

        {/* ── Growth ───────────────────────────────────────────────────── */}
        <h2 className="hud-sec">Growth</h2>
        <div className="hud-grid">
          <Link href="/admin/users" className="hud-card hud-tile">
            <div className="hud-n">{fmt(totalUsers)}</div>
            <div className="hud-l">Total users</div>
            <div className="hud-s">registered accounts</div>
            <span className={`hud-chip ${newUsers7d > 0 ? 'pos' : 'idle'}`}>{newUsers7d > 0 ? 'Growing' : 'Flat'}</span>
          </Link>
          <div className="hud-card hud-tile">
            <div className={`hud-n ${newUsers7d === 0 ? 'dim' : ''}`}>{fmt(newUsers7d)}</div>
            <div className="hud-l">New last 7d</div>
            <div className="hud-s">{totalUsers > 0 ? `+${((newUsers7d / totalUsers) * 100).toFixed(1)}% on base` : 'no base yet'}</div>
            <span className={`hud-chip ${newUsers7d > 0 ? 'pos' : 'idle'}`}>{newUsers7d > 0 ? 'Steady intake' : 'No signups'}</span>
          </div>
          <Link href="/admin/users?plan=pro" className="hud-card hud-tile">
            <div className={`hud-n ${proCount === 0 ? 'dim' : ''}`}>{fmt(proCount)}</div>
            <div className="hud-l">Pro</div>
            <div className="hud-s">pro + annual</div>
            <span className={`hud-chip ${proCount > 0 ? 'pos' : 'idle'}`}>{proCount > 0 ? 'Paying' : 'None yet'}</span>
          </Link>
          <Link href="/admin/users?plan=agency" className="hud-card hud-tile">
            <div className={`hud-n ${agencyCount === 0 ? 'dim' : ''}`}>{fmt(agencyCount)}</div>
            <div className="hud-l">Agency</div>
            <div className="hud-s">agency + annual</div>
            <span className={`hud-chip ${agencyCount > 0 ? 'pos' : 'idle'}`}>{agencyCount > 0 ? 'Paying' : 'None yet'}</span>
          </Link>
          <div className="hud-card hud-tile">
            <div className={`hud-n ${estimatedMRR === 0 ? 'dim' : ''}`}>{fmtMRR(estimatedMRR)}</div>
            <div className="hud-l">Est. MRR</div>
            <div className="hud-s">{fmt(activePaidCount)} paid workspace{activePaidCount === 1 ? '' : 's'} · excludes admin</div>
            <span className={`hud-chip ${estimatedMRR > 0 ? 'pos' : 'mid'}`}>{estimatedMRR > 0 ? 'Earning' : 'Pre-revenue'}</span>
          </div>
        </div>

        {/* ── Health ───────────────────────────────────────────────────── */}
        <h2 className="hud-sec">Health</h2>
        <div className="hud-grid">
          <div className="hud-card hud-tile">
            <div className={`hud-n ${churnCount === 0 ? '' : 'dim'}`}>{fmt(churnCount)}</div>
            <div className="hud-l">Paid at risk</div>
            <div className="hud-s">
              {churnCount === 0 ? '30d+ old · no post in 14d' : churnEmails.slice(0, 2).join(', ')}
            </div>
            <span className={`hud-chip ${churnCount === 0 ? 'pos' : 'high'}`}>{churnCount === 0 ? 'All clear' : 'Needs outreach'}</span>
          </div>
          <div className="hud-card hud-tile">
            <div className={`hud-n ${failed24h === 0 ? '' : 'dim'}`}>{fmt(failed24h)}</div>
            <div className="hud-l">Failed 24h</div>
            <div className="hud-s">status = failed</div>
            <span className={`hud-chip ${failed24h === 0 ? 'pos' : 'high'}`}>{failed24h === 0 ? 'Clean' : 'Investigate'}</span>
          </div>
          <div className="hud-card hud-tile">
            <div className={`hud-n ${topReferrer ? '' : 'dim'}`}>{topReferrer ? fmt(topReferrer.count) : '0'}</div>
            <div className="hud-l">Top referrer</div>
            <div className="hud-s">{topReferrer ? topReferrer.source : 'no referrer data'}</div>
            <span className={`hud-chip ${topReferrer ? 'pos' : 'idle'}`}>{topReferrer ? 'Acquiring' : 'No signal'}</span>
          </div>
          <div className="hud-card hud-tile">
            <div className="hud-n">{LIVE_PLATFORMS}</div>
            <div className="hud-l">Platforms live</div>
            <div className="hud-s">{platformsInUse} in use by users</div>
            <span className="hud-chip pos">Nominal</span>
          </div>
        </div>

        {/* ── Pipeline ─────────────────────────────────────────────────── */}
        <h2 className="hud-sec">Pipeline · last 24h</h2>
        <div className="hud-grid">
          <div className="hud-card hud-tile">
            <div className={`hud-n ${published24h === 0 ? 'dim' : ''}`}>{fmt(published24h)}</div>
            <div className="hud-l">Published</div>
            <div className="hud-s">status = published</div>
            <span className={`hud-chip ${published24h > 0 ? 'pos' : 'idle'}`}>{published24h > 0 ? 'Flowing' : 'Quiet'}</span>
          </div>
          <div className="hud-card hud-tile">
            <div className={`hud-n ${failed24h === 0 ? 'dim' : ''}`}>{fmt(failed24h)}</div>
            <div className="hud-l">Failed</div>
            <div className="hud-s">status = failed</div>
            <span className={`hud-chip ${failed24h === 0 ? 'pos' : 'high'}`}>{failed24h === 0 ? 'None' : 'Errors'}</span>
          </div>
          <div className="hud-card hud-tile">
            <div className={`hud-n ${partial24h === 0 ? 'dim' : ''}`}>{fmt(partial24h)}</div>
            <div className="hud-l">Partial</div>
            <div className="hud-s">status = partial</div>
            <span className={`hud-chip ${partial24h === 0 ? 'pos' : 'mid'}`}>{partial24h === 0 ? 'None' : 'Degraded'}</span>
          </div>
          <Link href="/admin/platform-stats" className="hud-card hud-tile">
            <div className={`hud-n ${totalAttempted24h === 0 ? 'dim' : ''}`}>{successRate}%</div>
            <div className="hud-l">Success rate</div>
            <div className="hud-s">{totalAttempted24h === 0 ? '0 attempts this window' : `${fmt(totalAttempted24h)} attempts`}</div>
            <span className={`hud-chip ${totalAttempted24h === 0 ? 'idle' : successRate >= 95 ? 'pos' : successRate >= 80 ? 'mid' : 'high'}`}>
              {totalAttempted24h === 0 ? 'No signal' : successRate >= 95 ? 'Healthy' : successRate >= 80 ? 'Watch' : 'Failing'}
            </span>
          </Link>
          <div className="hud-card hud-tile">
            <div className={`hud-n ${somaActiveProjects === 0 ? 'dim' : ''}`}>{fmt(somaActiveProjects)}</div>
            <div className="hud-l">SOMA active</div>
            <div className="hud-s">{fmt(somaProjects)} projects · {fmt(somaCreditsMTD)} credits MTD</div>
            <span className={`hud-chip ${somaActiveProjects > 0 ? 'pos' : 'idle'}`}>{somaActiveProjects > 0 ? 'Running' : 'Idle'}</span>
          </div>
        </div>

        {/* ── Signal sources ───────────────────────────────────────────── */}
        <h2 className="hud-sec">Signal sources</h2>
        <div className="hud-two">
          <div className="hud-card hud-dist">
            {platformDist.length === 0
              ? <p className="hud-empty">No connected accounts yet.</p>
              : platformDist.map(p => (
                  <div className="hud-row" key={p.platform}>
                    <span className="k">{p.platform}</span>
                    <span className="hud-meter"><i style={{ width: `${(p.count / maxPlatform) * 100}%` }} /></span>
                    <span className="v">{fmt(p.count)}</span>
                  </div>
                ))}
          </div>
          <div className="hud-card hud-dist">
            {signupReferrers.length === 0
              ? <p className="hud-empty">No referrer data captured yet.</p>
              : signupReferrers.slice(0, 6).map(r => (
                  <div className="hud-row" key={r.source}>
                    <span className="k">{r.source}</span>
                    <span className="hud-meter"><i style={{ width: `${(r.count / maxReferrer) * 100}%` }} /></span>
                    <span className="v">{fmt(r.count)}</span>
                  </div>
                ))}
            <p className="hud-caption">
              {fmt(attributedCount)} of {fmt(totalTracked)} signups carry attribution data.
            </p>
          </div>
        </div>

        {/* UTM + blog attribution — only rendered when there is something to show,
            so the section stays quiet until the data actually exists. */}
        {(signupSources.length > 0 || blogAttribution.length > 0) && (
          <div className="hud-two" style={{ marginTop: '16px' }}>
            {signupSources.length > 0 && (
              <div className="hud-card hud-dist">
                {signupSources.slice(0, 6).map(s => (
                  <div className="hud-row" key={s.source}>
                    <span className="k">{s.source}</span>
                    <span className="hud-meter">
                      <i style={{ width: `${(s.count / Math.max(1, ...signupSources.map(x => x.count))) * 100}%` }} />
                    </span>
                    <span className="v">{fmt(s.count)}</span>
                  </div>
                ))}
                <p className="hud-caption">utm_source on signup</p>
              </div>
            )}
            {blogAttribution.length > 0 && (
              <div className="hud-card hud-dist">
                {blogAttribution.slice(0, 6).map(b => (
                  <div className="hud-row" key={b.source}>
                    <span className="k">{b.source}</span>
                    <span className="hud-meter">
                      <i style={{ width: `${(b.count / Math.max(1, ...blogAttribution.map(x => x.count))) * 100}%` }} />
                    </span>
                    <span className="v">{fmt(b.count)}</span>
                  </div>
                ))}
                <p className="hud-caption">signups that came in via a blog post</p>
              </div>
            )}
          </div>
        )}

        {/* ── Roster ───────────────────────────────────────────────────── */}
        <h2 className="hud-sec">Roster · highest login count</h2>
        <div className="hud-card hud-tablewrap">
          {powerUsers.length === 0 ? (
            <p className="hud-empty" style={{ padding: '26px 30px' }}>No login activity recorded yet.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Account</th><th>Logins</th><th>Posts</th><th>Last active</th><th>Action</th></tr>
              </thead>
              <tbody>
                {powerUsers.map(u => (
                  <tr key={u.user_id}>
                    <td className="id">{u.email}</td>
                    <td className="num">{fmt(u.login_count)}</td>
                    <td className={u.posts_count > 0 ? 'num' : 'zero'}>{fmt(u.posts_count)}</td>
                    <td className="zero">{fmtDate(u.last_active)}</td>
                    <td>
                      <a
                        className="hud-act"
                        href={`mailto:${u.email}?subject=${encodeURIComponent('6 months of SocialMate Pro, on me')}&body=${encodeURIComponent(
                          `Hey,\n\nI'm Joshua, the founder of SocialMate. I noticed you've been logging in and I'd love 15 minutes of your time to hear what's working and what isn't.\n\nAs a thank you I'll put 6 months of Pro on your account, no strings.\n\nInterested?\n\nJoshua`
                        )}`}
                      >
                        Reach out
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Recent signups ───────────────────────────────────────────── */}
        <h2 className="hud-sec">Recent signups</h2>
        <div className="hud-card hud-tablewrap">
          {recentUsers.length === 0 ? (
            <p className="hud-empty" style={{ padding: '26px 30px' }}>No signups recorded yet.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Account</th><th>Plan</th><th>Posts</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={`${u.email}-${u.created_at}`}>
                    <td className="id">{u.email}</td>
                    <td className="zero">{u.plan}</td>
                    <td className={u.posts_count > 0 ? 'num' : 'zero'}>{fmt(u.posts_count)}</td>
                    <td className="zero">{fmtDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Navigation ───────────────────────────────────────────────── */}
        <h2 className="hud-sec">Console</h2>
        <div className="hud-links">
          {QUICK_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="hud-link">{l.label}</Link>
          ))}
        </div>

        <div className="hud-foot">
          <span>Live data · excludes admin account</span>
          <span>/admin/overview</span>
        </div>
      </div>
    </div>
  )
}
