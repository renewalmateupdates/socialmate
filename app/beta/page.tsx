'use client'
import { useState } from 'react'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import Link from 'next/link'

const TESTER_GOAL = 12

export default function BetaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/beta/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong — try again'); return }
      setDone(true)
    } catch {
      setError('Something went wrong — try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PublicNav />

      <main className="max-w-2xl mx-auto px-6 py-20">

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400/10 border border-amber-400/30 rounded-full text-xs font-bold text-amber-400 uppercase tracking-widest">
            🤖 Android Beta
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Help us ship<br />
            <span className="text-amber-400">SocialMate for Android</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto">
            We're in Google Play closed testing. We need {TESTER_GOAL} opted-in testers before Google lets us go public. Be one of them.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { n: '1', title: 'Enter your email', desc: 'We send you the Google Play opt-in link instantly.' },
            { n: '2', title: 'Opt in on Google Play', desc: 'Takes 30 seconds. Just tap the link and accept.' },
            { n: '3', title: 'App ships to production', desc: 'Every tester gets us one step closer to public launch.' },
          ].map(step => (
            <div key={step.n} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="w-7 h-7 bg-amber-400 text-black rounded-full flex items-center justify-center text-xs font-extrabold mb-3">{step.n}</div>
              <p className="text-sm font-bold mb-1">{step.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 mb-8">
          {done ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-extrabold mb-2">Check your inbox!</h2>
              <p className="text-gray-400 text-sm mb-4">
                We just sent the Google Play opt-in link to <span className="text-white font-semibold">{email}</span>.
              </p>
              <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-4 text-left mb-4">
                <p className="text-xs font-bold text-amber-400 mb-1">What to do next:</p>
                <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Open the email from SocialMate</li>
                  <li>Click the Google Play opt-in link</li>
                  <li>Sign in with your Google account and accept</li>
                  <li>The app will appear in your Play Store within a few hours</li>
                </ol>
              </div>
              <p className="text-xs text-gray-500">
                Didn't get it? Check spam, or{' '}
                <button onClick={() => { setDone(false); setEmail('') }} className="text-amber-400 underline">try again</button>.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-extrabold mb-1">Join the Android beta</h2>
              <p className="text-gray-400 text-sm mb-5">
                You'll get the Google Play opt-in link immediately. No spam, ever.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(null) }}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3.5 bg-gray-800 border border-gray-700 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-black text-sm font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2">
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Sending link...</>
                    : 'Send me the opt-in link →'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* What you get */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">What beta testers get</p>
          <div className="space-y-2.5">
            {[
              'Early access to SocialMate on Android before public launch',
              'Your feedback shapes the app before it ships to everyone',
              '100 bonus AI credits added to your account when the app goes live',
              'A direct line to the founder — Joshua reads every message',
            ].map(item => (
              <div key={item} className="flex items-start gap-3 text-sm">
                <span className="text-amber-400 font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What is SocialMate */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 mb-3">New to SocialMate?</p>
          <p className="text-gray-300 text-sm leading-relaxed max-w-lg mx-auto mb-4">
            SocialMate is a social media scheduler and AI creator toolkit — what competitors charge $99/month for, we give for $5 or free. Schedule posts to Bluesky, Discord, Telegram, Mastodon, and X from one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/" className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2">
              Learn more →
            </Link>
            <Link href="/pricing" className="text-xs text-gray-400 hover:text-gray-300 font-semibold underline underline-offset-2">
              See pricing →
            </Link>
          </div>
        </div>

        {/* Built by Joshua */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            Built solo by <span className="text-gray-300 font-semibold">Joshua Bostic</span> — founder of Gilgamesh Enterprise LLC, working a deli job nights and weekends to build this.{' '}
            <Link href="/story" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">Read the story →</Link>
          </p>
        </div>

      </main>

      <PublicFooter />
    </div>
  )
}
