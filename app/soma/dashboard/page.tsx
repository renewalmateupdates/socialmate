'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { setScheduledTime } from '@/lib/post-schedule'
import Sidebar from '@/components/Sidebar'
import SomaCreditPacks from '@/components/SomaCreditPacks'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { useI18n } from '@/contexts/I18nContext'
import type { SomaMode } from '@/lib/soma-mode'
import DashboardView, {
  type DashboardCredits, type DashboardDraft, type DashboardPerformance, type DashboardProject, type LedgerEntry,
} from './DashboardView'
import UpgradeModal from './UpgradeModal'

// Loads the SOMA dashboard's data and handles its actions; DashboardView lays
// it out. The old page's header mode toggle is gone: it wrote
// workspaces.soma_mode, which no generator ever read. Mode is per project,
// changed on each project's row through PATCH /api/soma/projects/[id], which
// enforces the paid mode on the server.

type EngagementRow = { content?: string; bluesky_stats?: any; mastodon_stats?: any; analytics?: any } // eslint-disable-line @typescript-eslint/no-explicit-any

// Manual bluesky_stats/mastodon_stats sync wins when present, otherwise the
// auto-populated analytics snapshot (same merge as /analytics and /evergreen).
function postEngagement(p: EngagementRow): number {
  const autoBsky = p.analytics?.bluesky
  const autoMasto = p.analytics?.mastodon
  const bsky = p.bluesky_stats ?? (autoBsky ? { likes: autoBsky.likes ?? 0, reposts: autoBsky.reposts ?? 0, replies: autoBsky.replies ?? 0 } : null)
  const masto = p.mastodon_stats ?? (autoMasto ? { favourites_count: autoMasto.likes ?? 0, reblogs_count: autoMasto.reposts ?? 0, replies_count: autoMasto.replies ?? 0 } : null)
  return (bsky?.likes ?? 0) + (bsky?.reposts ?? 0) + (bsky?.replies ?? 0)
    + (masto?.favourites_count ?? 0) + (masto?.reblogs_count ?? 0) + (masto?.replies_count ?? 0)
}

