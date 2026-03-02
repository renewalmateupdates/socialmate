import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing — Free Forever',
  description: 'SocialMate is free forever. All 16 platforms, unlimited posts, team collaboration — at zero cost. Pro plan available for AI power users.',
  openGraph: {
    title: 'SocialMate Pricing — Free Forever',
    description: 'All 16 platforms free. No per-channel fees. No post limits. Pro plan for AI power users.',
    url: 'https://socialmate-six.vercel.app/pricing',
  },
}

const FREE_FEATURES = [
  '16 social platforms',
  'Unlimited scheduled posts',
  'Bulk Scheduler',
  'Content Calendar',
  'Drafts & Queue',
  'Media Library',
  'Hashtag Collections',
  'Post Templates',
  'Link in Bio builder',
  'Analytics dashboard',
  'Best Times to Post',
  'Team collaboration (unlimited seats)',
  'Referral program',
  'Global search',
  '15 AI credits / month',
]

const PRO_FEATURES = [
  'Everything in Free',
  '500 AI credits / month',
  'AI caption generator',
  'AI hashtag suggestions',
  'AI post optimizer',
  'Advanced analytics',
  'Custom Link in Bio domain',
  'Priority support',
  'Early access to new features',
  'Remove SocialMate branding',
  'API access',
  'Zapier & Make integrations',
]

const COMPARISON = [
  { feature: 'Social platforms', free: '16', pro: '16', buffer: '3 (then $6/each)', hootsuite: '10', later: '6' },
  { feature: 'Scheduled posts', free: 'Unlimited', pro: 'Unlimited', buffer: '10/channel', hootsuite: 'Unlimited', later: '30/profile' },
  { feature: 'Team members', free: 'Unlimited', pro: 'Unlimited', buffer: '$12/user/mo', hootsuite: '$249/mo for 3', later: '$25/user/mo' },
  { feature: 'AI captions', free: '15 credits', pro: '500 credits', buffer: '❌', hootsuite: 'Paid add-on', later: 'Paid add-on' },
  { feature: 'Link in Bio', free: '✓ Free', pro: '✓ Custom domain', buffer: '❌', hootsuite: '❌', later: '✓ Paid' },
  { feature: 'Bulk Scheduler', free: '✓ Free', pro: '✓ Free', buffer: 'Paid plan', hootsuite: 'Paid plan', later: 'Paid plan' },
  { feature: 'Analytics', free: '✓ Free', pro: '✓ Advanced', buffer: 'Limited free', hootsuite: 'Paid add-on', later: 'Limited free' },
  { feature: 'Monthly cost', free: '$0', pro: '$19/mo', buffer: '$18+/mo', hootsuite: '$99+/mo', later: '$25+/mo' },
]

const FAQS = [
  {
    q: 'Is the free plan actually free forever?',
    a: 'Yes. No trial period, no credit card required, no bait-and-switch. The free plan is genuinely free forever. We make money when power users upgrade to Pro for more AI credits and advanced features.',
  },
  {
    q: 'Why is SocialMate free when Buffer charges $6 per channel?',
    a: "We built SocialMate because we believed social media scheduling was overpriced. Buffer's per-channel model means managing 10 platforms costs $60/month. That's unreasonable. Our free plan is sustainable because a meaningful percentage of users upgrade to Pro for AI features.",
  },
  {
    q: 'What happens if I go over my AI credit limit?',
    a: "You'll see a prompt to upgrade to Pro for 500 credits/month, or you can wait until your credits reset on the first of next month. Your scheduled posts and all other features continue working normally — only AI generation is paused.",
  },
  {
    q: 'Can I really add unlimited team members for free?',
    a: "Yes. Buffer charges $12 per user per month for team features. We don't. Invite your entire team, assign roles (Owner, Admin, Editor, Viewer), and collaborate on content — all included in the free plan.",
  },
  {
    q: 'What payment methods do you accept for Pro?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex), as well as PayPal. Annual plans are billed once per year and save you 37% compared to monthly.',
  },
  {
    q: 'Can I cancel my Pro subscription anytime?',
    a: "Yes, cancel anytime with no questions asked. You'll keep Pro features until the end of your billing period, then automatically move to the free plan. No cancellation fees.",
  },
]

export default function Pricing() {
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
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
            🎉 Free forever · No credit card required
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Simple, honest pricing</h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            Everything you need is free. Pro is for AI power users who want more.
          </p>
        </div>

        {/* PLANS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-3xl mx-auto">

          {/* FREE */}
          <div className="border border-gray-200 rounded-3xl p-8">
            <div className="mb-6">
              <h2 className="text-lg font-extrabold tracking-tight mb-1">Free</h2>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-extrabold tracking-tight">$0</span>
                <span className="text-gray-400 text-sm mb-2">/ forever</span>
              </div>
              <p className="text-sm text-gray-400">Everything you need to manage social media professionally.</p>
            </div>
            <Link href="/signup" className="block w-full py-3 border-2 border-black text-black text-sm font-bold rounded-xl hover:bg-black hover:text-white transition-all text-center mb-6">
              Get started free →
            </Link>
            <div className="space-y-2.5">
              {FREE_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-600">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PRO */}
          <div className="bg-black text-white rounded-3xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-white text-black text-xs font-extrabold px-4 py-1.5 rounded-full shadow">
                ⚡ Most Popular
              </span>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-extrabold tracking-tight mb-1">Pro</h2>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-extrabold tracking-tight">$19</span>
                <span className="text-white/50 text-sm mb-2">/ month</span>
              </div>
              <p className="text-sm text-white/60">For creators and teams who want AI superpowers.</p>
            </div>
            <Link href="/signup" className="block w-full py-3 bg-white text-black text-sm font-bold rounded-xl hover:opacity-90 transition-all text-center mb-6">
              Start Pro free trial →
            </Link>
            <div className="space-y-2.5">
              {PRO_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <span className="text-green-400 font-bold flex-shrink-0">✓</span>
                  <span className="text-white/80">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-center mb-8">How we compare</h2>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wide">Feature</th>
                    <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Buffer</th>
                    <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Hootsuite</th>
                    <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Later</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-center bg-black text-white rounded-t-none">SocialMate</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={row.feature} className={i < COMPARISON.length - 1 ? 'border-b border-gray-100' : ''}>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-700">{row.feature}</td>
                      <td className="px-5 py-4 text-xs text-center text-gray-500">{row.buffer}</td>
                      <td className="px-5 py-4 text-xs text-center text-gray-500">{row.hootsuite}</td>
                      <td className="px-5 py-4 text-xs text-center text-gray-500">{row.later}</td>
                      <td className="px-5 py-4 text-xs text-center font-bold bg-gray-50">
                        {row.free}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Switching from Buffer?{' '}
              <span className="font-bold text-black">Save $1,200+/year</span>
              {' '}by moving to SocialMate.
            </p>
          </div>
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
            No credit card. No trial period. Just a free social media scheduler that actually works.
          </p>
          <Link href="/signup" className="inline-block bg-white text-black text-sm font-bold px-10 py-5 rounded-2xl hover:opacity-90 transition-all shadow-2xl">
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