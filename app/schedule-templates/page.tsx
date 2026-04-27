'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

interface Template {
  id: string
  name: string
  slots: string[]
  created_at: string
}

function formatSlot(time: string) {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

export default function ScheduleTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading]     = useState(true)

  const [name, setName]         = useState('')
  const [slots, setSlots]       = useState<string[]>(['09:00'])
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/schedule-templates')
    if (res.status === 401) { router.push('/login?redirect=/schedule-templates'); return }
    const data = await res.json()
    setTemplates(data.templates ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSave() {
    if (!name.trim()) { setSaveError('Give your template a name.'); return }
    if (slots.length === 0) { setSaveError('Add at least one time slot.'); return }
    setSaving(true)
    setSaveError('')
    const res = await fetch('/api/schedule-templates', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: name.trim(), slots: [...slots].sort() }),
    })
    if (!res.ok) {
      const d = await res.json()
      setSaveError(d.error || 'Save failed.')
      setSaving(false)
      return
    }
    setName('')
    setSlots(['09:00'])
    setShowCreate(false)
    await load()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/schedule-templates/${id}`, { method: 'DELETE' })
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  function addSlot() {
    setSlots(prev => [...prev, '12:00'])
  }

  function updateSlot(idx: number, val: string) {
    setSlots(prev => prev.map((s, i) => i === idx ? val : s))
  }

  function removeSlot(idx: number) {
    setSlots(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 md:ml-56 p-4 sm:p-6 lg:p-8 max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Schedule Templates</h1>
            <p className="text-sm text-gray-400 mt-0.5">Saved posting-time presets you can reuse across platforms.</p>
          </div>
          <button
            onClick={() => setShowCreate(v => !v)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-4 py-2 rounded-xl transition-all"
          >
            {showCreate ? 'Cancel' : '+ New Template'}
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="rounded-2xl border border-amber-500/20 bg-gray-900 p-5 mb-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80">New Template</h2>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Template name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Morning Burst, Full Day, Weekend"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-400">Time slots (UTC)</label>
                <button
                  onClick={addSlot}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  + Add slot
                </button>
              </div>
              <div className="space-y-2">
                {slots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slot}
                      onChange={e => updateSlot(i, e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    />
                    <span className="text-xs text-gray-500 w-16 flex-shrink-0">{formatSlot(slot)}</span>
                    {slots.length > 1 && (
                      <button
                        onClick={() => removeSlot(i)}
                        className="text-gray-600 hover:text-red-400 text-lg leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-600 mt-2">All times are UTC. 9:00 UTC ≈ 5am ET / 2am PT.</p>
            </div>

            {saveError && (
              <p className="text-xs text-red-400">{saveError}</p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-extrabold py-2.5 rounded-xl text-sm transition-all"
            >
              {saving ? 'Saving…' : `Save Template (${slots.length} slot${slots.length !== 1 ? 's' : ''})`}
            </button>
          </div>
        )}

        {/* Template list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border border-gray-800 bg-gray-900 p-5 h-20 animate-pulse" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-sm font-semibold text-gray-300 mb-1">No templates yet</p>
            <p className="text-xs text-gray-500">Create a template to save your favourite posting times for reuse.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map(t => (
              <div key={t.id} className="rounded-2xl border border-gray-800 bg-gray-900 p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white mb-2">{t.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[...t.slots].sort().map(slot => (
                      <span key={slot} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-300">
                        {formatSlot(slot)} UTC
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-600 mt-2">
                    {t.slots.length} slot{t.slots.length !== 1 ? 's' : ''} · saved {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-xs flex-shrink-0 pt-0.5"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
