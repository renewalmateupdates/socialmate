'use client'
import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type CreatorProfile = {
  page_handle:              string
  page_title:               string | null
  page_bio:                 string | null
  avatar_url:               string | null
  header_color:             string
  tip_enabled:              boolean
  tip_min:                  number
  tip_max:                  number
  subscription_enabled:     boolean
  subscription_price:       number
  subscription_name:        string
  subscription_description: string
}

type PaywalledPost = {
  id:                  string
  title:               string
  preview:             string
  content?:            string  // only present when unlocked
  unlock_price_cents:  number | null
  created_at:          string
}

const TIP_PRESETS = [100, 300, 500, 1000] // cents
const LS_FAN_KEY  = (handle: string) => `fan_verified_${handle}`
const LS_UNLOCK_KEY = (postId: string) => `post_unlocked_${postId}`

function CreatorPageInner() {
  const { handle }  = useParams<{ handle: string }>()
  const searchParams = useSearchParams()

  const [creator,     setCreator]     = useState<CreatorProfile | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)

  const [tipAmount,   setTipAmount]   = useState(500)
  const [customTip,   setCustomTip]   = useState('')
  const [tipMessage,  setTipMessage]  = useState('')
  const [tipName,     setTipName]     = useState('')
  const [tipping,     setTipping]     = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [toast,       setToast]       = useState('')
  const [toastType,   setToastType]   = useState<'success'|'error'>('success')

  // paywalled posts
  const [posts,       setPosts]       = useState<PaywalledPost[]>([])
  const [isFan,       setIsFan]       = useState(false)
  const [fanEmail,    setFanEmail]    = useState('')
  const [verifying,   setVerifying]   = useState(false)
  const [showVerify,  setShowVerify]  = useState(false)
  const [unlocking,   setUnlocking]   = useState<string | null>(null)
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())
  const [expandedId,  setExpandedId]  = useState<string | null>(null)

  useEffect(() => {
    if (!handle) return
    fetch(`/api/creator/${handle}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.creator) setCreator(d.creator)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))

    fetch(`/api/creator/${handle}/posts`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.posts) setPosts(d.posts) })
      .catch(() => {})
  }, [handle])

  // Restore fan / unlock state from localStorage
  useEffect(() => {
    if (!handle) return
    const saved = localStorage.getItem(LS_FAN_KEY(handle))
    if (saved) {
      // Re-verify silently against server
      fetch(`/api/creator/${handle}/verify-fan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: saved }),
      }).then(r => r.ok ? r.json() : null).then(d => {
        if (d?.hasAccess) {
          setIsFan(true)
          if (d.posts) setPosts(d.posts)
        } else {
          localStorage.removeItem(LS_FAN_KEY(handle))
        }
      }).catch(() => {})
    }

    // Restore individual post unlocks
    const ids = new Set<string>()
    posts.forEach(p => {
      if (localStorage.getItem(LS_UNLOCK_KEY(p.id))) ids.add(p.id)
    })
    setUnlockedIds(ids)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle])

  // Handle return params from Stripe
  useEffect(() => {
    const tip    = searchParams.get('tip')
    const sub    = searchParams.get('sub')
    const unlock = searchParams.get('unlock')
    const csId   = searchParams.get('cs_id')
    const postId = searchParams.get('post_id')

    if (tip === 'success')      showToast('Thank you for the tip!', 'success')
    if (tip === 'cancelled')    showToast('Tip cancelled.', 'error')

    if (sub === 'success') {
      showToast('You\'re now a fan subscriber! Enter your email below to unlock content.', 'success')
      setShowVerify(true)
    }
    if (sub === 'cancelled')    showToast('Subscription cancelled.', 'error')

    if (unlock === 'success' && csId && postId) {
      // Verify the one-time unlock with server
      fetch(`/api/creator/${handle}/verify-unlock?session_id=${csId}&post_id=${postId}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d?.hasAccess && d.post) {
            localStorage.setItem(LS_UNLOCK_KEY(postId), csId)
            setUnlockedIds(prev => new Set(Array.from(prev).concat(postId)))
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: d.post.content } : p))
            setExpandedId(postId)
            showToast('Post unlocked!', 'success')
          }
        })
        .catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  function showToast(msg: string, type: 'success' | 'error') {
    setToast(msg); setToastType(type)
    setTimeout(() => setToast(''), 5000)
  }

  async function sendTip() {
    if (!creator) return
    const amount = customTip ? Math.round(parseFloat(customTip) * 100) : tipAmount
    if (!amount || amount < creator.tip_min) {
      showToast(`Minimum tip is $${creator.tip_min / 100}`, 'error'); return
    }
    if (amount > creator.tip_max) {
      showToast(`Maximum tip is $${creator.tip_max / 100}`, 'error'); return
    }
    setTipping(true)
    const res = await fetch(`/api/creator/${handle}/tip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_cents: amount, message: tipMessage, supporter_name: tipName }),
    })
    setTipping(false)
    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    } else {
      const d = await res.json()
      showToast(d.error || 'Something went wrong', 'error')
    }
  }

  async function subscribe() {
    if (!creator) return
    setSubscribing(true)
    const res = await fetch(`/api/creator/${handle}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    setSubscribing(false)
    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    } else {
      const d = await res.json()
      showToast(d.error || 'Something went wrong', 'error')
    }
  }

  async function verifyFan() {
    if (!fanEmail.trim()) return
    setVerifying(true)
    const res = await fetch(`/api/creator/${handle}/verify-fan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fanEmail.trim() }),
    })
    setVerifying(false)
    const d = await res.json()
    if (d.hasAccess) {
      localStorage.setItem(LS_FAN_KEY(handle), fanEmail.trim().toLowerCase())
      setIsFan(true)
      setShowVerify(false)
      if (d.posts) setPosts(d.posts)
      showToast('Fan access verified - exclusive content unlocked!', 'success')
    } else {
      showToast('No active subscription found for that email.', 'error')
    }
  }

  async function unlockPost(postId: string) {
    setUnlocking(postId)
    const res = await fetch(`/api/creator/${handle}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId }),
    })
    setUnlocking(null)
    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    } else {
      const d = await res.json()
      showToast(d.error || 'Something went wrong', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-secondary text-sm">Loading...</div>
      </div>
    )
  }

  if (notFound || !creator) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-5xl">🤷</span>
        <h1 className="text-xl font-black text-primary">Creator not found</h1>
        <p className="text-secondary text-sm">This creator page doesn&apos;t exist or hasn&apos;t been set up yet.</p>
        <Link href="/" className="text-xs text-amber-500 hover:underline">← socialmate.studio</Link>
      </div>
    )
  }

  const hasPaywalledPosts = posts.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 py-10 text-center" style={{ backgroundColor: creator.header_color || '#F59E0B' }}>
        <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center text-3xl mx-auto mb-3">
          {creator.avatar_url ? (
            <img src={creator.avatar_url} alt={creator.page_title || handle} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <span>👤</span>
          )}
        </div>
        <h1 className="text-2xl font-black" style={{ color: creator.header_color === '#ffffff' ? '#111827' : '#fff' }}>{creator.page_title || handle}</h1>
        {creator.page_bio && (
          <p className="text-sm mt-2 max-w-sm mx-auto" style={{ color: creator.header_color === '#ffffff' ? '#374151' : 'rgba(255,255,255,0.75)' }}>{creator.page_bio}</p>
        )}
        <p className="text-xs mt-2" style={{ color: creator.header_color === '#ffffff' ? '#6b7280' : 'rgba(255,255,255,0.5)' }}>@{handle}</p>
        {isFan && (
          <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.2)', color: creator.header_color === '#ffffff' ? '#111827' : '#fff' }}>
            Fan subscriber
          </span>
        )}
      </div>

      <div className="max-w-md mx-auto p-6 space-y-5">

        {/* Fan verify prompt - shown after sub success or manually */}
        {(showVerify || (!isFan && hasPaywalledPosts && creator.subscription_enabled)) && !isFan && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-2xl p-4">
            <p className="text-sm font-bold text-primary mb-1">Already a subscriber?</p>
            <p className="text-xs text-secondary mb-3">Enter the email you subscribed with to unlock exclusive content.</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={fanEmail}
                onChange={e => setFanEmail(e.target.value)}
                placeholder="your@email.com"
                onKeyDown={e => e.key === 'Enter' && verifyFan()}
                className="flex-1 bg-background border border-theme rounded-xl px-3 py-2 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={verifyFan}
                disabled={verifying || !fanEmail.trim()}
                className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black px-4 py-2 rounded-xl text-sm"
              >
                {verifying ? '...' : 'Verify'}
              </button>
            </div>
          </div>
        )}

        {/* Tip jar */}
        {creator.tip_enabled && (
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💸</span>
              <div>
                <p className="font-black text-primary">Send a Tip</p>
                <p className="text-xs text-secondary">One-time support - every bit counts</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {TIP_PRESETS.map(cents => (
                <button
                  key={cents}
                  onClick={() => { setTipAmount(cents); setCustomTip('') }}
                  className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                    tipAmount === cents && !customTip
                      ? 'bg-amber-400 border-amber-400 text-black'
                      : 'border-theme bg-background text-secondary hover:border-amber-400/50'
                  }`}
                >
                  ${cents / 100}
                </button>
              ))}
            </div>

            <div className="mb-3">
              <input
                type="number"
                value={customTip}
                onChange={e => setCustomTip(e.target.value)}
                placeholder={`Custom amount ($${creator.tip_min / 100}-$${creator.tip_max / 100})`}
                className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-2 mb-4">
              <input
                value={tipName}
                onChange={e => setTipName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
              />
              <input
                value={tipMessage}
                onChange={e => setTipMessage(e.target.value)}
                placeholder="Leave a message (optional)"
                className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={sendTip}
              disabled={tipping}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black py-3 rounded-xl text-sm transition-all"
            >
              {tipping ? 'Redirecting...' : `Send $${customTip || (tipAmount / 100)} Tip →`}
            </button>
          </div>
        )}

        {/* Fan subscription */}
        {creator.subscription_enabled && !isFan && (
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔁</span>
              <div>
                <p className="font-black text-primary">{creator.subscription_name}</p>
                <p className="text-xs text-secondary">${creator.subscription_price / 100}/month</p>
              </div>
            </div>
            {creator.subscription_description && (
              <p className="text-sm text-secondary mb-4">{creator.subscription_description}</p>
            )}
            {hasPaywalledPosts && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                Subscribers get access to {posts.length} exclusive post{posts.length !== 1 ? 's' : ''}
              </p>
            )}
            <button
              onClick={subscribe}
              disabled={subscribing}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-black py-3 rounded-xl text-sm transition-all"
            >
              {subscribing ? 'Redirecting...' : `Become a ${creator.subscription_name} - $${creator.subscription_price / 100}/mo →`}
            </button>
          </div>
        )}

        {/* Exclusive posts */}
        {hasPaywalledPosts && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔒</span>
              <p className="font-black text-primary">Exclusive Posts</p>
              {isFan && <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Fan access</span>}
            </div>
            <div className="space-y-3">
              {posts.map(post => {
                const isUnlocked = isFan || unlockedIds.has(post.id)
                const isExpanded = expandedId === post.id

                return (
                  <div key={post.id} className={`rounded-2xl border p-4 ${isUnlocked ? 'bg-surface border-theme' : 'bg-surface border-theme'}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span>{isUnlocked ? '📖' : '🔒'}</span>
                        <p className="font-bold text-primary text-sm">{post.title}</p>
                      </div>
                      {isUnlocked && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : post.id)}
                          className="text-xs text-amber-500 hover:underline shrink-0"
                        >
                          {isExpanded ? 'Hide' : 'Read'}
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-secondary leading-relaxed mb-3">
                      {isUnlocked && isExpanded ? (post.content ?? post.preview) : post.preview}
                      {!isUnlocked && <span className="text-secondary/50"> ...</span>}
                    </p>

                    {!isUnlocked && (
                      <div className="flex flex-col gap-2">
                        {post.unlock_price_cents && (
                          <button
                            onClick={() => unlockPost(post.id)}
                            disabled={unlocking === post.id}
                            className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black py-2 rounded-xl text-xs transition-all"
                          >
                            {unlocking === post.id ? 'Redirecting...' : `Unlock for $${post.unlock_price_cents / 100} →`}
                          </button>
                        )}
                        {creator.subscription_enabled && (
                          <button
                            onClick={subscribe}
                            className="w-full border border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-bold py-2 rounded-xl text-xs transition-all"
                          >
                            Subscribe to unlock all posts →
                          </button>
                        )}
                      </div>
                    )}

                    {isUnlocked && !isExpanded && (
                      <button
                        onClick={() => setExpandedId(post.id)}
                        className="text-xs text-amber-500 hover:underline"
                      >
                        Read full post →
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Powered by */}
        <div className="text-center pt-2 pb-2">
          <Link href="https://socialmate.studio/signup"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all">
            <span className="font-black text-amber-500 text-sm leading-none">S</span>
            Powered by SocialMate
          </Link>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-6 z-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl max-w-xs ${toastType === 'success' ? 'bg-gray-900' : 'bg-red-500'}`}
          style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}

export default function CreatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-secondary text-sm">Loading...</p></div>}>
      <CreatorPageInner />
    </Suspense>
  )
}
