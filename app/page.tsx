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

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      
      {/* NAV */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur border-b border-[#e4e4e0] z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">
              S
            </div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-500 hover:text-black transition-colors">Features</a>
            <a href="#platforms" className="text-sm text-gray-500 hover:text-black transition-colors">Platforms</a>
            <a href="#pricing" className="text-sm text-gray-500 hover:text-black transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              Get Started Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
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
          <Link href="/signup" className="bg-black text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-80 transition-all text-base">
            Start for Free →
          </Link>

          <a href="#features" className="border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-2xl hover:border-gray-400 transition-all text-base">
            See Features
          </a>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Already used by 18,000+ creators, brands, and businesses.
        </p>
      </section>

      {/* PLATFORMS */}
      <section id="platforms" className="border-y border-[#e4e4e0] py-10 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Works with all major platforms
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {PLATFORMS.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm transition-all px-4 py-2 rounded-full text-sm font-medium text-gray-700"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: platform.color }}
                ></span>
                {platform.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">
            Everything you need. Nothing you don’t.
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Professional social media management tools that used to cost hundreds per month — completely free.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">
              S
            </div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>

          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-400 hover:text-black transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-black transition-colors">Pricing</a>
            <a href="#" className="text-sm text-gray-400 hover:text-black transition-colors">Blog</a>
            <a href="#" className="text-sm text-gray-400 hover:text-black transition-colors">Privacy</a>
            <a href="#" className="text-sm text-gray-400 hover:text-black transition-colors">Terms</a>
          </div>

          <div className="text-sm text-gray-400">
            © 2026 SocialMate. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  )
}