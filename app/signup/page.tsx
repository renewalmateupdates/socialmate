'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PERKS = [
  '16 social platforms — all free',
  'Unlimited scheduled posts',
  'Bulk Scheduler & Calendar',
  'Link in Bio builder',
  'Team collaboration',
  'Analytics & Best Times',
]

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

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
        emailRedirectTo: `${window.location.origin}/onboarding`,
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="border-b border-gray-100 bg-white px-8 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-10 w-full max-w-md text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-3">You're almost in!</h1>
            <p className="text-gray-400 text-sm mb-2">We sent a confirmation email to</p>
            <p className="font-bold text-sm mb-6">{email}</p>
            <p className="text-xs text-gray-400 mb-8 leading-relaxed">
              Click the link in that email to confirm your account and get started. Check your spam folder if you don't see it.
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">What's waiting for you</p>
              {PERKS.map(p => (
                <div key={p} className="flex items-center gap-2 text-xs text-gray-600 py-0.5">
                  <span className="text-green-500 font-bold">✓</span> {p}
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="block w-full py-3 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all"
            >
              Go to Sign In →
            </Link>
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
        <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">
          Already have an account? Sign in →
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

          {/* LEFT — PERKS */}
          <div className="hidden md:block">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
              🎉 Free forever · No credit card
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
              The social scheduler that's actually free
            </h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Schedule to 16 platforms, manage your team, and grow your audience — without paying Buffer's $100+/month.
            </p>
            <div className="space-y-3">
              {PERKS.map(perk => (
                <div key={perk} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{perk}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-black rounded-2xl p-5 text-white">
              <p className="text-sm font-bold mb-1">"I was paying $99/month for Hootsuite."</p>
              <p className="text-xs text-white/60">"SocialMate does everything I need for free. Genuinely shocked."</p>
              <p className="text-xs text-white/40 mt-2">— Sarah K., Content Creator</p>
            </div>
          </div>

          {/* RIGHT — FORM */}
          <div>
            <div className="text-center mb-6 md:hidden">
              <h1 className="text-2xl font-extrabold tracking-tight mb-1">Create free account</h1>
              <p className="text-gray-400 text-sm">No credit card required</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-8">
              <h2 className="text-lg font-extrabold tracking-tight mb-6 hidden md:block">Create your free account</h2>

              <form onSubmit={handleSignup} className="space-y-4">
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

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
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
                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${strength.color}`}
                          style={{ width: `${(strength.score / 4) * 100}%` }}
                        />
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
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Confirm Password</label>
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
                        : 'border-gray-200 focus:border-gray-400'
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
                  className="w-full py-3.5 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Free Account →'
                  )}
                </button>
              </form>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-black hover:underline">
                Sign in →
              </Link>
            </p>
            <p className="text-center text-xs text-gray-300 mt-2">
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