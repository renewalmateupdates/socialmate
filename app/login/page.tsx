'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(error.message)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-lg tracking-tight">SocialMate</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-6">Log in to your SocialMate account.</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              placeholder="Your password"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {message && (
            <div className="text-sm px-4 py-3 rounded-xl bg-red-50 text-red-600">
              {message}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:opacity-80 transition-all disabled:opacity-50 text-sm"
          >
            {loading ? 'Logging in...' : 'Log In →'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-black font-semibold hover:underline">Sign up free</Link>
        </p>
      </div>
    </main>
  )
}