export default function SomaDashboardPage() {
  const router = useRouter()
  const { activeWorkspaceId } = useWorkspace()
  const { t } = useI18n()

  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState<DashboardCredits | null>(null)
  const [projects, setProjects] = useState<DashboardProject[]>([])
  const [projectLimit, setProjectLimit] = useState(1)
  const [drafts, setDrafts] = useState<DashboardDraft[]>([])
  const [voiceTier, setVoiceTier] = useState('none')
  const [interviewDone, setInterviewDone] = useState(false)
  const [performance, setPerformance] = useState<DashboardPerformance | null>(null)
  const [ledger, setLedger] = useState<LedgerEntry[] | null>(null)
  const [showLedger, setShowLedger] = useState(false)
  const [showPacks, setShowPacks] = useState(false)
  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const [approvingAll, setApprovingAll] = useState(false)
  const [modeSaving, setModeSaving] = useState<Record<string, boolean>>({})
  const [modeError, setModeError] = useState<Record<string, string>>({})
  const [showUpgrade, setShowUpgrade] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/soma/dashboard'); return }

      const creditsRes = await fetch('/api/soma/credits')
      if (creditsRes.ok) {
        const c = await creditsRes.json()
        // Free plans go to the upgrade page; Pro and Agency always get in
        // (their credits are provisioned on first load).
        if ((c.plan ?? 'free').replace('_annual', '') === 'free') { router.push('/soma/upgrade'); return }
        setCredits(c)
      }

      const [identityRes, voiceRes, projectsRes] = await Promise.all([
        fetch('/api/soma/identity'),
        fetch('/api/soma/voice'),
        fetch('/api/soma/projects'),
      ])
      if (identityRes.ok) setInterviewDone(!!(await identityRes.json()).profile?.interview_completed)
      if (voiceRes.ok) setVoiceTier((await voiceRes.json()).personality_tier ?? 'none')
      if (projectsRes.ok) {
        const pd = await projectsRes.json()
        setProjects(pd.projects ?? [])
        setProjectLimit(pd.limit ?? 1)
      }

      const [{ data: draftRows, error: draftErr }, { data: published, error: pubErr }] = await Promise.all([
        supabase.from('posts')
          .select('id, content, platforms, scheduled_at, metadata')
          .eq('user_id', user.id)
          .eq('status', 'draft')
          .order('scheduled_at', { ascending: true, nullsFirst: false }),
        supabase.from('posts')
          .select('id, content, metadata, bluesky_stats, mastodon_stats, analytics')
          .eq('user_id', user.id)
          .eq('status', 'published'),
      ])
      if (draftErr) console.warn('[soma] drafts load failed:', draftErr.message)
      if (pubErr) console.warn('[soma] published load failed:', pubErr.message)

      setDrafts((draftRows ?? []).filter(r => (r.metadata as { source?: string } | null)?.source === 'soma') as DashboardDraft[])

      const somaPublished = (published ?? []).filter(r => (r.metadata as { source?: string } | null)?.source === 'soma')
      if (somaPublished.length) {
        let engagement = 0
        let topPost: DashboardPerformance['topPost'] = null
        for (const row of somaPublished) {
          const e = postEngagement(row)
          engagement += e
          if (e > 0 && (!topPost || e > topPost.engagement)) topPost = { content: row.content ?? '', engagement: e }
        }
        setPerformance({ publishedCount: somaPublished.length, engagement, topPost })
      }
    } catch (err) {
      console.error('SOMA dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { load() }, [load])

  const onModeChange = async (projectId: string, mode: SomaMode) => {
    setModeError(e => ({ ...e, [projectId]: '' }))
    if ((mode === 'autopilot' && !credits?.autopilot_enabled) || (mode === 'full_send' && !credits?.full_send_enabled)) {
      setShowUpgrade(true)
      return
    }
    setModeSaving(s => ({ ...s, [projectId]: true }))
    try {
      const res = await fetch(`/api/soma/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      })
      if (res.status === 403) { setShowUpgrade(true); return }
      if (!res.ok) { setModeError(e => ({ ...e, [projectId]: t('app_soma_dashboard.mode_change_failed') })); return }
      setProjects(ps => ps.map(pr => (pr.id === projectId ? { ...pr, mode } : pr)))
    } catch {
      setModeError(e => ({ ...e, [projectId]: t('app_soma_dashboard.mode_change_failed') }))
    } finally {
      setModeSaving(s => ({ ...s, [projectId]: false }))
    }
  }

  const onApprove = async (id: string) => {
    setBusy(b => ({ ...b, [id]: true }))
    const at = drafts.find(d => d.id === id)?.scheduled_at ?? new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const { error } = await supabase.from('posts').update({ status: 'scheduled', scheduled_at: at }).eq('id', id)
    if (error) {
      console.warn('[soma] approve failed:', error.message)
    } else {
      // Queue the wake-up too; the backstop sweep only runs every few hours.
      await setScheduledTime(id, at)
      setDrafts(ds => ds.filter(d => d.id !== id))
    }
    setBusy(b => ({ ...b, [id]: false }))
  }

  const onApproveAll = async () => {
    if (!drafts.length) return
    setApprovingAll(true)
    const fallback = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const failed = new Set<string>()
    await Promise.all(drafts.map(async d => {
      const at = d.scheduled_at ?? fallback
      const { error } = await supabase.from('posts').update({ status: 'scheduled', scheduled_at: at }).eq('id', d.id)
      if (error) { console.warn('[soma] approve failed for', d.id, error.message); failed.add(d.id); return }
      await setScheduledTime(d.id, at)
    }))
    setDrafts(ds => ds.filter(d => failed.has(d.id)))
    setApprovingAll(false)
  }

  // Discarding deletes the draft, which frees its slot for the next run to
  // refill. The old Skip rewrote the draft's metadata instead, so it came back
  // on the next load and kept its slot forever.
  const onDiscard = async (id: string) => {
    if (!window.confirm(t('app_soma_dashboard.discard_confirm'))) return
    setBusy(b => ({ ...b, [id]: true }))
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) console.warn('[soma] discard failed:', error.message)
    else setDrafts(ds => ds.filter(d => d.id !== id))
    setBusy(b => ({ ...b, [id]: false }))
  }

  const onToggleLedger = async () => {
    const opening = !showLedger
    setShowLedger(opening)
    if (opening && ledger === null) {
      const res = await fetch('/api/soma/credit-history')
      setLedger(res.ok ? ((await res.json()).entries ?? []) : [])
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          autopilotEnabled={credits?.autopilot_enabled ?? false}
          fullSendEnabled={credits?.full_send_enabled ?? false}
        />
      )}
      <main className="flex-1 md:ml-56 p-4 sm:p-6 lg:p-8">
        <DashboardView
          loading={loading}
          now={new Date()}
          credits={credits}
          projects={projects}
          projectLimit={projectLimit}
          drafts={drafts}
          voiceTier={voiceTier}
          interviewDone={interviewDone}
          performance={performance}
          ledger={ledger}
          showLedger={showLedger}
          showPacks={showPacks}
          packs={<SomaCreditPacks workspaceId={activeWorkspaceId} />}
          busy={busy}
          approvingAll={approvingAll}
          modeSaving={modeSaving}
          modeError={modeError}
          onApprove={onApprove}
          onApproveAll={onApproveAll}
          onDiscard={onDiscard}
          onModeChange={onModeChange}
          onToggleLedger={onToggleLedger}
          onTogglePacks={() => setShowPacks(s => !s)}
        />
      </main>
    </div>
  )
}
