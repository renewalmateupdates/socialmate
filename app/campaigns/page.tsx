'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { CAMPAIGN_REWORD_COST } from '@/lib/ai-tool-costs'
import { Megaphone, Plus, Sparkles, Store, X } from 'lucide-react'
import {
  CAMPAIGN_PLATFORMS, MAX_MESSAGES, MAX_TIMES, PAID_ONLY_PLATFORMS, VARIANTS_PER_MESSAGE,
  productMessage, type ShopProduct,
} from '@/lib/campaigns'
import { DAY_ORDER, PLATFORM_NAMES, scheduleSummary, StatusPill } from './shared'

type Campaign = {
  id: string
  name: string
  status: 'active' | 'paused' | 'ended'
  platforms: string[]
  days: number[]
  times: string[]
  start_date: string
  end_date: string
  last_note: string | null
  next_post_at: string | null
}

type Draft = { text: string; image_url: string | null }

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function countSlots(days: number[], times: string[], start: string, end: string): number {
  if (!start || !end || end < start) return 0
  let n = 0
  const d = new Date(`${start}T12:00:00`)
  const last = new Date(`${end}T12:00:00`)
  while (d <= last) {
    if (days.includes(d.getDay())) n += times.length
    d.setDate(d.getDate() + 1)
  }
  return n
}

