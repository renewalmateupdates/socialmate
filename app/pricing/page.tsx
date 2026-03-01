'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Pricing() {
  const [user, setUser] = useState<any>(null)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const PRO_MONTHLY = 19
  const PRO_YEARLY = 12

  const FEATURES_FREE = [
    '16 social platforms',
    'Unlimited scheduled posts',
    'Bulk Scheduler',
    'Content Calendar',
    'Drafts workspace',
    'Post Queue',
    'Media Library',
    'Hashtag Collections',
    'Post Templates',
    'Link in Bio builder',
    'Global Search',
    'Basic Analytics',
    'Best Times to Post',
    'Team collaboration',
    'Referral program',
    '15 AI credits / month',
  ]

  const FEATURES_PRO = [
    'Everything in Free',
    '500 AI credits / month',
    'AI Caption Generator',
    'AI Hashtag Suggestions',
    'AI Best Time Optimizer',
    'Advanced Analytics',
    'Custom branded Link in Bio',
    'Priority support',
    'Early access to new features',
    'Remove SocialMate branding',
    'API access',
    'Zapier & Make integration',
  ]

  const COMPETITORS = [
    { name: 'Buffer', price: '$18+/mo', platforms: '3 channels', posts: '10/channel', team: 'Paid add-on', ai: '❌', linkinbio: '$9/mo extra', analytics: 'Basic only' },
    { name: 'Hootsuite', price: '$99+/mo', platforms: '10 accounts', posts: 'Unlimited', team: '1 user', ai: 'Limited', linkinbio: '❌', analytics: 'Paid add-on' },
    { name: 'Later', price: '$25+/mo', platforms: '6 profiles', posts: '30/profile', team: 'Paid add-on', ai: 'Limited', linkinbio: '$9/mo extra', analytics: 'Basic only' },
    { name: 'SocialMate', price: '$0 FREE', platforms: '16 platforms', posts: 'Unlimited', team: '✅ Free', ai: '✅ Included', linkinbio: '✅ Included', analytics: '✅ Included', highlight: true },
  ]

  const FAQS = [
    { q: 'Is SocialMate really free forever?', a: 'Yes. The free plan is not a trial — it never expires. You get 16 platforms, unlimited scheduling, and all core features at zero cost, forever.' },
    { q: 'What happens when I use all my AI credits?', a: 'AI credits reset every month. On the free plan you get 15 credits. On Pro you get 500. You can still use all other features without AI credits.' },
    { q: 'How does SocialMate compare to Buffer?', a: "Buffer charges $6 per channel per month. Connecting 5 platforms costs $30/month. SocialMate gives you all 16 platforms for free — that's over $1,000/year in savings." },
    { q: 'Can I upgrade or downgrade anytime?', a: 'Yes. You can upgrade to Pro at any time, and downgrade back to free whenever you want. No lock-in, no cancellation fees.' },
    { q: 'Is my data safe?', a: 'All data is stored securely with Supabase, encrypted at rest and in transit. We never sell your data or show you ads.' },
    { q: 'Do you offer refunds?', a: 'Yes. If you upgrade to Pro and are not satisfied within 7 days, we will give you a full refund, no questions asked.' },
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <div className="border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 bg-white z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">Dashboard</Link>
              <button onClick={handleSignOut} className="text-sm text-gray-400 hover:text-black transition-colors">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">Sign in</Link>
              <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">Get started free</Link>
            </>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20">

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
            🎉 No credit card required · Free forever
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            Most features are free. Upgrade only if you want more AI power.
          </p>
        </div>

        {/* BILLING TOGGLE */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setBilling('monthly')}
            className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${billing === 'monthly' ? 'bg-gray-100 text-black' : 'text-gray-400'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${billing === 'yearly' ? 'bg-gray-100 text-black' : 'text-gray-400'}`}
          >
            Yearly
            <span className="ml-1.5 text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">Save 37%</span>
          </button>
        </div>

        {/* PLANS */}
        <div className="grid grid-cols-2 gap-6 mb-20">

          {/* FREE */}
          <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Free</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-extrabold tracking-tight">$0</span>
                <span className="text-gray-400 mb-1.5 text-sm font-medium">/ forever</span>
              </div>
              <p className="text-sm text-gray-400">Everything you need to manage social media like a pro</p>
            </div>

            <Link
              href={user ? '/dashboard' : '/signup'}
              className="w-full py-3 border-2 border-gray-200 text-sm font-bold rounded-2xl hover:border-gray-400 transition-all text-center mb-8"
            >
              {user ? 'Go to Dashboard →' : 'Get started free →'}
            </Link>

            <div className="space-y-3 flex-1">
              {FEATURES_FREE.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">✓</span>
                  </div>
                  <span className="text-sm text-gray-600">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PRO */}
          <div className="bg-black rounded-3xl p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full">
              Most Popular
            </div>
            <div className="mb-6">
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Pro</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-extrabold tracking-tight text-white">
                  ${billing === 'yearly' ? PRO_YEARLY : PRO_MONTHLY}
                </span>
                <span className="text-white/50 mb-1.5 text-sm font-medium">/ month</span>
              </div>
              {billing === 'yearly' && (
                <p className="text-xs text-white/50">Billed ${PRO_YEARLY * 12}/year · Save ${(PRO_MONTHLY - PRO_YEARLY) * 12}/year</p>
              )}
              <p className="text-sm text-white/60 mt-2">For power users who want AI-driven content creation</p>
            </div>

            <button className="w-full py-3 bg-white text-black text-sm font-bold rounded-2xl hover:opacity-90 transition-all mb-8">
              Upgrade to Pro →
            </button>

            <div className="space-y-3 flex-1">
              {FEATURES_PRO.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white">✓</span>
                  </div>
                  <span className="text-sm text-white/80">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COMPETITOR COMPARISON */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">How we compare</h2>
            <p className="text-gray-400">SocialMate's free plan beats competitors' paid plans</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wide">Feature</th>
                  {COMPETITORS.map(c => (
                    <th key={c.name} className={`px-6 py-4 text-center ${c.highlight ? 'bg-black text-white' : 'bg-white text-gray-700'}`}>
                      <span className={`text-sm font-extrabold ${c.highlight ? 'text-white' : 'text-gray-800'}`}>{c.name}</span>
                      <br />
                      <span className={`text-xs font-semibold ${c.highlight ? 'text-white/60' : 'text-gray-400'}`}>{c.price}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Platforms / Channels', key: 'platforms' },
                  { label: 'Scheduled Posts', key: 'posts' },
                  { label: 'Team Members', key: 'team' },
                  { label: 'AI Tools', key: 'ai' },
                  { label: 'Link in Bio', key: 'linkinbio' },
                  { label: 'Analytics', key: 'analytics' },
                ].map((row, i) => (
                  <tr key={row.key} className={i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">{row.label}</td>
                    {COMPETITORS.map(c => (
                      <td key={c.name} className={`px-6 py-4 text-center text-xs font-semibold ${c.highlight ? 'bg-black text-white' : 'text-gray-600'}`}>
                        {(c as any)[row.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SAVINGS CALLOUT */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-10 text-center mb-20">
          <div className="text-5xl mb-4">💰</div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">Save over $1,200/year</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-6">
            Buffer charges $6 per social channel per month. Managing 5 platforms costs $360/year. With SocialMate, all 16 platforms are free — saving you over $1,200 compared to Buffer alone.
          </p>
          <Link
            href={user ? '/dashboard' : '/signup'}
            className="inline-block bg-black text-white text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all"
          >
            Start saving today →
          </Link>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <h2 className="text-3xl font-extrabold tracking-tight text-center mb-10">Frequently asked questions</h2>
          <div className="grid grid-cols-2 gap-4">
            {FAQS.map(faq => (
              <div key={faq.q} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-300 transition-all">
                <h3 className="text-sm font-bold mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FINAL CTA */}
        <div className="bg-black rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-extrabold tracking-tight mb-3">Ready to get started?</h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">Join thousands of creators and brands scheduling smarter. Free forever, no credit card needed.</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href={user ? '/dashboard' : '/signup'}
              className="bg-white text-black text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all"
            >
              {user ? 'Go to Dashboard →' : 'Create free account →'}
            </Link>
            <Link href="/login" className="text-white/60 text-sm font-semibold hover:text-white transition-colors px-4 py-4">
              Sign in →
            </Link>
          </div>
          <p className="text-white/30 text-xs mt-6">No credit card · No trial · Free forever</p>
        </div>
      </div>
    </div>
  )
}