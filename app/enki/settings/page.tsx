'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type RiskPreset = 'conservative' | 'balanced' | 'aggressive'

interface Profile {
  tier: 'citizen' | 'commander' | 'emperor'
  guardian_mode: 'approval' | 'autonomous' | 'dormant'
  alpaca_connected: boolean
  coinbase_connected: boolean
  alpaca_paper: boolean | null
  cloud_runner: boolean
  risk_preset: RiskPreset
  truth_mode_enabled: boolean
}

interface Doctrine {
  id: string
  name: string
  config: Record<string, unknown>
  is_active: boolean
}

interface AlpacaInfo {
  buying_power: number
  portfolio_value: number
  currency: string
  paper: boolean
}

interface CoinbaseInfo {
  account_count: number | null
}

const RISK_PRESETS: {
  id: RiskPreset
  emoji: string
  label: string
  description: string
  confidence: string
  positionSize: string
  dailyKill: string
  weeklyBreaker: string
  trailingStop: string
  borderSelected: string
  bgSelected: string
  textAccent: string
}[] = [
  {
    id: 'conservative',
    emoji: '🛡️',
    label: 'Conservative',
    description: 'Capital preservation first. Tight limits, high conviction only.',
    confidence: '8 / 10',
    positionSize: '2%',
    dailyKill: '2%',
    weeklyBreaker: '5%',
    trailingStop: 'Tight',
    borderSelected: 'border-blue-400',
    bgSelected: 'bg-blue-50 dark:bg-blue-950/20',
    textAccent: 'text-blue-500',
  },
  {
    id: 'balanced',
    emoji: '⚖️',
    label: 'Balanced',
    description: 'Steady growth with disciplined risk management. Recommended for most.',
    confidence: '6 / 10',
    positionSize: '5%',
    dailyKill: '3%',
    weeklyBreaker: '8%',
    trailingStop: 'Medium',
    borderSelected: 'border-amber-400',
    bgSelected: 'bg-amber-50 dark:bg-amber-950/20',
    textAccent: 'text-amber-400',
  },
  {
    id: 'aggressive',
    emoji: '🔥',
    label: 'Aggressive',
    description: 'Maximum upside. Larger positions, wider stops, lower confidence bar.',
    confidence: '4 / 10',
    positionSize: '10%',
    dailyKill: '5%',
    weeklyBreaker: '12%',
    trailingStop: 'Loose',
    borderSelected: 'border-red-400',
    bgSelected: 'bg-red-50 dark:bg-red-950/20',
    textAccent: 'text-red-400',
  },
]

const TIER_LABEL: Record<string, string> = {
  citizen:   'Citizen',
  commander: 'Commander',
  emperor:   'Emperor',
}

const TIER_COLOR: Record<string, string> = {
  citizen:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  commander: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  emperor:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
}

const TIER_FEATURES: Record<string, string[]> = {
  citizen: [
    'Paper trading (no real money)',
    'Fortress Guard active (read-only)',
    '7-signal confidence scoring',
    'Public leaderboard ranking',
    'Upgrade to unlock live trading',
  ],
  commander: [
    'Live trading via Alpaca (stocks)',
    'Live trading via Coinbase (crypto)',
    'Approval mode — you confirm each trade',
    'PDT guardian (day trade tracking)',
    'Fortress Guard + trailing stops',
    'Upgrade to Emperor for full autonomy',
  ],
  emperor: [
    'Live trading via Alpaca + Coinbase',
    'Autonomous mode — zero intervention',
    'Cloud Runner — always-on execution',
    'Priority signal processing',
    'Fortress Guard + all safety layers',
    'Empire-level conquest tracking',
  ],
}

