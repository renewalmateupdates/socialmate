import Link from 'next/link'

const PLANS = [
  {
    name: "Free", price: "$0", period: "forever",
    description: "The most generous free tier in the market. No credit card ever.",
    highlight: false, cta: "Get Started Free", ctaHref: "/signup",
    features: [
      "Unlimited scheduled posts",
      "2-week scheduling window",
      "3 connected accounts",
      "15 AI credits / month",
      "Visual content calendar",
      "Basic analytics",
      "Best time to post",
      "No credit card required",
    ],
  },
  {
    name: "Pro", price: "$5", period: "per month",
    description: "For serious creators who need more reach and power.",
    highlight: true, cta: "Start Pro →", ctaHref: "/signup?plan=pro",
    features: [
      "Everything in Free",
      "3-month scheduling window",
      "10 connected accounts",
      "500 AI credits / month",
      "AI hashtag generator",
      "5 team members",
      "Post recycling",
      "Priority support",
    ],
  },
  {
    name: "Agency", price: "$20", period: "per month",
    description: "For agencies managing multiple brands at scale.",
    highlight: false, cta: "Start Agency →", ctaHref: "/signup?plan=agency",
    features: [
      "Everything in Pro",
      "Unlimited scheduling window",
      "Unlimited connected accounts",
      "Unlimited AI credits",
      "Unlimited team members",
      "White label reports",
      "Competitor benchmarking",
      "Dedicated support",
    ],
  },
]

const COMPARE = [
  { feature: "Scheduling window", free: "2 weeks", pro: "3 months", agency: "Unlimited" },
  { feature: "Connected accounts", free: "3", pro: "10", agency: "Unlimited" },
  { feature: "AI credits / month", free: "15", pro: "500", agency: "Unlimited" },
  { feature: "Team members", free: "1", pro: "5", agency: "Unlimited" },
  { feature: "AI caption writer", free: "✓", pro: "✓", agency: "✓" },
  { feature: "AI hashtag generator", free: "—", pro: "✓", agency: "✓" },
  { feature: "Post recycling", free: "—", pro: "✓", agency: "✓" },
  { feature: "Analytics", free: "Basic", pro: "Full", agency: "Full + Export" },
  { feature: "White label reports", free: "—", pro: "—", agency: "✓" },
  { feature: "Competitor benchmarking", free: "—", pro: "—", agency: "✓" },
  { feature: "Support", free: "Community", pro: "Priority", agency: "Dedicated" },
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <nav className="sticky top-0 bg-white/90 backdrop-blur border-b border-[#e4e4e0] z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Log in</Link>
            <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              Get Started Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          Free plan is genuinely free. No trial. No gotcha.
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">Simple, honest pricing.</h1>
        <p className="text-gray-500 max-w-xl mx-auto">Start free forever. Upgrade only when you need more. No hidden fees, no feature paywalls on the basics.</p>
      </section>

      {/* PRICING CARDS */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {PLANS.map(plan => (
            <div key={plan.name} className={`rounded-2xl p-7 flex flex-col ${plan.highlight ? 'bg-black text-white border-2 border-black' : 'bg-white border border-gray-200'}`}>
              {plan.highlight && (
                <div className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit">
                  ⭐ Most Popular
                </div>
              )}
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{plan.name}</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                <span className="text-sm pb-1 text-gray-400">/{plan.period}</span>
              </div>
              <p className={`text-sm mb-6 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>
              <Link href={plan.ctaHref} className={`text-center font-semibold px-5 py-3 rounded-xl text-sm transition-all mb-6 ${plan.highlight ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:opacity-80'}`}>
                {plan.cta}
              </Link>
              <ul className="space-y-3 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 text-xs ${plan.highlight ? 'text-green-400' : 'text-green-500'}`}>✓</span>
                    <span className={plan.highlight ? 'text-gray-300' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* COMPARISON TABLE */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-16">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-extrabold text-lg tracking-tight">Full feature comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-1/2">Feature</th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Free</th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-black uppercase tracking-wide bg-gray-50">Pro</th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Agency</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-3 text-sm text-gray-700 font-medium">{row.feature}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">{row.free}</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-black bg-gray-50/50">{row.pro}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">{row.agency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl font-extrabold tracking-tight text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is the free plan actually free?", a: "Yes. No credit card, no trial period, no surprise charges. The free plan is free forever." },
              { q: "Can I cancel anytime?", a: "Yes. No contracts, no cancellation fees. Cancel from your settings page and your plan downgrades at the end of the billing period." },
              { q: "What happens to my posts if I downgrade?", a: "Your posts and drafts are safe. If you go back to free, posts scheduled beyond the 2-week window will move to drafts." },
              { q: "Do you offer refunds?", a: "We don't offer partial refunds, but if you have an issue reach out to renewalmate.updates@gmail.com and we will make it right." },
              { q: "How does the referral program work?", a: "Share your unique link. When someone signs up you get 25 AI credits. When they upgrade to Pro you get 3 months free. Agency upgrade gets you 6 months free." },
            ].map(faq => (
              <div key={faq.q} className="border border-gray-100 rounded-2xl p-5">
                <div className="font-semibold text-sm mb-2">{faq.q}</div>
                <p className="text-sm text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">Ready to get started?</h2>
          <p className="text-gray-500 mb-8">Join 18,000+ creators. Free forever, no credit card needed.</p>
          <Link href="/signup" className="bg-black text-white font-semibold px-10 py-4 rounded-2xl hover:opacity-80 transition-all text-base inline-block">
            Get Started Free →
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e4e4e0]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="/blog" className="text-sm text-gray-400 hover:text-black transition-colors">Blog</a>
            <a href="/privacy" className="text-sm text-gray-400 hover:text-black transition-colors">Privacy</a>
            <a href="/terms" className="text-sm text-gray-400 hover:text-black transition-colors">Terms</a>
          </div>
          <div className="text-sm text-gray-400">2026 SocialMate. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}