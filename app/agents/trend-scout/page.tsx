'use client'
import { useState, useEffect } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Trend = {
  topic:          string
  why_now:        string
  angle:          string
  sample_caption: string
}

type Settings = { enabled: boolean; last_ran_at: string | null }
type Results  = { trends: Trend[]; generated_at: string } | null

export default function TrendScoutPage() {
  const { activeWorkspaceId: workspaceId, plan } = useWorkspace()
  const router = useRouter()

  const [settings, setSettings] = useState<Settings>({ enabled: false, last_ran_at: null })
  const [results,  setResults]  = useState<Results>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState('')

  useEffect(() => {
    if (!workspaceId) return
    fetch(`/api/agents/trend-scout?workspace_id=${workspaceId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.settings) setSettings({ ...settings, ...d.settings })
        if (d?.results)  setResults(d.results)
      })
      .finally(() => setLoading(false))
  }, [workspaceId])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function save(newEnabled?: boolean) {
    if (!workspaceId) return
    setSaving(true)
    const enabled = newEnabled !== undefined ? newEnabled : settings.enabled
    const res = await fetch('/api/agents/trend-scout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: workspaceId, enabled }),
    })
    setSaving(false)
    if (res.ok) {
      setSettings(s => ({ ...s, enabled }))
      showToast('Settings saved!')
    }
  }

  function draftPost(caption: string) {
    const encoded = encodeURIComponent(caption)
    router.push(`/compose?content=${encoded}`)
  }

  const isPro = plan !== 'free'

  if (!isPro) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-4">
        <span className="text-5xl">📈</span>
        <h1 className="text-2xl font-black text-primary">Trend Scout</h1>
        <p className="text-secondary text-sm max-w-md">Daily AI-powered trend analysis from your tracked competitors — content angles delivered every morning. Available on Pro and Agency plans.</p>
        <Link href="/settings?tab=Plan" className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-3 rounded-xl text-sm">Upgrade to Pro →</Link>
        <Link href="/agents" className="text-xs text-secondary hover:text-primary">← Back to Agents</Link>
      </div>
    )
  }

  const trends: Trend[] = results?.trends ?? []

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/agents" className="text-xs text-secondary hover:text-primary mb-4 inline-block">← Back to Agents</Link>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📈</span>
          <h1 className="text-2xl font-black text-primary">Trend Scout</h1>
          <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Pro+</span>
        </div>
        <p className="text-secondary text-sm">
          Every morning at 7am UTC, Trend Scout analyzes what your tracked competitors are posting and surfaces the top content angles you should be hitting — with a ready-to-use draft for each.
        </p>
        {settings.last_ran_at && (
          <p className="text-xs text-secondary mt-1">Last ran: {new Date(settings.last_ran_at).toLocaleDateString()}</p>
        )}
      </div>

      {loading ? (
        <div className="text-secondary text-sm py-10 text-center">Loading…</div>
      ) : (
        <div className="space-y-5">
          {/* Enable toggle */}
          <div className="bg-surface border border-theme rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-bold text-primary">Enable Trend Scout</p>
              <p className="text-xs text-secondary mt-0.5">Runs every morning at 7am UTC — free, uses your tracked competitors</p>
            </div>
            <button
              disabled={saving}
              onClick={() => save(!settings.enabled)}
              className={`w-12 h-6 rounded-full transition-all relative ${settings.enabled ? 'bg-amber-400' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.enabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* How it works */}
          {trends.length === 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-600 mb-2">How it works</p>
              <ul className="text-sm text-secondary space-y-1">
                <li>✓ Reads your tracked competitors' recent posts</li>
                <li>✓ AI identifies recurring themes and trending angles</li>
                <li>✓ Delivers 5 content angles every morning</li>
                <li>✓ Each comes with a ready-to-post draft</li>
              </ul>
              <p className="text-xs text-secondary mt-3">
                {results === null
                  ? <>Add competitors in <Link href="/competitors" className="text-amber-600 underline">Competitor Tracking</Link> first — Trend Scout uses that data.</>
                  : 'Enable the agent above — first results will arrive tomorrow at 7am UTC.'}
              </p>
            </div>
          )}

          {/* Latest trends */}
          {trends.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-secondary">Latest Trends</p>
                {results?.generated_at && (
                  <p className="text-xs text-secondary">{new Date(results.generated_at).toLocaleDateString()}</p>
                )}
              </div>
              {trends.map((trend, i) => (
                <div key={i} className="bg-surface border border-theme rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-black text-primary">{trend.topic}</p>
                      <p className="text-xs text-amber-500 mt-0.5">{trend.why_now}</p>
                    </div>
                    <span className="text-xl shrink-0">📈</span>
                  </div>
                  <p className="text-sm text-secondary mb-3">{trend.angle}</p>
                  <div className="bg-background border border-theme rounded-xl p-3 mb-3">
                    <p className="text-xs font-bold text-secondary mb-1">Sample caption</p>
                    <p className="text-sm text-primary">{trend.sample_caption}</p>
                  </div>
                  <button
                    onClick={() => draftPost(trend.sample_caption)}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black py-2 rounded-xl text-xs transition-all"
                  >
                    Draft Post →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* No competitors warning */}
          <div className="bg-surface border border-theme rounded-2xl p-4 flex items-center gap-3">
            <span className="text-xl">🔭</span>
            <div>
              <p className="text-sm font-semibold text-primary">Needs competitor data</p>
              <p className="text-xs text-secondary">Trend Scout reads your competitor posts. <Link href="/competitors" className="text-amber-500 hover:underline">Add competitors →</Link></p>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }} className="fixed right-6 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl">{toast}</div>
      )}
    </div>
  )
}
