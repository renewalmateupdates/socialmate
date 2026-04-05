'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const appUrl = 'https://socialmate.studio'

const MILESTONE_STEP    = 5
const MILESTONE_CREDITS = 100

function getMilestoneProgress(payingReferrals: number) {
  const nextMultiple = Math.ceil((payingReferrals + 1) / MILESTONE_STEP) * MILESTONE_STEP
  const prevMultiple = nextMultiple - MILESTONE_STEP
  const progress     = ((payingReferrals - prevMultiple) / MILESTONE_STEP) * 100
  return { nextMultiple, prevMultiple, progress: Math.max(0, Math.min(100, progress)) }
}

type Conversion = {
  id: string
  status: string
  total_earned: number | null
  converted_at: string | null
  payout_amount?: number | null
  payout_status?: string | null
  payout_date?: string | null
}

type AffiliateData = {
  status: string
  commission_rate?: number
  active_referral_count?: number
}

// ── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const max    = Math.max(...data, 1)
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (v / max) * 100
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-16 h-8 opacity-60" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

// ── CopyableTemplate ─────────────────────────────────────────────────────────
function CopyableTemplate({ label, icon, text }: { label: string; icon: string; text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <span>{icon}</span>
          {label}
        </span>
        <button
          onClick={copy}
          className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
            copied
              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}>
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      <p className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AffiliatePage() {
  const router = useRouter()

  const [referralCode, setReferralCode]         = useState<string | null>(null)
  const [copied, setCopied]                     = useState(false)
  const [loading, setLoading]                   = useState(true)
  const [conversions, setConversions]           = useState<Conversion[]>([])
  const [affiliateData, setAffiliateData]       = useState<AffiliateData | null>(null)
  const [stats, setStats]                       = useState({
    totalReferrals:   0,
    payingReferrals:  0,
    creditsEarned:    0,
    totalEarnings:    0,
    pendingPayout:    0,
  })
  // Monthly buckets for sparkline (last 6 months)
  const [referralTrend, setReferralTrend]       = useState<number[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Load or generate referral code
      const { data: settings } = await supabase
        .from('user_settings')
        .select('referral_code')
        .eq('user_id', user.id)
        .single()

      let code = settings?.referral_code
      if (!code) {
        code = `ref_${user.id.slice(0, 8)}`
        await supabase
          .from('user_settings')
          .upsert({ user_id: user.id, referral_code: code }, { onConflict: 'user_id' })
      }
      setReferralCode(code)

      // Load referral conversions
      const { data: convRows } = await supabase
        .from('referral_conversions')
        .select('id, status, total_earned, converted_at, payout_amount, payout_status, payout_date')
        .eq('affiliate_user_id', user.id)
        .order('converted_at', { ascending: false })

      const rows: Conversion[] = convRows ?? []
      setConversions(rows)

      // Compute stats
      const paying       = rows.filter(c => c.status === 'eligible' || c.status === 'paid').length
      const credits      = rows.reduce((s, c) => s + (c.total_earned ?? 0), 0)
      const totalEarned  = rows.reduce((s, c) => s + (c.payout_amount ?? 0), 0)
      const pending      = rows.filter(c => c.payout_status === 'pending').reduce((s, c) => s + (c.payout_amount ?? 0), 0)
      setStats({
        totalReferrals:  rows.length,
        payingReferrals: paying,
        creditsEarned:   credits,
        totalEarnings:   totalEarned,
        pendingPayout:   pending,
      })

      // Build sparkline — count sign-ups per month for last 6 months
      const now    = new Date()
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        return d.toISOString().slice(0, 7) // "YYYY-MM"
      })
      const monthlyCounts = months.map(mo =>
        rows.filter(c => (c.converted_at ?? '').startsWith(mo)).length
      )
      setReferralTrend(monthlyCounts)

      // Load affiliate program status
      const res = await fetch('/api/affiliate/stats')
      if (res.ok) {
        const json = await res.json()
        if (json.affiliate) setAffiliateData(json.affiliate)
      }

      setLoading(false)
    }
    init()
  }, [router])

  function copyLink() {
    if (!referralCode) return
    navigator.clipboard.writeText(`${appUrl}/?ref=${referralCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const referralLink  = referralCode ? `${appUrl}/?ref=${referralCode}` : ''
  const { nextMultiple, progress } = getMilestoneProgress(stats.payingReferrals)
  const affiliateStatus = affiliateData?.status ?? null
  const commissionRate  = affiliateData?.commission_rate ?? 0.30

  // Share templates (populated once referralLink is known)
  const shareTemplates = referralLink
    ? [
        {
          label: 'Twitter / X',
          icon: '𝕏',
          text: `I've been using @socialmatehq to schedule posts across Bluesky, Discord, Mastodon, and Telegram — all for free. Try it: ${referralLink}`,
        },
        {
          label: 'Discord',
          icon: '💬',
          text: `Hey, found this free social media scheduler that actually works for Bluesky/Discord/Mastodon — ${referralLink}`,
        },
        {
          label: 'General',
          icon: '🔗',
          text: `Free social media scheduler with AI tools — no credit card needed: ${referralLink}`,
        },
      ]
    : []

  if (loading) {
    return (
      <div className="min-h-dvh bg-theme flex">
        <Sidebar />
        <main className="md:ml-56 flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="space-y-2">
              <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded-lg w-48" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800/60 rounded w-80" />
            </div>
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 h-24" />
              ))}
            </div>
            {/* Milestone skeleton */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-24" />
            {/* Link skeleton */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-48" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <main className="md:ml-56 flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* ── HEADER ── */}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Referral &amp; Affiliate</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Share SocialMate and earn credits — or cash commissions if you&apos;re in the partner program.
            </p>
          </div>

          {/* ── STATS GRID ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Referrals — with sparkline */}
            <div className="bg-surface border border-theme rounded-2xl p-4 col-span-2 sm:col-span-1 flex flex-col justify-between gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg opacity-70" aria-hidden>🙋</span>
                  </div>
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 leading-none tabular-nums">
                    {stats.totalReferrals}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">Total Referrals</div>
                </div>
                {referralTrend.some(v => v > 0) && (
                  <span className="text-pink-500 mt-1">
                    <Sparkline data={referralTrend} />
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">signed up via your link</div>
            </div>

            <div className="bg-surface border border-theme rounded-2xl p-4 flex flex-col justify-between gap-1">
              <span className="text-lg opacity-70" aria-hidden>⚡</span>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 leading-none tabular-nums">{stats.payingReferrals}</div>
              <div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active / Paying</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">on a paid plan</div>
              </div>
            </div>

            <div className="bg-surface border border-theme rounded-2xl p-4 flex flex-col justify-between gap-1">
              <span className="text-lg opacity-70" aria-hidden>💰</span>
              <div className="text-3xl font-extrabold text-green-600 dark:text-green-400 leading-none tabular-nums">
                {stats.totalEarnings > 0
                  ? `$${stats.totalEarnings.toFixed(0)}`
                  : stats.creditsEarned > 0
                  ? `${stats.creditsEarned}`
                  : '—'}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {stats.totalEarnings > 0 ? 'Est. Earnings' : 'Credits Earned'}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {stats.totalEarnings > 0
                    ? `${(commissionRate * 100).toFixed(0)}% commission`
                    : 'from referrals'}
                </div>
              </div>
            </div>

            <div className="bg-surface border border-theme rounded-2xl p-4 flex flex-col justify-between gap-1">
              <span className="text-lg opacity-70" aria-hidden>⏳</span>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 leading-none tabular-nums">
                {stats.pendingPayout > 0 ? `$${stats.pendingPayout.toFixed(0)}` : '—'}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Pending Payout</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">60-day hold</div>
              </div>
            </div>
          </div>

          {/* ── MILESTONE PROGRESS ── */}
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold">Milestone Progress</h2>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {stats.payingReferrals} / {nextMultiple} paying referrals
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-3">
              <div
                className="bg-pink-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Reach{' '}
              <span className="font-bold text-gray-900 dark:text-gray-100">{nextMultiple} paying referrals</span>{' '}
              to earn{' '}
              <span className="font-bold text-pink-500">+{MILESTONE_CREDITS} bonus credits</span>.{' '}
              Repeats every 5 paying referrals, forever.
            </p>
          </div>

          {/* ── REFERRAL LINK ── */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
              Your Referral Link
            </h2>

            {/* Link display + copy */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-2">
              <input
                readOnly
                value={referralLink || 'Generating your link…'}
                onClick={e => (e.target as HTMLInputElement).select()}
                className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-pink-400 dark:focus:border-pink-500 outline-none rounded-xl px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-200 cursor-text transition-colors"
              />
              <button
                onClick={copyLink}
                disabled={!referralLink}
                className={`flex-shrink-0 px-7 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 active:scale-95 ${
                  copied
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                    : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'
                }`}>
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
              Share anywhere. When someone signs up and upgrades, you earn automatically.
            </p>

            {/* Share templates */}
            {shareTemplates.length > 0 && (
              <>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                  Ready-to-share templates
                </h3>
                <div className="space-y-3">
                  {shareTemplates.map(t => (
                    <CopyableTemplate key={t.label} label={t.label} icon={t.icon} text={t.text} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── PAYOUT HISTORY ── */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-extrabold mb-4">Payout History</h2>
            {conversions.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">💸</div>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-300">No payouts yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs mx-auto">
                  Once your referrals upgrade to a paid plan, their conversions will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left text-xs font-bold text-gray-400 dark:text-gray-500 pb-2 pr-4">Date</th>
                      <th className="text-right text-xs font-bold text-gray-400 dark:text-gray-500 pb-2 pr-4">Amount</th>
                      <th className="text-right text-xs font-bold text-gray-400 dark:text-gray-500 pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversions.map(c => {
                      const date   = c.converted_at ? new Date(c.converted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
                      const amount = c.payout_amount != null ? `$${c.payout_amount.toFixed(2)}` : c.total_earned != null ? `${c.total_earned} cr` : '—'
                      const rawStatus = c.payout_status ?? c.status ?? 'pending'
                      const status = rawStatus === 'eligible' ? 'pending' : rawStatus
                      const statusLabel = status === 'paid' ? '✓ Paid' : status === 'pending' ? '⏳ Pending' : status
                      const statusStyle =
                        status === 'paid'
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-100 dark:border-green-800'
                          : status === 'pending'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                      return (
                        <tr key={c.id} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                          <td className="py-3 pr-4 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">{date}</td>
                          <td className="py-3 pr-4 text-right font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">{amount}</td>
                          <td className="py-3 text-right">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${statusStyle}`}>
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── PERFORMANCE TIPS ── */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-extrabold mb-1">How to get more referrals</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Actionable tips that actually convert.
            </p>
            <div className="space-y-0">
              {[
                {
                  icon: '🎯',
                  title: 'Share in Bluesky, Mastodon & Discord communities',
                  desc: 'Drop your link in creator, marketing, or indie-maker communities where people talk about tools. Be genuine — explain why you use it.',
                },
                {
                  icon: '✍️',
                  title: 'Write a comparison post',
                  desc: '"SocialMate vs Buffer" or "free Buffer alternatives" searches convert extremely well. A short blog post targeting those keywords pays off long-term.',
                },
                {
                  icon: '📹',
                  title: 'Record a quick walkthrough of your workflow',
                  desc: 'A 60-second screen recording of how you schedule a week of posts is one of the highest-converting formats on YouTube Shorts, TikTok, or Reels.',
                },
                {
                  icon: '🔗',
                  title: 'Add your link to your bio / link-in-bio page',
                  desc: 'A passive placement in your profile bio or Linktree drives consistent sign-ups with zero ongoing effort.',
                },
              ].map(tip => (
                <div key={tip.title} className="flex items-start gap-3.5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <span className="text-xl flex-shrink-0 mt-0.5">{tip.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{tip.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── HOW IT WORKS ── */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-extrabold mb-4">How it works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Share your link', desc: 'Send your referral link to anyone who might benefit from SocialMate.' },
                { step: '2', title: 'They upgrade',    desc: 'When they sign up and upgrade to Pro or Agency, they become a paying referral.' },
                { step: '3', title: 'You earn',        desc: 'Every 5 paying referrals earns +100 bonus AI credits. Affiliate members earn 30–40% cash.' },
              ].map(item => (
                <div key={item.step} className="flex flex-col items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CREDIT REWARDS TABLE ── */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-extrabold mb-3">Credit rewards</h2>
            <div className="space-y-0">
              {[
                { trigger: 'They publish their first post', reward: '+10 credits',  note: 'You both receive +10 credits'  },
                { trigger: 'They upgrade to Pro',           reward: '+50 credits',  note: '7-day hold for refund protection' },
                { trigger: 'They upgrade to Agency',        reward: '+50 credits',  note: '7-day hold for refund protection' },
                { trigger: 'Every 5 paying referrals',      reward: '+100 credits', note: 'Milestone bonus, stacks forever'  },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-bold">{item.trigger}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.note}</p>
                  </div>
                  <span className="text-sm font-extrabold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-xl flex-shrink-0 ml-4">
                    {item.reward}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── AFFILIATE PROGRAM ── */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-extrabold mb-1">Affiliate Program (Cash Commissions)</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Apply to earn 30–40% recurring cash commissions instead of credits. Requires approval.
            </p>

            {affiliateStatus === 'active' ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-green-600 text-lg">✅</span>
                <div>
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">Affiliate status: Active</p>
                  <p className="text-xs text-green-600 dark:text-green-500">
                    You&apos;re earning {(commissionRate * 100).toFixed(0)}% cash commissions on every referral.
                  </p>
                </div>
              </div>
            ) : affiliateStatus === 'pending_review' ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-amber-600 text-lg">⏳</span>
                <div>
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Application under review</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">We&apos;ll notify you by email within 3–5 business days.</p>
                </div>
              </div>
            ) : affiliateStatus === 'rejected' ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl px-4 py-3">
                <p className="text-sm font-bold text-red-700 dark:text-red-400">Application not approved</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">Contact support if you have questions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-theme">
                    <div className="text-xl font-extrabold text-gray-900 dark:text-gray-100">30%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Starting commission</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3 border border-purple-100 dark:border-purple-900">
                    <div className="text-xl font-extrabold text-purple-700 dark:text-purple-400">40%</div>
                    <div className="text-xs text-purple-600 dark:text-purple-500 mt-0.5">At 100 referrals</div>
                  </div>
                </div>
                <Link href="/partners"
                  className="inline-block bg-black dark:bg-white text-white dark:text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                  Apply to Partner Program →
                </Link>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Application-based. Reviewed within 3–5 business days.
                </p>
              </div>
            )}
          </div>

          {/* ── AFFILIATE RESOURCES & GUIDELINES ── */}
          <div className="bg-surface border border-theme rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-sm font-extrabold mb-1">Affiliate Resources &amp; Guidelines</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Everything you need to promote SocialMate effectively and compliantly.
              </p>
            </div>

            {/* Commission earnings examples */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Commission Structure</h3>
              <div className="space-y-2 mb-3">
                {[
                  { range: '1–99 active referrals', rate: '30% recurring', color: 'bg-gray-50 dark:bg-gray-800 border-theme' },
                  { range: '100+ active referrals', rate: '40% recurring', color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900' },
                ].map(tier => (
                  <div key={tier.range} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${tier.color}`}>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{tier.range}</span>
                    <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{tier.rate}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'At 10 users ($20/mo plan)', value: '~$60/mo' },
                  { label: 'At 20 users ($20/mo plan)', value: '~$120/mo' },
                  { label: 'At 100 users ($20/mo plan)', value: '~$800/mo' },
                ].map(ex => (
                  <div key={ex.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-theme text-center">
                    <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{ex.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ex.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payout details */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Payout Details</h3>
              <div className="space-y-0 text-sm">
                {[
                  { icon: '💳', label: 'Payout method',      value: 'Stripe (direct deposit or debit)'                },
                  { icon: '⏱',  label: 'Holding period',     value: '60 days — protects against cancellations & fraud' },
                  { icon: '🔁', label: 'Recurring?',          value: 'Yes — earn on every renewal, not just first payment' },
                  { icon: '➕', label: 'Add-on commissions',  value: 'White-label add-ons ($20–$40) also attributed to you' },
                  { icon: '🔗', label: 'Tracking methods',    value: 'Referral link OR promo code — both fully attributed' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block">{item.label}</span>
                      <span className="text-sm text-gray-800 dark:text-gray-200">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guidelines */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Promotion Guidelines</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-green-600 dark:text-green-500 mb-2">✅ Do</p>
                  <ul className="space-y-1.5">
                    {[
                      'Disclose that you earn a commission (required by FTC/ASA)',
                      'Share your honest experience with the product',
                      'Use your referral link or promo code — both track correctly',
                      'Promote on social posts, blogs, newsletters, YouTube, podcasts',
                      'Emphasize the free plan — it converts better than a paid pitch',
                    ].map(item => (
                      <li key={item} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                        <span className="text-green-500 flex-shrink-0 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-500 dark:text-red-400 mb-2">❌ Don&apos;t</p>
                  <ul className="space-y-1.5">
                    {[
                      "Don't make false or misleading claims about the product",
                      "Don't bid on branded keywords (SocialMate) in paid ads",
                      "Don't spam communities, DMs, or forums with bulk promo",
                      "Don't self-refer or create fake accounts to game commissions",
                      "Don't share your code on coupon/deal sites unless approved",
                    ].map(item => (
                      <li key={item} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                        <span className="text-red-400 flex-shrink-0 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">FAQ</h3>
              <div className="space-y-3">
                {[
                  {
                    q: 'Does it matter if they use my link or my promo code?',
                    a: 'No — both attribute to you equally. Promo codes work well in video content; links work better in blogs and newsletters.',
                  },
                  {
                    q: 'When does the 60-day hold start?',
                    a: "From the date of the referred user's payment. After 60 days with no refund or chargeback, that commission becomes eligible for payout.",
                  },
                  {
                    q: 'Do I earn on renewals?',
                    a: 'Yes. As long as your referred user stays subscribed, you earn on every billing cycle — monthly, quarterly, or annual.',
                  },
                  {
                    q: 'What happens if they downgrade or cancel?',
                    a: 'Future commissions from that user stop. If they cancel within the 60-day window, the commission from that payment is voided.',
                  },
                  {
                    q: 'Is there a minimum payout threshold?',
                    a: 'Stripe payouts are processed once your balance clears the 60-day hold. Contact support if you have questions about payout timing.',
                  },
                ].map(faq => (
                  <div key={faq.q} className="border-b border-gray-50 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">{faq.q}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
