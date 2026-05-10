'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Campaign = {
  id: string
  name: string
  goal: string | null
  persona_description: string | null
  channels: string[]
  status: string
  mode: 'draft' | 'auto'
  sequence_days: number[]
}

type Prospect = {
  id: string
  name: string
  email: string | null
  bluesky_handle: string | null
  mastodon_handle: string | null
  company: string | null
  notes: string | null
  status: string
  sequence_step: number
  last_contacted_at: string | null
  next_contact_at: string | null
}

type Message = {
  id: string
  prospect_id: string
  channel: string
  subject: string | null
  body: string
  step: number
  status: string
  sent_at: string | null
  created_at: string
  hermes_prospects: { name: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-gray-500/10 text-gray-400 border-gray-700',
  contacted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  replied:   'bg-green-500/10 text-green-400 border-green-500/20',
  converted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  opted_out: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const CHANNEL_ICONS: Record<string, string> = { email: '📧', bluesky: '🦋', mastodon: '🐘' }
const STEP_LABELS = ['Intro', 'Follow-up 1', 'Follow-up 2', 'Break-up']

export default function CampaignDetailPage() {
  const params   = useParams()
  const router   = useRouter()
  const id       = params.id as string

  const [campaign, setCampaign]   = useState<Campaign | null>(null)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [messages, setMessages]   = useState<Message[]>([])
  const [tab, setTab]             = useState<'prospects' | 'messages'>('prospects')
  const [loading, setLoading]     = useState(true)

  // Auto-discover
  const [discoverKeyword, setDiscoverKeyword]   = useState('technology')
  const [discoverSources, setDiscoverSources]   = useState(['substack', 'github', 'devto', 'hashnode'])
  const [discovering, setDiscovering]           = useState(false)
  const [discoverResult, setDiscoverResult]     = useState<{ discovered: number; withEmail: number; imported: number; sent: number; skipped: number; sources: Record<string, number> } | null>(null)
  const [autoDiscoverEnabled, setAutoDiscoverEnabled] = useState(false)

  // Add prospect form
  const [addOpen, setAddOpen]           = useState(false)
  const [pName, setPName]               = useState('')
  const [pEmail, setPEmail]             = useState('')
  const [pBsky, setPBsky]               = useState('')
  const [pMasto, setPMasto]             = useState('')
  const [pCompany, setPCompany]         = useState('')
  const [pNotes, setPNotes]             = useState('')
  const [pDomain, setPDomain]           = useState('')
  const [addLoading, setAddLoading]     = useState(false)
  const [findingEmail, setFindingEmail] = useState(false)
  const [emailScore, setEmailScore]     = useState<number | null>(null)

  // Generate state
  const [generating, setGenerating]         = useState<string | null>(null) // prospect id
  const [genChannel, setGenChannel]         = useState<string>('')
  const [genStep, setGenStep]               = useState(0)

  // Send state
  const [sending, setSending] = useState<string | null>(null) // message id

  // Edit message
  const [editId, setEditId]     = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [editSubject, setEditSubject] = useState('')
  const [editSaving, setEditSaving]   = useState(false)

  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const reload = useCallback(() => {
    setLoading(true)
    fetch(`/api/hermes/campaigns/${id}`)
      .then(r => r.json())
      .then(d => {
        setCampaign(d.campaign)
        setProspects(d.prospects ?? [])
        setMessages(d.messages ?? [])
        if (d.campaign?.apollo_query) {
          try {
            const cfg = JSON.parse(d.campaign.apollo_query)
            if (cfg.keyword) setDiscoverKeyword(cfg.keyword)
            if (cfg.sources) setDiscoverSources(cfg.sources)
          } catch {
            setDiscoverKeyword(d.campaign.apollo_query)
          }
        }
        if (d.campaign?.auto_discover_enabled) setAutoDiscoverEnabled(d.campaign.auto_discover_enabled)
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { reload() }, [reload])
  useEffect(() => {
    if (campaign && !genChannel) setGenChannel(campaign.channels?.[0] ?? 'email')
  }, [campaign, genChannel])

  const toggleSource = (src: string) => {
    setDiscoverSources(prev =>
      prev.includes(src) ? prev.filter(s => s !== src) : [...prev, src]
    )
  }

  const runDiscover = async () => {
    if (discoverSources.length === 0) { showToast('Select at least one source'); return }
    setDiscovering(true)
    setDiscoverResult(null)
    const res = await fetch(`/api/hermes/campaigns/${id}/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: discoverKeyword, sources: discoverSources }),
    })
    const data = await res.json()
    setDiscovering(false)
    if (res.ok) {
      setDiscoverResult(data)
      reload()
      showToast(`Imported ${data.imported} prospects, sent ${data.sent} intros`)
    } else {
      showToast(`Error: ${data.error}`)
    }
  }

  const toggleAutoDiscover = async (enabled: boolean) => {
    setAutoDiscoverEnabled(enabled)
    await fetch(`/api/hermes/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auto_discover_enabled: enabled, apollo_query: JSON.stringify({ keyword: discoverKeyword, sources: discoverSources }) }),
    })
    showToast(enabled ? 'Weekly auto-discover ON' : 'Weekly auto-discover OFF')
  }

  const findEmail = async () => {
    if (!pName.trim() || !pDomain.trim()) { showToast('Enter a name and domain first'); return }
    setFindingEmail(true)
    setEmailScore(null)
    const parts = pName.trim().split(' ')
    const first = parts[0]
    const last  = parts.slice(1).join(' ')
    const params = new URLSearchParams({ first_name: first, domain: pDomain.trim() })
    if (last) params.set('last_name', last)
    const res = await fetch(`/api/hermes/find-email?${params}`)
    const data = await res.json()
    setFindingEmail(false)
    if (data.email) {
      setPEmail(data.email)
      setEmailScore(data.score)
      showToast(`Found: ${data.email} (${data.score}% confidence)`)
    } else {
      showToast(data.error ?? 'No email found for that name + domain')
    }
  }

  const addProspect = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    const res = await fetch(`/api/hermes/campaigns/${id}/prospects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: pName, email: pEmail, bluesky_handle: pBsky, mastodon_handle: pMasto, company: pCompany, notes: pNotes }),
    })
    setAddLoading(false)
    if (res.ok) {
      setAddOpen(false); setPName(''); setPEmail(''); setPBsky(''); setPMasto(''); setPCompany(''); setPNotes(''); setPDomain(''); setEmailScore(null)
      reload()
      showToast('Prospect added')
    }
  }

  const generate = async (prospectId: string) => {
    setGenerating(prospectId)
    const step = prospects.find(p => p.id === prospectId)?.sequence_step ?? 0
    const res = await fetch(`/api/hermes/campaigns/${id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospect_id: prospectId, channel: genChannel, step }),
    })
    setGenerating(null)
    if (res.ok) { reload(); showToast('Message drafted') }
    else { const d = await res.json(); showToast(`Error: ${d.error}`) }
  }

  const sendMessage = async (msgId: string) => {
    setSending(msgId)
    const res = await fetch(`/api/hermes/messages/${msgId}/send`, { method: 'POST' })
    setSending(null)
    if (res.ok) { reload(); showToast('Sent!') }
    else { const d = await res.json(); showToast(`Send error: ${d.error}`) }
  }

  const deleteMessage = async (msgId: string) => {
    const res = await fetch(`/api/hermes/messages/${msgId}`, { method: 'DELETE' })
    if (res.ok) { reload(); showToast('Deleted') }
  }

  const saveEdit = async () => {
    if (!editId) return
    setEditSaving(true)
    const res = await fetch(`/api/hermes/messages/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: editSubject, body: editBody }),
    })
    setEditSaving(false)
    if (res.ok) { setEditId(null); reload(); showToast('Saved') }
  }

  const deleteProspect = async (pid: string) => {
    const res = await fetch(`/api/hermes/campaigns/${id}/prospects`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospect_id: pid }),
    })
    if (res.ok) { reload(); showToast('Removed') }
  }

  const deleteCampaign = async () => {
    if (!confirm('Delete this campaign and all its data?')) return
    await fetch(`/api/hermes/campaigns/${id}`, { method: 'DELETE' })
    router.push('/hermes')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-gray-800 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-900 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gray-900 rounded-2xl animate-pulse" />
      </div>
    </div>
  )

  if (!campaign) return (
    <div className="min-h-screen bg-gray-950 text-white p-6 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Campaign not found</p>
        <Link href="/hermes" className="text-amber-400 hover:text-amber-300 text-sm">← Back to HERMES</Link>
      </div>
    </div>
  )

  const draftMessages = messages.filter(m => m.status === 'draft')
  const sentMessages  = messages.filter(m => m.status === 'sent')

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/hermes" className="text-gray-500 hover:text-white transition-colors">← HERMES</Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-300 truncate">{campaign.name}</span>
        </div>

        {/* Campaign header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <h1 className="text-xl font-extrabold">{campaign.name}</h1>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${campaign.mode === 'auto' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-700'}`}>
                  {campaign.mode === 'auto' ? '⚡ Auto-send' : '✏️ Draft mode'}
                </span>
              </div>
              {campaign.goal && <p className="text-sm text-gray-400 mb-1">{campaign.goal}</p>}
              {campaign.persona_description && (
                <p className="text-xs text-gray-500">Target: {campaign.persona_description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>{prospects.length} prospects</span>
                <span>{sentMessages.length} sent · {draftMessages.length} drafted</span>
                <span>{(campaign.channels ?? []).map(ch => CHANNEL_ICONS[ch] ?? ch).join(' ')}</span>
                <span>Sequence: {campaign.sequence_days?.join(' → ')}d</span>
              </div>
            </div>
            <button onClick={deleteCampaign} className="text-xs text-red-500/50 hover:text-red-400 transition-colors shrink-0">Delete</button>
          </div>
        </div>

        {/* Auto-Discover panel */}
        <div className="bg-gray-900 border border-purple-500/20 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🔭</span>
              <span className="font-bold text-sm">Auto-Discover Prospects</span>
              <span className="text-xs text-purple-400 font-bold">HERMES Engine — free</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Run weekly</span>
              <button
                onClick={() => toggleAutoDiscover(!autoDiscoverEnabled)}
                className={`w-10 h-5 rounded-full transition-all relative ${autoDiscoverEnabled ? 'bg-purple-500' : 'bg-gray-700'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${autoDiscoverEnabled ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Source toggles */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {[
              { id: 'substack', label: 'Substack', icon: '📰' },
              { id: 'github',   label: 'GitHub',   icon: '🐙' },
              { id: 'devto',    label: 'Dev.to',   icon: '👩‍💻' },
              { id: 'hashnode', label: 'Hashnode',  icon: '📝' },
            ].map(src => (
              <button
                key={src.id}
                onClick={() => toggleSource(src.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  discoverSources.includes(src.id)
                    ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                    : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
                }`}>
                {src.icon} {src.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-3">
            <input
              value={discoverKeyword}
              onChange={e => setDiscoverKeyword(e.target.value)}
              placeholder='keyword — e.g. "technology", "saas", "creator", "startup"'
              className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 transition-colors"
            />
            <button
              onClick={runDiscover}
              disabled={discovering || discoverSources.length === 0}
              className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white text-sm font-extrabold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap">
              {discovering
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Finding...</>
                : '🔭 Find & Import'}
            </button>
          </div>
          {discoverResult && (
            <div className="flex items-center gap-4 text-xs flex-wrap">
              <span className="text-gray-400">Scraped <span className="text-white font-bold">{discoverResult.discovered}</span></span>
              <span className="text-blue-400 font-bold">📧 {discoverResult.withEmail} with email</span>
              <span className="text-green-400 font-bold">↑ {discoverResult.imported} imported</span>
              <span className="text-amber-400 font-bold">⚡ {discoverResult.sent} sent</span>
              {discoverResult.skipped > 0 && <span className="text-gray-500">{discoverResult.skipped} dupes skipped</span>}
              {discoverResult.sources && (
                <span className="text-gray-600 text-xs">
                  {Object.entries(discoverResult.sources).filter(([,n]) => n > 0).map(([s, n]) => `${s}:${n}`).join(' · ')}
                </span>
              )}
            </div>
          )}
          {autoDiscoverEnabled && (
            <p className="text-xs text-purple-400 mt-2">⚡ Running every Monday — scrapes {discoverSources.join(', ')} for new leads, extracts emails, generates intros, sends automatically.</p>
          )}
        </div>

        {/* Generate channel picker */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">Generate via</span>
          <div className="flex gap-2">
            {(campaign.channels ?? []).map(ch => (
              <button
                key={ch}
                onClick={() => setGenChannel(ch)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  genChannel === ch
                    ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}>
                {CHANNEL_ICONS[ch]} {ch}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          {(['prospects', 'messages'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                tab === t ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}>
              {t} {t === 'prospects' ? `(${prospects.length})` : `(${messages.length})`}
            </button>
          ))}
        </div>

        {/* PROSPECTS TAB */}
        {tab === 'prospects' && (
          <div className="space-y-3">
            {/* Add prospect */}
            {!addOpen ? (
              <button
                onClick={() => setAddOpen(true)}
                className="w-full bg-gray-900 border border-dashed border-gray-700 hover:border-gray-500 rounded-2xl py-4 text-sm text-gray-500 hover:text-gray-300 transition-all">
                + Add prospect
              </button>
            ) : (
              <form onSubmit={addProspect} className="bg-gray-900 border border-amber-400/20 rounded-2xl p-5 space-y-3">
                <p className="text-sm font-bold mb-1">Add Prospect</p>
                <div className="grid grid-cols-2 gap-3">
                  <input value={pName} onChange={e => setPName(e.target.value)} placeholder="Full name *" required
                    className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400" />
                  <input value={pCompany} onChange={e => setPCompany(e.target.value)} placeholder="Company"
                    className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400" />
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-bold text-gray-400">🔍 Find email automatically</p>
                  <div className="flex gap-2">
                    <input value={pDomain} onChange={e => setPDomain(e.target.value)} placeholder="Company domain (e.g. stripe.com)"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400" />
                    <button type="button" onClick={findEmail} disabled={findingEmail || !pName.trim() || !pDomain.trim()}
                      className="px-3 py-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-black text-xs font-extrabold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5">
                      {findingEmail ? <><div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Finding...</> : '🔍 Find'}
                    </button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input value={pEmail} onChange={e => { setPEmail(e.target.value); setEmailScore(null) }} placeholder="Email (auto-filled or enter manually)"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400" />
                    {emailScore !== null && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${emailScore >= 70 ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {emailScore}% conf.
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={pBsky} onChange={e => setPBsky(e.target.value)} placeholder="Bluesky @handle"
                    className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400" />
                  <input value={pMasto} onChange={e => setPMasto(e.target.value)} placeholder="Mastodon @user@instance"
                    className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400" />
                  <input value={pNotes} onChange={e => setPNotes(e.target.value)} placeholder="Notes — context for AI"
                    className="col-span-2 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={addLoading}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-black text-xs font-bold rounded-xl transition-all">
                    {addLoading ? 'Adding...' : 'Add'}
                  </button>
                  <button type="button" onClick={() => setAddOpen(false)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {prospects.length === 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                <p className="text-gray-500 text-sm">No prospects yet. Add someone to start reaching out.</p>
              </div>
            )}

            {prospects.map(p => (
              <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-bold text-sm">{p.name}</span>
                      {p.company && <span className="text-xs text-gray-500">{p.company}</span>}
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${STATUS_COLORS[p.status] ?? ''}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      {p.email && <span>📧 {p.email}</span>}
                      {p.bluesky_handle && <span>🦋 {p.bluesky_handle}</span>}
                      {p.mastodon_handle && <span>🐘 {p.mastodon_handle}</span>}
                      {p.sequence_step > 0 && (
                        <span className="text-blue-400">Step {p.sequence_step} — {STEP_LABELS[p.sequence_step] ?? `Step ${p.sequence_step}`}</span>
                      )}
                      {p.notes && <span className="text-gray-600 italic">{p.notes}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => generate(p.id)}
                      disabled={generating === p.id}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5">
                      {generating === p.id
                        ? <><div className="w-3 h-3 border-2 border-gray-500 border-t-white rounded-full animate-spin" /> Writing...</>
                        : `✍️ Generate ${STEP_LABELS[p.sequence_step] ?? 'message'}`}
                    </button>
                    <button onClick={() => deleteProspect(p.id)} className="text-xs text-red-500/40 hover:text-red-400 transition-colors px-1">✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MESSAGES TAB */}
        {tab === 'messages' && (
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                <p className="text-gray-500 text-sm">No messages yet. Generate one from the Prospects tab.</p>
              </div>
            )}

            {messages.map(m => (
              <div key={m.id} className={`bg-gray-900 border rounded-2xl p-5 ${m.status === 'sent' ? 'border-green-500/20' : m.status === 'failed' ? 'border-red-500/20' : 'border-gray-800'}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm">{CHANNEL_ICONS[m.channel]}</span>
                    <span className="text-sm font-bold">{m.hermes_prospects?.name ?? '—'}</span>
                    <span className="text-xs text-gray-500">{STEP_LABELS[m.step] ?? `Step ${m.step}`}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${
                      m.status === 'sent' ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : m.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-gray-500/10 text-gray-400 border-gray-700'
                    }`}>{m.status}</span>
                    {m.subject && <span className="text-xs text-gray-400 italic">"{m.subject}"</span>}
                  </div>
                  {m.status === 'draft' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setEditId(m.id); setEditBody(m.body); setEditSubject(m.subject ?? '') }}
                        className="text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 bg-gray-800 rounded-lg">
                        Edit
                      </button>
                      <button
                        onClick={() => sendMessage(m.id)}
                        disabled={sending === m.id}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-black text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5">
                        {sending === m.id
                          ? <><div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending...</>
                          : '⚡ Send'}
                      </button>
                      <button onClick={() => deleteMessage(m.id)} className="text-xs text-red-500/40 hover:text-red-400 transition-colors px-1">✕</button>
                    </div>
                  )}
                  {m.status === 'sent' && m.sent_at && (
                    <span className="text-xs text-gray-600 shrink-0">{new Date(m.sent_at).toLocaleDateString()}</span>
                  )}
                </div>

                {editId === m.id ? (
                  <div className="space-y-2">
                    {m.channel === 'email' && (
                      <input
                        value={editSubject}
                        onChange={e => setEditSubject(e.target.value)}
                        placeholder="Subject"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                      />
                    )}
                    <textarea
                      value={editBody}
                      onChange={e => setEditBody(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 resize-none font-mono"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} disabled={editSaving}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-black text-xs font-bold rounded-xl transition-all">
                        {editSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{m.body}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gray-800 border border-gray-700 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
