'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()

  const handleSignUp = async () => {
    if (!email || !password) return setMessage('Please fill in all fields.')
    if (password.length < 6) return setMessage('Password must be at least 6 characters.')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` }
    })
    if (error) {
      setMessage(error.message)
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-sm text-center">
          <div className="text-5xl mb-4">📬</div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and get started.
          </p>
          <p className="text-xs text-gray-400">
            Wrong email?{' '}
            <button onClick={() => setDone(false)} className="text-black font-semibold hover:underline">Go back</button>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-lg tracking-tight">SocialMate</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm mb-6">Free forever. No credit card needed.</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignUp()}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignUp()}
              placeholder="Min. 6 characters"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {message && (
            <div className="text-sm px-4 py-3 rounded-xl bg-red-50 text-red-600">
              {message}
            </div>
          )}

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:opacity-80 transition-all disabled:opacity-50 text-sm"
          >
            {loading ? 'Creating account...' : 'Create Free Account →'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">what you get</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              "✅ Unlimited posts",
              "✅ 16 platforms",
              "✅ 15 AI credits/mo",
              "✅ No credit card",
            ].map(f => (
              <div key={f} className="text-xs text-gray-500 flex items-center gap-1">{f}</div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-black font-semibold hover:underline">Log in</Link>
        </p>

        <p className="text-center text-xs text-gray-300 mt-3">
          By signing up you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-500">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-gray-500">Privacy Policy</Link>
        </p>
      </div>
    </main>
  )
}