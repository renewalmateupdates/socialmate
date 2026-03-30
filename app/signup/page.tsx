'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const PERKS = [
  '16 social platforms — all free',
  'Unlimited scheduled posts',
  'Bulk Scheduler & Calendar',
  'Link in Bio builder',
  'Team collaboration',
  'Analytics & Best Times',
]

function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [done, setDone] = useState(false)
  const [refCode, setRefCode] = useState('')
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) setRefCode(ref)
  }, [searchParams])

  const handleGoogleSignup = async () => {
    if (!ageConfirmed) { setError('Please confirm you are 13 or older to continue'); return }
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

  const passwordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: '', color: '' }
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-400' }
    if (score === 2) return { score, label: 'Fair', color: 'bg-yellow-400' }
    if (score === 3) return { score, label: 'Good', color: 'bg-blue-400' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }

  const strength = passwordStrength(password)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!ageConfirmed) { setError('Please confirm you are 13 or older to continue'); return }
    if (!email.trim()) { setError('Enter your email'); return }
    if (!email.includes('@')) { setError('Enter a valid email'); return }
    if (!password) { setError('Choose a password'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { referral_code: refCode || null },
      },
    })
    if (error) {
      setError(error.message.includes('already registered') ? 'This email is already registered. Try signing in.' : error.message)
      setLoading(false)
      return
    }
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-theme flex flex-col">
        <div className="border-b border-theme bg-surface px-8 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-surface border border-theme rounded-3xl p-10 w-full max-w-md text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-3">You're almost in!</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-2">We sent a confirmation email to</p>
            <p className="font-bold text-sm mb-6">{email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-8 leading-relaxed">
              Click the link in that email to confirm your account and get started. Check your spam folder if you don't see it.
            </p>
            {refCode && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-left">
                <p className="text-xs font-bold text-green-700 mb-1">🎁 Referral applied</p>
                <p className="text-xs text-green-600 leading-relaxed">
                  Once you confirm your email and publish your first post, you'll both receive 25 bonus AI credits automatically.
                </p>
              </div>
            )}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">What's waiting for you</p>
              {PERKS.map(p => (
                <div key={p} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 py-0.5">
                  <span className="text-green-500 font-bold">✓</span> {p}
                </div>
              ))}
            </div>
            <Link href="/login" className="block w-full py-3 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all">
              Go to Sign In →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme flex flex-col">
      <div className="border-b border-theme bg-surface px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </Link>
        <Link href="/login" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black transition-colors">
          Already have an account? Sign in →
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

          {/* LEFT */}
          <div className="hidden md:block">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
              🎉 Free forever · No credit card
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
              Professional tools shouldn't require a professional budget
            </h1>
            <p className="text-gray-400 dark:text-gray-500 mb-8 leading-relaxed">
              Schedule to 16 platforms, manage your team, and grow your audience — completely free. No per-channel fees, no seat limits, no catch.
            </p>
            <div className="space-y-3 mb-8">
              {PERKS.map(perk => (
                <div key={perk} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{perk}</span>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 border border-theme rounded-2xl p-5">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Part of the Mate Series</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                SocialMate is built on a simple belief: software should work for you, not extract from you. Free means free — not a 14-day trial, not a stripped-down version.
              </p>
            </div>
          </div>

          {/* RIGHT — FORM */}
          <div>
            {/* MOBILE HERO (shows only on small screens) */}
            <div className="md:hidden mb-6">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                🎉 Free forever · No credit card
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight mb-2">
                Professional tools,<br />zero cost
              </h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-4 leading-relaxed">
                Schedule to 16 platforms, get 12 AI tools, and grow your audience — completely free.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {PERKS.map(perk => (
                  <div key={perk} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                    <span className="text-green-500 text-xs font-bold">✓</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-theme rounded-3xl p-8">
              <h2 className="text-lg font-extrabold tracking-tight mb-6 hidden md:block">Create your free account</h2>

              {refCode && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                  <p className="text-xs font-bold text-green-700">🎁 Referral code applied: <span className="uppercase">{refCode}</span></p>
                  <p className="text-xs text-green-600 mt-0.5">You'll both earn 25 bonus AI credits after your first post.</p>
                </div>
              )}

              {/* Age Gate */}
              <button
                type="button"
                onClick={() => setAgeConfirmed(a => !a)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all mb-5 ${
                  ageConfirmed ? 'border-green-400 bg-green-50' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                  ageConfirmed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {ageConfirmed && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  I confirm I am 13 years of age or older
                </span>
              </button>

              {/* Google Button */}
              <button
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 mb-5"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">or sign up with email</span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                    className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:border-gray-400 transition-colors pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-black transition-colors text-xs font-semibold">
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${strength.color}`}
                          style={{ width: `${(strength.score / 4) * 100}%` }} />
                      </div>
                      <span className={`text-xs font-semibold ${
                        strength.score <= 1 ? 'text-red-400' :
                        strength.score === 2 ? 'text-yellow-500' :
                        strength.score === 3 ? 'text-blue-500' : 'text-green-500'
                      }`}>{strength.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Same password again"
                    className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none transition-colors ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-red-300 focus:border-red-400'
                        : confirmPassword && confirmPassword === password
                        ? 'border-green-300 focus:border-green-400'
                        : 'border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:border-gray-400'
                    }`}
                  />
                  {confirmPassword && confirmPassword === password && (
                    <p className="text-xs text-green-500 font-semibold mt-1">✓ Passwords match</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-red-500">❌ {error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : 'Create Free Account →'}
                </button>
              </form>
            </div>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-black hover:underline">Sign in →</Link>
            </p>
            <p className="text-center text-xs text-gray-300 dark:text-gray-600 mt-2">
              By signing up you agree to our{' '}
              <Link href="/terms" className="hover:text-gray-500 transition-colors">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="hover:text-gray-500 transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Signup() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-theme flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-200 dark:border-gray-700 border-t-black rounded-full animate-spin" /></div>}>
      <SignupForm />
    </Suspense>
  )
}