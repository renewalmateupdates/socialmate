'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function EnkiCopilotAcceptPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'ready' | 'accepting' | 'success' | 'error' | 'no-auth'>('loading')
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMsg('Invalid invitation link — no token provided.')
      return
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setStatus('no-auth')
      } else {
        // Fetch invitation details
        supabase
          .from('enki_copilots')
          .select('id, owner_user_id, copilot_email, status')
          .eq('id', token)
          .maybeSingle()
          .then(({ data: invite }) => {
            if (!invite) {
              setStatus('error')
              setErrorMsg('Invitation not found or already used.')
              return
            }
            if (invite.status === 'active') {
              setStatus('success')
              return
            }
            if (invite.status === 'removed') {
              setStatus('error')
              setErrorMsg('This invitation has been removed by the owner.')
              return
            }
            // Show ready state with owner info (we fetch email via a separate API call)
            fetch('/api/enki/copilot')
              .then(r => r.json())
              .then(json => {
                if (json.owner_email) setOwnerEmail(json.owner_email)
              })
              .catch(() => {})
            setStatus('ready')
          })
      }
    })
  }, [token])

  async function handleAccept() {
    if (!token) return
    setStatus('accepting')
    try {
      const res = await fetch(`/api/enki/copilot/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setStatus('error')
        setErrorMsg(json.error ?? 'Failed to accept invitation.')
        return
      }
      setStatus('success')
      setTimeout(() => router.push('/enki'), 2000)
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Enki header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center text-black font-extrabold text-2xl mx-auto mb-4">E</div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Enki Co-Pilot</h1>
          <p className="text-gray-400 text-sm mt-1">View-only dashboard access</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {status === 'loading' && (
            <div className="text-center py-6">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading invitation…</p>
            </div>
          )}

          {status === 'no-auth' && (
            <div className="text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="text-lg font-bold text-white mb-2">Sign in to accept</h2>
              <p className="text-gray-400 text-sm mb-6">You need a SocialMate account to accept this co-pilot invitation.</p>
              <div className="space-y-3">
                <Link
                  href={`/login?redirect=/enki/copilot/accept?token=${token}`}
                  className="block w-full bg-amber-400 text-black text-sm font-bold py-3 rounded-xl text-center hover:bg-amber-300 transition-colors"
                >
                  Sign in →
                </Link>
                <Link
                  href={`/signup?redirect=/enki/copilot/accept?token=${token}`}
                  className="block w-full border border-gray-700 text-gray-300 text-sm font-semibold py-3 rounded-xl text-center hover:border-gray-500 transition-colors"
                >
                  Create free account
                </Link>
              </div>
            </div>
          )}

          {status === 'ready' && (
            <div>
              <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 mb-6">
                <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">Invitation from</p>
                <p className="text-white font-semibold text-sm">{ownerEmail ?? 'an Enki user'}</p>
              </div>

              <h2 className="text-lg font-bold text-white mb-2">Accept Co-Pilot access?</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                As a co-pilot, you'll have <strong className="text-white">read-only view</strong> of their Enki trading dashboard — live trades, performance stats, and signals. You cannot execute, approve, or modify any trades.
              </p>

              <ul className="space-y-2 mb-6">
                {[
                  'View live trades and open positions',
                  'Monitor P&L and performance',
                  'See signal analysis in real-time',
                  'No ability to trade or approve',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-amber-400">▸</span>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleAccept}
                className="w-full bg-amber-400 text-black text-sm font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors min-h-[44px]"
              >
                Accept Co-Pilot Invitation →
              </button>
              <Link
                href="/dashboard"
                className="block text-center text-xs text-gray-500 hover:text-gray-400 mt-3 transition-colors"
              >
                Decline — go to dashboard
              </Link>
            </div>
          )}

          {status === 'accepting' && (
            <div className="text-center py-6">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Accepting invitation…</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-lg font-bold text-white mb-2">Co-Pilot access granted</h2>
              <p className="text-gray-400 text-sm mb-6">You now have read-only access to their Enki dashboard. Redirecting…</p>
              <Link
                href="/enki"
                className="inline-block bg-amber-400 text-black text-sm font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors"
              >
                Go to Enki Dashboard →
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">❌</div>
              <h2 className="text-lg font-bold text-white mb-2">Invitation error</h2>
              <p className="text-gray-400 text-sm mb-6">{errorMsg}</p>
              <Link
                href="/dashboard"
                className="inline-block border border-gray-700 text-gray-300 text-sm font-semibold px-6 py-3 rounded-xl hover:border-gray-500 transition-colors"
              >
                Go to dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
