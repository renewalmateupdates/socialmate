'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const APP_URL = 'https://socialmate.studio'

// ── Types ────────────────────────────────────────────────────────────────────

interface VIPCode {
  id: string
  code: string
  label: string
  discount_pct: number
  duration: string
  duration_months: number | null
  max_redemptions: number | null
  note: string | null
  active: boolean
  created_at: string
  created_by: string
}

type Tab = 'affiliate' | 'stax' | 'vip'

// ── Helpers ──────────────────────────────────────────────────────────────────

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {children}
    </span>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
      {children}
    </label>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-xl border border-theme bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition'
const btnCls   = 'px-5 py-2.5 rounded-xl text-sm font-bold bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition disabled:opacity-40 disabled:cursor-not-allowed'

// ── Main ─────────────────────────────────────────────────────────────────────

export default function AdminInvitesPage() {
  const router = useRouter()
  const [tab, setTab]     = useState<Tab>('affiliate')
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/admin/check').then(r => r.json()).then(j => {
      if (!j.isAdmin) { router.push('/admin'); return }
      setIsAdmin(true)
    })
  }, [router])

  if (isAdmin === null) {
    return (
      <div className="min-h-dvh bg-theme flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: 'affiliate', label: 'Affiliate Invites',   emoji: '💰' },
    { id: 'stax',      label: 'Studio Stax Invites', emoji: '🏪' },
    { id: 'vip',       label: 'VIP Promo Codes',     emoji: '👑' },
  ]

  return (
    <div className="min-h-dvh bg-theme p-6 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Invites & VIP Codes</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Invite partners, approve Stax listings, create VIP promo codes</p>
          </div>
          <button onClick={() => router.push('/admin')}
            className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            ← Admin Hub
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl mb-8">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        {tab === 'affiliate' && <AffiliateInvitePanel />}
        {tab === 'stax'      && <StaxInvitePanel />}
        {tab === 'vip'       && <VIPCodesPanel />}

      </div>
    </div>
  )
}

// ── Affiliate Invite Panel ───────────────────────────────────────────────────

function AffiliateInvitePanel() {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  async function send() {
    if (!email.trim()) return
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/partners/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })
    const json = await res.json()
    setResult(res.ok
      ? { ok: true,  msg: `Invite sent to ${email}` }
      : { ok: false, msg: json.error || 'Failed to send invite' }
    )
    if (res.ok) setEmail('')
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-theme rounded-2xl p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Invite to Partner Program</h2>
        <p className="text-xs text-gray-400 mb-5">
          Sends a 7-day invite link via email. The recipient clicks it to apply and join as an affiliate.
          Their standard codes (1M/3M/6M/1Y/CR1/CR2) get auto-generated on approval.
        </p>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label>Email address</Label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="creator@example.com"
              type="email"
              className={inputCls}
            />
          </div>
          <div className="flex items-end">
            <button onClick={send} disabled={loading || !email.trim()} className={btnCls}>
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </div>
        {result && (
          <p className={`mt-3 text-sm font-semibold ${result.ok ? 'text-green-600' : 'text-red-500'}`}>
            {result.ok ? '✅' : '❌'} {result.msg}
          </p>
        )}
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">📋 After the invite is accepted</p>
        <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
          Go to <strong>Affiliates → Applications</strong> in the admin panel to approve the application.
          Once approved, their 6 promo codes are auto-generated in Stripe and Supabase.
        </p>
      </div>
    </div>
  )
}

// ── Studio Stax Invite Panel ─────────────────────────────────────────────────

