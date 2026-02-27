import Link from "next/link"

const PLATFORMS = [
  { name: "Instagram", url: "https://instagram.com", color: "#e1306c" },
  { name: "X (Twitter)", url: "https://twitter.com", color: "#000000" },
  { name: "LinkedIn", url: "https://linkedin.com", color: "#0077b5" },
  { name: "TikTok", url: "https://tiktok.com", color: "#000000" },
  { name: "YouTube", url: "https://youtube.com", color: "#ff0000" },
  { name: "Pinterest", url: "https://pinterest.com", color: "#e60023" },
  { name: "Threads", url: "https://threads.net", color: "#000000" },
  { name: "Snapchat", url: "https://snapchat.com", color: "#fffc00" },
  { name: "Bluesky", url: "https://bsky.app", color: "#0085ff" },
  { name: "Reddit", url: "https://reddit.com", color: "#ff4500" },
  { name: "Discord", url: "https://discord.com", color: "#5865f2" },
  { name: "Telegram", url: "https://telegram.org", color: "#229ed9" },
  { name: "Mastodon", url: "https://mastodon.social", color: "#6364ff" },
  { name: "WhatsApp", url: "https://business.whatsapp.com", color: "#25d366" },
  { name: "BeReal", url: "https://bereal.com", color: "#000000" },
  { name: "Lemon8", url: "https://lemon8-app.com", color: "#ffcc00" },
]

