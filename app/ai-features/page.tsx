'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const AI_TOOLS = [
  {
    emoji: '✍️',
    label: 'Caption Generator',
    credits: '1 credit',
    what: 'Generates platform-optimized captions based on your topic and tone.',
    how: 'Powered by Google Gemini. Analyzes your topic and platform to generate captions that match character limits, tone, and engagement patterns.',
    href: '/compose',
    available: true,
  },
  {
    emoji: '#️⃣',
    label: 'Hashtag Generator',
    credits: '1 credit',
    what: 'Generates a set of relevant, high-performing hashtags for your post.',
    how: 'AI analyzes your caption content and niche to suggest hashtags that balance reach and relevance.',
    href: '/compose',
    available: true,
  },
  {
    emoji: '🔁',
    label: 'Post Rewrite / Improver',
    credits: '1 credit',
    what: 'Takes your existing caption and makes it sharper, more engaging, and better structured.',
    how: 'AI rewrites for stronger hooks, better readability, and platform-appropriate tone.',
    href: '/compose',
    available: true,
  },
  {
    emoji: '🎣',
    label: 'Viral Hook Generator',
    credits: '2 credits',
    what: 'Generates 3 scroll-stopping opening lines designed to drive clicks and engagement.',
    how: 'Trained on viral content patterns across TikTok, YouTube, LinkedIn and Reddit.',
    href: '/compose',
    available: true,
  },
  {
    emoji: '🧵',
    label: 'Thread Generator',
    credits: '3 credits',
    what: 'Turns a single topic or idea into a structured multi-part thread.',
    how: 'AI structures your idea into a narrative arc with a hook, supporting points, and a strong CTA.',
    href: '/compose',
    available: false,
    comingSoon: true,
  },
  {
    emoji: '♻️',
    label: 'Content Repurposer',
    credits: '3 credits',
    what: 'Paste a blog post, transcript, or long caption and get platform-ready content out the other side.',
    how: 'AI extracts key ideas from long-form content and reshapes them into short-form posts for each platform.',
    href: '/compose',
    available: false,
    comingSoon: true,
  },
  {
    emoji: '📆',
    label: 'AI Content Calendar',
    credits: '10–20 credits',
    what: 'Generate a full content calendar based on your niche, platforms, and posting goals.',
    how: 'AI plans a content strategy around your niche, then generates individual posts for each day. Fully editable before publishing.',
    href: '/compose',
    available: false,
    comingSoon: true,
  },
  {
    emoji: '🎨',
    label: 'AI Image Generation',
    credits: '25 credits',
    what: 'Generate custom images for your posts directly inside SocialMate.',
    how: 'Powered by Google Gemini image models. Generated images can be added directly to your scheduled post.',
    href: '/compose',
    available: false,
    comingSoon: true,
  },
]

const GROWTH_TOOLS = [
  {
    emoji: '🔥',
    label: 'SM-Pulse',
    credits: '5 credits per scan',
    what: 'Scans social platforms to surface what is trending in your niche right now.',
    how: 'Analyzes trending hashtags, viral post formats, and engagement spikes across Reddit, YouTube, and connected platforms. Refreshes weekly.',
    comingSoon: true,
  },
  {
    emoji: '📊',
    label: 'SM-Radar',
    credits: '3 credits per report',
    what: 'Analyzes your personal post performance to surface what is actually working for your audience.',
    how: 'SM-Radar pulls data from your connected accounts and identifies patterns in your best-performing content — timing, format, length, and tone.',
    comingSoon: true,
  },
  {
    emoji: '🕵️',
    label: 'Content Gap Detector',
    credits: '2 credits',
    what: 'Spots gaps in your posting strategy so you never go cold on your audience.',
    how: 'Tracks your posting history and engagement patterns, then flags when a high-performing content type has gone quiet.',
    comingSoon: true,
  },
]

const SCHEDULING_TOOLS = [
  {
    emoji: '📅',
    label: 'Bulk Scheduler',
    credits: 'Free (manual)',
    what: 'Schedule dozens of posts at once instead of one at a time.',
    how: 'Posts are queued and distributed across your selected timeframe. Manual bulk scheduling is always free.',
    href: '/bulk-scheduler',
    comingSoon: false,
  },
  {
    emoji: '⏰',
    label: 'Best Time to Post',
    credits: 'Free',
    what: 'See when your audience is most active so you can schedule posts for maximum reach.',
    how: 'Pulled from your connected account analytics. Displayed on your dashboard and suggested during scheduling.',
    href: '/best-times',
    comingSoon: false,
  },
  {
    emoji: '🛡️',
    label: 'Platform Requirement Guard',
    credits: 'Always free',
    what: 'Automatically warns you if your post violates a platform\'s rules before it goes live.',
    how: 'Checks every post against known platform limits for character counts, video length, file size, and hashtag caps before scheduling.',
    href: '/compose',
    comingSoon: false,
  },
]

