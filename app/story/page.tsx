'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { supabase } from '@/lib/supabase'
import { Heart } from 'lucide-react'

const DONATION_AMOUNTS = [5, 10, 25, 50]

export default function Story() {
  const [customAmount, setCustomAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthed(!!data.user)
    })
  }, [])

  const handleDonate = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount
    if (!amount || amount <= 0) return
    if (amount > 2500) return
    setLoading(true)
    try {
      const res = await fetch('/api/donations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }


  const content = (
    <div className="max-w-3xl mx-auto px-6 py-16">

      <div className="mb-10">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">The Story</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-gray-100">Why SocialMate exists</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          SocialMate — Automate your content. Accelerate your growth.
        </p>
      </div>

      <div className="bg-panel border border-edge dark:border-edge rounded-2xl p-8 mb-6 space-y-5">
        {[
          {
            title: 'Where this started',
            body: "I built SocialMate as a self-taught developer, working solo across every role — product, design, engineering, marketing, and support. No team, no investors, no outside funding. I built it because the tools that actually help creators and small businesses grow have historically been priced for people who already had the budget to afford them. That gatekeeping was the problem I set out to remove.",
          },
          {
            title: "The problem I couldn't ignore",
            body: "The social media management space charges $30, $99, even $200 a month for scheduling, basic analytics, and AI-assisted writing — features that don't come close to costing that much to run. The price reflects what the market will bear, not what the technology requires. Creators end up locked into a pay-to-play model that was never built with them in mind.",
          },
          {
            title: 'What SocialMate is trying to be',
            body: "The goal is straightforward: give creators and small businesses tools that are genuinely powerful, for free or as close to free as the business can sustainably support. Not a stripped-down free tier engineered to push an upgrade — a free plan that's actually useful, backed by a credit system that keeps costs predictable without gatekeeping the features that matter most.",
          },
          {
            title: "What I'm building toward",
            body: "SocialMate is built to be more than a scheduler. The direction is a full creator operating system — AI tools, growth intelligence, trend detection, and content automation in one place, priced so it doesn't require a business budget to justify. Revenue goes back into the product, directly, to make it faster, more capable, and more useful for the people relying on it.",
          },
          {
            title: 'How your data is protected',
            body: 'SocialMate runs on Supabase with row-level security, so your data is isolated to your account and inaccessible to anyone else, including me. OAuth tokens for connected platforms are encrypted at rest. Your data is never sold, never used for advertising, and never shared with third parties for profit.',
          },
        ].map((section, i) => (
          <div key={i}>
            <h2 className="text-base font-extrabold mb-2 text-gray-900 dark:text-gray-100">{section.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{section.body}</p>
          </div>
        ))}

        <div className="pt-2 border-t border-edge dark:border-edge">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic">
            "I want to turn a dark world into a bright future — one creator at a time."
          </p>
          <p className="text-xs text-gray-400 mt-2">— Joshua Bostic, founder of SocialMate</p>
        </div>
      </div>

      <div className="bg-panel border border-edge dark:border-edge rounded-2xl p-8 mb-6">
        <h2 className="text-base font-extrabold mb-1 text-gray-900 dark:text-gray-100">Support the mission</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          SocialMate is fully bootstrapped — no investors, no funding rounds, no safety net. If this product has brought you value and you want to help keep it growing, any contribution goes directly toward server costs, API access, and building more features faster.
        </p>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {DONATION_AMOUNTS.map(amount => (
            <button key={amount}
              onClick={() => { setSelectedAmount(amount); setCustomAmount('') }}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                selectedAmount === amount && !customAmount
                  ? 'bg-amber text-void border-black dark:border-white'
                  : 'bg-raised border-edge dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-400'
              }`}>
              ${amount}
            </button>
          ))}
          <div className="flex items-center border border-edge dark:border-gray-600 rounded-xl overflow-hidden">
            <span className="px-3 text-sm text-gray-400 dark:text-gray-500 bg-raised h-full flex items-center py-2.5">$</span>
            <input
              type="number"
              placeholder="Custom"
              value={customAmount}
              min="1"
              max="2500"
              onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
              className="w-24 px-3 py-2.5 text-sm outline-none bg-raised text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <button
          onClick={handleDonate}
          disabled={(!selectedAmount && !customAmount) || loading}
          className="bg-black text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5">
          {loading ? 'Redirecting...' : <>Support SocialMate <Heart size={14} strokeWidth={2} fill="currentColor" /></>}
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          Payments processed securely via Stripe. This is a voluntary contribution — not a subscription.{' '}
          <Link href="/give" className="text-amber-500 hover:text-amber-400 font-semibold">50% of every donation goes to SM-Give ❤️</Link>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Custom donations are capped at $2,500.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/pricing"
          className="text-xs font-bold px-4 py-2 bg-amber text-void rounded-xl hover:opacity-80 transition-all">
          View Pricing
        </Link>
        <Link href="/features"
          className="text-xs font-bold px-4 py-2 border border-edge dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl hover:border-gray-400 dark:hover:border-gray-400 transition-all">
          Explore Features
        </Link>
        {isAuthed ? (
          <Link href="/dashboard"
            className="text-xs font-bold px-4 py-2 border border-edge dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl hover:border-gray-400 dark:hover:border-gray-400 transition-all">
            Back to Dashboard →
          </Link>
        ) : (
          <Link href="/signup"
            className="text-xs font-bold px-4 py-2 border border-edge dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl hover:border-gray-400 dark:hover:border-gray-400 transition-all">
            Get Started Free
          </Link>
        )}
      </div>
    </div>
  )

  return <PublicLayout>{content}</PublicLayout>
}
