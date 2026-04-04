'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const appUrl = 'https://socialmate.studio'

const MILESTONE_STEP = 5
const MILESTONE_CREDITS = 100

function getMilestoneProgress(payingReferrals: number) {
  const nextMultiple = Math.ceil((payingReferrals + 1) / MILESTONE_STEP) * MILESTONE_STEP
  const prevMultiple = nextMultiple - MILESTONE_STEP
  const progress     = ((payingReferrals - prevMultiple) / MILESTONE_STEP) * 100
  return { nextMultiple, prevMultiple, progress: Math.max(0, Math.min(100, progress)) }
}

export default function AffiliatePage() {
  const router = useRouter()
  const [userId, setUserId]               = useState<string | null>(null)
  const [referralCode, setReferralCode]   = useState<string | null>(null)
  const [copied, setCopied]               = useState(false)
  const [loading, setLoading]             = useState(true)
  const [stats, setStats]                 = useState({ totalReferrals: 0, payingReferrals: 0, creditsEarned: 0 })
  const [affiliateStatus, setAffiliateStatus] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

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

      // Load referral stats
      const { data: conversions } = await supabase
        .from('referral_conversions')
        .select('status, total_earned')
        .eq('affiliate_user_id', user.id)

      if (conversions) {
        const paying      = conversions.filter(c => c.status === 'eligible' || c.status === 'paid').length
        const credits     = conversions.reduce((sum, c) => sum + (c.total_earned ?? 0), 0)
        setStats({ totalReferrals: conversions.length, payingReferrals: paying, creditsEarned: credits })
      }

      // Load affiliate program status (if any)
      const res = await fetch('/api/affiliate/stats')
      if (res.ok) {
        const json = await res.json()
        if (json.affiliate?.status) setAffiliateStatus(json.affiliate.status)
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

  const referralLink = referralCode ? `${appUrl}/?ref=${referralCode}` : ''
  const { nextMultiple, progress } = getMilestoneProgress(stats.payingReferrals)

  if (loading) {
    return (
      <div className="min-h-dvh bg-theme flex">
        <Sidebar />
        <div className="md:ml-56 flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <main className="md:ml-56 flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Referral & Affiliate</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Share SocialMate and earn credits for every paying referral.
            </p>
          </div>

          {/* REFERRAL LINK */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Your Referral Link</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-3">
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 font-mono truncate">
                {referralLink || 'Generating...'}
              </div>
              <button
                onClick={copyLink}
                disabled={!referralLink}
                className="bg-black dark:bg-white text-white dark:text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all flex-shrink-0 disabled:opacity-40">
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Share this link anywhere. When someone signs up and upgrades, you earn credits automatically.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Referrals',   value: stats.totalReferrals,   sub: 'signed up'       },
              { label: 'Paying Referrals',  value: stats.payingReferrals,  sub: 'on a paid plan'  },
              { label: 'Credits Earned',    value: stats.creditsEarned,    sub: 'from referrals'  },
            ].map(stat => (
              <div key={stat.label} className="bg-surface border border-theme rounded-2xl p-5 text-center">
                <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{stat.value}</div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* MILESTONE PROGRESS */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold">Milestone Progress</h2>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {stats.payingReferrals} / {nextMultiple} paying referrals
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mb-3">
              <div
                className="bg-pink-500 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Reach <span className="font-bold text-gray-900 dark:text-gray-100">{nextMultiple} paying referrals</span> to earn{' '}
              <span className="font-bold text-pink-500">+{MILESTONE_CREDITS} bonus credits</span>.{' '}
              Every 5 paying referrals earns you +{MILESTONE_CREDITS} bonus credits, forever.
            </p>
          </div>

          {/* HOW IT WORKS */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-extrabold mb-4">How it works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: '1', icon: '🔗', title: 'Share your link', desc: 'Send your referral link to anyone who might benefit from SocialMate.' },
                { step: '2', icon: '✅', title: 'They upgrade',    desc: 'When they sign up and upgrade to Pro or Agency, they become a paying referral.' },
                { step: '3', icon: '🎁', title: 'You earn credits', desc: 'Every 5 paying referrals earns you +100 bonus AI credits added to your balance.' },
              ].map(item => (
                <div key={item.step} className="flex flex-col items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
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

          {/* AFFILIATE PROGRAM SECTION */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-extrabold mb-1">Affiliate Program (Cash Commissions)</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Apply to the affiliate program to earn 30–40% recurring cash commissions instead of credits.
              Requires application and approval.
            </p>
            {affiliateStatus === 'active' ? (
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-green-600 text-lg">✅</span>
                <div>
                  <p className="text-sm font-bold text-green-700">Affiliate status: Active</p>
                  <p className="text-xs text-green-600">You&apos;re earning cash commissions on every referral.</p>
                </div>
              </div>
            ) : affiliateStatus === 'pending_review' ? (
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-yellow-600 text-lg">⏳</span>
                <div>
                  <p className="text-sm font-bold text-yellow-700">Application under review</p>
                  <p className="text-xs text-yellow-600">We&apos;ll notify you by email once a decision is made.</p>
                </div>
              </div>
            ) : affiliateStatus === 'rejected' ? (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-sm font-bold text-red-700">Application not approved</p>
                <p className="text-xs text-red-600 mt-0.5">Contact support if you have questions.</p>
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

          {/* CREDIT REWARDS TABLE */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-extrabold mb-3">Credit rewards</h2>
            <div className="space-y-3">
              {[
                { trigger: 'They publish their first post', reward: '+10 credits',  note: 'You both receive +10 credits'  },
                { trigger: 'They upgrade to Pro',           reward: '+50 credits',  note: '7-day hold for refund protection' },
                { trigger: 'They upgrade to Agency',        reward: '+50 credits',  note: '7-day hold for refund protection' },
                { trigger: 'Every 5 paying referrals',      reward: '+100 credits', note: 'Milestone bonus, stacks forever'  },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-bold">{item.trigger}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.note}</p>
                  </div>
                  <span className="text-sm font-extrabold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl flex-shrink-0 ml-4">
                    {item.reward}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── AFFILIATE RESOURCES & GUIDELINES ── */}
          <div className="bg-surface border border-theme rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-sm font-extrabold mb-1">Affiliate Resources & Guidelines</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Everything you need to promote SocialMate effectively and compliantly.
              </p>
            </div>

            {/* Commission structure */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Commission Structure</h3>
              <div className="space-y-2">
                {[
                  { range: '1–99 active referrals',  rate: '30% recurring', color: 'bg-gray-50 dark:bg-gray-800 border-theme' },
                  { range: '100+ active referrals',  rate: '40% recurring', color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900' },
                ].map(tier => (
                  <div key={tier.range} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${tier.color}`}>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{tier.range}</span>
                    <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{tier.rate}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <div className="space-y-2 text-sm">
                {[
                  { icon: '💳', label: 'Payout method',       value: 'Stripe (direct deposit or debit)'           },
                  { icon: '⏱',  label: 'Holding period',      value: '60 days — protects against cancellations & fraud' },
                  { icon: '🔁',  label: 'Recurring?',          value: 'Yes — earn on every renewal, not just first payment' },
                  { icon: '➕',  label: 'Add-on commissions',  value: 'White-label add-ons ($20–$40) also attributed to you' },
                  { icon: '🔗',  label: 'Tracking methods',    value: 'Referral link OR promo code — both fully attributed' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block">{item.label}</span>
                      <span className="text-sm text-gray-800 dark:text-gray-200">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested copy */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Suggested Promo Copy</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Copy and adapt these for your audience. Replace [YOUR_CODE] with your promo code.</p>
              <div className="space-y-3">
                {[
                  {
                    label: 'Short (social post)',
                    text: `I schedule my Bluesky, Discord & Telegram posts with SocialMate — and it's actually free. No credit card, no post limits. Use code [YOUR_CODE] at signup. socialmate.studio`,
                  },
                  {
                    label: 'Medium (caption/email)',
                    text: `If you're tired of paying $99/month for Hootsuite or hitting free-plan limits, SocialMate is worth checking out. It's genuinely free — bulk scheduler, calendar, AI tools, all included. I've been using it for [PLATFORM] scheduling and it saves me hours every week. Sign up with code [YOUR_CODE] at socialmate.studio`,
                  },
                  {
                    label: 'Long (blog/review)',
                    text: `SocialMate is a free social media scheduler built for creators and small businesses who don't want to pay enterprise prices. It supports Bluesky, Discord, Telegram, and Mastodon natively — plus Instagram, TikTok, and others coming soon. The bulk scheduler alone makes it worth trying. There's no credit card required and the free plan doesn't artificially cap your posts. Use referral code [YOUR_CODE] when you sign up at socialmate.studio to get started.`,
                  },
                ].map(copy => (
                  <div key={copy.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-theme">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-2">{copy.label}</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{copy.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Guidelines / Do's and Don'ts */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Promotion Guidelines</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-green-600 mb-2">✅ Do</p>
                  <ul className="space-y-1.5">
                    {[
                      'Disclose that you earn a commission (required by FTC/ASA)',
                      'Share your honest experience with the product',
                      'Use your unique referral link or promo code — both track correctly',
                      'Promote on social posts, blogs, newsletters, YouTube, podcasts',
                      'Emphasize the free plan — it converts better than paid pitch',
                    ].map(item => (
                      <li key={item} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                        <span className="text-green-500 flex-shrink-0 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-500 mb-2">❌ Don&apos;t</p>
                  <ul className="space-y-1.5">
                    {[
                      'Don\'t make false or misleading claims about the product',
                      'Don\'t bid on branded keywords (SocialMate) in paid ads',
                      'Don\'t spam communities, DMs, or forums with bulk promo',
                      'Don\'t self-refer or create fake accounts to game commissions',
                      'Don\'t share your promo code in coupon/deal sites unless approved',
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
                    a: 'No — both attribute to you equally. Use whichever converts better for your audience. Promo codes work well in video content; links work better in blogs and newsletters.',
                  },
                  {
                    q: 'When does the 60-day hold start?',
                    a: 'From the date of the referred user\'s payment. After 60 days with no refund or chargeback, that commission becomes eligible for payout.',
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
                    a: 'Stripe payouts are processed once your balance clears the 60-day hold. Contact support if you have questions about your specific payout timing.',
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
