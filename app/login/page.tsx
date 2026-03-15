'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'Wrong email or password' : error.message)
        setLoading(false)
        return
      }

      if (data?.user) {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
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

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 mb-5"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

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