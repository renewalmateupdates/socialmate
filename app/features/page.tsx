'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

const FEATURE_CATEGORIES = [
  {
    category: 'AI Tools',
    emoji: '🤖',
    features: [
      { name: 'Caption Generator',       emoji: '✍️',  credits: '3 credits',      proOnly: false, what: 'Generates platform-optimized captions based on your topic and tone.',                                                                         how: 'Powered by Google Gemini. Analyzes your topic and platform to generate captions that match character limits, tone, and engagement patterns.' },
      { name: 'Hashtag Generator',       emoji: '#️⃣', credits: '2 credits',      proOnly: false, what: 'Generates a set of relevant, high-performing hashtags for your post.',                                                                        how: 'AI analyzes your caption content and niche to suggest hashtags that balance reach and relevance.' },
      { name: 'Post Rewrite / Improver', emoji: '🔁',  credits: '3 credits',      proOnly: false, what: 'Takes your existing caption and makes it sharper, more engaging, and better structured.',                                                    how: 'AI rewrites for stronger hooks, better readability, and platform-appropriate tone.' },
      { name: 'Viral Hook Generator',    emoji: '🎣',  credits: '4 credits',      proOnly: false, what: 'Generates 3 scroll-stopping opening lines designed to drive clicks and engagement.',                                                         how: 'Trained on viral content patterns across TikTok, YouTube, LinkedIn and Reddit.' },
      { name: 'Thread Generator',        emoji: '🧵',  credits: '8 credits',      proOnly: false, what: 'Turns a single topic or idea into a structured multi-part thread.',                                                                          how: 'AI structures your idea into a narrative arc with a hook, supporting points, and a strong CTA.' },
      { name: 'Content Repurposer',      emoji: '♻️',  credits: '8 credits',      proOnly: false, what: 'Paste a blog post, transcript, or long caption and get platform-ready content out the other side.',                                         how: 'AI extracts key ideas from long-form content and reshapes them into short-form posts for each platform.' },
      { name: 'AI Content Calendar',     emoji: '📅',  credits: '20 credits',     proOnly: true,  what: 'Generate a full 30-day content calendar based on your niche, platforms, and posting goals.',                                               how: 'AI plans a content strategy around your niche, then generates individual posts for each day. Fully editable before publishing.' },
      { name: 'AI Image Generation',     emoji: '🎨',  credits: '25 credits',     proOnly: true,  what: 'Generate custom images for your posts directly inside SocialMate.',                                                                          how: 'Powered by Google Gemini image models. Generated images can be added directly to your scheduled post.' },
    ],
  },
  {
    category: 'Growth Intelligence',
    emoji: '📡',
    features: [
      { name: 'SM-Pulse',             emoji: '🔥',  credits: '10 credits per scan',   proOnly: false, what: 'Scans social platforms to surface what is trending in your niche right now.',                                 how: 'Analyzes trending hashtags, viral post formats, and engagement spikes across Reddit, YouTube, and connected platforms.' },
      { name: 'SM-Radar',             emoji: '📊',  credits: '10 credits per report', proOnly: false, what: 'Analyzes your personal post performance to surface what is actually working for your audience.',              how: 'SM-Radar pulls data from your connected accounts and identifies patterns in your best-performing content — timing, format, length, and tone.' },
      { name: 'Content Gap Detector', emoji: '🕳️', credits: '10 credits',            proOnly: false, what: 'Spots underserved topics and content gaps in your niche so you can create content nobody else is making.',    how: 'Analyzes your niche across platforms and surfaces the questions, formats, and topics that are missing or underserved.' },
    ],
  },
  {
    category: 'Scheduling & Automation',
    emoji: '🗓️',
    features: [
      { name: 'Bulk Scheduler',             emoji: '📦',  credits: 'Free',        proOnly: false, what: 'Schedule dozens of posts at once instead of one at a time.',                                                   how: 'Posts are queued and distributed across your selected timeframe. Manual bulk scheduling is always free.' },
      { name: 'Best Time to Post',          emoji: '⏰',  credits: 'Free',        proOnly: false, what: 'See when your audience is most active so you can schedule posts for maximum reach.',                          how: 'Pulled from your connected account analytics. Displayed on your dashboard and suggested during scheduling.' },
      { name: 'Platform Requirement Guard', emoji: '🛡️', credits: 'Always free', proOnly: false, what: 'Automatically warns you if your post violates a platform\'s rules before it goes live.',                     how: 'Checks every post against known platform limits for character counts, video length, file size, and hashtag caps before scheduling.' },
    ],
  },
  {
    category: 'Creator Tools',
    emoji: '🎨',
    features: [
      { name: 'Link-in-Bio Page',      emoji: '🔗',  credits: 'Free', proOnly: false, what: 'A clean, shareable page that houses all your links — like Linktree, built into SocialMate.',               how: 'Fully customizable from your dashboard. Pro users can connect a custom domain.' },
      { name: 'Post Template Library', emoji: '📁',  credits: 'Free', proOnly: false, what: 'Save your best post formats as reusable templates so you never start from scratch.',                        how: 'Templates are stored in your account for quick reuse.' },
      { name: 'Media Library',         emoji: '🗃️', credits: 'Free', proOnly: false, what: 'Store and organize your images and videos inside SocialMate for quick access when scheduling.',            how: 'Free tier: 1 GB. Pro: 10 GB. Agency: 50 GB.' },
      { name: 'Hashtag Collections',   emoji: '🏷️', credits: 'Free', proOnly: false, what: 'Save groups of hashtags and apply them to posts with one click.',                                           how: 'Saved in your account. Fully editable. No limits on how many collections you create.' },
    ],
  },
]

export default function Features() {
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = ['All', ...FEATURE_CATEGORIES.map(c => c.category)]
  const filtered = activeCategory === 'All'
    ? FEATURE_CATEGORIES
    : FEATURE_CATEGORIES.filter(c => c.category === activeCategory)

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-16">

        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">Features</h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            Every tool SocialMate offers — what it does, how it works, and what it costs.
            Scheduling is always free. AI features use credits so you stay in control.
          </p>
        </div>

        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                activeCategory === cat
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {filtered.map(section => (
          <div key={section.category} className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">{section.emoji}</span>
              <h2 className="text-base font-extrabold tracking-tight">{section.category}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {section.features.map(f => (
                <div key={f.name} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 transition-all">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{f.emoji}</span>
                      <h3 className="text-sm font-extrabold">{f.name}</h3>
                      {f.proOnly && (
                        <span className="text-xs font-bold px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">Pro+</span>
                      )}
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                      {f.credits}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">What it does</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{f.what}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">How it works</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{f.how}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-black rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-extrabold mb-2">Ready to get started?</h2>
          <p className="text-sm text-gray-400 mb-6">All of this — free to start. No credit card required.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/signup"
              className="bg-white text-black text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all">
              Start for Free
            </Link>
            <Link href="/pricing"
              className="border border-gray-600 text-white text-sm font-bold px-6 py-3 rounded-xl hover:border-gray-400 transition-all">
              View Pricing →
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
