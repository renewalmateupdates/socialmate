'use client'
import { useState } from 'react'
import Link from 'next/link'

const FREE_FEATURES = [
  'All 16 social platforms',
  '1 account per platform',
  'Schedule up to 2 weeks ahead',
  'Unlimited scheduled posts',
  '100 AI credits / month',
  '2 team members',
  'Content Calendar & Queue',
  'Drafts & Bulk Scheduler',
  'Media Library',
  'Hashtag Collections',
  'Post Templates',
  'Link in Bio builder',
  'Analytics dashboard',
  'Best Times to Post',
  'Global search',
  'Referral program',
]

const PRO_FEATURES = [
  'Everything in Free',
  '5 accounts per platform',
  'Schedule up to 1 month ahead',
  '500 AI credits / month',
  '5 team members',
  'AI caption generator',
  'AI hashtag suggestions',
  'AI post optimizer',
  'Advanced analytics',
  'Priority support',
  'Early access to new features',
]

const AGENCY_FEATURES = [
  'Everything in Pro',
  '10 accounts per platform',
  'Schedule up to 3 months ahead',
  'Unlimited AI credits',
  'Unlimited team members',
  'Master account + client workspaces',
  'Dedicated support',
  'White-label add-on — coming soon',
]

const COMPARISON = [
  {
    feature: 'Social platforms supported',
    us: 'All 16 — free',
    typical: 'Usually 3–6 on base plan',
    note: true,
  },
  {
    feature: 'Scheduled posts',
    us: 'Unlimited',
    typical: 'Capped or per-channel limits',
    note: true,
  },
  {
    feature: 'Team members',
    us: 'Up to 2 free · 5 Pro · Unlimited Agency',
    typical: 'Per-seat pricing ($10–25/user/mo)',
    note: true,
  },
  {
    feature: 'AI captions',
    us: '100 credits free / 500 Pro',
    typical: 'Paid add-on or not available',
    note: true,
  },
  {
    feature: 'Link in Bio',
    us: 'Included free',
    typical: 'Not included or separate paid tool',
    note: true,
  },
  {
    feature: 'Bulk Scheduler',
    us: 'Included free',
    typical: 'Paid plan only',
    note: true,
  },
  {
    feature: 'Analytics',
    us: 'Free · Advanced on Pro',
    typical: 'Limited free or paid add-on',
    note: true,
  },
  {
    feature: 'Client workspaces',
    us: 'Agency tier — $20/mo',
    typical: 'Enterprise pricing or not offered',
    note: true,
  },
  {
    feature: 'Monthly cost',
    us: '$0 · $5 · $20',
    typical: '$25–$300+/mo depending on usage',
    note: false,
  },
]

