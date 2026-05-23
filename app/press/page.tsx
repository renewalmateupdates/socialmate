import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: 'Press & Media — SocialMate',
  description: 'Press kit, brand assets, founder bio, and media contact for SocialMate. Building something worth writing about.',
  openGraph: {
    title: 'Press & Media — SocialMate',
    description: 'Press kit for SocialMate — the Creator OS that gives creators what competitors charge $99/month for, at $5 or free.',
    url: 'https://socialmate.studio/press',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate Press' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Press & Media — SocialMate',
    description: 'Press kit, brand assets, and media contact for SocialMate.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/press' },
}

const STATS = [
  { value: '7',    label: 'Live platforms',                  note: 'Bluesky, X, TikTok, LinkedIn, Discord, Telegram, Mastodon' },
  { value: '480+', label: 'Published blog posts',           note: 'SEO-targeted content library' },
  { value: '8',    label: 'Autonomous AI agents',           note: 'Newsletter, repurpose, caption, outreach, and more' },
  { value: '$5',   label: 'Pro plan — per month',           note: 'What competitors charge $99 for' },
  { value: '$0',   label: 'Free plan — forever',            note: '50 AI credits, all 7 platforms, no credit card' },
  { value: '20+',  label: 'Built-in AI tools',              note: 'Caption, hook, thread, hashtag, repurpose, score, and more' },
]

