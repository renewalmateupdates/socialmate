'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Coupon {
  id: string
  code: string
  discount_type: 'percent' | 'fixed' | 'trial_extension'
  discount_value: number
  max_redemptions: number | null
  current_redemptions: number
  expires_at: string | null
  active: boolean
  note: string | null
  created_at: string
  affiliates: { id: string; full_name: string | null; email: string } | null
}

interface Affiliate {
  id: string
  full_name: string | null
  email: string
  status: string
}

const DISCOUNT_LABELS: Record<string, string> = {
  percent:          '% off',
  fixed:            '$ off',
  trial_extension:  'days trial',
}

function formatDiscount(type: string, value: number) {
  if (type === 'percent') return `${value}% off`
  if (type === 'fixed') return `$${value} off`
  if (type === 'trial_extension') return `+${value} trial days`
  return String(value)
}

export default function AdminCouponsClient() {
  const [coupons, setCoupons]       = useState<Coupon[]>([])
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading]       = useState(true)
  const [creating, setCreating]     = useState(false)
  const [showForm, setShowForm]     = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [success, setSuccess]       = useState<string | null>(null)

  // Form state
  const [code, setCode]                   = useState('')
  const [affiliateId, setAffiliateId]     = useState('')
  const [discountType, setDiscountType]   = useState<'percent' | 'fixed' | 'trial_extension'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [maxRedemptions, setMaxRedemptions] = useState('')
  const [expiresAt, setExpiresAt]         = useState('')
  const [note, setNote]                   = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [cRes, aRes] = await Promise.all([
      fetch('/api/admin/coupons'),
      fetch('/api/admin/affiliates'),
    ])
    const [cJson, aJson] = await Promise.all([cRes.json(), aRes.json()])
    setCoupons(cJson.coupons ?? [])
    setAffiliates((aJson.affiliates ?? []).filter((a: Affiliate) => a.status === 'active'))
    setLoading(false)
  }

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          affiliate_id:    affiliateId || undefined,
          discount_type:   discountType,
          discount_value:  Number(discountValue),
          max_redemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
          expires_at:      expiresAt || undefined,
          note:            note || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error); return }
      setSuccess(`Coupon ${json.coupon.code} created.`)
      setShowForm(false)
      setCode(''); setAffiliateId(''); setDiscountValue(''); setMaxRedemptions(''); setExpiresAt(''); setNote('')
      await load()
      setTimeout(() => setSuccess(null), 4000)
    } finally {
      setCreating(false)
    }
  }

  async function deactivate(id: string) {
    if (!confirm('Deactivate this coupon?')) return
    await fetch('/api/admin/coupons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active: false }),
    })
    await load()
  }

  const inputCls = 'w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-violet-400'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Partner Coupons</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create and manage affiliate-linked discount codes.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/affiliates" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">← Affiliates</Link>
            <button
              onClick={() => { setShowForm(v => !v); setError(null) }}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors"
            >
              {showForm ? 'Cancel' : '+ New Coupon'}
            </button>
          </div>
        </div>

        {/* Feedback */}
        {success && (
          <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">New Coupon</h2>
            <form onSubmit={createCoupon} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Code *</label>
                <input
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="SAVE20"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Affiliate (optional)</label>
                <select
                  value={affiliateId}
                  onChange={e => setAffiliateId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">— No affiliate —</option>
                  {affiliates.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.full_name || a.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Discount Type *</label>
                <select
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value as typeof discountType)}
                  className={inputCls}
                >
                  <option value="percent">Percent off (%)</option>
                  <option value="fixed">Fixed amount ($)</option>
                  <option value="trial_extension">Trial extension (days)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Value * ({DISCOUNT_LABELS[discountType]})
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountValue}
                  onChange={e => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percent' ? '20' : discountType === 'fixed' ? '5.00' : '14'}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Max Redemptions (blank = unlimited)</label>
                <input
                  type="number"
                  min="1"
                  value={maxRedemptions}
                  onChange={e => setMaxRedemptions(e.target.value)}
                  placeholder="100"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Expires At (blank = never)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Internal Note</label>
                <input
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Created for YouTube collab with @creator"
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  {creating ? 'Creating…' : 'Create Coupon'}
                </button>
                <span className="text-xs text-gray-400">
                  {discountType !== 'trial_extension' && 'A Stripe promotion code will be created automatically.'}
                  {discountType === 'trial_extension' && 'Applied as free trial days at checkout — no Stripe coupon needed.'}
                </span>
              </div>
            </form>
          </div>
        )}

        {/* Coupons table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No coupons yet. Create one above.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">Code</th>
                    <th className="text-left px-4 py-3">Discount</th>
                    <th className="text-left px-4 py-3">Affiliate</th>
                    <th className="text-right px-4 py-3">Uses</th>
                    <th className="text-left px-4 py-3">Expires</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Note</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {coupons.map(c => (
                    <tr key={c.id} className={`${!c.active ? 'opacity-40' : ''}`}>
                      <td className="px-4 py-3 font-mono font-bold text-violet-600 dark:text-violet-400 text-sm">
                        {c.code}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {formatDiscount(c.discount_type, c.discount_value)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                        {c.affiliates
                          ? (c.affiliates.full_name || c.affiliates.email)
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                        {c.current_redemptions}
                        {c.max_redemptions != null && (
                          <span className="text-gray-400 text-xs"> / {c.max_redemptions}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {c.expires_at
                          ? new Date(c.expires_at) < new Date()
                            ? <span className="text-red-500">Expired</span>
                            : new Date(c.expires_at).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                          c.active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                        }`}>
                          {c.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-[160px] truncate">
                        {c.note ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        {c.active && (
                          <button
                            onClick={() => deactivate(c.id)}
                            className="text-xs text-red-500 hover:text-red-400 font-semibold"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Coupon codes are case-insensitive. Stripe promotion codes are auto-created for percent/fixed discounts.
        </p>
      </div>
    </div>
  )
}