function StaxInvitePanel() {
  const [name, setName]         = useState('')
  const [tagline, setTagline]   = useState('')
  const [appName, setAppName]   = useState('')
  const [appEmail, setAppEmail] = useState('')
  const [url, setUrl]           = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<{ ok: boolean; msg: string; link?: string } | null>(null)
  const [copied, setCopied]     = useState(false)

  async function generate() {
    if (!name.trim() || !appEmail.trim()) return
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/admin/stax-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        tagline: tagline.trim() || null,
        applicant_name: appName.trim() || null,
        applicant_email: appEmail.trim(),
        url: url.trim() || null,
      }),
    })
    const json = await res.json()
    if (res.ok) {
      setResult({ ok: true, msg: 'Checkout link generated!', link: json.checkout_url })
    } else {
      setResult({ ok: false, msg: json.error || 'Failed to generate link' })
    }
    setLoading(false)
  }

  function copy() {
    if (!result?.link) return
    navigator.clipboard.writeText(result.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-theme rounded-2xl p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Generate Studio Stax Checkout Link</h2>
        <p className="text-xs text-gray-400 mb-5">
          Creates an approved listing with a 72-hour one-time checkout link. Share it with the applicant — they pay and go live immediately.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Product / Tool Name *</Label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Acme App" className={inputCls} />
          </div>
          <div>
            <Label>Tagline</Label>
            <input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="One line pitch" className={inputCls} />
          </div>
          <div>
            <Label>Applicant Name</Label>
            <input value={appName} onChange={e => setAppName(e.target.value)} placeholder="Jane Smith" className={inputCls} />
          </div>
          <div>
            <Label>Applicant Email *</Label>
            <input value={appEmail} onChange={e => setAppEmail(e.target.value)} type="email" placeholder="jane@acme.com" className={inputCls} />
          </div>
          <div className="col-span-2">
            <Label>Website URL</Label>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://acme.com" className={inputCls} />
          </div>
        </div>

        <button onClick={generate} disabled={loading || !name.trim() || !appEmail.trim()} className={btnCls}>
          {loading ? 'Generating...' : 'Generate Checkout Link'}
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded-xl ${result.ok ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/20 border border-red-200'}`}>
            <p className={`text-sm font-bold mb-2 ${result.ok ? 'text-green-700 dark:text-green-400' : 'text-red-600'}`}>
              {result.ok ? '✅' : '❌'} {result.msg}
            </p>
            {result.link && (
              <div className="flex gap-2">
                <code className="flex-1 text-xs bg-white dark:bg-gray-900 border border-theme rounded-lg px-3 py-2 break-all text-gray-700 dark:text-gray-300">
                  {result.link}
                </code>
                <button onClick={copy}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${copied ? 'bg-green-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'}`}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── VIP Codes Panel ──────────────────────────────────────────────────────────

function VIPCodesPanel() {
  const [codes, setCodes]         = useState<VIPCode[]>([])
  const [loading, setLoading]     = useState(true)
  const [creating, setCreating]   = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)
  const [copied, setCopied]       = useState<string | null>(null)

  // Form state
  const [code, setCode]           = useState('')
  const [label, setLabel]         = useState('')
  const [discountPct, setDiscountPct] = useState('100')
  const [duration, setDuration]   = useState<'forever' | 'once' | 'repeating'>('forever')
  const [durationMonths, setDurationMonths] = useState('3')
  const [maxRed, setMaxRed]       = useState('1')
  const [unlimitedRed, setUnlimitedRed] = useState(false)
  const [note, setNote]           = useState('')

  useEffect(() => { loadCodes() }, [])

  async function loadCodes() {
    setLoading(true)
    const res = await fetch('/api/admin/vip-codes')
    const json = await res.json()
    setCodes(json.codes ?? [])
    setLoading(false)
  }

  async function create() {
    if (!code.trim() || !label.trim() || !discountPct) return
    setCreating(true)
    setError(null)
    setSuccess(null)
    const res = await fetch('/api/admin/vip-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.trim(),
        label: label.trim(),
        discount_pct: Number(discountPct),
        duration,
        duration_months: duration === 'repeating' ? Number(durationMonths) : null,
        max_redemptions: unlimitedRed ? null : Number(maxRed),
        note: note.trim() || null,
      }),
    })
    const json = await res.json()
    if (res.ok) {
      setSuccess(`✅ ${json.code.code} created in Stripe!`)
      setCode(''); setLabel(''); setNote('')
      setDiscountPct('100'); setDuration('forever'); setMaxRed('1'); setUnlimitedRed(false)
      await loadCodes()
    } else {
      setError(json.error || 'Failed to create code')
    }
    setCreating(false)
  }

  async function deactivate(id: string, codeStr: string) {
    if (!confirm(`Deactivate ${codeStr}? This will disable it in Stripe immediately.`)) return
    setDeleting(id)
    await fetch('/api/admin/vip-codes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await loadCodes()
    setDeleting(null)
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const PRESETS = [
    { label: '🆓 Pro for Life',    code: 'PROLIFE',      discount: 100, duration: 'forever' as const, note: 'Admin gift — Pro plan free forever' },
    { label: '🆓 Agency for Life', code: 'AGENCYLIFE',   discount: 100, duration: 'forever' as const, note: 'Admin gift — Agency plan free forever' },
    { label: '50% Pro 3 Months',   code: 'PROLAUNCH50',  discount: 50,  duration: 'repeating' as const, note: '3-month half-off deal' },
    { label: '50% Agency 3 Months',code: 'AGLAUNCH50',   discount: 50,  duration: 'repeating' as const, note: '3-month half-off deal' },
    { label: '1 Month Free',       code: 'FIRSTMONTH',   discount: 100, duration: 'once' as const, note: 'First month on the house' },
  ]

  return (
    <div className="space-y-6">

      {/* Create form */}
      <div className="bg-surface border border-theme rounded-2xl p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Create VIP Promo Code</h2>
        <p className="text-xs text-gray-400 mb-5">
          Creates a real Stripe coupon + promotion code. Works on any SocialMate checkout.
          Share the code directly or as a pre-filled link.
        </p>

        {/* Presets */}
        <div className="mb-5">
          <Label>Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button key={p.code}
                onClick={() => {
                  setCode(p.code); setLabel(p.label.replace(/[^\w\s]/g, '').trim())
                  setDiscountPct(String(p.discount)); setDuration(p.duration)
                  setNote(p.note); setMaxRed('1'); setUnlimitedRed(false)
                  if (p.duration === 'repeating') setDurationMonths('3')
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-theme bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-black dark:hover:border-white transition">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Code (no spaces) *</Label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
              placeholder="PROLIFE"
              className={inputCls}
            />
          </div>
          <div>
            <Label>Label / Description *</Label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Pro for Life — VIP Gift" className={inputCls} />
          </div>
          <div>
            <Label>Discount %</Label>
            <input value={discountPct} onChange={e => setDiscountPct(e.target.value)} type="number" min="1" max="100" className={inputCls} />
          </div>
          <div>
            <Label>Duration</Label>
            <select value={duration} onChange={e => setDuration(e.target.value as typeof duration)}
              className={inputCls}>
              <option value="forever">Forever (applies every renewal)</option>
              <option value="once">Once (first payment only)</option>
              <option value="repeating">Repeating (N months)</option>
            </select>
          </div>
          {duration === 'repeating' && (
            <div>
              <Label>Duration Months</Label>
              <input value={durationMonths} onChange={e => setDurationMonths(e.target.value)} type="number" min="1" className={inputCls} />
            </div>
          )}
          <div>
            <Label>Max Redemptions</Label>
            <div className="flex gap-2 items-center">
              <input
                value={maxRed}
                onChange={e => setMaxRed(e.target.value)}
                type="number" min="1"
                disabled={unlimitedRed}
                className={inputCls}
                style={{ opacity: unlimitedRed ? 0.4 : 1 }}
              />
              <label className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap cursor-pointer">
                <input type="checkbox" checked={unlimitedRed} onChange={e => setUnlimitedRed(e.target.checked)} />
                Unlimited
              </label>
            </div>
          </div>
          <div className="col-span-2">
            <Label>Internal Note (not shown to users)</Label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Gift for early creator partner" className={inputCls} />
          </div>
        </div>

        {error   && <p className="text-sm text-red-500 font-semibold mb-3">❌ {error}</p>}
        {success && <p className="text-sm text-green-600 dark:text-green-400 font-semibold mb-3">{success}</p>}

        <button onClick={create} disabled={creating || !code.trim() || !label.trim()} className={btnCls}>
          {creating ? 'Creating in Stripe...' : '✨ Create VIP Code'}
        </button>
      </div>

      {/* Existing codes */}
      <div className="bg-surface border border-theme rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-theme">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Active VIP Codes</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : codes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-3xl mb-2">👑</div>
            <p className="text-sm text-gray-400">No VIP codes yet. Create one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-theme">
            {codes.map(c => {
              const checkoutLink = `${APP_URL}/pricing?promo=${c.code}`
              return (
                <div key={c.id} className={`px-6 py-4 flex items-start gap-4 ${!c.active ? 'opacity-40' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-sm font-black text-gray-900 dark:text-gray-100 tracking-wider">{c.code}</span>
                      <Badge color={c.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}>
                        {c.active ? 'active' : 'deactivated'}
                      </Badge>
                      <Badge color="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {c.discount_pct}% off
                      </Badge>
                      <Badge color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {c.duration === 'repeating' ? `${c.duration_months}mo` : c.duration}
                      </Badge>
                      {c.max_redemptions && (
                        <Badge color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          max {c.max_redemptions}x
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.label}</p>
                    {c.note && <p className="text-xs text-gray-400 italic mt-0.5">{c.note}</p>}
                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">
                      By {c.created_by} · {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 items-start flex-wrap">
                    <button
                      onClick={() => copy(c.code, `code-${c.id}`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-theme bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-black dark:hover:border-white transition">
                      {copied === `code-${c.id}` ? '✓ Code' : '📋 Code'}
                    </button>
                    <button
                      onClick={() => copy(checkoutLink, `link-${c.id}`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-theme bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-black dark:hover:border-white transition">
                      {copied === `link-${c.id}` ? '✓ Link' : '🔗 Link'}
                    </button>
                    {c.active && (
                      <button
                        onClick={() => deactivate(c.id, c.code)}
                        disabled={deleting === c.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-40">
                        {deleting === c.id ? '...' : 'Deactivate'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
        <p className="font-bold mb-1">📖 How VIP codes work</p>
        <ul className="space-y-1 list-disc list-inside text-blue-600 dark:text-blue-500">
          <li><strong>Code:</strong> Share it and they type it at any SocialMate checkout to apply the discount</li>
          <li><strong>Pre-filled link:</strong> Goes directly to pricing page with code pre-applied — one click to checkout</li>
          <li><strong>Forever:</strong> Discount applies to every renewal indefinitely (true "for life" pricing)</li>
          <li><strong>Once:</strong> Applies only to the first payment (first month free, etc.)</li>
          <li><strong>Repeating N months:</strong> Applies for N billing periods then stops</li>
          <li><strong>Max redemptions = 1:</strong> Only one person can ever use this code (unique gift)</li>
        </ul>
      </div>
    </div>
  )
}
