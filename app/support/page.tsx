import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Support — SocialMate',
  description: 'Get help with SocialMate. Find answers to common questions, report bugs, or reach out to the team directly.',
}

const FAQS = [
  {
    q: 'How do I connect a social media account?',
    a: 'Go to Settings → Connected Accounts in your dashboard. Click the platform you want to connect and follow the authorization steps. Bluesky requires an App Password (not your main password) — create one at bsky.app → Settings → App Passwords.',
  },
  {
    q: 'How does the credit system work?',
    a: 'Credits power SocialMate\'s AI tools. You have three pools: monthly credits (reset each billing period), earned credits (from referrals and milestones), and purchased credits (never expire). Credits are consumed in that order — monthly first, then earned, then purchased.',
  },
  {
    q: 'Why is my scheduled post not going out?',
    a: 'First, check that your connected account is still authorized under Settings → Connected Accounts. Platforms occasionally revoke tokens, which requires re-connecting. Also confirm the scheduled time is in the future and the post status shows "scheduled" in your Queue.',
  },
  {
    q: 'How do I cancel or change my plan?',
    a: 'Go to Settings → Plan in your dashboard. From there you can upgrade, downgrade, or cancel. Cancellations take effect at the end of your current billing period — you keep access until then.',
  },
  {
    q: 'I posted on X/Twitter and got charged credits — why?',
    a: 'X/Twitter uses a pay-per-use model at $0.01 per tweet due to X\'s API pricing. This is separate from AI credits. Monthly tweet quotas apply: 50/month on Free, 200 on Pro, 500 on Agency.',
  },
  {
    q: 'How do I join the affiliate program?',
    a: 'Visit socialmate.studio/partners and apply. Once approved, you\'ll get a unique referral link that earns 30% recurring commission on every subscription payment from people you refer.',
  },
  {
    q: 'What is Studio Stax?',
    a: 'Studio Stax is a curated creator marketplace built into SocialMate. Creators can list their services (video editing, design, copywriting, etc.) and get discovered by brands and other creators. Visit socialmate.studio/studio-stax to browse or apply to list.',
  },
  {
    q: 'I found a bug. How do I report it?',
    a: 'Use the feedback button (pink pill, bottom-left of your dashboard) to submit a bug report. Include as much detail as possible — what you were doing, what happened, and what you expected. We read every report.',
  },
  {
    q: 'How do workspaces work?',
    a: 'Workspaces let you isolate different brands or clients. Your personal workspace is your default. Agency plan users can create up to 5 client workspaces, each with their own connected accounts, posts, and settings.',
  },
  {
    q: 'Is there a mobile app?',
    a: 'SocialMate is a web app that works on mobile browsers. It\'s fully responsive and tested on iPhone. A native app is on the roadmap.',
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
            Social<span className="text-pink-500">Mate</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/blog" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Blog</Link>
            <Link href="/dashboard" className="bg-pink-500 text-white px-4 py-1.5 rounded-full font-semibold hover:bg-pink-600 transition-colors">Dashboard</Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="text-5xl mb-4">🛟</div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">How can we help?</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Find answers below, or reach out directly. We&apos;re a small team and we actually read everything.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          <a href="mailto:socialmatehq@gmail.com"
            className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-pink-300 dark:hover:border-pink-700 transition-all group text-center">
            <div className="text-2xl mb-2">✉️</div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">Email Us</div>
            <div className="text-xs text-gray-400 mt-1">socialmatehq@gmail.com</div>
          </a>
          <Link href="/dashboard"
            className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-pink-300 dark:hover:border-pink-700 transition-all group text-center">
            <div className="text-2xl mb-2">💬</div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">In-App Feedback</div>
            <div className="text-xs text-gray-400 mt-1">Pink pill, bottom-left of dashboard</div>
          </Link>
          <Link href="/roadmap"
            className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-pink-300 dark:hover:border-pink-700 transition-all group text-center">
            <div className="text-2xl mb-2">🗺️</div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">Roadmap</div>
            <div className="text-xs text-gray-400 mt-1">See what&apos;s coming next</div>
          </Link>
        </div>

        {/* FAQ */}
        <div className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="border border-gray-200 dark:border-gray-700 rounded-2xl group">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-semibold text-gray-900 dark:text-white text-sm select-none list-none">
                  {faq.q}
                  <span className="text-gray-400 ml-4 shrink-0 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="px-6 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Still stuck */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 border border-pink-100 dark:border-pink-900/40 rounded-3xl p-8 text-center">
          <div className="text-3xl mb-3">🤝</div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Still need help?</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-5 max-w-sm mx-auto">
            Shoot us an email and we&apos;ll get back to you as soon as possible. No ticket system, no bots — just a real person.
          </p>
          <a href="mailto:socialmatehq@gmail.com"
            className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-3 rounded-full transition-colors text-sm">
            Email socialmatehq@gmail.com
          </a>
        </div>

        {/* Footer links */}
        <div className="mt-12 text-center text-xs text-gray-400 flex items-center justify-center gap-4 flex-wrap">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <Link href="/pricing" className="hover:text-gray-600 transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-gray-600 transition-colors">Blog</Link>
          <Link href="/roadmap" className="hover:text-gray-600 transition-colors">Roadmap</Link>
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
        </div>
      </div>
    </div>
  )
}
