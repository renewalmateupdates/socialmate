'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Enter your email'); return }
    if (mode === 'password' && !password) { setError('Enter your password'); return }
    setLoading(true)
    setError('')

    if (mode === 'magic') {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() })
      if (error) { setError(error.message); setLoading(false); return }
      setMagicSent(true)
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Wrong email or password' : error.message)
      setLoading(false)
      return
    }

    // Check onboarding status and redirect accordingly
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single()

    router.refresh()

    if (profile?.onboarding_completed) {
      router.push('/dashboard')
    } else {
      router.push('/onboarding')
    }
  }

  if (magicSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="border-b border-gray-100 bg-white px-8 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-10 w-full max-w-md text-center">
            <div className="text-6xl mb-6">📬</div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-3">Check your inbox</h1>
            <p className="text-gray-400 text-sm mb-2">We sent a magic link to</p>
            <p className="font-bold text-sm mb-6">{email}</p>
            <p className="text-xs text-gray-400 mb-8">Click the link in the email to sign in instantly. No password needed.</p>
            <button
              onClick={() => { setMagicSent(false); setMode('password') }}
              className="text-sm font-semibold text-gray-500 hover:text-black transition-colors"
            >
              ← Try a different method
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="border-b border-gray-100 bg-white px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </Link>
        <Link href="/signup" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">
          No account? Sign up free →
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to your SocialMate account</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-8">

            {/* MODE TOGGLE */}
            <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setMode('password'); setError('') }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'password' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
              >
                🔑 Password
              </button>
              <button
                onClick={() => { setMode('magic'); setError('') }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'magic' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
              >
                ✨ Magic Link
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoFocus
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              {mode === 'password' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                    <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-black transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition-colors pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors text-xs font-semibold"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'magic' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs text-blue-600 font-medium">We'll email you a one-click sign-in link. No password needed.</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-red-500">❌ {error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'magic' ? 'Sending link...' : 'Signing in...'}
                  </>
                ) : (
                  mode === 'magic' ? 'Send Magic Link →' : 'Sign In →'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="font-bold text-black hover:underline">
              Sign up free →
            </Link>
          </p>

          <p className="text-center text-xs text-gray-300 mt-3">
            By signing in you agree to our{' '}
            <Link href="/terms" className="hover:text-gray-500 transition-colors">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="hover:text-gray-500 transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}