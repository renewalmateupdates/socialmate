'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Enter your email'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="border-b border-gray-100 bg-white px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </Link>
        <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">
          Back to sign in
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {sent ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center">
              <div className="text-6xl mb-6">📬</div>
              <h1 className="text-2xl font-extrabold tracking-tight mb-3">Check your inbox</h1>
              <p className="text-gray-400 text-sm mb-2">We sent a password reset link to</p>
              <p className="font-bold text-sm mb-6">{email}</p>
              <p className="text-xs text-gray-400 mb-8">Click the link in the email to reset your password. Check your spam folder if you don't see it within a few minutes.</p>
              <Link href="/login" className="block w-full py-3 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all text-center">
                Back to Sign In →
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Reset your password</h1>
                <p className="text-gray-400 text-sm">Enter your email and we'll send you a reset link</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        Sending...
                      </>
                    ) : 'Send Reset Link →'}
                  </button>
                </form>
              </div>
              <p className="text-center text-xs text-gray-400 mt-4">
                Remember your password?{' '}
                <Link href="/login" className="font-bold text-black hover:underline">Sign in →</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}