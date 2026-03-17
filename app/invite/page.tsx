'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function InviteInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'ready' | 'accepting' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const check = async () => {
      if (!token) { setStatus('error'); setErrorMsg('Invalid invite link'); return }
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setStatus('ready')
    }
    check()
  }, [token])

  const handleAccept = async () => {
    if (!user) {
      router.push(`/login?next=/invite?token=${token}`)
      return
    }
    setStatus('accepting')
    const res = await fetch('/api/team/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId: user.id, email: user.email }),
    })
    const data = await res.json()
    if (!res.ok) {
      setStatus('error')
      setErrorMsg(data.error || 'Something went wrong')
      return
    }
    setStatus('success')
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center shadow-sm">

        {status === 'loading' && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto" />
        )}

        {status === 'ready' && (
          <>
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">S</div>
            <h1 className="text-2xl font-extrabold mb-2">You're invited!</h1>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              {user
                ? 'Accept this invitation to join the workspace as a team member.'
                : 'Sign in or create an account to accept this invitation.'}
            </p>
            {user && (
              <p className="text-xs text-gray-400 mb-6">
                Accepting as <span className="font-semibold text-gray-700">{user.email}</span>
              </p>
            )}
            <button onClick={handleAccept}
              className="w-full bg-black text-white font-bold py-3 rounded-xl hover:opacity-80 transition-all text-sm">
              {user ? 'Accept Invitation' : 'Sign in to Accept'}
            </button>
          </>
        )}

        {status === 'accepting' && (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Accepting invitation...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-extrabold mb-2">You're in!</h2>
            <p className="text-gray-500 text-sm">Redirecting you to the dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-extrabold mb-2">Invalid Invite</h2>
            <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
            <Link href="/login" className="text-sm font-semibold text-black underline">
              Go to login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    }>
      <InviteInner />
    </Suspense>
  )
}