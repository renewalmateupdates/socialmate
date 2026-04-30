'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

type Slot = { day: string; time: string }

type Template = {
  id: string
  name: string
  slots: Slot[]
  created_at: string
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TIMES = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
]

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour  = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function SchedulesPage() {
  const [templates,   setTemplates]   = useState<Template[]>([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [deleting,    setDeleting]    = useState<string | null>(null)
  const [showCreate,  setShowCreate]  = useState(false)
  const [name,        setName]        = useState('')
  const [slots,       setSlots]       = useState<Slot[]>([{ day: 'Mon', time: '09:00' }])
  const [error,       setError]       = useState('')
  const [toast,       setToast]       = useState('')

  useEffect(() => { loadTemplates() }, [])

  async function loadTemplates() {
    setLoading(true)
    const res = await fetch('/api/schedule-templates')
    if (res.ok) {
      const data = await res.json()
      setTemplates(data.templates ?? [])
    }
    setLoading(false)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function save() {
    if (!name.trim()) { setError('Give this template a name.'); return }
    if (slots.length === 0) { setError('Add at least one time slot.'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/schedule-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), slots }),
    })
    setSaving(false)
    if (res.ok) {
      setShowCreate(false)
      setName('')
      setSlots([{ day: 'Mon', time: '09:00' }])
      await loadTemplates()
      showToast('Template saved!')
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save.')
    }
  }

  async function deleteTemplate(id: string) {
    setDeleting(id)
    const res = await fetch(`/api/schedule-templates/${id}`, { method: 'DELETE' })
    setDeleting(null)
    if (res.ok) {
      setTemplates(t => t.filter(x => x.id !== id))
      showToast('Template deleted.')
    }
  }

  function addSlot() {
    setSlots(s => [...s, { day: 'Mon', time: '09:00' }])
  }

  function updateSlot(i: number, field: keyof Slot, value: string) {
    setSlots(s => s.map((slot, idx) => idx === i ? { ...slot, [field]: value } : slot))
  }

  function removeSlot(i: number) {
    setSlots(s => s.filter((_, idx) => idx !== i))
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-primary">Schedule Templates</h1>
            <p className="text-secondary text-sm mt-1">Save posting-time presets and apply them to SOMA projects.</p>
          </div>
          <button
            onClick={() => { setShowCreate(true); setError('') }}
            className="bg-amber-400 hover:bg-amber-300 text-black font-black px-4 py-2 rounded-xl text-sm transition-all"
          >
            + New Template
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="bg-surface border border-amber-400 rounded-2xl p-6 mb-6">
            <h2 className="font-black text-primary mb-4">New Template</h2>

            <div className="mb-4">
              <label className="block text-xs font-bold text-secondary uppercase tracking-wide mb-1">Template name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Weekday mornings, Mon–Fri 3×/day"
                className="w-full bg-background border border-theme rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-secondary uppercase tracking-wide">Time slots</label>
                <button onClick={addSlot} className="text-xs font-bold text-amber-500 hover:text-amber-400">+ Add slot</button>
              </div>
              <div className="space-y-2">
                {slots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <select
                      value={slot.day}
                      onChange={e => updateSlot(i, 'day', e.target.value)}
                      className="bg-background border border-theme rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-amber-400"
                    >
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select
                      value={slot.time}
                      onChange={e => updateSlot(i, 'time', e.target.value)}
                      className="bg-background border border-theme rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-amber-400 flex-1"
                    >
                      {TIMES.map(t => <option key={t} value={t}>{fmtTime(t)}</option>)}
                    </select>
                    {slots.length > 1 && (
                      <button onClick={() => removeSlot(i)} className="text-gray-400 hover:text-red-400 text-sm">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black px-5 py-2 rounded-xl text-sm transition-all"
              >
                {saving ? 'Saving…' : 'Save Template'}
              </button>
              <button
                onClick={() => { setShowCreate(false); setError('') }}
                className="border border-theme text-secondary hover:text-primary px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Template list */}
        {loading ? (
          <div className="text-secondary text-sm py-10 text-center">Loading templates…</div>
        ) : templates.length === 0 ? (
          <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-bold text-primary mb-1">No templates yet</p>
            <p className="text-sm text-secondary mb-4">Save your posting schedule as a preset to reuse across projects.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-amber-400 hover:bg-amber-300 text-black font-black px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              Create your first template
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map(t => (
              <div key={t.id} className="bg-surface border border-theme rounded-2xl p-5 hover:border-amber-400/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-black text-primary">{t.name}</h3>
                    <p className="text-xs text-secondary mt-0.5">
                      {t.slots.length} slot{t.slots.length !== 1 ? 's' : ''} · Created {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    disabled={deleting === t.id}
                    className="text-xs text-gray-400 hover:text-red-400 font-semibold transition-colors disabled:opacity-50"
                  >
                    {deleting === t.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {t.slots.map((slot, i) => (
                    <span key={i} className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 px-2.5 py-1 rounded-full font-semibold">
                      {slot.day} {fmtTime(slot.time)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }} className="fixed right-6 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl">
            {toast}
          </div>
        )}
      </main>
    </div>
  )
}
