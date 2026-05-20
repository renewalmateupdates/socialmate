'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'

const DISCOUNTS = [
  {
    id: 'nonprofit',
    icon: '🤝',
    label: 'Nonprofit Discount',
    badge: '50% off Pro',
    desc: 'For registered nonprofits, charities, and community organizations doing meaningful work.',
    eligibility: [
      '501(c)(3) or equivalent nonprofit status',
      'Community organizations and NGOs',
      'Faith-based organizations',
      'Educational nonprofits',
    ],
    code: 'NONPROFIT50',
    color: 'emerald',
  },
  {
    id: 'student',
    icon: '🎓',
    label: 'Student Discount',
    badge: '25% off Pro',
    desc: 'For current students at accredited colleges, universities, and trade schools.',
    eligibility: [
      'Active enrollment at any accredited institution',
      'Must have a valid .edu email address',
      'Community college students welcome',
      'Bootcamp students — reach out directly',
    ],
    code: 'STUDENT25',
    color: 'blue',
  },
]

export default function DiscountPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (code: string) => {
    try { navigator.clipboard.writeText(code) } catch {}
    setCopied(code)
    setTimeout(() => setCopied(null), 2500)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PublicNav />

      <main className="max-w-3xl mx-auto px-4 py-20">

        <div className="text-center mb-14">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Special Access</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Discounts for Those<br />Doing the Work
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            SocialMate is already the most affordable creator tool out there. These discounts are for people who need it most — no strings attached.
          </p>
        </div>

        <div className="space-y-6 mb-16">
          {DISCOUNTS.map(d => (
            <div key={d.id} className={`rounded-3xl border bg-gray-900 p-8 ${
              d.color === 'emerald' ? 'border-emerald-500/30' : 'border-blue-500/30'
            }`}>
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  d.color === 'emerald' ? 'bg-emerald-900/40' : 'bg-blue-900/40'
                }`}>
                  {d.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h2 className="text-lg font-extrabold">{d.label}</h2>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      d.color === 'emerald'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>{d.badge}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{d.desc}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Who qualifies</p>
                <ul className="space-y-1.5">
                  {d.eligibility.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className={`mt-0.5 flex-shrink-0 ${d.color === 'emerald' ? 'text-emerald-400' : 'text-blue-400'}`}>✓</span>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Coupon code</p>
                  <p className="text-xl font-extrabold tracking-widest">{d.code}</p>
                </div>
                <button
                  onClick={() => copy(d.code)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex-shrink-0 ${
                    copied === d.code
                      ? 'bg-green-500 text-white'
                      : d.color === 'emerald'
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                        : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}>
                  {copied === d.code ? '✓ Copied!' : 'Copy code'}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Apply this code at checkout on the <Link href="/pricing" className="underline hover:text-gray-300">pricing page</Link>. Honor system — we trust you.
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center">
          <p className="text-xl font-extrabold mb-2">Not sure if you qualify?</p>
          <p className="text-gray-400 text-sm mb-5">Reach out directly and we'll figure it out. We want to help.</p>
          <a
            href="mailto:hi@socialmate.studio"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all">
            📬 hi@socialmate.studio
          </a>
        </div>

      </main>

      <PublicFooter />
    </div>
  )
}
