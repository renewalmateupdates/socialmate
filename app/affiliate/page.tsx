'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

interface Conversion {
  id: string
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
    rejection_reason: string | null
  } | null
  referral_code: string | null
  conversions: Conversion[]
  commission_label: string
  next_tier: { rate: string; remaining: number } | null
}

const PLATFORMS = ['Twitter/X', 'YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'Blog/Newsletter', 'Other']
const AUDIENCE_SIZES = ['Under 1K', '1K–10K', '10K–50K', '50K+']

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Pending',  color: 'bg-gray-100 text-gray-500'    },
  locked:   { label: 'Locked',   color: 'bg-yellow-100 text-yellow-700' },
  eligible: { label: 'Eligible', color: 'bg-green-100 text-green-700'  },
  paid:     { label: 'Paid',     color: 'bg-blue-100 text-blue-600'    },
}

export default function AffiliatePage() {
  const { plan } = useWorkspace()
  const router = useRouter()
  const [data, setData] = useState<AffiliateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  // Form state
  const [fullName, setFullName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [audienceSize, setAudienceSize] = useState('')
  const [promotionPlan, setPromotionPlan] = useState('')
  const [whyGoodFit, setWhyGoodFit] = useState('')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate-six.vercel.app'

  useEffect(() => { fetchStats() }, [])

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

  function togglePlatform(p: string) {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  async function handleSubmit() {
    setSubmitError('')
    if (!fullName.trim() || !promotionPlan.trim() || !whyGoodFit.trim()) {
      setSubmitError('Please fill out all required fields.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/affiliate/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          website_url: websiteUrl,
          platforms: selectedPlatforms,
          audience_size: audienceSize,
          promotion_plan: promotionPlan,
          why_good_fit: whyGoodFit,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setSubmitError(json.error || 'Failed to submit.')
      } else {
        setSubmitSuccess(true)
        await fetchStats()
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function copyLink() {
    if (!data?.referral_code) return
    navigator.clipboard.writeText(`${appUrl}/?ref=${data.referral_code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const referralLink = data?.referral_code ? `${appUrl}/?ref=${data.referral_code}` : ''
  const affiliateStatus = data?.affiliate?.status

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Affiliate Program</h1>
            <p className="text-gray-500 text-sm mt-1">
              Earn recurring commissions by referring new users to SocialMate.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading...</div>

          ) : affiliateStatus === 'active' ? (
            /* ── ACTIVE DASHBOARD ── */
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Unpaid Earnings</div>
                  <div className="text-2xl font-bold text-gray-900">${(data!.affiliate!.unpaid_earnings ?? 0).toFixed(2)}</div>
                  <div className="text-xs text-gray-400 mt-1">Pending payout</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Total Earned</div>
                  <div className="text-2xl font-bold text-gray-900">${(data!.affiliate!.total_earnings ?? 0).toFixed(2)}</div>
                  <div className="text-xs text-gray-400 mt-1">All time</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Active Referrals</div>
                  <div className="text-2xl font-bold text-gray-900">{data!.affiliate!.active_referral_count ?? 0}</div>
                  <div className="text-xs text-gray-400 mt-1">Paying subscribers</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Commission Rate</div>
                    <div className="text-xl font-bold text-gray-900">{data!.commission_label}</div>
                  </div>
                  {data!.next_tier ? (
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Next tier: {data!.next_tier.rate}</div>
                      <div className="text-xs text-purple-600 font-semibold mt-0.5">
                        {data!.next_tier.remaining} more referral{data!.next_tier.remaining !== 1 ? 's' : ''} to unlock
                      </div>
                    </div>
                  ) : (
                    <div className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">Max tier 🎉</div>
                  )}
                </div>
                {data!.next_tier && (
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((data!.affiliate!.active_referral_count ?? 0) / 100) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Your Referral Link</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 font-mono truncate">
                    {referralLink}
                  </div>
                  <button onClick={copyLink}
                    className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all flex-shrink-0">
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Share this link. When someone signs up and subscribes, you earn commission automatically.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                  <h3 className="text-sm font-bold text-gray-900">Referral History</h3>
                </div>
                {(data!.conversions ?? []).length === 0 ? (
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
                      {data!.conversions.map(c => {
                        const badge = STATUS_BADGE[c.status] || STATUS_BADGE.pending
                        return (
                          <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all">
                            <td className="px-5 py-3 text-gray-600">{new Date(c.converted_at).toLocaleDateString()}</td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                            </td>
                            <td className="px-5 py-3 text-gray-500 text-xs">{new Date(c.lock_expires_at).toLocaleDateString()}</td>
                            <td className="px-5 py-3 text-right text-gray-700 font-medium">${(c.monthly_commission ?? 0).toFixed(2)}</td>
                            <td className="px-5 py-3 text-right font-bold text-gray-900">${(c.total_earned ?? 0).toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          ) : affiliateStatus === 'pending_review' ? (
            /* ── PENDING STATE ── */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Application Under Review</h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                Your application has been submitted and is currently being reviewed.
                You'll be notified by email once a decision has been made.
              </p>
            </div>

          ) : affiliateStatus === 'rejected' ? (
            /* ── REJECTED STATE ── */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="text-4xl mb-4">❌</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Application Not Approved</h2>
              {data?.affiliate?.rejection_reason && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 mb-4 text-left max-w-md mx-auto">
                  <strong>Reason:</strong> {data.affiliate.rejection_reason}
                </div>
              )}
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                If you have questions, please reach out to support.
              </p>
            </div>

          ) : (
            /* ── APPLICATION FORM ── */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="text-4xl mb-4 text-center">🤝</div>
              <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">Apply to the Affiliate Program</h2>
              <p className="text-gray-500 text-sm mb-8 text-center max-w-md mx-auto leading-relaxed">
                Earn <strong>30% recurring commission</strong> on every referral, up to <strong>40%</strong> at 100 active referrals.
                Applications are reviewed manually — we'll notify you by email.
              </p>

              {/* Tier info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
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

              {plan === 'free' ? (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 text-sm text-yellow-700 font-medium text-center">
                  You must be on a paid plan to apply.
                  <button onClick={() => router.push('/settings')} className="ml-2 underline hover:no-underline">
                    Upgrade now →
                  </button>
                </div>
              ) : submitSuccess ? (
                <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-4 text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <div className="text-sm font-semibold text-green-700">Application submitted! We'll review it and email you.</div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                      Website or Main Social Profile
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={e => setWebsiteUrl(e.target.value)}
                      placeholder="https://"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                      Active Platforms
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePlatform(p)}
                          className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                            selectedPlatforms.includes(p)
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                          }`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                      Estimated Monthly Audience
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {AUDIENCE_SIZES.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setAudienceSize(s)}
                          className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                            audienceSize === s
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                      How do you plan to promote SocialMate? <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={promotionPlan}
                      onChange={e => setPromotionPlan(e.target.value)}
                      rows={3}
                      placeholder="Describe your content style, audience, and how you'd introduce SocialMate..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                      Why would you be a great affiliate? <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={whyGoodFit}
                      onChange={e => setWhyGoodFit(e.target.value)}
                      rows={3}
                      placeholder="What makes you a good fit for the SocialMate affiliate program?"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 resize-none"
                    />
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                      {submitError}
                    </div>
                  )}

                  <div className="text-xs text-gray-400 pt-1">
                    60-day lock period · 30% recurring commission · Reviewed within 3–5 business days
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-black text-white font-semibold text-sm px-8 py-3 rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
                    {submitting ? 'Submitting...' : 'Submit Application →'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}