const CREATOR_TOOLS = [
  {
    emoji: '🔗',
    label: 'Link-in-Bio Page',
    credits: 'Free',
    what: 'A clean, shareable page that houses all your links — like Linktree, built into SocialMate.',
    how: 'Fully customizable from your dashboard. Pro users can connect a custom domain.',
    href: '/link-in-bio',
  },
  {
    emoji: '📋',
    label: 'Post Template Library',
    credits: 'Free',
    what: 'Save your best post formats as reusable templates so you never start from scratch.',
    how: 'Templates are stored in your account for quick reuse.',
    href: '/templates',
  },
  {
    emoji: '🖼️',
    label: 'Media Library',
    credits: 'Free',
    what: 'Store and organize your images and videos inside SocialMate for quick access when scheduling.',
    how: 'Free tier: 1 GB. Pro: 10 GB. Agency: 50 GB.',
    href: '/media',
  },
  {
    emoji: '🏷️',
    label: 'Hashtag Collections',
    credits: 'Free',
    what: 'Save groups of hashtags and apply them to posts with one click.',
    how: 'Saved in your account. Fully editable. No limits on how many collections you create.',
    href: '/hashtags',
  },
]

function ToolCard({ tool }: { tool: any }) {
  const inner = (
    <div className={`bg-white border rounded-2xl p-5 transition-all group ${
      tool.comingSoon
        ? 'border-gray-100 opacity-70'
        : 'border-gray-100 hover:border-gray-300 hover:shadow-sm cursor-pointer'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{tool.emoji}</span>
          <p className="text-sm font-extrabold text-gray-900">{tool.label}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
          tool.comingSoon
            ? 'bg-gray-100 text-gray-400'
            : tool.credits === 'Free' || tool.credits === 'Always free' || tool.credits === 'Free (manual)'
            ? 'bg-green-50 text-green-600'
            : 'bg-black text-white'
        }`}>
          {tool.comingSoon ? 'Coming soon' : tool.credits}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">What it does</p>
          <p className="text-xs text-gray-600 leading-relaxed">{tool.what}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">How it works</p>
          <p className="text-xs text-gray-500 leading-relaxed">{tool.how}</p>
        </div>
      </div>
      {!tool.comingSoon && tool.href && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <span className="text-xs font-bold text-black group-hover:underline">
            Use this tool →
          </span>
        </div>
      )}
    </div>
  )

  if (!tool.comingSoon && tool.href) {
    return <Link href={tool.href}>{inner}</Link>
  }
  return inner
}

function Section({ title, tools }: { title: string; tools: any[] }) {
  return (
    <div className="mb-10">
      <h2 className="text-base font-extrabold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3">
        {tools.map(tool => <ToolCard key={tool.label} tool={tool} />)}
      </div>
    </div>
  )
}

export default function AIFeaturesPage() {
  const router = useRouter()
  const { credits, creditsTotal, plan } = useWorkspace()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">

          {/* HEADER */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">AI Features</h1>
              <p className="text-sm text-gray-400 mt-1">All the tools available in your SocialMate account</p>
            </div>
            <div className={`text-right px-4 py-3 rounded-2xl border ${
              plan === 'agency' ? 'bg-purple-50 border-purple-100' :
              plan === 'pro'    ? 'bg-blue-50 border-blue-100'     :
              'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">AI Credits</p>
              <p className="text-xl font-extrabold text-gray-900">{credits} <span className="text-sm font-semibold text-gray-400">/ {creditsTotal}</span></p>
              {plan === 'free' && (
                <Link href="/pricing" className="text-xs font-bold text-black hover:underline">
                  Get more credits →
                </Link>
              )}
            </div>
          </div>

          {/* LIVE TOOLS BANNER */}
          <div className="bg-black text-white rounded-2xl p-5 mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Ready to use now</p>
              <p className="text-sm font-extrabold">Caption, Hashtags, Rewrite & Hook Generator are live</p>
              <p className="text-xs text-gray-400 mt-1">Open Compose to start using them against your credits.</p>
            </div>
            <Link href="/compose"
              className="flex-shrink-0 bg-white text-black text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
              Open Compose →
            </Link>
          </div>

          <Section title="🤖 AI Tools" tools={AI_TOOLS} />
          <Section title="📈 Growth Intelligence" tools={GROWTH_TOOLS} />
          <Section title="📆 Scheduling & Automation" tools={SCHEDULING_TOOLS} />
          <Section title="🛠 Creator Tools" tools={CREATOR_TOOLS} />

        </div>
      </main>
    </div>
  )
}