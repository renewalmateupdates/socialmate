'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  // R2: track whether a valid recovery session exists
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionChecking, setSessionChecking] = useState(true)
  const router = useRouter()

  // R2: verify there's an active recovery session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      // Supabase sets the session type to 'recovery' when user arrives via reset link
      if (session) {
        setSessionReady(true)
      }
      setSessionChecking(false)
    }
    checkSession()

    // Also listen for the PASSWORD_RECOVERY event in case the token
    // is still being exchanged when the component mounts
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
        setSessionChecking(false)
      }
    })

    return () => subscription.unsubscribe()
  }, []) // R1: removed stale useEffect import issue — now actually used

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) { setError('Enter a new password'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="border-b border-gray-100 bg-white px-8 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* R2: still checking session */}
          {sessionChecking && (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-400">Verifying your reset link...</p>
            </div>
          )}

          {/* R2: expired or missing session */}
          {!sessionChecking && !sessionReady && !done && (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center">
              <div className="text-6xl mb-6">⚠️</div>
              <h1 className="text-2xl font-extrabold tracking-tight mb-3">Link expired or invalid</h1>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                This password reset link has expired or already been used. Reset links are valid for 1 hour.
              </p>
              <Link href="/forgot-password"
                className="block w-full py-3 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all text-center mb-3">
                Request a new reset link →
              </Link>
              <Link href="/login"
                className="block text-xs text-gray-400 hover:text-black transition-colors">
                Back to sign in
              </Link>
            </div>
          )}

          {/* SUCCESS */}
          {done && (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center">
              <div className="text-6xl mb-6">✅</div>
              <h1 className="text-2xl font-extrabold tracking-tight mb-3">Password updated!</h1>
              <p className="text-gray-400 text-sm">Redirecting you to the dashboard...</p>
            </div>
          )}

          {/* FORM — only shown when session is valid */}
          {!sessionChecking && sessionReady && !done && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Choose a new password</h1>
                <p className="text-gray-400 text-sm">Must be at least 6 characters</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl p-8">
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="New password"
                        autoFocus
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-black font-semibold">
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Same password again"
                      className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none transition-colors ${
                        confirmPassword && confirmPassword !== password ? 'border-red-300' :
                        confirmPassword && confirmPassword === password ? 'border-green-300' :
                        'border-gray-200 focus:border-gray-400'
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
                        Updating...
                      </>
                    ) : 'Update Password →'}
                  </button>
                </form>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}