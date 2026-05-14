'use client'
import { useState } from 'react'

interface Dispatch {
  id: string
  edition: number
  subject: string
  recipient_count: number
  sent_at: string
}

interface Props {
  recipientCount: number
  dispatches: Dispatch[]
  nextEdition: number
}

export default function IrisClient({ recipientCount, dispatches, nextEdition }: Props) {
  const [subject, setSubject]         = useState('')
  const [intro, setIntro]             = useState('')
  const [whatShipped, setWhatShipped] = useState('')
  const [realNumbers, setRealNumbers] = useState('')
  const [whatsNext, setWhatsNext]     = useState('')
  const [closing, setClosing]         = useState('Until next time,\n— Joshua')

  const [preview, setPreview]         = useState<string | null>(null)
  const [previewing, setPreviewing]   = useState(false)
  const [sending, setSending]         = useState(false)
  const [sent, setSent]               = useState<{ edition: number; count: number } | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const [confirm, setConfirm]         = useState(false)

  const payload = { subject, intro, whatShipped, realNumbers, whatsNext, closing }

  async function handlePreview() {
    if (!subject.trim() || !intro.trim()) { setError('Subject and intro are required'); return }
    setError(null)
    setPreviewing(true)
    try {
      const res = await fetch('/api/admin/iris/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, preview: true }),
      })
      const json = await res.json()
      if (json.html) { setPreview(json.html) }
      else { setError(json.error ?? 'Preview failed') }
    } catch { setError('Preview request failed') }
    finally { setPreviewing(false) }
  }

  async function handleSend() {
    if (!subject.trim() || !intro.trim()) { setError('Subject and intro are required'); return }
    setError(null)
    setSending(true)
    try {
      const res = await fetch('/api/admin/iris/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.ok) {
        setSent({ edition: json.edition, count: json.sent })
        setSubject(''); setIntro(''); setWhatShipped(''); setRealNumbers(''); setWhatsNext('')
        setClosing('Until next time,\n— Joshua')
        setPreview(null)
      } else {
        setError(json.error ?? 'Send failed')
      }
    } catch { setError('Send request failed') }
    finally { setSending(false); setConfirm(false) }
  }

  const SECTION_CLASS = 'bg-surface border border-theme rounded-2xl p-6 mb-5'
  const LABEL_CLASS   = 'text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2'
  const TA_CLASS      = 'w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:border-amber-400 transition-all resize-none'

  return (
    <div className="min-h-dvh bg-theme p-6 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-black text-lg">I</div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">THE IRIS DISPATCH</h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold tracking-widest uppercase">Build-in-public newsletter</p>
              </div>
            </div>
          </div>
          <a href="/admin" className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">← Admin</a>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <div className="text-3xl font-black text-amber-500 mb-1">{recipientCount}</div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Opted-in</div>
            <div className="text-xs text-gray-400">will receive this</div>
          </div>
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <div className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-1">#{nextEdition}</div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Next edition</div>
            <div className="text-xs text-gray-400">edition number</div>
          </div>
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <div className="text-3xl font-black text-emerald-500 mb-1">{dispatches.length}</div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sent total</div>
            <div className="text-xs text-gray-400">all time</div>
          </div>
        </div>

        {/* Success banner */}
        {sent && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-emerald-800 dark:text-emerald-300">Edition #{sent.edition} sent to {sent.count} subscribers.</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">IRIS Dispatch is out in the world. 🌈</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-5 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Compose form */}
        <div className={SECTION_CLASS}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-6 bg-amber-500 rounded-full" />
            <h2 className="font-bold text-gray-900 dark:text-gray-100">Compose Edition #{nextEdition}</h2>
          </div>

          <div className="mb-4">
            <label className={LABEL_CLASS}>Subject line</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="IRIS #1 — We shipped X, hit Y users, and what's coming next"
              className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:border-amber-400 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className={LABEL_CLASS}>🖊 Intro — personal, from you</label>
            <textarea
              value={intro}
              onChange={e => setIntro(e.target.value)}
              rows={4}
              placeholder="Hey — it's been a wild two weeks. Here's what's going on with SocialMate..."
              className={TA_CLASS}
            />
          </div>

          <div className="mb-4">
            <label className={LABEL_CLASS}>🔨 What shipped</label>
            <textarea
              value={whatShipped}
              onChange={e => setWhatShipped(e.target.value)}
              rows={5}
              placeholder="• IRIS newsletter — this one! biweekly build-in-public dispatch&#10;• SOMA Voice DNA — 40-question interview, AI now sounds like me&#10;• 62 new blog posts for SEO..."
              className={TA_CLASS}
            />
          </div>

          <div className="mb-4">
            <label className={LABEL_CLASS}>📊 Real numbers</label>
            <textarea
              value={realNumbers}
              onChange={e => setRealNumbers(e.target.value)}
              rows={4}
              placeholder="• 28 total users (7 this week)&#10;• 0 revenue — still bootstrapping&#10;• 245 posts scheduled by users this month..."
              className={TA_CLASS}
            />
          </div>

          <div className="mb-4">
            <label className={LABEL_CLASS}>🚀 What's next</label>
            <textarea
              value={whatsNext}
              onChange={e => setWhatsNext(e.target.value)}
              rows={4}
              placeholder="• Need 12 more Google Play testers to unlock production&#10;• Working on LinkedIn API access&#10;• First SOMA content run with Voice DNA active..."
              className={TA_CLASS}
            />
          </div>

          <div className="mb-6">
            <label className={LABEL_CLASS}>✍️ Closing</label>
            <textarea
              value={closing}
              onChange={e => setClosing(e.target.value)}
              rows={3}
              className={TA_CLASS}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePreview}
              disabled={previewing}
              className="flex-1 py-3 border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400 text-sm font-bold rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all disabled:opacity-50">
              {previewing ? 'Generating…' : '👁 Preview Email'}
            </button>
            <button
              onClick={() => { if (!subject.trim() || !intro.trim()) { setError('Subject and intro are required'); return } setConfirm(true) }}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-2xl transition-all disabled:opacity-50">
              📬 Send to {recipientCount} subscribers
            </button>
          </div>
        </div>

        {/* Preview panel */}
        {preview && (
          <div className={SECTION_CLASS}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-gray-100">Email Preview</h2>
              <button onClick={() => setPreview(null)} className="text-xs text-gray-400 hover:text-black dark:hover:text-white">✕ Close</button>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50">
              <iframe
                srcDoc={preview}
                className="w-full"
                style={{ height: '700px', border: 'none' }}
                title="IRIS email preview"
              />
            </div>
          </div>
        )}

        {/* Send history */}
        {dispatches.length > 0 && (
          <div className={SECTION_CLASS}>
            <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Send History</h2>
            <div className="space-y-2">
              {dispatches.map(d => (
                <div key={d.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <span className="text-xs font-black text-amber-500 mr-2">#{d.edition}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{d.subject}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-xs font-semibold text-gray-500">{d.recipient_count} sent</div>
                    <div className="text-xs text-gray-400">{new Date(d.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Confirm send modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-4xl mb-4 text-center">📬</div>
            <h2 className="text-xl font-black text-center mb-2">Send Edition #{nextEdition}?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              This will email <strong>{recipientCount} subscribers</strong> with subject:<br />
              <span className="text-gray-900 dark:text-gray-100 font-semibold">"{subject}"</span>
            </p>
            <p className="text-xs text-gray-400 text-center mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all">
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-2xl transition-all disabled:opacity-50">
                {sending ? 'Sending…' : 'Send it 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
