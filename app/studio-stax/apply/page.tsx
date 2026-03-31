'use client'
import { useState, useEffect } from 'react'
import PublicLayout from '@/components/PublicLayout'
import Link from 'next/link'

const CATEGORIES = [
  { id: 'social-media',      label: 'Social Media Tools'   },
  { id: 'content-creation',  label: 'Content Creation'     },
  { id: 'ai-tools',          label: 'AI Tools'              },
  { id: 'analytics',         label: 'Analytics & Growth'   },
  { id: 'creator-economy',   label: 'Creator Economy'       },
  { id: 'community',         label: 'Community Building'   },
  { id: 'productivity',      label: 'Productivity'          },
  { id: 'developer-tools',   label: 'Developer Tools'       },
]

interface PricingInfo {
  annual: { price: number; foundingPrice: number; standardPrice: number; foundingFull: boolean; slotsFilled: number; slotsRemaining: number; slotsTotal: number }
  quarterly: { price: number; targetQuarter: string; isMidQuarter: boolean; startsAt: string; endsAt: string }
  currentQuarter: string
}

export default function StudioStaxApplyPage() {
  const [pricing, setPricing] = useState<PricingInfo | null>(null)

  useEffect(() => {
    fetch('/api/studio-stax/pricing').then(r => r.json()).then(setPricing).catch(() => {})
  }, [])

  const [form, setForm] = useState({
    applicant_name: '',
    applicant_email: '',
    name: '',
    tagline: '',
    description: '',
    url: '',
    logo_url: '',
    category: '',
    mission_statement: '',
    why_apply: '',
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.applicant_name || !form.applicant_email || !form.name || !form.tagline || !form.description || !form.url || !form.category) {
      setError('Please fill in all required fields.')
      return
    }
    if (!form.applicant_email.includes('@')) { setError('Enter a valid email address.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); setLoading(false); return }
      setDone(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-gray-100">Application received!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Joshua reviews every application personally. You&apos;ll hear back within 48 hours. If approved, you&apos;ll receive a payment link for your listing fee.
          </p>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 mb-8 text-left">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">What happens next</p>
            <ol className="space-y-1 text-xs text-amber-800 dark:text-amber-300">
              <li>1. Joshua reviews your tool (48 hrs)</li>
              <li>2. If approved → you receive a payment link</li>
              <li>3. Pay → listing goes live immediately</li>
              <li>4. Rank higher by donating to SM-Give</li>
            </ol>
          </div>
          <Link href="/studio-stax" className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            ← Back to Studio Stax
          </Link>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-8">
          <Link href="/studio-stax" className="text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white transition-all">← Back to Studio Stax</Link>
        </div>
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-full px-4 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-4">
            Founder-reviewed · 48hr response
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-2">Apply for Studio Stax</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Founder-approved only. No corporations, no VC-backed giants — just tools built by people who actually give a damn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Your info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Your Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Your Name *</label>
                <input value={form.applicant_name} onChange={e => set('applicant_name', e.target.value)} placeholder="Joshua Bostic" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 placeholder-gray-300 dark:placeholder-gray-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                <input type="email" value={form.applicant_email} onChange={e => set('applicant_email', e.target.value)} placeholder="you@yourtool.com" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 placeholder-gray-300 dark:placeholder-gray-600" />
              </div>
            </div>
          </div>

          {/* Tool info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Your Tool</p>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Tool Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="SocialMate" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 placeholder-gray-300 dark:placeholder-gray-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Tagline * <span className="text-gray-400 font-normal">(max 80 chars)</span></label>
              <input value={form.tagline} onChange={e => set('tagline', e.target.value.slice(0, 80))} placeholder="Schedule smarter. Start free." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 placeholder-gray-300 dark:placeholder-gray-600" />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.tagline.length}/80</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Description * <span className="text-gray-400 font-normal">(max 300 chars)</span></label>
              <textarea value={form.description} onChange={e => set('description', e.target.value.slice(0, 300))} rows={3} placeholder="Tell creators what your tool does and why it matters..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 placeholder-gray-300 dark:placeholder-gray-600 resize-none" />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/300</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Website URL *</label>
                <input type="url" value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://yourtool.com" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 placeholder-gray-300 dark:placeholder-gray-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Logo URL <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="url" value={form.logo_url} onChange={e => set('logo_url', e.target.value)} placeholder="https://yourtool.com/logo.png" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 placeholder-gray-300 dark:placeholder-gray-600" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100">
                <option value="">Select a category...</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Mission */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">The &quot;By the People&quot; Check</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">We only list tools that empower creators — not exploit them. Tell us why yours qualifies.</p>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Mission Statement <span className="text-gray-400 font-normal">(optional but strongly recommended)</span></label>
              <textarea value={form.mission_statement} onChange={e => set('mission_statement', e.target.value)} rows={3} placeholder="What's your tool's philosophy? Why did you build it? Who does it serve?" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 placeholder-gray-300 dark:placeholder-gray-600 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Why should you be listed? <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea value={form.why_apply} onChange={e => set('why_apply', e.target.value)} rows={2} placeholder="Anything else you want Joshua to know..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 placeholder-gray-300 dark:placeholder-gray-600 resize-none" />
            </div>
          </div>

          {/* Pricing note — dynamic */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Listing Options (after approval)</p>
            {pricing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Annual */}
                <div className="bg-white dark:bg-amber-950/30 rounded-xl p-3 border border-amber-200 dark:border-amber-700">
                  <p className="text-xs font-extrabold text-gray-900 dark:text-gray-100 mb-0.5">Annual</p>
                  <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                    ${(pricing.annual.price / 100).toFixed(0)}<span className="text-xs font-semibold text-gray-500">/year</span>
                  </p>
                  {pricing.annual.foundingFull ? (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Standard rate — founding 100 slots filled this quarter
                    </p>
                  ) : (
                    <p className="text-[10px] mt-0.5">
                      <span className="text-green-600 dark:text-green-400 font-bold">Founding price — </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {pricing.annual.slotsRemaining} of {pricing.annual.slotsTotal} spots left at this rate. Goes to ${(pricing.annual.standardPrice / 100).toFixed(0)} after.
                      </span>
                    </p>
                  )}
                </div>
                {/* Quarterly */}
                <div className="bg-white dark:bg-amber-950/30 rounded-xl p-3 border border-amber-200 dark:border-amber-700">
                  <p className="text-xs font-extrabold text-gray-900 dark:text-gray-100 mb-0.5">Quarterly</p>
                  <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                    ${(pricing.quarterly.price / 100).toFixed(0)}<span className="text-xs font-semibold text-gray-500">/quarter</span>
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {pricing.quarterly.isMidQuarter
                      ? `Starts ${pricing.quarterly.targetQuarter} (next quarter — first-come, first-served)`
                      : `Current quarter: ${pricing.quarterly.targetQuarter}`}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-700 dark:text-amber-300">Loading pricing...</p>
            )}
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              💳 <strong>No charge today.</strong> Joshua reviews every application personally and responds within 48 hours. If approved, you&apos;ll receive a payment link via email with your chosen option.
            </p>
          </div>

          {error && <p className="text-sm font-medium text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm">
            {loading ? 'Submitting...' : 'Submit Application →'}
          </button>
        </form>
      </div>
    </PublicLayout>
  )
}
