'use client'
import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

const DONATION_AMOUNTS = [5, 10, 25]

export default function Story() {
  const [customAmount, setCustomAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">

          {/* HEADER */}
          <div className="mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">The Story</p>
            <h1 className="text-3xl font-extrabold tracking-tight mb-4">
              Why SocialMate exists
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              SocialMate — Automate your content. Accelerate your growth.
            </p>
          </div>

          {/* STORY */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-6 space-y-5">
            <div>
              <h2 className="text-base font-extrabold mb-2">Where this started</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                I work full time at a deli. I pick up hours at a construction company when I can. And in every spare moment I have, I build SocialMate. Not because it's easy — it's anything but — but because I genuinely believe creators and small businesses deserve better tools than what the market is charging for.
              </p>
            </div>

            <div>
              <h2 className="text-base font-extrabold mb-2">The problem I couldn't ignore</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                The social media management space is dominated by tools that charge $30, $99, even $200 a month for features that should cost nothing. Basic scheduling. A few analytics. An AI caption here and there. These companies aren't expensive because the technology is expensive — they're expensive because they can be. Creators are trapped in a pay-to-play ecosystem that was never designed with them in mind.
              </p>
            </div>

            <div>
              <h2 className="text-base font-extrabold mb-2">What SocialMate is trying to be</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                The goal has always been simple: give creators and small businesses access to tools that actually feel powerful — and make them free, or as close to free as sustainably possible. Not a watered-down free tier designed to frustrate you into upgrading. A genuinely generous free plan, backed by a credit system that keeps costs predictable without gatekeeping what matters.
              </p>
            </div>

            <div>
              <h2 className="text-base font-extrabold mb-2">What I'm building toward</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                SocialMate isn't just a scheduler. The vision is a full creator operating system — AI tools, growth intelligence, trend detection, content automation — all in one place, at a price that doesn't require a business budget to justify. Every dollar this product earns goes directly back into making it better, faster, and more powerful for the people using it.
              </p>
            </div>

            <div>
              <h2 className="text-base font-extrabold mb-2">How your data is protected</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                SocialMate is built on Supabase with row-level security, meaning your data is isolated to your account and inaccessible to anyone else — including me. OAuth tokens for connected social platforms are encrypted at rest. No data is sold. No ads. No third-party tracking for profit. The business model is simple: provide value, charge fairly, and keep the lights on.
              </p>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500 leading-relaxed italic">
                "I want to turn a dark world into a bright future — one creator at a time."
              </p>
              <p className="text-xs text-gray-400 mt-2">— The solo founder, developer, marketer, and deli worker behind SocialMate</p>
            </div>
          </div>

          {/* SUPPORT */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-6">
            <h2 className="text-base font-extrabold mb-1">Support the mission</h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              SocialMate is bootstrapped — no investors, no funding rounds, no safety net. If this product has brought you value and you want to help keep it growing, any contribution goes directly toward server costs, API access, and building more features faster.
            </p>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {DONATION_AMOUNTS.map(amount => (
                <button
                  key={amount}
                  onClick={() => { setSelectedAmount(amount); setCustomAmount('') }}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    selectedAmount === amount && !customAmount
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}>
                  ${amount}
                </button>
              ))}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <span className="px-3 text-sm text-gray-400 bg-gray-50 h-full flex items-center py-2.5">$</span>
                <input
                  type="number"
                  placeholder="Custom"
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
                  className="w-24 px-3 py-2.5 text-sm outline-none"
                />
              </div>
            </div>

            <button
              disabled={!selectedAmount && !customAmount}
              className="bg-black text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Support SocialMate ❤️
            </button>

            <p className="text-xs text-gray-400 mt-3">
              Payments processed securely via Stripe. This is a voluntary contribution — not a subscription.
            </p>
          </div>

          {/* LINKS */}
          <div className="flex items-center gap-3">
            <Link href="/pricing"
              className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">
              View Pricing
            </Link>
            <Link href="/features"
              className="text-xs font-bold px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:border-gray-400 transition-all">
              Explore Features
            </Link>
            <Link href="/referral"
              className="text-xs font-bold px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:border-gray-400 transition-all">
              Referral Program
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}