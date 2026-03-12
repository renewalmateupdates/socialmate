'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

interface Conversion {
  id: string
  referred_user_id: string
  referral_code: string
  status: 'pending' | 'locked' | 'eligible' | 'paid'
  converted_at: string
  lock_expires_at: string
  monthly_commission: number
  total_earned: number
}

interface AffiliateData {
  affiliate: {
    status: string
    commission_rate: number
    total_earnings: number
    unpaid_earnings: number
    active_referral_count: number
    joined_at: string
  } | null
  referral_code: string | null
  conversions: Conversion[]
  commission_label: string
  next_tier: { rate: string; remaining: number } | null
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Pending',  color: 'bg-gray-100 text-gray-500'   },
  locked:   { label: 'Locked',   color: 'bg-yellow-100 text-yellow-700' },
  eligible: { label: 'Eligible', color: 'bg-green-100 text-green-700'  },
  paid:     { label: 'Paid',     color: 'bg-blue-100 text-blue-600'    },
}

export default function AffiliatePage() {
  const { plan } = useWorkspace()
  const router = useRouter()
  const [data, setData] = useState<AffiliateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [copied, setCopied] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate-six.vercel.app'

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      const res = await fetch('/api/affiliate/stats')
      const json = await res.json()
      setData(json)
    } catch {
      console.error('Failed to load affiliate stats')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    setJoining(true)
    setJoinError('')
    try {
      const res = await fetch('/api/affiliate/join', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        setJoinError(json.error || 'Failed to join.')
      } else {
        await fetchStats()
      }
    } catch {
      setJoinError('Something went wrong. Please try again.')
    } finally {
      setJoining(false)
    }
  }

  function copyLink() {
    if (!data?.referral_code) return
    navigator.clipboard.writeText(`${appUrl}/?ref=${data.referral_code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const referralLink = data?.referral_code ? `${appUrl}/?ref=${data.referral_code}` : ''

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Affiliate Program</h1>
            <p className="text-gray-500 text-sm mt-1">
              Earn recurring commissions by referring new users to SocialMate.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Loading...
            </div>
          ) : !data?.affiliate ? (
            /* ── JOIN CARD ── */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Join the Affiliate Program</h2>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
                Refer users to SocialMate and earn <strong>30% recurring commission</strong> on every active subscription.
                Hit 100 active referrals and earn <strong>40%</strong>. Payouts unlock after a 60-day lock period.
              </p>

              {/* Tier cards */}
              <div className="grid grid-cols-2 gap-4 mb-8 text-left max-w-sm mx-auto">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-2xl font-bold text-gray-900">30%</div>
                  <div className="text-xs text-gray-500 mt-0.5">Recurring commission</div>
                  <div className="text-xs text-gray-400 mt-1">Starting rate</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <div className="text-2xl font-bold text-purple-700">40%</div>
                  <div className="text-xs text-purple-600 mt-0.5">Recurring commission</div>
                  <div className="text-xs text-purple-400 mt-1">At 100 active referrals</div>
                </div>
              </div>

              <div className="text-xs text-gray-400 mb-6">
                60-day lock period · Must be on a paid plan to join
              </div>

              {plan === 'free' ? (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 text-sm text-yellow-700 font-medium">
                  You must be on a paid plan (Pro or Agency) to join the affiliate program.
                  <button
                    onClick={() => router.push('/settings')}
                    className="ml-2 underline hover:no-underline">
                    Upgrade now →
                  </button>
                </div>
              ) : (
                <>
                  {joinError && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
                      {joinError}
                    </div>
                  )}
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="bg-black text-white font-semibold text-sm px-8 py-3 rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
                    {joining ? 'Joining...' : 'Join Affiliate Program →'}
                  </button>
                </>
              )}
            </div>
          ) : (
            /* ── DASHBOARD ── */
            <div className="space-y-6">

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                    Unpaid Earnings
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(data.affiliate.unpaid_earnings ?? 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Pending payout</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                    Total Earned
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(data.affiliate.total_earnings ?? 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">All time</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                    Active Referrals
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {data.affiliate.active_referral_count ?? 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Paying subscribers</div>
                </div>
              </div>

              {/* Commission tier */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                      Commission Rate
                    </div>
                    <div className="text-xl font-bold text-gray-900">{data.commission_label}</div>
                  </div>
                  {data.next_tier && (
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Next tier: {data.next_tier.rate}</div>
                      <div className="text-xs text-purple-600 font-semibold mt-0.5">
                        {data.next_tier.remaining} more referral{data.next_tier.remaining !== 1 ? 's' : ''} to unlock
                      </div>
                    </div>
                  )}
                  {!data.next_tier && (
                    <div className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                      Max tier 🎉
                    </div>
                  )}
                </div>
                {data.next_tier && (
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((data.affiliate.active_referral_count ?? 0) / 100) * 100)}%`
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Referral link */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Your Referral Link
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 font-mono truncate">
                    {referralLink}
                  </div>
                  <button
                    onClick={copyLink}
                    className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all flex-shrink-0">
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Share this link. When someone signs up and subscribes, you earn commission automatically.
                </p>
              </div>

              {/* Conversions table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                  <h3 className="text-sm font-bold text-gray-900">Referral History</h3>
                </div>
                {data.conversions.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-gray-400">
                    No referrals yet. Share your link to get started.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                        <th className="px-5 py-3 text-left">Date</th>
                        <th className="px-5 py-3 text-left">Status</th>
                        <th className="px-5 py-3 text-left">Lock Expires</th>
                        <th className="px-5 py-3 text-right">Monthly</th>
                        <th className="px-5 py-3 text-right">Total Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.conversions.map((c) => {
                        const badge = STATUS_BADGE[c.status] || STATUS_BADGE.pending
                        return (
                          <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all">
                            <td className="px-5 py-3 text-gray-600">
                              {new Date(c.converted_at).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-gray-500 text-xs">
                              {new Date(c.lock_expires_at).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-3 text-right text-gray-700 font-medium">
                              ${(c.monthly_commission ?? 0).toFixed(2)}
                            </td>
                            <td className="px-5 py-3 text-right font-bold text-gray-900">
                              ${(c.total_earned ?? 0).toFixed(2)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  )
}