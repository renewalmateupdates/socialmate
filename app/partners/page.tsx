'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// Gold/purple design tokens
const gold   = '#F59E0B'
const purple = '#7C3AED'
const dark   = '#0a0a0a'
const surface = '#111111'
const border  = '#222222'
const muted   = '#6b7280'

function PartnersLoginInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token')  // invite token

  const [mode, setMode]               = useState<'login' | 'signup'>('login')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [loading, setLoading]         = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]             = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const [inviteValid, setInviteValid] = useState<null | { email: string; valid: boolean }>(null)

  // Check for existing session
  useEffect(() => {
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Single call — stats returns isAdmin flag for the owner account
        const res = await fetch('/api/partners/stats')
        if (res.ok) {
          const json = await res.json()
          // Admin: redirect straight to admin panel
          if (json.isAdmin) {
            router.push('/admin/affiliates')
            return
          }
          if (json.profile?.status === 'active') {
            router.push('/partners/dashboard')
            return
          }
          if (json.profile?.onboarding_completed === false) {
            router.push('/partners/onboarding')
            return
          }
        }
        router.push('/partners/access-denied')
        return
      }
      setCheckingSession(false)
    }
    checkSession()
  }, [router])

  // Validate invite token
  useEffect(() => {
    if (!token) return
    async function validateToken() {
      const res = await fetch(`/api/partners/invite-respond?token=${token}&action=check`)
      if (res.ok) {
        const json = await res.json()
        if (json.valid) {
          setInviteValid({ email: json.email, valid: true })
          setEmail(json.email)
          setMode('signup')
        } else {
          setInviteValid({ email: '', valid: false })
        }
      }
    }
    validateToken()
  }, [token])

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    const callbackUrl = token
      ? `${window.location.origin}/partners/auth/callback?token=${token}`
      : `${window.location.origin}/partners/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) { setError('Fill in all fields'); return }
    setLoading(true)
    setError('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/partners/auth/callback${token ? `?token=${token}` : ''}`,
          data: { source: 'partner_portal', invite_token: token ?? null },
        },
      })
      if (error) { setError(error.message); setLoading(false); return }
      // On signup, redirect to onboarding with token
      router.push(token ? `/partners/onboarding?token=${token}` : '/partners/onboarding')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'Wrong email or password' : error.message)
        setLoading(false)
        return
      }
      if (data.user) {
        const res = await fetch('/api/partners/stats')
        if (res.ok) {
          const json = await res.json()
          if (json.isAdmin) {
            router.push('/admin/affiliates')
            return
          }
          if (json.profile?.status === 'active' || json.profile?.status === 'suspended') {
            if (!json.profile.onboarding_completed) {
              router.push('/partners/onboarding')
            } else {
              router.push('/partners/dashboard')
            }
            return
          }
        }
        router.push('/partners/access-denied')
      }
    }
  }

  if (checkingSession) {
    return (
      <div style={{ minHeight: '100vh', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${gold}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: dark, display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <header style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${border}` }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#000000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff',
            flexShrink: 0,
          }}>S</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f1f1' }}>SocialMate</span>
            <span style={{
              fontSize: 10, color: '#000', fontWeight: 800,
              background: gold, padding: '2px 7px', borderRadius: 4,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>Partners</span>
          </div>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: muted, textDecoration: 'none' }}>← Back to SocialMate</Link>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Hero text */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(245,158,11,0.1)', border: `1px solid rgba(245,158,11,0.3)`,
              borderRadius: 20, padding: '6px 14px', marginBottom: 20,
            }}>
              <span style={{ color: gold, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Affiliate Partner Portal</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f1f1', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {inviteValid?.valid ? `You're invited` : 'Partner Sign In'}
            </h1>
            <p style={{ fontSize: 15, color: muted, margin: 0, lineHeight: 1.6 }}>
              {inviteValid?.valid
                ? `Create your account and start earning 30–40% recurring commissions.`
                : 'Access your affiliate dashboard, promo codes, and earnings.'}
            </p>
          </div>

          {/* Invalid invite banner */}
          {token && inviteValid?.valid === false && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12, padding: '14px 16px', marginBottom: 24, textAlign: 'center',
            }}>
              <p style={{ fontSize: 14, color: '#f87171', margin: 0, fontWeight: 600 }}>
                This invite link is invalid or has expired.
              </p>
              <p style={{ fontSize: 13, color: muted, margin: '6px 0 0' }}>
                Contact your SocialMate representative for a new invite.
              </p>
            </div>
          )}

          {/* Card */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 32 }}>

            {/* Mode tabs (only show if no invite) */}
            {!inviteValid?.valid && (
              <div style={{
                display: 'flex', gap: 4, background: '#0a0a0a', borderRadius: 10,
                padding: 4, marginBottom: 28,
              }}>
                {(['login', 'signup'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      background: mode === m ? '#1a1a1a' : 'transparent',
                      color: mode === m ? '#f1f1f1' : muted,
                      transition: 'all 0.15s',
                    }}
                  >
                    {m === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 20,
                fontSize: 13, color: '#f87171',
              }}>
                {error}
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              style={{
                width: '100%', padding: '11px 16px', borderRadius: 10,
                border: `1px solid ${border}`, background: '#1a1a1a',
                color: '#f1f1f1', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, marginBottom: 20,
                opacity: googleLoading ? 0.6 : 1,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: border }} />
              <span style={{ fontSize: 12, color: muted }}>or</span>
              <div style={{ flex: 1, height: 1, background: border }} />
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  readOnly={!!inviteValid?.valid}
                  placeholder="you@example.com"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: inviteValid?.valid ? '#0f0f0f' : '#0f0f0f',
                    border: `1px solid ${inviteValid?.valid ? 'rgba(245,158,11,0.4)' : border}`,
                    color: inviteValid?.valid ? gold : '#f1f1f1',
                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Create a password' : '••••••••'}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: '#0f0f0f', border: `1px solid ${border}`,
                    color: '#f1f1f1', fontSize: 14, outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${gold}, ${purple})`,
                  color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  opacity: loading ? 0.6 : 1, marginTop: 4,
                  fontFamily: 'inherit',
                }}
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {mode === 'login' && (
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: muted }}>
                <Link href="/forgot-password" style={{ color: gold, textDecoration: 'none' }}>
                  Forgot your password?
                </Link>
              </p>
            )}
          </div>

          {/* Footer note */}
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#4b5563', lineHeight: 1.6 }}>
            Partner access is by invite only. If you were not invited,{' '}
            <Link href="/partners/access-denied" style={{ color: gold, textDecoration: 'none' }}>
              apply here
            </Link>.
          </p>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '24px', borderTop: `1px solid ${border}`, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>
          © {new Date().getFullYear()} Gilgamesh Enterprise LLC · SocialMate Partner Program
        </p>
      </footer>
    </div>
  )
}

export default function PartnersPage() {
  return (
    <Suspense>
      <PartnersLoginInner />
    </Suspense>
  )
}
