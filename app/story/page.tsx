'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const DONATION_AMOUNTS = [5, 10, 25, 50]

type DonationType = 'charity' | 'founder_support'

function DonationCard({
  type,
  title,
  subtitle,
  badge,
  buttonLabel,
  buttonClass,
  footerNote,
}: {
  type: DonationType
  title: string
  subtitle: string
  badge: string
  buttonLabel: string
  buttonClass: string
  footerNote: React.ReactNode
}) {
  const [customAmount, setCustomAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleDonate = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount
    if (!amount || amount <= 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/donations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, donation_type: type }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 flex flex-col gap-4">
      <div>
        <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-lg mb-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {badge}
        </span>
        <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {DONATION_AMOUNTS.map(amount => (
          <button key={amount}
            onClick={() => { setSelectedAmount(amount); setCustomAmount('') }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              selectedAmount === amount && !customAmount
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-400'
            }`}>
            ${amount}
          </button>
        ))}
        <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
          <span className="px-3 text-sm text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 h-full flex items-center py-2">$</span>
          <input
            type="number"
            placeholder="Custom"
            value={customAmount}
            min="1"
            onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
            className="w-20 px-3 py-2 text-sm outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={handleDonate}
          disabled={(!selectedAmount && !customAmount) || loading}
          className={`w-full text-sm font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${buttonClass}`}>
          {loading ? 'Redirecting...' : buttonLabel}
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">{footerNote}</p>
      </div>
    </div>
  )
}

export default function Story() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthed(!!data.user)
      setAuthChecked(true)
    })
  }, [])


  const content = (
    <div className="max-w-3xl mx-auto px-6 py-16">

      <div className="mb-10">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">The Story</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-gray-100">Why SocialMate exists</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          SocialMate — Automate your content. Accelerate your growth.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 mb-6 space-y-5">
        {[
          {
            title: 'Where this started',
            body: 'I know what it means to come from nothing. To watch opportunity feel out of reach — not because of lack of drive, but because the tools, the resources, and the access were always priced for people who already had everything. I built SocialMate as a self-taught developer, solo across every role — product, design, engineering, marketing, support. No team. No investors. No safety net. Just a deep conviction that creators and small businesses deserve powerful tools without being priced out of using them.',
          },
          {
            title: "The problem I couldn't ignore",
            body: "The social media management space is dominated by tools that charge $30, $99, even $200 a month for features that should cost nothing. Basic scheduling. A few analytics. An AI caption here and there. These companies aren't expensive because the technology is expensive — they're expensive because they can be. Creators are trapped in a pay-to-play ecosystem that was never designed with them in mind.",
          },
          {
            title: 'What SocialMate is trying to be',
            body: "The goal has always been simple: give creators and small businesses access to tools that actually feel powerful — and make them free, or as close to free as sustainably possible. Not a watered-down free tier designed to frustrate you into upgrading. A genuinely generous free plan, backed by a credit system that keeps costs predictable without gatekeeping what matters.",
          },
          {
            title: "What I'm building toward",
            body: "SocialMate isn't just a scheduler. The vision is a full creator operating system — AI tools, growth intelligence, trend detection, content automation — all in one place, at a price that doesn't require a business budget to justify. Every dollar this product earns goes directly back into making it better, faster, and more powerful for the people using it.",
          },
          {
            title: 'How your data is protected',
            body: 'SocialMate is built on Supabase with row-level security, meaning your data is isolated to your account and inaccessible to anyone else — including me. OAuth tokens for connected social platforms are encrypted at rest. No data is sold. No ads. No third-party tracking for profit.',
          },
        ].map((section, i) => (
          <div key={i}>
            <h2 className="text-base font-extrabold mb-2 text-gray-900 dark:text-gray-100">{section.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{section.body}</p>
          </div>
        ))}

        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic">
            "I want to turn a dark world into a bright future — one creator at a time."
          </p>
          <p className="text-xs text-gray-400 mt-2">— Joshua Bostic, founder of SocialMate</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-extrabold mb-1 text-gray-900 dark:text-gray-100">Support the mission</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
          SocialMate is fully bootstrapped — no investors, no funding rounds, no safety net. Choose how you want to contribute below.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <DonationCard
            type="charity"
            title="Donate to SM-Give ❤️"
            badge="100% to charity"
            subtitle="Every dollar goes directly to SM-Give — school supplies, baby essentials, and homeless care packages. Nothing held back."
            buttonLabel="Donate to SM-Give ❤️"
            buttonClass="bg-red-500 hover:bg-red-600 text-white"
            footerNote={
              <>
                100% goes directly to charity.{' '}
                <Link href="/give" className="text-amber-500 hover:text-amber-400 font-semibold">Learn about SM-Give →</Link>
              </>
            }
          />
          <DonationCard
            type="founder_support"
            title="Support the Founder 💛"
            badge="50% to charity"
            subtitle="Half supports SM-Give directly. The other half goes to the founder — fueling server costs, APIs, and building faster."
            buttonLabel="Support the Founder 💛"
            buttonClass="bg-amber-500 hover:bg-amber-600 text-white"
            footerNote={
              <>
                50% goes to SM-Give, 50% supports the founder.{' '}
                Payments via Stripe — voluntary, not a subscription.
              </>
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/pricing"
          className="text-xs font-bold px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 transition-all">
          View Pricing
        </Link>
        <Link href="/features"
          className="text-xs font-bold px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl hover:border-gray-400 dark:hover:border-gray-400 transition-all">
          Explore Features
        </Link>
        {isAuthed ? (
          <Link href="/dashboard"
            className="text-xs font-bold px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl hover:border-gray-400 dark:hover:border-gray-400 transition-all">
            Back to Dashboard →
          </Link>
        ) : (
          <Link href="/signup"
            className="text-xs font-bold px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl hover:border-gray-400 dark:hover:border-gray-400 transition-all">
            Get Started Free
          </Link>
        )}
      </div>
    </div>
  )

  if (isAuthed) {
    return (
      <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {content}
          </div>
        </main>
      </div>
    )
  }

  return <PublicLayout>{content}</PublicLayout>
}
