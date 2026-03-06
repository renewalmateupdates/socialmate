'use client'
import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

const FEATURE_CATEGORIES = [
  {
    category: 'AI Tools',
    emoji: '🤖',
    features: [
      {
        name: 'Caption Generator',
        emoji: '✍️',
        credits: '1 credit',
        what: 'Generates platform-optimized captions based on your topic and tone.',
        example: 'Input: "coffee shop grand opening" → Output: A warm, engaging Instagram caption with emojis and a call to action.',
        how: 'Powered by Google Gemini. Analyzes your topic and platform to generate captions that match character limits, tone, and engagement patterns.',
      },
      {
        name: 'Hashtag Generator',
        emoji: '#️⃣',
        credits: '1 credit',
        what: 'Generates a set of relevant, high-performing hashtags for your post.',
        example: 'Input: fitness motivation caption → Output: 15 hashtags ranging from broad to niche for maximum reach.',
        how: 'AI analyzes your caption content and niche to suggest hashtags that balance reach and relevance.',
      },
      {
        name: 'Post Rewrite / Improver',
        emoji: '🔁',
        credits: '1 credit',
        what: 'Takes your existing caption and makes it sharper, more engaging, and better structured.',
        example: 'Input: "We have a new product out." → Output: "Introducing something we\'ve been building for months — and it\'s finally here. 🚀"',
        how: 'AI rewrites for stronger hooks, better readability, and platform-appropriate tone.',
      },
      {
        name: 'Viral Hook Generator',
        emoji: '🎣',
        credits: '2 credits',
        what: 'Generates 3 scroll-stopping opening lines designed to drive clicks and engagement.',
        example: 'Topic: productivity hacks → "You\'re wasting 3 hours a day and don\'t even know it…", "Nobody taught you this in school…", "I stopped doing this one thing and my output doubled."',
        how: 'Trained on viral content patterns across TikTok, YouTube, LinkedIn and Reddit to generate hooks that provoke curiosity.',
      },
      {
        name: 'Smart Auto-Formatting',
        emoji: '🔀',
        credits: '2 credits per platform',
        what: 'Write one post — SocialMate automatically reformats it for every platform you select.',
        example: 'Write a LinkedIn post → SocialMate generates a TikTok caption, Instagram version, and Reddit-style post from the same idea.',
        how: 'Reads each platform\'s character limits, tone norms, and formatting requirements, then adapts your content automatically.',
      },
      {
        name: 'Platform Rewrite',
        emoji: '📲',
        credits: '2 credits',
        what: 'Converts one post into versions optimized for every connected platform at once.',
        example: 'Input: one product launch announcement → Outputs: Instagram caption, LinkedIn post, Reddit thread opener, YouTube description.',
        how: 'AI understands the culture and format of each platform and rewrites your content to feel native — not copy-pasted.',
      },
      {
        name: 'Thread Generator',
        emoji: '🧵',
        credits: '3 credits',
        what: 'Turns a single topic or idea into a structured multi-part thread.',
        example: 'Topic: "5 mistakes new freelancers make" → A 6-part thread with hook, body points, and a strong CTA at the end.',
        how: 'AI structures your idea into a narrative arc with a hook, supporting points, and a closing that drives engagement.',
      },
      {
        name: 'Content Repurposer',
        emoji: '♻️',
        credits: '3 credits',
        what: 'Paste a blog post, transcript, or long caption and get platform-ready content out the other side.',
        example: 'Paste a 1,000-word blog → Get 5 tweets, 3 Instagram captions, a LinkedIn post, and a TikTok hook.',
        how: 'AI extracts the key ideas from long-form content and reshapes them into short-form posts for each platform.',
      },
      {
        name: 'AI Media Kit Generator',
        emoji: '📋',
        credits: '3 credits',
        what: 'Generates a professional sponsorship pitch and media kit text based on your profile.',
        example: 'Input: your platforms, niche, audience size → Output: a ready-to-send media kit you can copy or download.',
        how: 'AI builds a professional bio, audience summary, and pitch angle based on the information you provide.',
      },
      {
        name: 'Post Idea Generator',
        emoji: '💡',
        credits: '2 credits',
        what: 'Stuck on what to post? Get 10 content ideas tailored to your niche and audience.',
        example: 'Niche: personal finance, audience: young adults → "The truth about the 50/30/20 rule", "What I wish I knew about credit at 22"…',
        how: 'AI combines your niche, past content patterns, and current trends to suggest ideas most likely to perform.',
      },
      {
        name: 'AI Image Generation',
        emoji: '🎨',
        credits: '25 credits',
        what: 'Generate custom images for your posts directly inside SocialMate.',
        example: 'Prompt: "minimalist coffee shop flat lay, warm tones" → AI-generated image ready to attach to your post.',
        how: 'Powered by Google Gemini image models. Images are generated based on your text prompt and can be added directly to your scheduled post.',
      },
      {
        name: 'AI Content Calendar',
        emoji: '📅',
        credits: '10 credits (Free 2-week) · 20 credits (Pro/Agency 30-day)',
        what: 'Generate a full content calendar based on your niche, platforms, and posting goals — then edit every post before it goes live.',
        example: 'Niche: fitness coaching, 5 posts/week → 30 days of captions, hooks, and hashtags pre-scheduled and fully editable.',
        how: 'AI plans a content strategy around your niche and goals, then generates individual posts for each day. You control edits, tone, and final scheduling.',
      },
    ],
  },
  {
    category: 'Growth Intelligence',
    emoji: '📡',
    features: [
      {
        name: 'SM-Pulse',
        emoji: '🔥',
        credits: '5 credits per scan',
        what: 'Scans social platforms to surface what is trending in your niche right now.',
        example: '"Short educational clips under 15 seconds are trending in the finance niche this week. Top hashtags: #moneytips #personalfinance."',
        how: 'SM-Pulse analyzes trending hashtags, viral post formats, and engagement spikes across Reddit, YouTube, and connected platforms. Refreshes weekly.',
      },
      {
        name: 'SM-Radar',
        emoji: '📊',
        credits: '3 credits per report',
        what: 'Analyzes your personal post performance to surface what is actually working for your audience.',
        example: '"Your posts perform 2.4x better when published between 6–8 PM. Educational carousels receive the most saves. Short captions outperform long ones for your audience."',
        how: 'SM-Radar pulls data from your connected accounts and identifies patterns in your best-performing content — timing, format, length, and tone.',
      },
      {
        name: 'Content Gap Detector',
        emoji: '🕳️',
        credits: '2 credits',
        what: 'Spots gaps in your posting strategy so you never go cold on your audience.',
        example: '"You haven\'t posted video content in 12 days. Your audience engages 3x more with video than static images."',
        how: 'Tracks your posting history and engagement patterns, then flags when a high-performing content type has gone quiet.',
      },
      {
        name: 'AI Post Performance Predictor',
        emoji: '🎯',
        credits: 'Included in SM-Radar',
        what: 'Before you post, get a predicted engagement score and improvement suggestions.',
        example: 'Draft post → Predicted engagement: 7.2/10. Suggested improvement: add a question at the end to drive comments.',
        how: 'Part of SM-Radar. Scores your draft against patterns from high-performing content in similar niches.',
      },
    ],
  },
  {
    category: 'Scheduling & Automation',
    emoji: '🗓️',
    features: [
      {
        name: 'Bulk Scheduler',
        emoji: '📦',
        credits: 'Free (manual) · Credits for AI-generated',
        what: 'Schedule dozens of posts at once instead of one at a time.',
        example: 'Upload 20 posts with captions → select a date range → SocialMate spaces them out automatically.',
        how: 'Posts are queued and distributed across your selected timeframe. Manual bulk scheduling is always free. AI-assisted scheduling costs credits.',
      },
      {
        name: 'Evergreen Auto-Reposting',
        emoji: '🌱',
        credits: '1 credit per cycle',
        what: 'Keep your best content working by automatically reposting it on a schedule you control.',
        example: 'Your top LinkedIn post from 3 months ago → set to repost every 90 days automatically.',
        how: 'SocialMate tracks your top-performing posts and lets you set a repeat cycle. You can choose suggested intervals (30, 60, or 90 days) or set your own.',
      },
      {
        name: 'Cross-Platform Auto Reformat',
        emoji: '🎬',
        credits: '2 credits per platform',
        what: 'Upload one video or image and SocialMate creates platform-optimized versions automatically.',
        example: 'Upload one video → SocialMate generates a TikTok version, Instagram Reel, and YouTube Short with correct dimensions and captions.',
        how: 'Reads each platform\'s video length limits, aspect ratios, and caption requirements, then creates a tailored version for each.',
      },
      {
        name: 'Platform Requirement Guard',
        emoji: '🛡️',
        credits: 'Always free',
        what: 'Automatically warns you if your post violates a platform\'s rules before it goes live.',
        example: '"Your caption is 340 characters — X/Twitter allows 280. Trim or auto-shorten?"',
        how: 'SocialMate checks every post against known platform limits for character counts, video length, file size, and hashtag caps before scheduling.',
      },
      {
        name: 'Best Time to Post',
        emoji: '⏰',
        credits: 'Free',
        what: 'See when your audience is most active so you can schedule posts for maximum reach.',
        example: '"Your Instagram audience is most active Tuesday and Thursday between 7–9 PM."',
        how: 'Pulled from your connected account analytics. Displayed on your dashboard and suggested during scheduling.',
      },
    ],
  },
  {
    category: 'Creator Tools',
    emoji: '🎨',
    features: [
      {
        name: 'Link-in-Bio Page',
        emoji: '🔗',
        credits: 'Free',
        what: 'A clean, shareable page that houses all your links — like Linktree, built into SocialMate.',
        example: 'socialmate.app/yourname → shows your bio, social links, website, merch, newsletter, and latest posts.',
        how: 'Fully customizable from your dashboard. Pro users can connect a custom domain. Free pages display a subtle "Built with SocialMate" footer.',
      },
      {
        name: 'Post Template Library',
        emoji: '📁',
        credits: 'Free',
        what: 'Save your best post formats as reusable templates so you never start from scratch.',
        example: 'Save a "Monday motivation" template → reuse it every week with one click, just swap the copy.',
        how: 'Templates are stored in your account and optionally shared to the community library for others to discover and use.',
      },
      {
        name: 'Media Library',
        emoji: '🗃️',
        credits: 'Free',
        what: 'Store and organize your images and videos inside SocialMate for quick access when scheduling.',
        example: 'Upload your brand assets once → attach them to any post without re-uploading.',
        how: 'Stored on secure cloud storage. Free tier gets 1 GB. Pro gets 10 GB. Agency gets 50 GB.',
      },
      {
        name: 'Hashtag Collections',
        emoji: '🏷️',
        credits: 'Free',
        what: 'Save groups of hashtags and apply them to posts with one click.',
        example: 'Save a "fitness motivation" collection of 20 hashtags → apply to any post instantly.',
        how: 'Saved in your account. Fully editable. No limits on how many collections you create.',
      },
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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight mb-3">Features</h1>
            <p className="text-sm text-gray-500 max-w-2xl">
              Every tool SocialMate offers — what it does, how it works, and what it costs.
              Scheduling is always free. AI features use credits so you stay in control.
            </p>
          </div>

          {/* CATEGORY FILTER */}
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                  activeCategory === cat
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* FEATURES */}
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
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                        {f.credits}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">What it does</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{f.what}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Example</p>
                        <p className="text-xs text-gray-600 leading-relaxed italic">{f.example}</p>
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

          {/* BOTTOM CTA */}
          <div className="bg-black rounded-2xl p-8 text-center text-white">
            <h2 className="text-xl font-extrabold mb-2">Ready to get started?</h2>
            <p className="text-sm text-gray-400 mb-6">
              All of this — free to start. No credit card required.
            </p>
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
      </div>
    </div>
  )
}