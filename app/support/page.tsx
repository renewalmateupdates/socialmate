'use client'

import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

const FAQS = [
  {
    q: 'What platforms can I schedule to?',
    a: 'SocialMate currently supports Bluesky, Discord, Telegram, Mastodon, and X/Twitter. More platforms are coming soon: LinkedIn, YouTube, Reddit, and Pinterest are on the roadmap.',
  },
  {
    q: 'How do credits work?',
    a: 'Credits power the AI tools. You have three pools: monthly credits (reset each billing period), earned credits (from referrals and milestones), and purchased credits (never expire). Credits are consumed in that order — monthly first, then earned, then purchased.',
  },
  {
    q: 'Is the free plan actually free?',
    a: 'Yes. No credit card required. The free plan includes 50 credits per month, 2 seats, and full access to the post scheduling features. You can schedule to all supported platforms without paying anything.',
  },
  {
    q: 'How do I connect my social accounts?',
    a: 'Go to Settings → Connected Accounts in your dashboard. Each platform has a Connect button with step-by-step instructions. Bluesky requires an App Password (not your main password) — you can create one at bsky.app → Settings → App Passwords.',
  },
  {
    q: 'Can I schedule to multiple platforms at once?',
    a: 'Yes. When composing a post, select all the platforms you want to publish to. One post, one submission — it goes out to every platform you select at the scheduled time.',
  },
  {
    q: "What's X/Twitter pay-per-use?",
    a: "X/Twitter uses a pay-per-use model at $0.01 per tweet due to X's API pricing. Monthly tweet quotas also apply: 50 tweets/month on Free, 200 on Pro, and 500 on Agency. This is separate from your AI credits.",
  },
  {
    q: 'How does billing work?',
    a: 'Billing is handled through Stripe. Subscriptions renew monthly or annually depending on your plan. You can upgrade, downgrade, or cancel anytime from Settings → Plan. Annual plans save roughly 8% compared to monthly.',
  },
  {
    q: 'Can I invite my team?',
    a: 'Yes. Pro plan includes 5 seats and Agency includes 15 seats. Invite team members from Settings → Team. Each member gets their own login while sharing the same workspace and connected accounts.',
  },
  {
    q: 'What is Studio Stax?',
    a: 'Studio Stax is a curated directory of indie founder tools built into SocialMate. Founders can apply to list their tools and get discovered by the creator community. Browse at /studio-stax or apply to be listed at /studio-stax/apply.',
  },
  {
    q: 'How do I become an affiliate?',
    a: 'Apply at /partners. Once approved, you get a unique referral link that earns 30% recurring commission on every subscription payment. After 100 active recurring referrals, that jumps to 40% forever.',
  },
]

const QUICK_LINKS = [
  { label: 'Pricing', href: '/pricing', desc: 'Plans & credit packs' },
  { label: 'Features', href: '/features', desc: 'Everything SocialMate does' },
  { label: 'Affiliate Program', href: '/partners', desc: '30% recurring commission' },
  { label: 'Blog', href: '/blog', desc: 'Tips, guides & updates' },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="border rounded-xl overflow-hidden transition-colors"
      style={{ borderColor: '#222222', backgroundColor: '#111111' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 cursor-pointer"
      >
        <span className="font-semibold text-white text-sm leading-snug">{q}</span>
        <span
          className="shrink-0 text-gray-400 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div
          className="px-6 pb-5 pt-1 text-sm leading-relaxed border-t"
          style={{ color: '#9ca3af', borderColor: '#222222' }}
        >
          {a}
        </div>
      )}
    </div>
  )
}

const supportFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function SupportPage() {
  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(supportFaqSchema) }} />
      <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-3xl mx-auto px-6 py-20">

          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
              We&apos;ve got your back.
            </h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Quick answers below. If you still need help, reach out directly.
            </p>
          </div>

          {/* FAQ Accordion */}
          <section className="mb-16">
            <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </section>

          {/* Still need help */}
          <section className="mb-16">
            <div
              className="rounded-2xl p-8 text-center border"
              style={{ backgroundColor: '#111111', borderColor: '#222222' }}
            >
              <h2 className="text-2xl font-black text-white mb-2">Still need help?</h2>
              <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                We typically respond within 24 hours. Joshua personally reads every message.
              </p>
              <a
                href="mailto:support@socialmate.studio"
                className="inline-flex items-center gap-2 font-bold text-white px-6 py-3 rounded-full transition-colors text-sm"
                style={{ backgroundColor: '#7C3AED' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6d28d9')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#7C3AED')}
              >
                support@socialmate.studio
              </a>
            </div>
          </section>

          {/* Quick links */}
          <section>
            <h2 className="text-xl font-bold text-white mb-5">Quick Links</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QUICK_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl border p-4 transition-colors group"
                  style={{ backgroundColor: '#111111', borderColor: '#222222' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#222222')}
                >
                  <div className="font-semibold text-white text-sm mb-1 group-hover:text-purple-400 transition-colors">
                    {link.label}
                  </div>
                  <div className="text-xs text-gray-500">{link.desc}</div>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>
    </PublicLayout>
  )
}