const FAQS = [
  {
    q: 'Is the free plan actually free forever?',
    a: 'Yes. No trial period, no credit card required, no bait-and-switch. The free plan is genuinely free forever. We make money when power users upgrade to Pro or Agency for more AI credits, more accounts, and advanced features.',
  },
  {
    q: 'Why is so much included for free?',
    a: "We built SocialMate because we believe professional tools shouldn't require a professional budget. The free tier is sustainable because a meaningful percentage of users upgrade when they need more — and that's enough to keep the lights on for everyone else.",
  },
  {
    q: 'What are AI credits and what do they cover?',
    a: 'AI credits power caption generation, hashtag suggestions, and post optimization. Each generation uses roughly one credit. Free users get 100 credits per month, Pro gets 500, and Agency gets unlimited. Credits reset on the 1st of every month. If you run out, everything else keeps working — only AI generation pauses until your reset.',
  },
  {
    q: 'What is the difference between Pro and Agency?',
    a: 'Pro is for individual creators and small teams who want more AI power and more accounts per platform. Agency adds separate client workspaces — each client gets their own isolated dashboard you manage from one master login — plus unlimited team members and a 3-month scheduling horizon.',
  },
  {
    q: 'What does the white-label add-on mean for Agency users?',
    a: "White-label lets your clients see your agency's branding instead of SocialMate's — your logo, your colors, your domain. They never know what's powering it. This is coming soon as a $20/month add-on on top of the Agency plan, bringing the total to $40/month for a fully branded agency tool.",
  },
  {
    q: 'Do annual plans auto-renew?',
    a: "Yes, annual plans renew automatically on your billing anniversary. You can cancel anytime before renewal and you'll keep access until the end of your paid period. No cancellation fees, no questions asked.",
  },
  {
    q: 'Can I switch between monthly and annual?',
    a: "Yes. You can switch to annual at any time to lock in the lower rate and get 2 months free. If you're on annual and switch back to monthly, you'll keep annual access until the end of your current billing period.",
  },
  {
    q: 'Can I cancel anytime?',
    a: "Always. Cancel anytime, no questions asked. You keep your paid features until the end of your billing period, then move to the free plan automatically. Your data stays safe.",
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <Link href="/pricing" className="text-black font-bold">Pricing</Link>
          <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors hidden sm:block">Sign in</Link>
          <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Get started free →
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
            🎉 Free forever · No credit card required
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Simple, honest pricing.</h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto mb-8">
            The free plan outperforms what most tools charge pro prices for. Paid tiers are about acceleration, not access.
          </p>

          {/* BILLING TOGGLE */}
          <div className="inline-flex items-center gap-3 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${!annual ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}>
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${annual ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}>
              Annual
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">2 months free</span>
            </button>
          </div>
        </div>

        {/* PLANS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

          {/* FREE */}
          <div className="border border-gray-200 rounded-3xl p-7">
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Free Forever</p>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-5xl font-extrabold tracking-tight">$0</span>
                <span className="text-gray-400 text-sm mb-2">/ forever</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">Everything you need to run your social media professionally. No strings attached.</p>
            </div>
            <Link href="/signup"
              className="block w-full py-3 border-2 border-black text-black text-sm font-bold rounded-xl hover:bg-black hover:text-white transition-all text-center mb-6">
              Get started free →
            </Link>
            <div className="space-y-2.5">
              {FREE_FEATURES.map(f => (
                <div key={f} className="flex items-start gap-2.5 text-sm">
                  <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-gray-600">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PRO */}
          <div className="bg-black text-white rounded-3xl p-7 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-white text-black text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg">
                ⚡ Most Popular
              </span>
            </div>
            <div className="mb-6">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Pro</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-extrabold tracking-tight">
                  {annual ? '$50' : '$5'}
                </span>
                <span className="text-white/50 text-sm mb-2">
                  {annual ? '/ year' : '/ month'}
                </span>
              </div>
              {annual && (
                <p className="text-xs text-green-400 font-semibold mb-2">That's 2 months free</p>
              )}
              {!annual && (
                <p className="text-xs text-white/40 mb-2">or $50/year — 2 months free</p>
              )}
              <p className="text-sm text-white/60 leading-relaxed">For creators and small teams who rely on AI every day.</p>
            </div>
            <Link href="/signup"
              className="block w-full py-3 bg-white text-black text-sm font-bold rounded-xl hover:opacity-90 transition-all text-center mb-6">
              Start Pro →
            </Link>
            <div className="space-y-2.5">
              {PRO_FEATURES.map(f => (
                <div key={f} className="flex items-start gap-2.5 text-sm">
                  <span className="text-green-400 font-bold flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-white/80">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AGENCY */}
          <div className="border-2 border-gray-900 rounded-3xl p-7 relative">
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Agency</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-extrabold tracking-tight">
                  {annual ? '$200' : '$20'}
                </span>
                <span className="text-gray-400 text-sm mb-2">
                  {annual ? '/ year' : '/ month'}
                </span>
              </div>
              {annual && (
                <p className="text-xs text-green-600 font-semibold mb-2">That's 2 months free</p>
              )}
              {!annual && (
                <p className="text-xs text-gray-400 mb-2">or $200/year — 2 months free</p>
              )}
              <p className="text-sm text-gray-400 leading-relaxed">For agencies managing multiple clients under one roof.</p>
            </div>
            <Link href="/signup"
              className="block w-full py-3 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all text-center mb-6">
              Start Agency →
            </Link>
            <div className="space-y-2.5">
              {AGENCY_FEATURES.map(f => (
                <div key={f} className="flex items-start gap-2.5 text-sm">
                  <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-gray-600">{f}</span>
                </div>
              ))}
            </div>

            {/* WHITE LABEL ADDON */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-start gap-2.5">
                <span className="text-purple-500 font-bold flex-shrink-0 mt-0.5">+</span>
                <div>
                  <p className="text-sm font-bold text-gray-800">White-label add-on</p>
                  <p className="text-xs text-gray-400 mt-0.5">Brand the platform as your own. Your logo, your domain, your colors. Clients never see SocialMate.</p>
                  <p className="text-xs font-bold text-purple-600 mt-1.5">+$20/mo · Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WHAT OTHERS CHARGE FOR */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">What you'd typically pay elsewhere</h2>
            <p className="text-gray-400">Most tools charge pro prices for features we include free. Here's the reality.</p>
          </div>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Feature</th>
                    <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Typical tools</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-center bg-black text-white">SocialMate</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={row.feature} className={i < COMPARISON.length - 1 ? 'border-b border-gray-100' : ''}>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-700">{row.feature}</td>
                      <td className="px-5 py-4 text-xs text-center text-gray-400">{row.typical}</td>
                      <td className="px-5 py-4 text-xs text-center font-bold text-black bg-gray-50">{row.us}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Based on publicly available pricing from common social media management tools as of 2026.
          </p>
        </div>

        {/* AFFILIATE CALLOUT */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-10 mb-16 text-center">
          <div className="text-3xl mb-3">🤝</div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Believe in it? Get paid for it.</h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto mb-6">
            Active SocialMate users can apply to our affiliate program. Earn 30% recurring commission on every paying subscriber you refer — forever. Hit 100 active subscribers and it bumps to 40%.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
            {[
              { label: '30%', sub: 'recurring commission' },
              { label: '40%', sub: 'at 100+ subscribers' },
              { label: '∞', sub: 'paid out forever' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4">
                <p className="text-2xl font-extrabold tracking-tight">{stat.label}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">Must be an active SocialMate user to apply. Program launching soon.</p>
        </div>

        {/* FAQ */}
        <div className="mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map(faq => (
              <div key={faq.q} className="border border-gray-100 rounded-2xl p-6">
                <h3 className="text-sm font-bold mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FINAL CTA */}
        <div className="bg-black rounded-3xl p-12 text-white text-center">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">Start free today</h2>
          <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
            No credit card. No trial. No catch. A tool that respects you from day one.
          </p>
          <Link href="/signup"
            className="inline-block bg-white text-black text-sm font-bold px-10 py-5 rounded-2xl hover:opacity-90 transition-all shadow-2xl">
            Create free account →
          </Link>
          <p className="text-white/30 text-xs mt-4">16 platforms · Unlimited posts · Free forever</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 px-8 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="font-bold text-sm tracking-tight">SocialMate</span>
            <span className="text-xs text-gray-400 ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}