const FEATURES = [
  { icon: "📅", title: "Visual Content Calendar", description: "Drag-and-drop scheduling across all your platforms. See your entire month at a glance with color-coded posts per platform." },
  { icon: "🤖", title: "AI Caption Writer", description: "Generate scroll-stopping captions in seconds using Google Gemini. Free tier includes 15 AI credits/month — Pro gets 500." },
  { icon: "🏷️", title: "AI Hashtag Generator", description: "Stop guessing which hashtags work. Our AI analyzes your niche and generates high-reach hashtags tailored to each post." },
  { icon: "📊", title: "Analytics Dashboard", description: "Track reach, engagement, and follower growth across all platforms in one unified dashboard. No more platform-hopping." },
  { icon: "⏰", title: "Best Time to Post", description: "Platform-specific recommendations for when your audience is most active. Agency tier gets fully personalized AI suggestions." },
  { icon: "👥", title: "Team Collaboration", description: "Invite team members, assign roles, and collaborate on content without sharing passwords. Pro supports up to 5 members." },
  { icon: "♻️", title: "Post Recycling", description: "Automatically re-queue your best performing content so it keeps working for you long after the first publish." },
  { icon: "🔗", title: "Link in Bio Tool", description: "Build a beautiful, mobile-optimized link page that connects all your content and tracks every click." },
  { icon: "🏆", title: "Competitor Benchmarking", description: "Agency tier exclusive: track competitor growth, posting frequency, and engagement to stay one step ahead." },
]

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "The most generous free tier in the market. No credit card ever.",
    highlight: false,
    cta: "Get Started Free",
    ctaHref: "/signup",
    features: [
      "Unlimited scheduled posts",
      "2-week scheduling window",
      "3 connected accounts",
      "15 AI credits / month",
      "Visual content calendar",
      "Basic analytics",
      "Best time to post recommendations",
      "No credit card required",
    ],
  },
  {
    name: "Pro",
    price: "$5",
    period: "per month",
    description: "For serious creators and small teams who need more reach and power.",
    highlight: true,
    cta: "Start Pro →",
    ctaHref: "/signup?plan=pro",
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
    name: "Agency",
    price: "$20",
    period: "per month",
    description: "For agencies and power users managing multiple brands.",
    highlight: false,
    cta: "Start Agency →",
    ctaHref: "/signup?plan=agency",
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

const TESTIMONIALS = [
  { quote: "I cancelled Buffer after 3 years the day I found SocialMate. Same features, literally $0.", name: "Priya M.", role: "Content Creator, 80K followers" },
  { quote: "We manage 12 brands. SocialMate Agency at $20/mo replaced a $400/mo Hootsuite plan. No brainer.", name: "Derek L.", role: "Founder, Social Agency" },
  { quote: "The AI caption writer alone saves me 3 hours a week. And it is free. How is this real?", name: "Aisha T.", role: "E-commerce Brand Owner" },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">

      <nav className="sticky top-0 bg-white/90 backdrop-blur border-b border-[#e4e4e0] z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-500 hover:text-black transition-colors">Features</a>
            <a href="#platforms" className="text-sm text-gray-500 hover:text-black transition-colors">Platforms</a>
            <a href="#pricing" className="text-sm text-gray-500 hover:text-black transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Log in</Link>
            <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">Get Started Free →</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          No credit card. No ads. Free forever.
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
          Schedule Every Post.<br />Free. Forever.
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
          Connect all your social accounts, plan your content, and post automatically — everything Buffer and Hootsuite charge $99/month for. On us.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/signup" className="bg-black text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-80 transition-all text-base">Start for Free →</Link>
          <a href="#features" className="border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-2xl hover:border-gray-400 transition-all text-base">See Features</a>
        </div>
        <p className="text-xs text-gray-400 mt-4">Already used by 18,000+ creators, brands, and businesses.</p>
      </section>

      <section className="border-y border-[#e4e4e0] bg-gray-50/50 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-extrabold tracking-tight">18,000+</div>
            <div className="text-sm text-gray-500 mt-1">Users worldwide</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">16</div>
            <div className="text-sm text-gray-500 mt-1">Platforms supported</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">$0</div>
            <div className="text-sm text-gray-500 mt-1">To get started</div>
          </div>
        </div>
      </section>

      <section id="platforms" className="border-b border-[#e4e4e0] py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Works with all major platforms</p>
          <div className="flex flex-wrap justify-center gap-2">
            {PLATFORMS.map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm transition-all px-4 py-2 rounded-full text-sm font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">Everything you need. Nothing you don&apos;t.</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Professional social media management tools that used to cost hundreds per month — completely free.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-300 hover:shadow-sm transition-all bg-white">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-black text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">Why pay $99/month for the same thing?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10">Buffer charges $18/mo. Hootsuite charges $99/mo. Sprout Social charges $249/mo. SocialMate gives you the same tools — including AI — for free.</p>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
            <div className="border border-gray-700 rounded-2xl p-5">
              <div className="text-gray-400 text-sm mb-1">Buffer</div>
              <div className="text-2xl font-extrabold text-red-400">$18<span className="text-sm font-normal">/mo</span></div>
            </div>
            <div className="border border-gray-700 rounded-2xl p-5">
              <div className="text-gray-400 text-sm mb-1">Hootsuite</div>
              <div className="text-2xl font-extrabold text-red-400">$99<span className="text-sm font-normal">/mo</span></div>
            </div>
            <div className="border-2 border-green-500 rounded-2xl p-5">
              <div className="text-green-400 text-sm mb-1">SocialMate</div>
              <div className="text-2xl font-extrabold text-green-400">$0<span className="text-sm font-normal">/mo</span></div>
            </div>
          </div>
          <Link href="/signup" className="bg-white text-black font-semibold px-8 py-4 rounded-2xl hover:opacity-80 transition-all text-base inline-block">Switch for Free →</Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">Loved by 18,000+ users</h2>
          <p className="text-gray-500">Real people who switched from Buffer and Hootsuite.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50">
              <p className="text-gray-700 text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="font-semibold text-sm">{t.name}</div>
              <div className="text-xs text-gray-400">{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-gray-50/50 border-y border-[#e4e4e0] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Simple, honest pricing.</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Start free forever. Upgrade only when you need more power. No hidden fees, no feature paywalls on the basics.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-7 flex flex-col ${plan.highlight ? "bg-black text-white border-2 border-black" : "bg-white border border-gray-200"}`}>
                {plan.highlight && (
                  <div className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit">
                    ⭐ Most Popular
                  </div>
                )}
                <div className="mb-1 text-sm font-semibold uppercase tracking-widest text-gray-400">{plan.name}</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className="text-sm pb-1 text-gray-400">/{plan.period}</span>
                </div>
                <p className={`text-sm mb-6 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.description}</p>
                <Link href={plan.ctaHref} className={`text-center font-semibold px-5 py-3 rounded-xl text-sm transition-all mb-6 ${plan.highlight ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:opacity-80"}`}>
                  {plan.cta}
                </Link>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 text-xs ${plan.highlight ? "text-green-400" : "text-green-500"}`}>✓</span>
                      <span className={plan.highlight ? "text-gray-300" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-5 py-2.5 text-sm text-gray-600">
              🎁 <span><strong>Referral program:</strong> Get 25 free AI credits per referral. Refer a paid user → earn 3 months Pro free.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Stop paying for social scheduling.</h2>
        <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">Join 18,000+ creators and brands who made the switch. Set up in 2 minutes, no credit card needed.</p>
        <Link href="/signup" className="bg-black text-white font-semibold px-10 py-4 rounded-2xl hover:opacity-80 transition-all text-base inline-block">Get Started Free — Forever →</Link>
        <p className="text-xs text-gray-400 mt-4">Free plan is genuinely free. No trial. No gotcha.</p>
      </section>

      <footer className="border-t border-[#e4e4e0]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
              <span className="font-bold text-base tracking-tight">SocialMate</span>
            </Link>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-sm text-gray-400 hover:text-black transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-black transition-colors">Pricing</a>
              <a href="/blog" className="text-sm text-gray-400 hover:text-black transition-colors">Blog</a>
              <a href="/privacy" className="text-sm text-gray-400 hover:text-black transition-colors">Privacy</a>
              <a href="/terms" className="text-sm text-gray-400 hover:text-black transition-colors">Terms</a>
            </div>
            <div className="text-sm text-gray-400">© 2026 SocialMate. All rights reserved.</div>
          </div>
        </div>
      </footer>

    </div>
  )
}