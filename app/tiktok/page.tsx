import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: 'TikTok Studio — Schedule & Edit TikTok Videos Free | SocialMate',
  description: 'SocialMate\'s TikTok Studio lets you trim videos, apply filters, add captions, generate AI scripts, and schedule directly to TikTok — free on all plans. Production API approved.',
  openGraph: {
    title: 'TikTok Studio — Schedule & Edit TikTok Videos Free | SocialMate',
    description: 'Schedule TikTok videos, apply filters, add captions, and generate AI scripts — all in one place. Production API approved. Free on all plans.',
    url: 'https://socialmate.studio/tiktok',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate TikTok Studio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TikTok Studio — Schedule & Edit TikTok Videos Free | SocialMate',
    description: 'Schedule TikTok videos automatically. Production API approved. Free on all plans — no per-post charges.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/tiktok' },
}

const FEATURES = [
  {
    icon: '✂️',
    title: 'Video Trimming',
    description: 'Trim your videos to the perfect length right inside SocialMate. No external editor needed.',
  },
  {
    icon: '🎨',
    title: '8 Video Filters',
    description: 'Apply cinematic CSS filters — Vivid, Matte, Warm, Cool, B&W, Fade, Dramatic, and Sharp — with a single click.',
  },
  {
    icon: '💬',
    title: 'Caption Overlay',
    description: 'Burn captions directly onto your video before it goes live. Fully customizable text, position, and style.',
  },
  {
    icon: '🖼️',
    title: 'Thumbnail Capture',
    description: 'Grab any frame from your video to use as your TikTok thumbnail. No extra tools.',
  },
  {
    icon: '📤',
    title: 'GIF Export',
    description: 'Export a 5-second GIF preview of your video for use in posts, DMs, or marketing. Built in, no npm deps.',
  },
  {
    icon: '🤖',
    title: 'AI Script Generator',
    description: 'Tell it your topic, video length, and tone — get a structured hook, body, and CTA in seconds. Powered by Gemini.',
  },
  {
    icon: '📅',
    title: 'Schedule to TikTok',
    description: 'Pick your date and time, hit schedule. SocialMate publishes directly to your TikTok profile via the official Production API.',
  },
  {
    icon: '🔁',
    title: 'Post Everywhere at Once',
    description: 'Schedule your video to TikTok and 6 other platforms simultaneously — Bluesky, Discord, Mastodon, LinkedIn, Telegram, X.',
  },
]

const QUOTA = [
  { plan: 'Free', price: '$0/mo', videos: '20 videos/mo', color: 'border-gray-700' },
  { plan: 'Pro', price: '$5/mo', videos: '60 videos/mo', color: 'border-amber-500' },
  { plan: 'Agency', price: '$20/mo', videos: '200 videos/mo', color: 'border-purple-500' },
]

export default function TikTokStudioLandingPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative bg-gray-950 pt-20 pb-16 px-4 text-center overflow-hidden">
        {/* TikTok brand glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#fe2c55]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#fe2c55]/10 border border-[#fe2c55]/30 text-[#fe2c55] text-xs font-semibold px-3 py-1 rounded-full mb-6">
            ✅ TikTok Production API Approved
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            TikTok Studio
          </h1>
          <p className="text-xl text-gray-300 mb-3">
            Edit, script, schedule, and publish TikTok videos — all in one place.
          </p>
          <p className="text-gray-500 text-sm mb-10">
            Free on every plan. No per-post charges. Official Production API — not a workaround.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="bg-[#fe2c55] hover:bg-[#e0263c] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Get started free →
            </Link>
            <Link
              href="/login?redirect=/tiktok/studio"
              className="border border-gray-700 hover:border-gray-500 text-gray-300 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Open TikTok Studio
            </Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-gray-900 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Everything you need to win on TikTok
          </h2>
          <p className="text-gray-400 text-center mb-12 text-sm">
            Built into your SocialMate dashboard. No extra subscriptions, no extra apps.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-[#fe2c55]/40 transition-colors">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold mb-2 text-sm">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Post everywhere CTA section */}
      <section className="bg-gray-950 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">🌐</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Write once. Post everywhere.
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            SocialMate isn&apos;t just a TikTok tool. Schedule the same video to TikTok, Bluesky,
            Discord, Mastodon, LinkedIn, Telegram, and X all at once — or customize the caption
            per platform. One dashboard, 7 platforms, zero extra tools.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['TikTok', 'Bluesky', 'Discord', 'Mastodon', 'LinkedIn', 'Telegram', 'X/Twitter'].map((p) => (
              <span key={p} className={`px-3 py-1 rounded-full text-xs font-medium border ${p === 'TikTok' ? 'bg-[#fe2c55]/10 border-[#fe2c55]/40 text-[#fe2c55]' : 'bg-gray-800 border-gray-700 text-gray-300'}`}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / quota */}
      <section className="bg-gray-900 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            TikTok scheduling is free
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10">
            TikTok doesn&apos;t charge per post — so we don&apos;t either. Pick a plan for your posting volume.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {QUOTA.map((q) => (
              <div key={q.plan} className={`bg-gray-800 rounded-xl p-6 border-2 ${q.color} text-center`}>
                <div className="text-white font-bold text-lg mb-1">{q.plan}</div>
                <div className="text-gray-400 text-sm mb-3">{q.price}</div>
                <div className="text-[#fe2c55] font-semibold text-sm">{q.videos}</div>
              </div>
            ))}
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 text-sm text-gray-400 text-center">
            💡 TikTok&apos;s API has no per-post charge. Our only cost is storage egress (~$0.09/GB).
            That savings goes straight to you — free on all plans.
          </div>
        </div>
      </section>

      {/* AI Script Generator callout */}
      <section className="bg-gray-950 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-[#fe2c55]/10 to-purple-900/20 border border-[#fe2c55]/20 rounded-2xl p-8 text-center">
            <div className="text-3xl mb-4">🤖</div>
            <h2 className="text-xl font-bold text-white mb-3">
              Never stare at a blank script again
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The TikTok Script Generator takes your topic, duration, and tone — and returns a
              structured hook, body, and CTA in seconds. Powered by Gemini. 5 credits.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-[#fe2c55] hover:bg-[#e0263c] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              Try it free →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-900 py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to stop posting manually?
          </h2>
          <p className="text-gray-400 mb-8 text-sm">
            Connect your TikTok account in under a minute. Free forever on the free plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="bg-[#fe2c55] hover:bg-[#e0263c] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Create free account →
            </Link>
            <Link
              href="/for/tiktok-creators"
              className="border border-gray-700 hover:border-gray-500 text-gray-300 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Learn more about TikTok scheduling
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