export default function EnkiSettingsPage() {
  const router = useRouter()
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [authed, setAuthed]         = useState(false)
  const [profile, setProfile]       = useState<Profile | null>(null)
  const [mode, setMode]             = useState<'approval' | 'autonomous' | 'dormant'>('approval')
  const [saved, setSaved]           = useState(false)
  const [riskPreset, setRiskPreset] = useState<RiskPreset>('balanced')
  const [presetSaving, setPresetSaving] = useState(false)
  const [presetSaved, setPresetSaved]   = useState(false)

  // Alpaca connect form state
  const [alpacaKey,       setAlpacaKey]       = useState('')
  const [alpacaSecret,    setAlpacaSecret]    = useState('')
  const [alpacaPaper,     setAlpacaPaper]     = useState(true)
  const [alpacaConnecting, setAlpacaConnecting] = useState(false)
  const [alpacaError,     setAlpacaError]     = useState<string | null>(null)
  const [alpacaInfo,      setAlpacaInfo]      = useState<AlpacaInfo | null>(null)

  // Coinbase connect form state
  const [cbKey,       setCbKey]       = useState('')
  const [cbSecret,    setCbSecret]    = useState('')
  const [cbConnecting, setCbConnecting] = useState(false)
  const [cbError,     setCbError]     = useState<string | null>(null)
  const [cbInfo,      setCbInfo]      = useState<CoinbaseInfo | null>(null)

  // Truth Mode
  const [truthMode,        setTruthMode]        = useState(false)
  const [truthSaving,      setTruthSaving]      = useState(false)
  const [truthSaved,       setTruthSaved]       = useState(false)

  // Doctrine / Full Send state
  const [doctrines,           setDoctrines]           = useState<Doctrine[]>([])
  const [positionSizePct,     setPositionSizePct]     = useState(10)
  const [positionSaving,      setPositionSaving]      = useState(false)
  const [positionSaved,       setPositionSaved]       = useState(false)
  const [activeDoctrineId,    setActiveDoctrineId]    = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login?next=/enki/settings'); return }
      setAuthed(true)
      loadProfile()
    })
  }, [])

  async function loadProfile() {
    setLoading(true)
    try {
      const [profileRes, doctrinesRes] = await Promise.all([
        fetch('/api/enki/profile'),
        fetch('/api/enki/doctrines'),
      ])
      const [profileJson, doctrinesJson] = await Promise.all([
        profileRes.json(),
        doctrinesRes.json(),
      ])
      if (profileJson.profile) {
        setProfile(profileJson.profile)
        setMode(profileJson.profile.guardian_mode)
        setRiskPreset(profileJson.profile.risk_preset ?? 'balanced')
        setTruthMode(Boolean(profileJson.profile.truth_mode_enabled))
      }
      if (doctrinesJson.doctrines) {
        setDoctrines(doctrinesJson.doctrines)
        const active = doctrinesJson.doctrines.find((d: Doctrine) => d.is_active)
        if (active) {
          setActiveDoctrineId(active.id)
          const pct = typeof active.config?.position_size_pct === 'number'
            ? active.config.position_size_pct as number
            : 10
          setPositionSizePct(pct)
        }
      }
    } catch (e) {
      console.error('Enki settings load error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function savePositionSize() {
    setPositionSaving(true)
    try {
      if (activeDoctrineId) {
        // Update existing active doctrine's config
        const existing = doctrines.find(d => d.id === activeDoctrineId)
        const updatedConfig = { ...(existing?.config ?? {}), position_size_pct: positionSizePct }
        await fetch('/api/enki/doctrines', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: activeDoctrineId, config: updatedConfig }),
        })
        setDoctrines(prev => prev.map(d =>
          d.id === activeDoctrineId ? { ...d, config: updatedConfig } : d
        ))
      } else {
        // Create a default doctrine if none exists
        const res = await fetch('/api/enki/doctrines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Default Doctrine',
            config: { symbols: ['SPY', 'QQQ'], position_size_pct: positionSizePct },
          }),
        })
        const json = await res.json()
        if (json.doctrine) {
          setDoctrines([json.doctrine])
          setActiveDoctrineId(json.doctrine.id)
        }
      }
      setPositionSaved(true)
      setTimeout(() => setPositionSaved(false), 2500)
    } catch (e) {
      console.error('Position size save error:', e)
    } finally {
      setPositionSaving(false)
    }
  }

  async function saveTruthMode(enabled: boolean) {
    setTruthMode(enabled)
    setTruthSaving(true)
    try {
      await fetch('/api/enki/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ truth_mode_enabled: enabled }),
      })
      setProfile(p => p ? { ...p, truth_mode_enabled: enabled } : p)
      setTruthSaved(true)
      setTimeout(() => setTruthSaved(false), 2500)
    } catch (e) {
      console.error('Truth mode save error:', e)
      setTruthMode(!enabled) // revert optimistic update on error
    } finally {
      setTruthSaving(false)
    }
  }

  async function saveMode() {
    if (!profile) return
    setSaving(true)
    try {
      await fetch('/api/enki/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guardian_mode: mode }),
      })
      setProfile(p => p ? { ...p, guardian_mode: mode } : p)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      console.error('Save error:', e)
    } finally {
      setSaving(false)
    }
  }

  async function savePreset(preset: RiskPreset) {
    setRiskPreset(preset)
    setPresetSaving(true)
    try {
      await fetch('/api/enki/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ risk_preset: preset }),
      })
      setProfile(p => p ? { ...p, risk_preset: preset } : p)
      setPresetSaved(true)
      setTimeout(() => setPresetSaved(false), 2500)
    } catch (e) {
      console.error('Preset save error:', e)
    } finally {
      setPresetSaving(false)
    }
  }

  async function connectAlpaca() {
    setAlpacaError(null)
    setAlpacaConnecting(true)
    try {
      const res = await fetch('/api/enki/brokers/alpaca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: alpacaKey, secretKey: alpacaSecret, paper: alpacaPaper }),
      })
      const json = await res.json()
      if (!res.ok) {
        setAlpacaError(json.error ?? 'Connection failed.')
        return
      }
      setAlpacaInfo({ buying_power: json.buying_power, portfolio_value: json.portfolio_value, currency: json.currency, paper: json.paper })
      setProfile(p => p ? { ...p, alpaca_connected: true, alpaca_paper: json.paper } : p)
      setAlpacaKey('')
      setAlpacaSecret('')
    } catch {
      setAlpacaError('Network error. Please try again.')
    } finally {
      setAlpacaConnecting(false)
    }
  }

  async function disconnectAlpaca() {
    if (!confirm('Disconnect Alpaca? The guardian will stop trading stocks.')) return
    setAlpacaConnecting(true)
    try {
      await fetch('/api/enki/brokers/alpaca', { method: 'DELETE' })
      setProfile(p => p ? { ...p, alpaca_connected: false, alpaca_paper: null } : p)
      setAlpacaInfo(null)
    } catch {
      // silently ignore
    } finally {
      setAlpacaConnecting(false)
    }
  }

  async function connectCoinbase() {
    setCbError(null)
    setCbConnecting(true)
    try {
      const res = await fetch('/api/enki/brokers/coinbase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: cbKey, secretKey: cbSecret }),
      })
      const json = await res.json()
      if (!res.ok) {
        setCbError(json.error ?? 'Connection failed.')
        return
      }
      setCbInfo({ account_count: json.account_count })
      setProfile(p => p ? { ...p, coinbase_connected: true } : p)
      setCbKey('')
      setCbSecret('')
    } catch {
      setCbError('Network error. Please try again.')
    } finally {
      setCbConnecting(false)
    }
  }

  async function disconnectCoinbase() {
    if (!confirm('Disconnect Coinbase? The guardian will stop trading crypto.')) return
    setCbConnecting(true)
    try {
      await fetch('/api/enki/brokers/coinbase', { method: 'DELETE' })
      setProfile(p => p ? { ...p, coinbase_connected: false } : p)
      setCbInfo(null)
    } catch {
      // silently ignore
    } finally {
      setCbConnecting(false)
    }
  }

  async function pauseGuardian() {
    if (!confirm('This will set your guardian to Dormant and pause all autonomous activity. Continue?')) return
    setMode('dormant')
    setSaving(true)
    try {
      await fetch('/api/enki/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guardian_mode: 'dormant' }),
      })
      setProfile(p => p ? { ...p, guardian_mode: 'dormant' } : p)
    } catch (e) {
      console.error('Pause error:', e)
    } finally {
      setSaving(false)
    }
  }

  if (!authed || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading settings…</p>
        </div>
      </div>
    )
  }

  const tier = profile?.tier ?? 'citizen'
  const isCommander = tier === 'commander' || tier === 'emperor'
  const isEmperor   = tier === 'emperor'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-black dark:bg-gray-950 border-b border-gray-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-black font-extrabold text-sm">E</div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Enki</p>
              <p className="text-gray-500 text-xs">Settings</p>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/enki/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/enki/trades"    className="text-gray-400 hover:text-white transition-colors">Trades</Link>
            <Link href="/enki/leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</Link>
            <Link href="/enki/settings"  className="text-amber-400 font-semibold">Settings</Link>
          </nav>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Tier card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Tier</h2>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${TIER_COLOR[tier]}`}>
              {TIER_LABEL[tier]}
            </span>
          </div>
          <ul className="space-y-2">
            {TIER_FEATURES[tier].map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-amber-400 mt-0.5">▸</span>
                {f}
              </li>
            ))}
          </ul>
          {!isEmperor && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link
                href="/enki#pricing"
                className="inline-block text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors"
              >
                Upgrade tier →
              </Link>
            </div>
          )}
        </div>

        {/* Risk Profile */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Risk Profile</h2>
          {truthMode && (
            <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-3 mb-4">
              <span className="text-violet-500">🔒</span>
              <p className="text-xs text-violet-700 dark:text-violet-300 font-medium">
                Truth Mode is running — parameters locked to preserve data integrity
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500 mb-5">
            Choose how aggressively Enki trades. These thresholds apply when trades execute.
            {presetSaving && <span className="ml-2 text-amber-400 text-xs">Saving…</span>}
            {presetSaved && <span className="ml-2 text-green-500 text-xs font-medium">Saved</span>}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {RISK_PRESETS.map(preset => {
              const isSelected = riskPreset === preset.id
              return (
                <button
                  key={preset.id}
                  onClick={() => savePreset(preset.id)}
                  disabled={presetSaving || truthMode}
                  className={`text-left p-4 rounded-xl border-2 transition-all focus:outline-none disabled:opacity-60 ${
                    isSelected
                      ? `${preset.borderSelected} ${preset.bgSelected}`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg leading-none">{preset.emoji}</span>
                    <span className={`text-sm font-bold ${isSelected ? preset.textAccent : 'text-gray-900 dark:text-gray-100'}`}>
                      {preset.label}
                    </span>
                    {preset.id === 'balanced' && (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-semibold px-1.5 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{preset.description}</p>
                  <dl className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <dt className="text-gray-400">Confidence</dt>
                      <dd className={`font-semibold ${isSelected ? preset.textAccent : 'text-gray-700 dark:text-gray-300'}`}>{preset.confidence}</dd>
                    </div>
                    <div className="flex justify-between text-xs">
                      <dt className="text-gray-400">Position size</dt>
                      <dd className={`font-semibold ${isSelected ? preset.textAccent : 'text-gray-700 dark:text-gray-300'}`}>{preset.positionSize}</dd>
                    </div>
                    <div className="flex justify-between text-xs">
                      <dt className="text-gray-400">Daily kill</dt>
                      <dd className={`font-semibold ${isSelected ? preset.textAccent : 'text-gray-700 dark:text-gray-300'}`}>{preset.dailyKill}</dd>
                    </div>
                    <div className="flex justify-between text-xs">
                      <dt className="text-gray-400">Weekly breaker</dt>
                      <dd className={`font-semibold ${isSelected ? preset.textAccent : 'text-gray-700 dark:text-gray-300'}`}>{preset.weeklyBreaker}</dd>
                    </div>
                    <div className="flex justify-between text-xs">
                      <dt className="text-gray-400">Trailing stop</dt>
                      <dd className={`font-semibold ${isSelected ? preset.textAccent : 'text-gray-700 dark:text-gray-300'}`}>{preset.trailingStop}</dd>
                    </div>
                  </dl>
                </button>
              )
            })}
          </div>
        </div>

        {/* Position Size / Full Send */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Position Size per Trade</h2>
            {positionSaved && <span className="text-green-500 text-xs font-medium">Saved</span>}
          </div>
          {truthMode && (
            <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-3 mb-4">
              <span className="text-violet-500">🔒</span>
              <p className="text-xs text-violet-700 dark:text-violet-300 font-medium">
                Truth Mode is running — parameters locked to preserve data integrity
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500 mb-5">
            How much of your portfolio Enki deploys per trade signal. Higher = more compounding power, higher risk.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Size: <strong className="text-gray-900 dark:text-gray-100">{positionSizePct}%</strong></span>
              {positionSizePct === 100 && (
                <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                  ⚡ Full Send — uses entire portfolio per trade
                </span>
              )}
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={positionSizePct}
              onChange={e => setPositionSizePct(Number(e.target.value))}
              className="w-full accent-amber-400 h-2 rounded-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>5% (conservative)</span>
              <span>50% (aggressive)</span>
              <span className="text-amber-500 font-bold">100% Full Send</span>
            </div>

            {positionSizePct >= 50 && positionSizePct < 100 && (
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3">
                <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                  High position size. Make sure your doctrine symbols are well-diversified and Fortress Guard is active.
                </p>
              </div>
            )}

            {positionSizePct === 100 && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-800 dark:text-amber-300 font-bold mb-0.5">Full Send Mode Active</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Every trade signal deploys 100% of your portfolio value. Built for maximum compounding from small accounts ($5 → growth). Fortress Guard limits remain enforced.
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={savePositionSize}
                disabled={positionSaving || truthMode}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-bold rounded-xl transition-colors"
              >
                {positionSaving ? 'Saving…' : 'Save Position Size'}
              </button>
              {doctrines.length === 0 && (
                <span className="text-xs text-gray-400">No active doctrine — saving will create one.</span>
              )}
            </div>
          </div>
        </div>

        {/* Guardian mode */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Guardian Mode</h2>
          <p className="text-sm text-gray-500 mb-5">Controls how Enki executes trades on your behalf.</p>

          <div className="space-y-3">
            {/* Approval */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
              mode === 'approval'
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
              <input
                type="radio"
                name="mode"
                value="approval"
                checked={mode === 'approval'}
                onChange={() => setMode('approval')}
                disabled={!isCommander}
                className="mt-1 accent-amber-400"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Approval Mode
                  {!isCommander && <span className="ml-2 text-xs text-gray-400">(Commander+)</span>}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Enki identifies trades and waits for your confirmation before executing.</p>
              </div>
            </label>

            {/* Autonomous */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
              mode === 'autonomous'
                ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${!isEmperor ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input
                type="radio"
                name="mode"
                value="autonomous"
                checked={mode === 'autonomous'}
                onChange={() => setMode('autonomous')}
                disabled={!isEmperor}
                className="mt-1 accent-green-500"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Autonomous Mode
                  {!isEmperor && <span className="ml-2 text-xs text-gray-400">(Emperor only)</span>}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Zero intervention. Enki executes when confidence hits 6/10+. Fortress Guard always active.</p>
              </div>
            </label>

            {/* Dormant */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
              mode === 'dormant'
                ? 'border-gray-400 bg-gray-50 dark:bg-gray-800/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
              <input
                type="radio"
                name="mode"
                value="dormant"
                checked={mode === 'dormant'}
                onChange={() => setMode('dormant')}
                className="mt-1 accent-gray-500"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Dormant</p>
                <p className="text-xs text-gray-500 mt-0.5">Guardian is paused. No trades execute. Portfolio monitoring continues.</p>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={saveMode}
              disabled={saving || mode === profile?.guardian_mode}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-bold rounded-xl transition-colors"
            >
              {saving ? 'Saving…' : 'Save Mode'}
            </button>
            {saved && <span className="text-green-500 text-sm font-medium">Saved</span>}
          </div>
        </div>

        {/* Broker connections */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Broker Connections</h2>
          <p className="text-sm text-gray-500 mb-5">
            Connect your broker API keys to enable live trading. Keys are encrypted at rest and never stored in plain text.
          </p>

          <div className="space-y-5">
            {/* ── Alpaca ── */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-400/10 rounded-lg flex items-center justify-center text-yellow-500 font-bold text-xs">AL</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Alpaca</p>
                    <p className="text-xs text-gray-500">US stocks + ETFs — Commander+</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  profile?.alpaca_connected
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                }`}>
                  {profile?.alpaca_connected ? (profile.alpaca_paper ? 'Connected · Paper' : 'Connected · Live') : 'Not connected'}
                </span>
              </div>

              {!isCommander && (
                <div className="px-4 py-3">
                  <p className="text-xs text-gray-400">
                    Requires Commander tier.{' '}
                    <Link href="/enki#pricing" className="text-amber-500 hover:text-amber-400">Upgrade →</Link>
                  </p>
                </div>
              )}

              {isCommander && !profile?.alpaca_connected && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">API Key ID</label>
                      <input
                        type="password"
                        value={alpacaKey}
                        onChange={e => setAlpacaKey(e.target.value)}
                        placeholder="PKTEST…"
                        className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Secret Key</label>
                      <input
                        type="password"
                        value={alpacaSecret}
                        onChange={e => setAlpacaSecret(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={alpacaPaper}
                      onChange={e => setAlpacaPaper(e.target.checked)}
                      className="accent-amber-400 w-4 h-4"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Paper trading account <span className="text-gray-400">(uses paper-api.alpaca.markets)</span>
                    </span>
                  </label>

                  {alpacaError && (
                    <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">{alpacaError}</p>
                  )}

                  <button
                    onClick={connectAlpaca}
                    disabled={alpacaConnecting || !alpacaKey || !alpacaSecret}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-bold rounded-lg transition-colors min-h-[44px]"
                  >
                    {alpacaConnecting ? 'Connecting…' : 'Connect Alpaca'}
                  </button>

                  <p className="text-xs text-gray-400">
                    Get your API keys at{' '}
                    <a href="https://alpaca.markets" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400">
                      alpaca.markets
                    </a>{' '}
                    → My Account → API Keys.
                  </p>
                </div>
              )}

              {isCommander && profile?.alpaca_connected && (
                <div className="p-4">
                  {alpacaInfo && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-0.5">Buying Power</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          ${alpacaInfo.buying_power.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-0.5">Portfolio Value</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          ${alpacaInfo.portfolio_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={disconnectAlpaca}
                    disabled={alpacaConnecting}
                    className="text-xs font-bold text-red-500 hover:text-red-400 disabled:opacity-50 transition-colors min-h-[44px] px-1"
                  >
                    {alpacaConnecting ? 'Disconnecting…' : 'Disconnect Alpaca'}
                  </button>
                </div>
              )}
            </div>

            {/* ── Coinbase ── */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-400/10 rounded-lg flex items-center justify-center text-blue-500 font-bold text-xs">CB</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Coinbase</p>
                    <p className="text-xs text-gray-500">Crypto — Emperor only</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  profile?.coinbase_connected
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                }`}>
                  {profile?.coinbase_connected ? 'Connected' : 'Not connected'}
                </span>
              </div>

              {!isEmperor && (
                <div className="px-4 py-3">
                  <p className="text-xs text-gray-400">
                    Requires Emperor tier.{' '}
                    <Link href="/enki#pricing" className="text-amber-500 hover:text-amber-400">Upgrade →</Link>
                  </p>
                </div>
              )}

              {isEmperor && !profile?.coinbase_connected && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">API Key</label>
                      <input
                        type="password"
                        value={cbKey}
                        onChange={e => setCbKey(e.target.value)}
                        placeholder="organizations/…"
                        className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Secret Key</label>
                      <input
                        type="password"
                        value={cbSecret}
                        onChange={e => setCbSecret(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {cbError && (
                    <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">{cbError}</p>
                  )}

                  <button
                    onClick={connectCoinbase}
                    disabled={cbConnecting || !cbKey || !cbSecret}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-bold rounded-lg transition-colors min-h-[44px]"
                  >
                    {cbConnecting ? 'Connecting…' : 'Connect Coinbase'}
                  </button>

                  <p className="text-xs text-gray-400">
                    Get your API keys at{' '}
                    <a href="https://advanced.coinbase.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400">
                      advanced.coinbase.com
                    </a>{' '}
                    → Settings → API.
                  </p>
                </div>
              )}

              {isEmperor && profile?.coinbase_connected && (
                <div className="p-4">
                  {cbInfo?.account_count != null && (
                    <p className="text-xs text-gray-400 mb-3">
                      {cbInfo.account_count} wallet{cbInfo.account_count !== 1 ? 's' : ''} accessible
                    </p>
                  )}
                  <button
                    onClick={disconnectCoinbase}
                    disabled={cbConnecting}
                    className="text-xs font-bold text-red-500 hover:text-red-400 disabled:opacity-50 transition-colors min-h-[44px] px-1"
                  >
                    {cbConnecting ? 'Disconnecting…' : 'Disconnect Coinbase'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fortress Guard summary */}
        <div className="bg-black border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-amber-400 mb-4">Fortress Guard — Always Active</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['$5 min', 'Minimum trade size'],
              ['$2,000 max', 'Per-trade cap'],
              ['3 trades/day', 'Daily trade limit'],
              ['−8% stop-loss', 'Hard stop per position'],
              ['25% max', 'Portfolio in one asset'],
              ['6/10 confidence', 'Minimum to execute'],
            ].map(([val, label]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-amber-400 font-extrabold text-sm w-24 shrink-0">{val}</span>
                <span className="text-gray-400 text-sm">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-4">
            These rules cannot be disabled. They exist to protect you — even in autonomous mode.
          </p>
        </div>

        {/* Truth Mode */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Truth Mode <span className="text-xs font-normal text-gray-400 ml-1">(Experimental)</span></h2>
              <p className="text-sm text-gray-500 mt-1 max-w-lg">
                Runs a simplified trading system in parallel to validate real performance. Does not affect your main Enki strategy.
              </p>
            </div>
            {/* Toggle */}
            <button
              onClick={() => saveTruthMode(!truthMode)}
              disabled={truthSaving}
              aria-pressed={truthMode}
              className={`relative shrink-0 ml-4 mt-1 w-12 h-6 rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                truthMode ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  truthMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
              truthMode
                ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${truthMode ? 'bg-violet-500' : 'bg-gray-400'}`} />
              {truthMode ? 'ON' : 'OFF'}
            </span>
            {truthSaved && <span className="text-green-500 text-xs font-medium">Saved</span>}
            {truthSaving && <span className="text-gray-400 text-xs">Saving…</span>}
          </div>

          {truthMode && (
            <div className="mt-4 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/50 rounded-xl px-4 py-3">
              <p className="text-xs text-violet-700 dark:text-violet-300 font-semibold mb-1">Experiment is running</p>
              <ul className="text-xs text-violet-600 dark:text-violet-400 space-y-0.5">
                <li>• Strategy parameters are locked — do not change thresholds mid-experiment</li>
                <li>• Trades are recorded in a separate system and do not affect your main portfolio</li>
                <li>• View results at <a href="/enki/truth" className="underline hover:text-violet-200">/enki/truth</a></li>
              </ul>
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">Pause the guardian immediately. No trades will execute while dormant.</p>
          <button
            onClick={pauseGuardian}
            disabled={saving || profile?.guardian_mode === 'dormant'}
            className="px-5 py-2.5 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold rounded-xl transition-colors"
          >
            {profile?.guardian_mode === 'dormant' ? 'Guardian is dormant' : 'Pause Guardian'}
          </button>
        </div>

      </div>
    </div>
  )
}