export default function PressPage() {
  return (
    <PublicLayout>

      {/* ─── HERO ─── */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <img src="/logo.png" alt="SocialMate" className="w-16 h-16 rounded-2xl mx-auto mb-6" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Press &amp; Media</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Building something<br />
            <span className="text-amber-400">worth writing about.</span>
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-base leading-relaxed">
            SocialMate is a social media scheduler and Creator OS that gives creators
            what competitors charge $99/month for — at $5 or free. Built solo, bootstrapped,
            while the founder worked a deli job at Walmart.
          </p>
        </div>
      </section>

      {/* ─── KEY STATS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-10">Key facts</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <p className="text-3xl font-black text-amber-400 mb-1">{stat.value}</p>
                <p className="text-sm font-extrabold mb-1">{stat.label}</p>
                <p className="text-xs text-gray-500">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TAGLINE / ANGLE ─── */}
      <section className="bg-black text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-6">
            &ldquo;What competitors charge $99/month for,<br />we give for $5 — or free.&rdquo;
          </h2>
          <p className="text-gray-300 text-base leading-relaxed mb-6">
            That&apos;s the pitch. And it&apos;s real. SocialMate is a full-featured social media scheduler
            with built-in AI tools, an autonomous content generation system (SOMA), a trading bot (Enki),
            8 AI agents, and 7 live platforms — starting at $0.
          </p>
          <p className="text-gray-400 text-sm">
            The story: solo founder, bootstrapped, no VC, no co-founder, working a deli job while building.
            Built with Claude Code. Live in 60 days. Growing organically.
          </p>
        </div>
      </section>

      {/* ─── BRAND ASSETS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-8">Brand assets</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Logo */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <p className="text-sm font-extrabold mb-4">Logo</p>
              <div className="bg-black rounded-xl p-8 flex items-center justify-center mb-4">
                <img src="/logo.png" alt="SocialMate Logo" className="w-24 h-24 rounded-3xl" />
              </div>
              <a href="/logo.png" download
                className="inline-block bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all">
                Download logo.png →
              </a>
              <p className="text-xs text-gray-500 mt-2">Three-circle grayscale gradient on dark background. PNG format.</p>
            </div>

            {/* Brand colors */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <p className="text-sm font-extrabold mb-4">Brand Colors</p>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ backgroundColor: '#f59e0b' }} />
                  <div>
                    <p className="text-sm font-bold">Amber</p>
                    <p className="text-xs text-gray-400 font-mono">#f59e0b</p>
                    <p className="text-xs text-gray-500">Primary accent — CTAs, highlights</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 border border-gray-700" style={{ backgroundColor: '#030712' }} />
                  <div>
                    <p className="text-sm font-bold">Dark Background</p>
                    <p className="text-xs text-gray-400 font-mono">#030712</p>
                    <p className="text-xs text-gray-500">Primary dark background</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 border border-gray-700" style={{ backgroundColor: '#000000' }} />
                  <div>
                    <p className="text-sm font-bold">Pure Black</p>
                    <p className="text-xs text-gray-400 font-mono">#000000</p>
                    <p className="text-xs text-gray-500">Section backgrounds</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ backgroundColor: '#f9fafb' }} />
                  <div>
                    <p className="text-sm font-bold">Light Background</p>
                    <p className="text-xs text-gray-400 font-mono">#f9fafb</p>
                    <p className="text-xs text-gray-500">Light mode / app interior</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <p className="text-sm font-extrabold mb-4">Typography</p>
              <p className="text-xs text-gray-400 mb-2">Font stack</p>
              <p className="text-sm font-mono text-gray-300 mb-4">
                ui-sans-serif, system-ui, -apple-system, sans-serif
              </p>
              <p className="text-xs text-gray-500">
                System font stack via Tailwind CSS. No custom web fonts — fast load, native rendering.
              </p>
            </div>

            {/* Name guidelines */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <p className="text-sm font-extrabold mb-4">Name &amp; Usage</p>
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>SocialMate (one word, capital S and M)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>socialmate.studio (lowercase URL)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>Social Mate (two words)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>Socialmate (all lowercase)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── ABOUT THE COMPANY ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-8">About the company</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-extrabold mb-2 text-gray-300">Legal name</p>
              <p className="text-base font-bold mb-6">Gilgamesh Enterprise LLC</p>

              <p className="text-sm font-extrabold mb-2 text-gray-300">Incorporated</p>
              <p className="text-base font-bold mb-6">Wyoming, USA</p>

              <p className="text-sm font-extrabold mb-2 text-gray-300">Founded</p>
              <p className="text-base font-bold mb-6">2026</p>
            </div>
            <div>
              <p className="text-sm font-extrabold mb-2 text-gray-300">Product</p>
              <p className="text-base font-bold mb-2">SocialMate</p>
              <p className="text-xs text-gray-400 mb-6">socialmate.studio</p>

              <p className="text-sm font-extrabold mb-2 text-gray-300">Launched</p>
              <p className="text-base font-bold mb-6">March 26, 2026 (soft launch)<br />April 1, 2026 (Product Hunt)</p>

              <p className="text-sm font-extrabold mb-2 text-gray-300">Funding</p>
              <p className="text-base font-bold mb-6">100% bootstrapped. Zero VC.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOUNDER BIO ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-8">Founder bio</p>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl flex-shrink-0">
                J
              </div>
              <div>
                <h2 className="text-lg font-extrabold">Joshua Bostic</h2>
                <p className="text-amber-400 text-sm font-bold">Founder &amp; CEO, SocialMate / Gilgamesh Enterprise LLC</p>
              </div>
            </div>
            <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
              <p>
                Joshua Bostic is the solo founder and CEO of Gilgamesh Enterprise LLC, the company behind
                SocialMate. He built SocialMate while working full-time at Walmart in a deli job — coding
                nights and weekends with no external funding, no co-founder, and no engineering team.
              </p>
              <p>
                The product launched March 26, 2026, reached Product Hunt in April 2026, and has since grown
                to include 7 live social media platforms, 8 autonomous AI agents, an AI content generation
                system (SOMA), an algorithmic trading bot (Enki), and over 480 published blog posts.
              </p>
              <p>
                Joshua built the entire product using Claude Code by Anthropic. He is a self-taught developer
                and first-generation entrepreneur based in the United States. His mission: make the tools that
                let people build online accessible to everyone, not just those who can afford enterprise software.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRESS CONTACT ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-6">Press contact</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
            Writing about us? We&apos;d love to read it.
          </h2>
          <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-lg mx-auto">
            For press inquiries, interview requests, brand asset requests, or
            anything else media-related — reach out directly. Response time is
            typically within 24 hours.
          </p>
          <a href="mailto:socialmatehq@gmail.com"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-xl text-sm transition-all mb-4">
            socialmatehq@gmail.com →
          </a>
          <p className="text-gray-400 text-sm">
            If you publish a piece about SocialMate, send us the link.
            We&apos;ll share it.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 text-sm">
            <Link href="/about" className="text-amber-400 hover:text-amber-300 font-medium">
              About page →
            </Link>
            <Link href="/story" className="text-amber-400 hover:text-amber-300 font-medium">
              Our story →
            </Link>
            <Link href="/blog" className="text-amber-400 hover:text-amber-300 font-medium">
              Blog →
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  )
}