export default function CampaignsPage() {
  const router = useRouter()
  const { plan, credits, activeWorkspaceId, refreshCredits } = useWorkspace()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [connected, setConnected] = useState<string[]>([])

  const today = useMemo(() => dayKey(new Date()), [])
  const [name,      setName]      = useState('')
  const [messages,  setMessages]  = useState<Draft[]>([{ text: '', image_url: null }])
  const [platforms, setPlatforms] = useState<string[]>([])
  const [days,      setDays]      = useState<number[]>([1, 3, 5])
  const [times,     setTimes]     = useState<string[]>(['10:00'])
  const [startDate, setStartDate] = useState(today)
  const [endDate,   setEndDate]   = useState(() => { const d = new Date(); d.setDate(d.getDate() + 27); return dayKey(d) })
  const [reword,    setReword]    = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  const [store,     setStore]     = useState('')
  const [importing, setImporting] = useState(false)
  const [products,  setProducts]  = useState<ShopProduct[]>([])
  const [picked,    setPicked]    = useState<string[]>([])
  const [importErr, setImportErr] = useState('')

  useEffect(() => {
    loadCampaigns()
    fetch('/api/accounts/connected')
      .then(r => r.ok ? r.json() : { platforms: [] })
      .then(d => {
        const usable = (d.platforms ?? []).filter((p: string) => (CAMPAIGN_PLATFORMS as readonly string[]).includes(p))
        setConnected(usable)
        setPlatforms(usable.filter((p: string) => plan !== 'free' || !PAID_ONLY_PLATFORMS.includes(p)))
      })
      .catch(() => setConnected([]))
    // Load once; the plan only narrows the default selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadCampaigns() {
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns')
      const d = await res.json().catch(() => ({}))
      setCampaigns(res.ok ? d.campaigns ?? [] : [])
    } finally {
      setLoading(false)
    }
  }

  const filled     = messages.filter(m => m.text.trim()).length
  const totalPosts = countSlots(days, times, startDate, endDate)
  const rewordCost = filled * CAMPAIGN_REWORD_COST

  function toggle<T>(list: T[], item: T): T[] {
    return list.includes(item) ? list.filter(x => x !== item) : [...list, item]
  }

  async function importProducts() {
    setImportErr('')
    setImporting(true)
    try {
      const res = await fetch('/api/campaigns/shop-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setImportErr(d.error || 'Could not read that store.'); setProducts([]); return }
      setProducts(d.products ?? [])
      setPicked([])
    } finally {
      setImporting(false)
    }
  }

  function addPicked() {
    const chosen = products.filter(p => picked.includes(p.url))
    const kept   = messages.filter(m => m.text.trim())
    const added  = chosen.map(p => ({ text: productMessage(p), image_url: p.image_url }))
    setMessages([...kept, ...added].slice(0, MAX_MESSAGES))
    setProducts([])
    setPicked([])
  }

  async function create() {
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, platforms, days, times,
          workspaceId: activeWorkspaceId,
          timezone:    Intl.DateTimeFormat().resolvedOptions().timeZone,
          start_date:  startDate,
          end_date:    endDate,
          messages:    messages.filter(m => m.text.trim()),
          reword,
        }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setError(d.error || 'Could not create the campaign.'); return }
      if (d.charged) refreshCredits().catch(() => {})
      router.push(`/campaigns/${d.id}`)
    } catch {
      setError('Could not reach SocialMate. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-theme">
      <Sidebar />
      <main className="md:ml-56 flex-1 p-6 md:p-10">
       <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-theme">Campaigns</h1>
            <p className="text-muted text-sm mt-1">A set of posts that takes turns on the days and times you pick, until an end date.</p>
          </div>
          {!showForm && (
            <button
              onClick={() => { setShowForm(true); setError('') }}
              className="flex-shrink-0 inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-black font-black px-4 py-2 rounded-xl text-sm transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} /> New campaign
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-surface border border-amber-400 rounded-2xl p-6 mb-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-theme">New campaign</h2>
              <button onClick={() => setShowForm(false)} aria-label="Close" className="text-muted hover:text-theme"><X className="w-4 h-4" /></button>
            </div>

            <div>
              <label htmlFor="campaign-name" className="block text-xs font-bold text-muted uppercase tracking-wide mb-1">Name</label>
              <input
                id="campaign-name"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={80}
                placeholder="e.g. Holiday shop push"
                className="w-full bg-theme border border-theme rounded-xl px-4 py-2.5 text-sm text-theme placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Messages */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted uppercase tracking-wide">Messages ({filled}/{MAX_MESSAGES})</span>
                {messages.length < MAX_MESSAGES && (
                  <button onClick={() => setMessages([...messages, { text: '', image_url: null }])} className="text-xs font-bold text-amber-500 hover:text-amber-400">+ Add message</button>
                )}
              </div>
              <p className="text-xs text-muted mb-3">They post in turn. When the list comes round again, each one goes out again{reword ? ' in a new version' : ''}.</p>
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    {m.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-theme" />
                    )}
                    <textarea
                      value={m.text}
                      aria-label={`Message ${i + 1}`}
                      onChange={e => setMessages(messages.map((x, j) => j === i ? { ...x, text: e.target.value } : x))}
                      rows={3}
                      maxLength={2000}
                      placeholder={i === 0 ? 'What should this post say?' : 'Another message'}
                      className="flex-1 bg-theme border border-theme rounded-xl px-3 py-2 text-sm text-theme placeholder:text-gray-400 focus:outline-none focus:border-amber-400 resize-y"
                    />
                    {messages.length > 1 && (
                      <button onClick={() => setMessages(messages.filter((_, j) => j !== i))} aria-label={`Remove message ${i + 1}`} className="mt-2 text-gray-400 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Shopify import */}
              <div className="mt-4 rounded-xl border border-theme p-4">
                <p className="text-sm font-bold text-theme flex items-center gap-1.5"><Store className="w-4 h-4" /> Start from a Shopify store</p>
                <p className="text-xs text-muted mt-1 mb-3">Each product you pick becomes a message with its name, price, link and photo. You can edit them after.</p>
                <div className="flex gap-2">
                  <input
                    value={store}
                    onChange={e => setStore(e.target.value)}
                    aria-label="Store address"
                    placeholder="yourstore.com"
                    className="flex-1 min-w-0 bg-theme border border-theme rounded-xl px-3 py-2 text-sm text-theme placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={importProducts}
                    disabled={importing || !store.trim()}
                    className="border border-theme hover:border-amber-400 text-theme font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50"
                  >
                    {importing ? 'Reading…' : 'Load products'}
                  </button>
                </div>
                {importErr && <p className="text-xs text-red-500 mt-2">{importErr}</p>}
                {products.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {products.map(p => (
                      <label key={p.url} className="flex items-center gap-3 text-sm text-theme cursor-pointer">
                        <input type="checkbox" checked={picked.includes(p.url)} onChange={() => setPicked(toggle(picked, p.url))} className="accent-amber-500" />
                        {p.image_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={p.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                          : <span className="w-8 h-8 rounded bg-theme border border-theme" />}
                        <span className="flex-1 min-w-0 truncate">{p.title}</span>
                        <span className="text-muted">{p.price}</span>
                      </label>
                    ))}
                    <button
                      onClick={addPicked}
                      disabled={!picked.length}
                      className="mt-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black px-4 py-2 rounded-xl text-sm"
                    >
                      Add {picked.length || ''} as messages
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Platforms */}
            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wide mb-2">Post to</span>
              {connected.length === 0 ? (
                <p className="text-sm text-muted">Connect an account first on the <Link href="/accounts" className="text-amber-500 underline">Accounts page</Link>. Campaigns post to Bluesky, Mastodon, Discord, Telegram, LinkedIn and X.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {connected.map(p => {
                    const locked = plan === 'free' && PAID_ONLY_PLATFORMS.includes(p)
                    const on = platforms.includes(p)
                    return (
                      <button
                        key={p}
                        disabled={locked}
                        aria-pressed={on}
                        onClick={() => setPlatforms(toggle(platforms, p))}
                        title={locked ? 'Posting to X needs the Pro plan' : undefined}
                        className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all disabled:opacity-40 ${on ? 'bg-amber-400 border-amber-400 text-black' : 'border-theme text-theme hover:border-amber-400'}`}
                      >
                        {PLATFORM_NAMES[p] ?? p}{locked ? ' (Pro)' : ''}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Schedule */}
            <div>
              <span className="block text-xs font-bold text-muted uppercase tracking-wide mb-2">Days</span>
              <div className="flex flex-wrap gap-2">
                {DAY_ORDER.map(([d, label]) => (
                  <button
                    key={d}
                    aria-pressed={days.includes(d)}
                    onClick={() => setDays(toggle(days, d))}
                    className={`w-12 py-1.5 rounded-lg text-sm font-bold border transition-all ${days.includes(d) ? 'bg-amber-400 border-amber-400 text-black' : 'border-theme text-theme hover:border-amber-400'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted uppercase tracking-wide">Times</span>
                {times.length < MAX_TIMES && (
                  <button onClick={() => setTimes([...times, '18:00'])} className="text-xs font-bold text-amber-500 hover:text-amber-400">+ Add time</button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {times.map((t, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <input
                      type="time"
                      value={t}
                      aria-label={`Time ${i + 1}`}
                      onChange={e => setTimes(times.map((x, j) => j === i ? e.target.value : x))}
                      className="bg-theme border border-theme rounded-lg px-3 py-1.5 text-sm text-theme focus:outline-none focus:border-amber-400"
                    />
                    {times.length > 1 && (
                      <button onClick={() => setTimes(times.filter((_, j) => j !== i))} aria-label={`Remove time ${i + 1}`} className="text-gray-400 hover:text-red-400"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted mt-2">In your time zone, {Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')}.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="campaign-start" className="block text-xs font-bold text-muted uppercase tracking-wide mb-1">Starts</label>
                <input id="campaign-start" type="date" value={startDate} min={today} onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-theme border border-theme rounded-xl px-3 py-2 text-sm text-theme focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label htmlFor="campaign-end" className="block text-xs font-bold text-muted uppercase tracking-wide mb-1">Ends</label>
                <input id="campaign-end" type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-theme border border-theme rounded-xl px-3 py-2 text-sm text-theme focus:outline-none focus:border-amber-400" />
              </div>
            </div>

            {/* Rewording */}
            <label className="flex items-start gap-3 rounded-xl border border-theme p-4 cursor-pointer">
              <input type="checkbox" checked={reword} onChange={e => setReword(e.target.checked)} className="mt-1 accent-amber-500" />
              <span>
                <span className="text-sm font-bold text-theme flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> Reword each time with AI</span>
                <span className="block text-xs text-muted mt-1">
                  AI writes {VARIANTS_PER_MESSAGE} versions of each message now, keeping every link and price as written, so repeats never go out word for word.
                  {' '}{CAMPAIGN_REWORD_COST} credits per message, charged once{filled ? `: ${rewordCost} credits` : ''}. You have {credits}.
                </span>
              </span>
            </label>

            <div className="rounded-xl bg-theme border border-theme px-4 py-3 text-sm text-theme">
              {totalPosts > 0
                ? <>About <strong>{totalPosts}</strong> post{totalPosts === 1 ? '' : 's'} in all, {days.length * times.length} a week. They count toward your monthly post limit, and each week&apos;s posts show up in Queue a week ahead.</>
                : 'Pick days and times inside the dates to see how many posts this makes.'}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={create}
                disabled={saving}
                className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                {saving ? (reword ? 'Writing versions…' : 'Starting…') : 'Start campaign'}
              </button>
              <button onClick={() => setShowForm(false)} className="border border-theme text-muted hover:text-theme px-5 py-2.5 rounded-xl text-sm font-semibold">
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : campaigns.length === 0 ? (
          !showForm && (
            <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
              <Megaphone className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
              <p className="font-bold text-theme mb-1">No campaigns yet</p>
              <p className="text-sm text-muted mb-4">Write a few posts once, pick the days and times, and they take turns going out until the end date.</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-amber-400 hover:bg-amber-300 text-black font-black px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                Start your first campaign
              </button>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {campaigns.map(c => (
              <Link key={c.id} href={`/campaigns/${c.id}`} className="block bg-surface border border-theme rounded-2xl p-5 hover:border-amber-400/60 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-black text-theme truncate">{c.name}</h3>
                    <p className="text-xs text-muted mt-1">{scheduleSummary(c)}</p>
                    <p className="text-xs text-muted mt-0.5">{c.platforms.map(p => PLATFORM_NAMES[p] ?? p).join(', ')}</p>
                  </div>
                  <StatusPill status={c.status} />
                </div>
                {c.next_post_at && c.status === 'active' && (
                  <p className="text-xs text-theme mt-3">Next post: {new Date(c.next_post_at).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                )}
                {c.last_note && <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">{c.last_note}</p>}
              </Link>
            ))}
          </div>
        )}
       </div>
      </main>
    </div>
  )
}
