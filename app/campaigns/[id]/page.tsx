'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Toast from '@/components/Toast'
import { ArrowLeft, Pause, Play, Square } from 'lucide-react'
import { PLATFORM_NAMES, scheduleSummary, StatusPill } from '../shared'

type Message = { text: string; variants?: string[]; image_url?: string | null }
type Campaign = {
  id: string
  name: string
  status: 'active' | 'paused' | 'ended'
  platforms: string[]
  days: number[]
  times: string[]
  timezone: string
  start_date: string
  end_date: string
  messages: Message[]
  reworded: boolean
  last_note: string | null
}
type UpcomingPost = { id: string; content: string; scheduled_at: string; media_urls: string[] | null }
type SentPost = { id: string; content: string; status: string; scheduled_at: string; published_at: string | null }

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

const SENT_LABEL: Record<string, string> = { published: 'Posted', partial: 'Posted to some', failed: 'Failed' }

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [upcoming, setUpcoming] = useState<UpcomingPost[]>([])
  const [sent,     setSent]     = useState<SentPost[]>([])
  const [loading,  setLoading]  = useState(true)
  const [missing,  setMissing]  = useState(false)
  const [busy,     setBusy]     = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [openMsg,  setOpenMsg]  = useState<number | null>(null)
  const [toast,    setToast]    = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/campaigns/${id}`)
    if (res.status === 404) { setMissing(true); setLoading(false); return }
    const d = await res.json().catch(() => ({}))
    if (res.ok) {
      setCampaign(d.campaign)
      setUpcoming(d.upcoming ?? [])
      setSent(d.sent ?? [])
    }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  function flash(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function act(action: 'pause' | 'resume' | 'end') {
    setBusy(true)
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { flash(d.error || 'That did not work. Try again.', 'error'); return }
      if (action === 'pause')  flash(d.removed ? `Paused. ${d.removed} upcoming post${d.removed === 1 ? '' : 's'} removed.` : 'Paused.')
      if (action === 'end')    flash('Campaign ended.')
      if (action === 'resume') flash(d.created ? `Running again. ${d.created} post${d.created === 1 ? '' : 's'} added for the next week.` : 'Running again.')
      setConfirmEnd(false)
      await load()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-theme">
      <Sidebar />
      <main className="md:ml-56 flex-1 p-6 md:p-10">
       <div className="max-w-3xl mx-auto">
        <Link href="/campaigns" className="inline-flex items-center gap-1 text-sm text-muted hover:text-theme mb-6">
          <ArrowLeft className="w-4 h-4" /> Campaigns
        </Link>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : missing || !campaign ? (
          <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
            <p className="font-bold text-theme mb-1">Campaign not found</p>
            <p className="text-sm text-muted">It may have been made from another account.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-surface border border-theme rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl font-black text-theme">{campaign.name}</h1>
                  <p className="text-sm text-muted mt-1">{scheduleSummary(campaign)}</p>
                  <p className="text-sm text-muted">{campaign.platforms.map(p => PLATFORM_NAMES[p] ?? p).join(', ')} · {campaign.timezone.replace(/_/g, ' ')}</p>
                </div>
                <StatusPill status={campaign.status} />
              </div>
              {campaign.last_note && <p className="text-sm text-amber-600 dark:text-amber-400 mt-3">{campaign.last_note}</p>}

              {campaign.status !== 'ended' && (
                <div className="flex flex-wrap items-center gap-2 mt-5">
                  {campaign.status === 'active' ? (
                    <button onClick={() => act('pause')} disabled={busy}
                      className="inline-flex items-center gap-1.5 border border-theme hover:border-amber-400 text-theme font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50">
                      <Pause className="w-4 h-4" /> Pause
                    </button>
                  ) : (
                    <button onClick={() => act('resume')} disabled={busy}
                      className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-black font-black px-4 py-2 rounded-xl text-sm disabled:opacity-50">
                      <Play className="w-4 h-4" /> Resume
                    </button>
                  )}
                  {confirmEnd ? (
                    <>
                      <span className="text-sm text-theme">End it and remove the posts that have not gone out?</span>
                      <button onClick={() => act('end')} disabled={busy}
                        className="bg-red-500 hover:bg-red-400 text-white font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50">
                        Yes, end it
                      </button>
                      <button onClick={() => setConfirmEnd(false)} className="text-sm text-muted hover:text-theme px-2">Keep it</button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmEnd(true)} disabled={busy}
                      className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-red-500 font-semibold px-3 py-2">
                      <Square className="w-4 h-4" /> End campaign
                    </button>
                  )}
                </div>
              )}
              {campaign.status === 'paused' && (
                <p className="text-xs text-muted mt-3">Paused campaigns post nothing. Resume picks up from now; times that passed while paused are skipped.</p>
              )}
            </div>

            {/* Upcoming */}
            <section className="bg-surface border border-theme rounded-2xl p-6">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-black text-theme">Next up</h2>
                {upcoming.length > 0 && <Link href="/queue" className="text-xs font-bold text-amber-500 hover:text-amber-400">Edit in Queue</Link>}
              </div>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted">
                  {campaign.status === 'active'
                    ? 'Nothing in the next week. Posts are added a week ahead, every morning.'
                    : 'Nothing is scheduled while the campaign is not running.'}
                </p>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {upcoming.map(p => (
                    <li key={p.id} className="py-3 flex gap-3">
                      <span className="w-36 flex-shrink-0 text-xs font-bold text-theme pt-0.5">{when(p.scheduled_at)}</span>
                      <span className="flex-1 min-w-0 text-sm text-muted whitespace-pre-line line-clamp-3">{p.content}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted mt-3">Deleting one of these in Queue skips just that time. The campaign keeps going.</p>
            </section>

            {/* Messages */}
            <section className="bg-surface border border-theme rounded-2xl p-6">
              <h2 className="font-black text-theme mb-1">Messages</h2>
              <p className="text-xs text-muted mb-3">
                {campaign.reworded ? 'Each message goes out as written first, then in its AI versions as the list comes round again.' : 'They take turns in this order.'}
              </p>
              <ol className="space-y-3">
                {campaign.messages.map((m, i) => (
                  <li key={i} className="rounded-xl border border-theme p-3">
                    <div className="flex gap-3">
                      {m.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <p className="flex-1 min-w-0 text-sm text-theme whitespace-pre-line">{m.text}</p>
                    </div>
                    {(m.variants?.length ?? 0) > 0 && (
                      <div className="mt-2">
                        <button onClick={() => setOpenMsg(openMsg === i ? null : i)} className="text-xs font-bold text-amber-500 hover:text-amber-400">
                          {openMsg === i ? 'Hide versions' : `Show ${m.variants!.length} versions`}
                        </button>
                        {openMsg === i && (
                          <ul className="mt-2 space-y-2">
                            {m.variants!.map((v, j) => (
                              <li key={j} className="text-sm text-muted whitespace-pre-line border-l-2 border-amber-400/50 pl-3">{v}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            {/* Sent */}
            {sent.length > 0 && (
              <section className="bg-surface border border-theme rounded-2xl p-6">
                <h2 className="font-black text-theme mb-3">Already sent</h2>
                <ul className="divide-y divide-[var(--border)]">
                  {sent.map(p => (
                    <li key={p.id} className="py-3 flex gap-3">
                      <span className="w-36 flex-shrink-0 text-xs text-muted pt-0.5">{when(p.published_at ?? p.scheduled_at)}</span>
                      <span className="flex-1 min-w-0 text-sm text-muted line-clamp-2">{p.content}</span>
                      <span className={`flex-shrink-0 text-xs font-bold ${p.status === 'failed' ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {SENT_LABEL[p.status] ?? p.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
       </div>
      </main>
      <Toast message={toast?.message ?? ''} type={toast?.type} />
    </div>
  )
}
