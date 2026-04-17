'use client'
import { useEffect, useState, useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Types ────────────────────────────────────────────────────────────────────

type AssetClass = 'stocks' | 'crypto'
type BrokerType = 'paper' | 'alpaca' | 'coinbase'

interface DoctrineConfig {
  symbols: string[]
  max_positions: number
  stop_loss_pct: number
  take_profit_pct: number
  trailing_stop: boolean
  compound_mode: boolean
  asset_class: AssetClass
  broker: BrokerType
  sector_limit_pct: number
  max_daily_drawdown_pct: number
}

interface Doctrine {
  id: string
  name: string
  description: string | null
  config: DoctrineConfig
  is_active: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

interface Profile {
  tier: 'citizen' | 'commander' | 'emperor'
  alpaca_connected: boolean
  coinbase_connected: boolean
}

type Toast = { id: number; message: string; type: 'success' | 'error' }

// ─── Default form state ───────────────────────────────────────────────────────

const DEFAULT_CONFIG: DoctrineConfig = {
  symbols: [],
  max_positions: 5,
  stop_loss_pct: 8,
  take_profit_pct: 15,
  trailing_stop: false,
  compound_mode: false,
  asset_class: 'stocks',
  broker: 'paper',
  sector_limit_pct: 40,
  max_daily_drawdown_pct: 3,
}

interface FormState {
  name: string
  description: string
  is_active: boolean
  is_public: boolean
  config: DoctrineConfig
}

const DEFAULT_FORM: FormState = {
  name: '',
  description: '',
  is_active: false,
  is_public: false,
  config: { ...DEFAULT_CONFIG },
}

// ─── Tier badge ───────────────────────────────────────────────────────────────

const TIER_BADGE: Record<string, string> = {
  citizen:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  commander: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  emperor:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
}

// ─── Small sub-components ─────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  sublabel,
  disabled = false,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  sublabel?: string
  disabled?: boolean
}) {
  return (
    <label className={`flex items-center justify-between gap-4 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</span>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
          checked ? 'bg-amber-400' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

function NumberInput({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '%',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
        <span className="text-xs font-bold text-amber-400">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-gray-200 dark:bg-gray-700 accent-amber-400 cursor-pointer"
      />
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-gray-500">{min}{unit}</span>
        <span className="text-[10px] text-gray-500">{max}{unit}</span>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EnkiDoctrinesPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [doctrines, setDoctrines] = useState<Doctrine[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastCounter = useRef(0)

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM, config: { ...DEFAULT_CONFIG } })

  // Symbol input
  const [symbolInput, setSymbolInput] = useState('')

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── Auth + load ──────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login?redirect=/enki/doctrines'); return }
      setAuthed(true)
      loadAll()
    })
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [docRes, profRes] = await Promise.all([
        fetch('/api/enki/doctrines'),
        fetch('/api/enki/profile'),
      ])
      const [docJson, profJson] = await Promise.all([
        docRes.json(),
        profRes.json(),
      ])
      if (docJson.doctrines)   setDoctrines(docJson.doctrines)
      if (profJson.profile)    setProfile(profJson.profile)
    } catch (e) {
      console.error('Doctrines load error:', e)
      showToast('Failed to load doctrines', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Toast helper ─────────────────────────────────────────────────────────────

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    const id = ++toastCounter.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }

  // ── Panel open/close ─────────────────────────────────────────────────────────

  function openCreate() {
    setEditingId(null)
    setForm({ ...DEFAULT_FORM, config: { ...DEFAULT_CONFIG } })
    setSymbolInput('')
    setPanelOpen(true)
  }

  function openEdit(d: Doctrine) {
    setEditingId(d.id)
    setForm({
      name: d.name,
      description: d.description ?? '',
      is_active: d.is_active,
      is_public: d.is_public,
      config: { ...d.config },
    })
    setSymbolInput('')
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setEditingId(null)
  }

  // ── Derived: how many active doctrines ───────────────────────────────────────

  const activeCount = doctrines.filter((d) => d.is_active).length
  const atActiveLimit = activeCount >= 5

  // ── Symbol chip helpers ───────────────────────────────────────────────────────

  function addSymbol(raw: string) {
    const ticker = raw.trim().toUpperCase().replace(/[^A-Z0-9./-]/g, '')
    if (!ticker) return
    if (form.config.symbols.length >= 10) {
      showToast('Max 10 symbols per doctrine', 'error')
      return
    }
    if (form.config.symbols.includes(ticker)) return
    setForm((prev) => ({
      ...prev,
      config: { ...prev.config, symbols: [...prev.config.symbols, ticker] },
    }))
    setSymbolInput('')
  }

  function removeSymbol(ticker: string) {
    setForm((prev) => ({
      ...prev,
      config: { ...prev.config, symbols: prev.config.symbols.filter((s) => s !== ticker) },
    }))
  }

  function onSymbolKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSymbol(symbolInput)
    } else if (e.key === 'Backspace' && symbolInput === '' && form.config.symbols.length > 0) {
      removeSymbol(form.config.symbols[form.config.symbols.length - 1])
    }
  }

  // ── Form helpers ──────────────────────────────────────────────────────────────

  function setConfig<K extends keyof DoctrineConfig>(key: K, value: DoctrineConfig[K]) {
    setForm((prev) => ({ ...prev, config: { ...prev.config, [key]: value } }))
  }

  // ── Save ──────────────────────────────────────────────────────────────────────

  async function handleSave() {
    // Add any pending symbol input
    if (symbolInput.trim()) addSymbol(symbolInput)

    if (!form.name.trim()) { showToast('Name is required', 'error'); return }
    if (form.config.symbols.length === 0) { showToast('Add at least one symbol', 'error'); return }

    // Warn about active limit only when enabling
    if (form.is_active && !editingId && atActiveLimit) {
      showToast('You already have 5 active doctrines (the max)', 'error')
      return
    }
    if (form.is_active && editingId) {
      const currentDoc = doctrines.find((d) => d.id === editingId)
      const wasInactive = currentDoc && !currentDoc.is_active
      if (wasInactive && atActiveLimit) {
        showToast('You already have 5 active doctrines (the max)', 'error')
        return
      }
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        config: form.config,
        is_active: form.is_active,
        is_public: false,
      }

      const res = editingId
        ? await fetch(`/api/enki/doctrines/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/enki/doctrines', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })

      const json = await res.json()
      if (!res.ok) { showToast(json.error ?? 'Save failed', 'error'); return }

      showToast(editingId ? 'Doctrine updated' : 'Doctrine created')
      closePanel()
      await loadAll()
    } catch {
      showToast('Network error — try again', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Quick toggle active ───────────────────────────────────────────────────────

  async function toggleActive(d: Doctrine) {
    const nextActive = !d.is_active
    if (nextActive && activeCount >= 5) {
      showToast('5-doctrine limit reached. Deactivate one first.', 'error')
      return
    }
    try {
      const res = await fetch(`/api/enki/doctrines/${d.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive }),
      })
      if (!res.ok) { showToast('Update failed', 'error'); return }
      setDoctrines((prev) => prev.map((x) => x.id === d.id ? { ...x, is_active: nextActive } : x))
      showToast(nextActive ? `${d.name} activated` : `${d.name} deactivated`)
    } catch {
      showToast('Network error', 'error')
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/enki/doctrines/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) { showToast('Delete failed', 'error'); return }
      setDoctrines((prev) => prev.filter((d) => d.id !== deleteId))
      showToast('Doctrine deleted')
      setDeleteId(null)
    } catch {
      showToast('Network error', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // ── Loading/auth gate ─────────────────────────────────────────────────────────

  if (!authed || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading doctrines…</p>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Header ── */}
      <div className="bg-black dark:bg-gray-950 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-black font-extrabold text-sm">E</div>
            <div>
              <p className="text-sm font-extrabold text-white leading-none">Doctrines</p>
              <p className="text-xs text-gray-500 mt-0.5">Strategy Command</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${TIER_BADGE[profile.tier]}`}>
                {profile.tier}
              </span>
            )}
            <Link
              href="/enki/dashboard"
              className="text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors"
            >
              ← Dashboard
            </Link>
            <button
              onClick={openCreate}
              className="text-xs font-bold bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 rounded-xl transition-colors"
            >
              + New Doctrine
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Fortress Guard info banner ── */}
        <div className="bg-black dark:bg-gray-950 border border-amber-400/20 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-base mt-0.5 flex-shrink-0">◆</span>
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Fortress Guard — Scan Protocol</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Enki scans every <span className="text-gray-300 font-semibold">15 minutes</span> during market hours{' '}
                <span className="text-gray-300 font-semibold">(Mon–Fri, 9:30 AM–4:00 PM ET)</span>. Active doctrines run
                automatically — no action required once armed. Confidence threshold:{' '}
                <span className="text-gray-300 font-semibold">0.04% price movement</span>. Max{' '}
                <span className="text-amber-400 font-bold">5 active doctrines</span> per account.{' '}
                {activeCount > 0 && (
                  <span className="text-amber-400 font-bold">{activeCount}/5 currently active.</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ── Active limit warning ── */}
        {atActiveLimit && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-amber-600 dark:text-amber-400 text-sm font-bold flex-shrink-0">⚠</span>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Maximum active doctrines reached (5/5). Deactivate one before enabling another.
            </p>
          </div>
        )}

        {/* ── Doctrine grid ── */}
        {doctrines.length === 0 ? (
          <EmptyState onNew={openCreate} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {doctrines.map((d) => (
              <DoctrineCard
                key={d.id}
                doctrine={d}
                onEdit={() => openEdit(d)}
                onToggleActive={() => toggleActive(d)}
                onDelete={() => setDeleteId(d.id)}
                atLimit={atActiveLimit && !d.is_active}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Slide-in Panel ── */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={closePanel}
          />
          {/* Panel */}
          <div className="w-full max-w-xl bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-slide-in-right">
            {/* Panel header */}
            <div className="bg-black dark:bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <p className="text-sm font-extrabold text-white">{editingId ? 'Edit Doctrine' : 'New Doctrine'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{editingId ? 'Modify strategy parameters' : 'Define a trading strategy'}</p>
              </div>
              <button onClick={closePanel} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">

              {/* Name + Description */}
              <section>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Identity</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Doctrine Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      placeholder="e.g. Momentum Assault Alpha"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 text-right">{form.name.length}/60</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Optional — describe the strategy's intent"
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Asset class + Broker */}
              <section>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Asset Class & Broker</p>
                <div className="space-y-4">
                  {/* Asset class toggle */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Asset Class</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['stocks', 'crypto'] as AssetClass[]).map((ac) => (
                        <button
                          key={ac}
                          type="button"
                          onClick={() => {
                            setConfig('asset_class', ac)
                            // Reset broker to paper if switching to crypto without coinbase
                            if (ac === 'crypto' && !profile?.coinbase_connected) {
                              setConfig('broker', 'paper')
                            }
                            if (ac === 'stocks' && form.config.broker === 'coinbase') {
                              setConfig('broker', 'paper')
                            }
                          }}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                            form.config.asset_class === ac
                              ? 'bg-amber-400 border-amber-400 text-black'
                              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-amber-400/50'
                          }`}
                        >
                          {ac === 'stocks' ? '📈 Stocks' : '₿ Crypto'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Broker radio group */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Broker</label>
                    <div className="space-y-2">
                      {/* Paper */}
                      <BrokerOption
                        selected={form.config.broker === 'paper'}
                        disabled={false}
                        label="Paper Trading"
                        sublabel="Simulated — no real money"
                        badge="Always available"
                        badgeColor="gray"
                        onClick={() => setConfig('broker', 'paper')}
                      />
                      {/* Alpaca */}
                      <BrokerOption
                        selected={form.config.broker === 'alpaca'}
                        disabled={!profile?.alpaca_connected || form.config.asset_class === 'crypto'}
                        label="Alpaca"
                        sublabel={
                          form.config.asset_class === 'crypto'
                            ? 'Stocks only — switch asset class to use Alpaca'
                            : profile?.alpaca_connected
                            ? 'Real money — US stocks (Mon–Fri)'
                            : 'Not connected'
                        }
                        badge={profile?.alpaca_connected ? 'Connected' : undefined}
                        badgeColor="blue"
                        connectHref={!profile?.alpaca_connected ? '/enki/settings' : undefined}
                        onClick={() => setConfig('broker', 'alpaca')}
                      />
                      {/* Coinbase */}
                      <BrokerOption
                        selected={form.config.broker === 'coinbase'}
                        disabled={!profile?.coinbase_connected || form.config.asset_class === 'stocks'}
                        label="Coinbase"
                        sublabel={
                          form.config.asset_class === 'stocks'
                            ? 'Crypto only — switch asset class to use Coinbase'
                            : profile?.coinbase_connected
                            ? 'Real money — Crypto 24/7'
                            : 'Not connected'
                        }
                        badge={profile?.coinbase_connected ? 'Connected' : undefined}
                        badgeColor="orange"
                        connectHref={!profile?.coinbase_connected ? '/enki/settings' : undefined}
                        onClick={() => setConfig('broker', 'coinbase')}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Symbols */}
              <section>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Target Symbols <span className="text-gray-600">({form.config.symbols.length}/10)</span>
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 min-h-[52px] flex flex-wrap gap-1.5 items-center focus-within:ring-2 focus-within:ring-amber-400 transition">
                  {form.config.symbols.map((sym) => (
                    <span
                      key={sym}
                      className="inline-flex items-center gap-1 bg-amber-400/10 border border-amber-400/30 text-amber-500 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-lg"
                    >
                      {sym}
                      <button
                        type="button"
                        onClick={() => removeSymbol(sym)}
                        className="text-amber-400/60 hover:text-amber-400 ml-0.5 leading-none transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={form.config.symbols.length === 0 ? 'AAPL, TSLA, QQQ…' : ''}
                    value={symbolInput}
                    onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                    onKeyDown={onSymbolKeyDown}
                    onBlur={() => { if (symbolInput.trim()) addSymbol(symbolInput) }}
                    className="flex-1 min-w-[80px] bg-transparent text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
                    disabled={form.config.symbols.length >= 10}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">Press Enter or comma to add. Backspace removes last.</p>
              </section>

              {/* Risk parameters */}
              <section>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Risk Parameters</p>
                <div className="space-y-5">
                  <NumberInput
                    label="Max Positions"
                    value={form.config.max_positions}
                    min={1}
                    max={20}
                    unit=""
                    onChange={(v) => setConfig('max_positions', v)}
                  />
                  <NumberInput
                    label="Stop Loss"
                    value={form.config.stop_loss_pct}
                    min={1}
                    max={50}
                    onChange={(v) => setConfig('stop_loss_pct', v)}
                  />
                  <NumberInput
                    label="Take Profit"
                    value={form.config.take_profit_pct}
                    min={1}
                    max={200}
                    onChange={(v) => setConfig('take_profit_pct', v)}
                  />
                  <NumberInput
                    label="Max Daily Drawdown"
                    value={form.config.max_daily_drawdown_pct}
                    min={1}
                    max={10}
                    onChange={(v) => setConfig('max_daily_drawdown_pct', v)}
                  />
                  <NumberInput
                    label="Sector Limit"
                    value={form.config.sector_limit_pct}
                    min={20}
                    max={80}
                    onChange={(v) => setConfig('sector_limit_pct', v)}
                  />
                </div>
              </section>

              {/* Strategy toggles */}
              <section>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Strategy Options</p>
                <div className="space-y-4">
                  <Toggle
                    checked={form.config.trailing_stop}
                    onChange={(v) => setConfig('trailing_stop', v)}
                    label="Trailing Stop"
                    sublabel="Stop-loss follows price upward as it rises"
                  />
                  <Toggle
                    checked={form.config.compound_mode}
                    onChange={(v) => setConfig('compound_mode', v)}
                    label="Compound Mode"
                    sublabel="Reinvest profits into subsequent positions"
                  />
                </div>
              </section>

              {/* Activation */}
              <section>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Deployment</p>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
                    <Toggle
                      checked={form.is_active}
                      onChange={(v) => {
                        if (v && !editingId && atActiveLimit) {
                          showToast('5-doctrine limit reached', 'error')
                          return
                        }
                        setForm((p) => ({ ...p, is_active: v }))
                      }}
                      label="Activate Doctrine"
                      sublabel={
                        atActiveLimit && !form.is_active
                          ? '⚠ 5-doctrine limit reached — deactivate one first'
                          : 'Guardian picks this up on the next 15-min scan'
                      }
                      disabled={atActiveLimit && !form.is_active && !editingId}
                    />
                    <Toggle
                      checked={form.is_public}
                      onChange={() => {}}
                      label="Share in Marketplace"
                      sublabel="Coming soon — not available yet"
                      disabled
                    />
                  </div>
                </div>
              </section>

            </div>

            {/* Panel footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center gap-3 flex-shrink-0 bg-white dark:bg-gray-900">
              <button
                onClick={closePanel}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-bold transition-colors"
              >
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Doctrine'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-2">Delete Doctrine?</p>
            <p className="text-xs text-gray-400 mb-6">
              This will permanently remove the doctrine and cannot be undone. The Guardian will stop scanning for it immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold transition-colors"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast stack ── */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl text-sm font-semibold shadow-lg pointer-events-auto transition-all ${
              t.type === 'success'
                ? 'bg-gray-900 dark:bg-gray-800 text-white border border-gray-700'
                : 'bg-red-600 text-white'
            }`}
          >
            {t.type === 'success' ? (
              <span className="mr-2 text-amber-400">◆</span>
            ) : (
              <span className="mr-2">⚠</span>
            )}
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Slide-in animation ── */}
      <style jsx global>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  )
}

// ─── Doctrine Card ─────────────────────────────────────────────────────────────

function DoctrineCard({
  doctrine,
  onEdit,
  onToggleActive,
  onDelete,
  atLimit,
}: {
  doctrine: Doctrine
  onEdit: () => void
  onToggleActive: () => void
  onDelete: () => void
  atLimit: boolean
}) {
  const { config } = doctrine

  const brokerBadge: Record<BrokerType, string> = {
    paper:    'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    alpaca:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    coinbase: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  }

  const brokerLabel: Record<BrokerType, string> = {
    paper:    'Paper',
    alpaca:   'Alpaca',
    coinbase: 'Coinbase',
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border rounded-2xl flex flex-col transition-colors ${
      doctrine.is_active
        ? 'border-amber-400/30 shadow-[0_0_0_1px_rgba(251,191,36,0.15)]'
        : 'border-gray-100 dark:border-gray-800'
    }`}>
      {/* Card header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100 truncate">{doctrine.name}</p>
            {doctrine.description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{doctrine.description}</p>
            )}
          </div>
          <button
            onClick={onDelete}
            className="text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors text-lg leading-none flex-shrink-0 mt-0.5"
            title="Delete doctrine"
          >
            ×
          </button>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5">
          {/* Status */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            doctrine.is_active
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {doctrine.is_active ? '● ACTIVE' : '○ INACTIVE'}
          </span>
          {/* Broker */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${brokerBadge[config.broker]}`}>
            {brokerLabel[config.broker]}
          </span>
          {/* Asset class */}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 capitalize">
            {config.asset_class}
          </span>
          {/* Trailing stop */}
          {config.trailing_stop && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
              Trailing
            </span>
          )}
          {/* Compound */}
          {config.compound_mode && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400">
              Compound
            </span>
          )}
        </div>
      </div>

      {/* Symbols */}
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Symbols</p>
        <div className="flex flex-wrap gap-1">
          {config.symbols.slice(0, 8).map((sym) => (
            <span key={sym} className="text-[10px] font-bold bg-amber-400/10 border border-amber-400/20 text-amber-500 dark:text-amber-400 px-1.5 py-0.5 rounded">
              {sym}
            </span>
          ))}
          {config.symbols.length > 8 && (
            <span className="text-[10px] text-gray-400 px-1 py-0.5">+{config.symbols.length - 8} more</span>
          )}
        </div>
      </div>

      {/* Risk stats */}
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-3 gap-2">
          <RiskStat label="Max Pos" value={String(config.max_positions)} />
          <RiskStat label="Stop Loss" value={`${config.stop_loss_pct}%`} />
          <RiskStat label="Take Profit" value={`${config.take_profit_pct}%`} />
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 flex gap-2 mt-auto">
        <button
          onClick={onEdit}
          className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onToggleActive}
          disabled={atLimit}
          title={atLimit ? '5-doctrine limit reached' : undefined}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
            doctrine.is_active
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400'
              : atLimit
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
              : 'bg-amber-400 hover:bg-amber-500 text-black'
          }`}
        >
          {doctrine.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  )
}

// ─── Helper: risk stat cell ────────────────────────────────────────────────────

function RiskStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-xs font-extrabold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  )
}

// ─── Broker option (radio-style) ───────────────────────────────────────────────

function BrokerOption({
  selected,
  disabled,
  label,
  sublabel,
  badge,
  badgeColor,
  connectHref,
  onClick,
}: {
  selected: boolean
  disabled: boolean
  label: string
  sublabel: string
  badge?: string
  badgeColor: 'gray' | 'blue' | 'orange'
  connectHref?: string
  onClick: () => void
}) {
  const badgeStyles: Record<string, string> = {
    gray:   'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    blue:   'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  }

  return (
    <button
      type="button"
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
        selected
          ? 'bg-amber-400/5 border-amber-400/40'
          : disabled
          ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-400/30'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Radio dot */}
        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          selected ? 'border-amber-400' : 'border-gray-300 dark:border-gray-600'
        }`}>
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold ${selected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
              {label}
            </span>
            {badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeStyles[badgeColor]}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {sublabel}
            {connectHref && !badge && (
              <>
                {' — '}
                <Link href={connectHref} className="text-amber-400 hover:underline font-semibold" onClick={(e) => e.stopPropagation()}>
                  Connect in Settings →
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </button>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-black dark:bg-gray-950 border border-amber-400/30 rounded-2xl flex items-center justify-center mb-5">
        <span className="text-2xl text-amber-400">◆</span>
      </div>
      <p className="text-lg font-extrabold text-gray-900 dark:text-gray-100 mb-2">No Doctrines Yet</p>
      <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
        Doctrines are the rules Enki fights by. Define your symbols, risk tolerance, and broker — then arm it and let the Guardian execute.
      </p>
      <button
        onClick={onNew}
        className="bg-amber-400 hover:bg-amber-500 text-black text-sm font-bold px-6 py-3 rounded-xl transition-colors"
      >
        Build your first doctrine →
      </button>
    </div>
  )
}
