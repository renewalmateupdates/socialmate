import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Zoho Social (2026) — Full Comparison',
  description: 'Zoho Social starts at $15/month. SocialMate offers more AI tools, more platforms, and a genuine free tier. See the full comparison.',
  openGraph: {
    title:       'SocialMate vs Zoho Social (2026)',
    description: 'Zoho Social is expensive for what it offers. SocialMate has more AI tools, more platforms, and starts free.',
    url:         'https://socialmate.studio/vs/zoho-social',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/zoho-social' },
}

const COMPARISON = [
  { feature: 'Starting price',         zoho: '$15/month',               socialmate: '$0 — free forever'    },
  { feature: 'Free plan',              zoho: '❌ Trial only',            socialmate: '✅ Genuinely free'     },
  { feature: 'Platforms supported',    zoho: '9',                       socialmate: '16 (growing)'          },
  { feature: 'Mastodon/Bluesky',       zoho: '❌',                       socialmate: '✅'                    },
  { feature: 'Discord/Telegram',       zoho: '❌',                       socialmate: '✅'                    },
  { feature: 'AI writing tools',       zoho: 'Basic (Zia AI)',          socialmate: '12 tools free'         },
  { feature: 'Bulk scheduling',        zoho: '✅ (paid)',                socialmate: '✅ Free'               },
  { feature: 'Link in bio',            zoho: '❌',                       socialmate: '✅ Free'               },
  { feature: 'Competitor tracking',    zoho: 'Monitor (paid)',          socialmate: '✅ Free'               },
  { feature: 'Evergreen recycling',    zoho: '❌',                       socialmate: '✅ Free'               },
  { feature: 'RSS import',             zoho: '❌',                       socialmate: '✅ Free'               },
  { feature: 'Hashtag manager',        zoho: '❌',                       socialmate: '✅ Free'               },
  { feature: 'Team seats (free)',      zoho: '0',                       socialmate: '2'                     },
  { feature: 'Client workspaces',      zoho: 'Agency plan',             socialmate: 'Pro+: from $5/mo'     },
  { feature: 'CRM integration',        zoho: '✅ (with Zoho CRM)',       socialmate: '—'                     },
]

export default function VsZohoSocial() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-all hidden sm:block">Sign in</Link>
            <Link href="/signup" className="bg-black text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              Get started free →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">

        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">SocialMate vs Zoho Social (2026)</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Zoho Social is part of the Zoho ecosystem and works best when you're already using other Zoho products.
            As a standalone social media scheduler, it's expensive relative to what it offers.
            Here's how SocialMate compares.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Zoho Social</p>
            <p className="text-3xl font-extrabold text-gray-700 mb-1">$15/month</p>
            <p className="text-xs text-gray-400">9 platforms · No free plan</p>
          </div>
          <div className="border-2 border-green-200 bg-green-50 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">SocialMate</p>
            <p className="text-3xl font-extrabold text-green-700 mb-1">$0/month</p>
            <p className="text-xs text-green-600">16 platforms · 12 AI tools · Free forever</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">Feature comparison</h2>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 px-5 py-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Feature</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Zoho Social</span>
              <span className="text-xs font-bold text-black uppercase tracking-wide text-center">SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-gray-50 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <span className="text-xs font-semibold text-gray-700">{row.feature}</span>
                <span className="text-xs text-gray-400 text-center">{row.zoho}</span>
                <span className="text-xs font-bold text-black text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 bg-blue-50 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4">When Zoho Social makes sense</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            If your team is already using Zoho CRM, Zoho Desk, or other Zoho products, Zoho Social's integrations with those tools can add real value. The unified Zoho ecosystem is a genuine differentiator for teams already committed to Zoho. For standalone social media scheduling with no Zoho dependencies, SocialMate gives you more for less.
          </p>
        </div>

        <div className="bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Try SocialMate free</h2>
          <p className="text-gray-400 text-sm mb-6">16 platforms · 12 AI tools · Free forever. No card required.</p>
          <Link href="/signup"
            className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            Create free account →
          </Link>
        </div>
      </div>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="font-bold text-sm">SocialMate</span>
          </Link>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/vs/buffer" className="hover:text-black">vs Buffer</Link>
            <Link href="/vs/hootsuite" className="hover:text-black">vs Hootsuite</Link>
            <Link href="/vs/socialrails" className="hover:text-black">vs SocialRails</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
