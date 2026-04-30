'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type CreatorProfile = {
  page_handle:             string
  page_title:              string | null
  page_bio:                string | null
  avatar_url:              string | null
  tip_enabled:             boolean
  tip_min:                 number
  tip_max:                 number
  subscription_enabled:    boolean
  subscription_price:      number
  subscription_name:       string
  subscription_description:string
}

const TIP_PRESETS = [100, 300, 500, 1000] // cents

export default function CreatorPage() {
  const { handle } = useParams<{ handle: string }>()
  const searchParams = useSearchParams()

  const [creator,     setCreator]     = useState<CreatorProfile | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)

  const [tipAmount,   setTipAmount]   = useState(500)  // cents
  const [customTip,   setCustomTip]   = useState('')
  const [tipMessage,  setTipMessage]  = useState('')
  const [tipName,     setTipName]     = useState('')
  const [tipping,     setTipping]     = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [toast,       setToast]       = useState('')
  const [toastType,   setToastType]   = useState<'success'|'error'>('success')

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
  }, [handle])

  useEffect(() => {
    const tip = searchParams.get('tip')
    const sub = searchParams.get('sub')
    if (tip === 'success') showToast('💛 Thank you for the tip!', 'success')
    if (tip === 'cancelled') showToast('Tip cancelled.', 'error')
    if (sub === 'success') showToast('🎉 You\'re now a fan subscriber!', 'success')
    if (sub === 'cancelled') showToast('Subscription cancelled.', 'error')
  }, [searchParams])

  function showToast(msg: string, type: 'success' | 'error') {
    setToast(msg); setToastType(type)
    setTimeout(() => setToast(''), 4000)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-secondary text-sm">Loading…</div>
      </div>
    )
  }

  if (notFound || !creator) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-5xl">🤷</span>
        <h1 className="text-xl font-black text-primary">Creator not found</h1>
        <p className="text-secondary text-sm">This creator page doesn't exist or hasn't been set up yet.</p>
        <Link href="/" className="text-xs text-amber-500 hover:underline">← socialmate.studio</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-amber-400 px-6 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center text-3xl mx-auto mb-3">
          {creator.avatar_url ? (
            <img src={creator.avatar_url} alt={creator.page_title || handle} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <span>👤</span>
          )}
        </div>
        <h1 className="text-2xl font-black text-black">{creator.page_title || handle}</h1>
        {creator.page_bio && (
          <p className="text-black/70 text-sm mt-2 max-w-sm mx-auto">{creator.page_bio}</p>
        )}
        <p className="text-black/50 text-xs mt-2">@{handle}</p>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-5">

        {/* Tip jar */}
        {creator.tip_enabled && (
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💸</span>
              <div>
                <p className="font-black text-primary">Send a Tip</p>
                <p className="text-xs text-secondary">One-time support — every bit counts</p>
              </div>
            </div>

            {/* Preset amounts */}
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

            {/* Custom amount */}
            <div className="mb-3">
              <input
                type="number"
                value={customTip}
                onChange={e => setCustomTip(e.target.value)}
                placeholder={`Custom amount ($${creator.tip_min / 100}–$${creator.tip_max / 100})`}
                className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Name + message */}
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
              {tipping ? 'Redirecting…' : `Send $${customTip || (tipAmount / 100)} Tip →`}
            </button>
          </div>
        )}

        {/* Fan subscription */}
        {creator.subscription_enabled && (
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
            <button
              onClick={subscribe}
              disabled={subscribing}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-black py-3 rounded-xl text-sm transition-all"
            >
              {subscribing ? 'Redirecting…' : `Become a ${creator.subscription_name} — $${creator.subscription_price / 100}/mo →`}
            </button>
          </div>
        )}

        {/* Powered by */}
        <div className="text-center">
          <Link href="/" className="text-xs text-secondary hover:text-primary">
            Powered by <span className="font-bold">SocialMate</span> ✨
          </Link>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-6 z-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl ${toastType === 'success' ? 'bg-gray-900' : 'bg-red-500'}`}
          style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
