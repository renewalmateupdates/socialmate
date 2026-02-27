import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="border-b border-gray-100 px-8 h-14 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-lg tracking-tight">SocialMate</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-500 hover:text-black px-3 py-2 rounded-lg hover:bg-gray-50 transition-all">Log in</Link>
          <Link href="/signup" className="text-sm font-semibold bg-black text-white px-4 py-2 rounded-lg hover:opacity-80 transition-all">Get Started Free →</Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="max-w-3xl mx-auto text-center px-6 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          No credit card. No ads. Free forever.
        </div>
        <h1 className="text-6xl font-extrabold tracking-tighter text-gray-900 leading-tight mb-6">
          Schedule Every Post.<br />Free. Forever.
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Connect all your social accounts, plan your content, and post automatically — everything Buffer and Hootsuite charge $99/month for. On us.
        </p>
        <div className="flex gap-3 justify-center flex-wrap mb-5">
          <Link href="/signup" className="bg-black text-white font-semibold px-7 py-3.5 rounded-xl hover:opacity-80 transition-all text-base">Start for Free →</Link>
          <Link href="/demo" className="bg-white text-gray-500 font-medium px-7 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:text-black transition-all text-base">See a Demo</Link>
        </div>
        <p className="text-sm text-gray-400">Already used by <span className="font-semibold text-gray-600">18,000+</span> creators, brands, and businesses.</p>
      </div>

      {/* PLATFORM STRIP */}
      <div className="border-t border-b border-gray-100 bg-gray-50 py-4 px-8 flex items-center justify-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-2">Works with</span>
        {["📸 Instagram","𝕏 Twitter","💼 LinkedIn","🎵 TikTok","▶ YouTube","📌 Pinterest","🧵 Threads"].map(p => (
          <div key={p} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 hover:border-gray-300 transition-all cursor-pointer">{p}</div>
        ))}
      </div>

      {/* FEATURES */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Features</span>
        <h2 className="text-4xl font-extrabold tracking-tighter mt-3 mb-3">Everything you need.<br />Nothing you pay for.</h2>
        <p className="text-gray-500 text-lg mb-14 max-w-lg">The tools other platforms put behind paywalls are built into SocialMate's free tier — forever.</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: "📅", title: "Visual Calendar", desc: "Drag, drop, and plan your entire content calendar weeks ahead across all platforms." },
            { icon: "⚡", title: "Auto-Publishing", desc: "Schedule once and SocialMate handles the rest — publishing at exactly the right time." },
            { icon: "🔗", title: "All Platforms", desc: "Instagram, X, LinkedIn, TikTok, YouTube, Pinterest, Threads — one dashboard." },
            { icon: "📊", title: "Analytics", desc: "Track reach, engagement, and growth across every platform. Know what's working." },
            { icon: "👥", title: "Team Access", desc: "Invite teammates, assign roles, approve posts. No per-seat pricing ever." },
            { icon: "🤖", title: "AI Writer", desc: "Generate captions, hashtags, and hooks in seconds. Optional $5/mo upgrade." },
          ].map(f => (
            <div key={f.title} className="bg-gray-50 border border-gray-100 rounded-2xl p-7 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-lg mb-4">{f.icon}</div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div className="bg-gray-50 border-t border-b border-gray-100 py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Pricing</span>
          <h2 className="text-4xl font-extrabold tracking-tighter mt-3 mb-3">Simple. Honest. Free.</h2>
          <p className="text-gray-500 text-lg mb-14">The full product is free. Pay only if you want superpowers.</p>
          <div className="grid grid-cols-3 gap-4 text-left">
            {[
              { name: "Free", price: "$0", period: "forever · no card needed", features: ["All 7 platforms", "Unlimited scheduled posts", "Visual content calendar", "Basic analytics", "Team collaboration", "Auto-publishing"], btn: "Get Started Free", solid: false },
              { name: "Pro", price: "$5", period: "per month · cancel anytime", features: ["Everything in Free", "AI caption & hashtag writer", "Best time to post AI", "Advanced analytics", "Competitor benchmarking", "Priority support"], btn: "Upgrade to Pro", solid: true, highlight: true },
              { name: "Agency", price: "$20", period: "per month · cancel anytime", features: ["Everything in Pro", "White-label your branding", "Unlimited client accounts", "Client reporting exports", "Dedicated account manager", "Custom onboarding"], btn: "Contact Sales", solid: false },
            ].map(p => (
              <div key={p.name} className={`bg-white rounded-2xl p-7 relative transition-all hover:-translate-y-1 hover:shadow-lg ${p.highlight ? 'border-2 border-black' : 'border border-gray-200'}`}>
                {p.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</div>}
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{p.name}</div>
                <div className="text-5xl font-extrabold tracking-tighter mb-1">{p.price}</div>
                <div className="text-xs text-gray-400 mb-6">{p.period}</div>
                <div className="h-px bg-gray-100 mb-5"></div>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map(f => <li key={f} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>{f}</li>)}
                </ul>
                <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-80 ${p.solid ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}>{p.btn}</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 px-10 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center text-white text-xs font-bold">S</div>
          SocialMate
        </div>
        <div className="flex gap-6 text-sm text-gray-400">
          {["Features","Pricing","Blog","Privacy","Terms"].map(l => <a key={l} href="#" className="hover:text-black transition-colors">{l}</a>)}
        </div>
        <span className="text-sm text-gray-400">© 2025 SocialMate. Free. Forever.</span>
      </footer>
    </main>
  )
}