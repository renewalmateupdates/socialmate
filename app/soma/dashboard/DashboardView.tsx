'use client'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, Globe, Pause } from 'lucide-react'
import PlatformIcon, { hasPlatformIcon } from '@/components/landing/PlatformIcon'
import { useI18n } from '@/contexts/I18nContext'
import { SOMA_COSTS } from '@/lib/soma-costs'
import { effectiveSomaMode, type SomaMode } from '@/lib/soma-mode'
import { runCapForMode, runsThisMonth } from '@/lib/soma-runs'
import { nextScheduledRun } from '@/lib/soma-schedule'
import { pickNextStep, type NextStepProject } from './next-step'

// The SOMA dashboard, as props in and events out. page.tsx loads the data and
// owns the writes; this only lays it out, top to bottom: what SOMA is doing,
// the one thing to do next, the projects (each with its own mode), drafts
// waiting for review, voice and results, and credits last.

export interface DashboardProject {
  id: string
  name: string
  platforms: string[]
  mode: SomaMode
  paused?: boolean | null
  runs_this_month: number | null
  last_generated_at: string | null
  last_doc: { version: number; created_at: string } | null
  auto_collect_url?: string | null
  upcoming_posts: number
}

export interface DashboardCredits {
  monthly: number
  used: number
  purchased: number
  autopilot_enabled: boolean
  full_send_enabled: boolean
}

export interface DashboardDraft {
  id: string
  content: string
  platforms: string[]
  scheduled_at: string | null
  metadata: { soma_project_id?: string } | null
}

export interface DashboardPerformance {
  publishedCount: number
  engagement: number
  topPost: { content: string; engagement: number } | null
}

export interface LedgerEntry {
  id: string
  action_type: string
  credits_used: number
  balance_after: number
  created_at: string
}

export interface DashboardViewProps {
  loading: boolean
  now: Date
  credits: DashboardCredits | null
  projects: DashboardProject[]
  projectLimit: number
  drafts: DashboardDraft[]
  voiceTier: string
  interviewDone: boolean
  performance: DashboardPerformance | null
  ledger: LedgerEntry[] | null
  showLedger: boolean
  showPacks: boolean
  packs: ReactNode
  busy: Record<string, boolean>
  approvingAll: boolean
  modeSaving: Record<string, boolean>
  modeError: Record<string, string>
  onApprove: (id: string) => void
  onApproveAll: () => void
  onDiscard: (id: string) => void
  onModeChange: (projectId: string, mode: SomaMode) => void
  onToggleLedger: () => void
  onTogglePacks: () => void
}

function Glyph({ id }: { id: string }) {
  if (!hasPlatformIcon(id)) return <Globe size={14} className="text-gray-400" strokeWidth={1.75} />
  return <PlatformIcon name={id} size={14} className="text-gray-300" />
}

// 44px tall on phones (touch target), compact from sm up.
const btn = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 min-h-11 sm:min-h-0 text-xs font-semibold transition-colors disabled:opacity-60'
const btnPrimary = `${btn} bg-amber-500 hover:bg-amber-400 text-gray-950`
const btnQuiet = `${btn} border border-gray-700 text-gray-200 hover:bg-gray-800`
const textLink = 'inline-flex items-center min-h-11 sm:min-h-0 text-amber-400 hover:text-amber-300'

export default function DashboardView(p: DashboardViewProps) {
  const { t } = useI18n()
  const addons = { soma_autopilot_enabled: p.credits?.autopilot_enabled, soma_full_send_enabled: p.credits?.full_send_enabled }
  const projects = p.projects.map(pr => ({ ...pr, effectiveMode: effectiveSomaMode(pr.mode, addons) }))
  const active = projects.filter(pr => !pr.paused)
  const dateShort = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  // ── Status line ──
  const nextRun = nextScheduledRun(p.now, {
    weekly: active.some(pr => pr.effectiveMode !== 'safe'),
    daily:  active.some(pr => pr.effectiveMode === 'full_send'),
  })
  const when = nextRun?.toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' }) ?? ''
  const status = [
    projects.length === 1 ? t('app_soma_dashboard.status_one_project') : t('app_soma_dashboard.status_projects', { n: projects.length }),
    nextRun ? t('app_soma_dashboard.status_next_run', { when }) : t('app_soma_dashboard.status_manual'),
  ].join(' · ')

  // ── Next step ──
  const hasVoice = p.voiceTier !== 'none' || p.interviewDone
  const step = pickNextStep({ projects: projects as NextStepProject[], draftCount: p.drafts.length, hasVoice })
  const stepView = (() => {
    switch (step.kind) {
      case 'create_project': return { title: t('app_soma_dashboard.step_create_title'), body: t('app_soma_dashboard.step_create_body'), cta: t('app_soma_dashboard.step_create_cta'), href: '/soma/projects/new' }
      case 'add_doc':        return { title: t('app_soma_dashboard.step_doc_title', { name: step.project.name }), body: t('app_soma_dashboard.step_doc_body'), cta: t('app_soma_dashboard.step_doc_cta'), href: `/soma/projects/${step.project.id}` }
      case 'review':         return { title: t('app_soma_dashboard.step_review_title', { n: step.count }), body: t('app_soma_dashboard.step_review_body'), cta: t('app_soma_dashboard.step_review_cta'), href: '#review' }
      case 'voice':          return { title: t('app_soma_dashboard.step_voice_title'), body: t('app_soma_dashboard.step_voice_body'), cta: t('app_soma_dashboard.step_voice_cta'), href: '/soma/voice' }
      case 'generate':       return { title: t('app_soma_dashboard.step_generate_title', { name: step.project.name }), body: t('app_soma_dashboard.step_generate_body', { cost: SOMA_COSTS.generate_week }), cta: t('app_soma_dashboard.step_generate_cta'), href: `/soma/projects/${step.project.id}` }
      case 'done':           return { title: t('app_soma_dashboard.step_done_title'), body: step.automated && nextRun ? t('app_soma_dashboard.step_done_auto', { when }) : t('app_soma_dashboard.step_done_safe'), cta: null, href: null }
    }
  })()

  // ── Credits ──
  const monthlyLeft = p.credits ? Math.max(0, p.credits.monthly - p.credits.used) : 0
  const resets = new Date(p.now.getFullYear(), p.now.getMonth() + 1, 1).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const ledgerLabel = (a: string) => {
    const known = ['generate_week', 'autopilot_run', 'full_send_run', 'ingest_weekly', 'identity_update']
    return known.includes(a) ? t(`app_soma_dashboard.ledger_${a}`) : a.replace(/_/g, ' ')
  }

  const projectName = (id?: string) => projects.find(pr => pr.id === id)?.name

  if (p.loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6" aria-busy="true">
        <div className="h-8 w-64 rounded bg-gray-800 animate-pulse" />
        <div className="h-28 rounded-2xl bg-gray-900 animate-pulse" />
        <div className="h-40 rounded-2xl bg-gray-900 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-bold text-white">{t('app_soma_dashboard.title')}</h1>
        <p className="text-sm text-gray-400">{status}</p>
      </header>

      <section className="rounded-2xl border-2 border-amber-500/50 bg-gray-900 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1">{t('app_soma_dashboard.next_step')}</p>
          <h2 className="text-base font-semibold text-white">{stepView.title}</h2>
          <p className="text-sm text-gray-400 mt-1">{stepView.body}</p>
        </div>
        {stepView.cta && stepView.href && (
          <Link href={stepView.href} className={`${btnPrimary} px-4 py-2.5 text-sm self-start sm:self-auto`}>
            {stepView.cta} <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-300">{t('app_soma_dashboard.projects_heading')}</h2>
          {projects.length > 0 && projects.length < p.projectLimit && (
            <Link href="/soma/projects/new" className={`${textLink} text-xs font-semibold`}>{t('app_soma_dashboard.new_project')}</Link>
          )}
        </div>
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 text-sm text-gray-400">{t('app_soma_dashboard.no_projects_sub')}</div>
        ) : (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 divide-y divide-gray-800">
            {projects.map(pr => {
              const cap = runCapForMode(pr.effectiveMode)
              const used = runsThisMonth(pr, p.now)
              const doc = pr.last_doc
                ? t('app_soma_dashboard.doc_version', { v: pr.last_doc.version, date: dateShort(pr.last_doc.created_at) })
                : pr.auto_collect_url ? t('app_soma_dashboard.doc_link') : t('app_soma_dashboard.doc_none')
              return (
                <div key={pr.id} className="p-4 grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_auto_minmax(0,1.6fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate flex items-center gap-2">
                      {pr.name}
                      {pr.paused && <span className="inline-flex items-center gap-1 rounded bg-gray-800 px-1.5 py-0.5 text-[11px] font-medium text-gray-400"><Pause className="w-3 h-3" strokeWidth={2} />{t('app_soma_dashboard.paused')}</span>}
                    </p>
                    <p className={`text-xs mt-0.5 ${pr.last_doc || pr.auto_collect_url ? 'text-gray-500' : 'text-amber-400'}`}>{doc}</p>
                  </div>
                  <div>
                    <label className="sr-only" htmlFor={`mode-${pr.id}`}>{t('app_soma_dashboard.mode_label')}</label>
                    <select
                      id={`mode-${pr.id}`}
                      value={pr.mode}
                      disabled={!!p.modeSaving[pr.id]}
                      onChange={e => p.onModeChange(pr.id, e.target.value as SomaMode)}
                      className="rounded-lg border border-gray-700 bg-gray-950 px-2.5 py-1.5 min-h-11 sm:min-h-0 text-xs font-medium text-gray-100 focus:outline-none focus:border-amber-500/60 disabled:opacity-60"
                    >
                      <option value="safe">{t('app_soma_dashboard.mode_safe')}</option>
                      <option value="autopilot">{t('app_soma_dashboard.mode_autopilot')}{p.credits?.autopilot_enabled ? '' : ` · ${t('app_soma_dashboard.mode_locked', { price: '$10' })}`}</option>
                      <option value="full_send">{t('app_soma_dashboard.mode_full_send')}{p.credits?.full_send_enabled ? '' : ` · ${t('app_soma_dashboard.mode_locked', { price: '$20' })}`}</option>
                    </select>
                    {pr.effectiveMode !== pr.mode && (
                      <p className="text-[11px] text-amber-400 mt-1">{t('app_soma_dashboard.mode_runs_as', { mode: t(`app_soma_dashboard.mode_${pr.effectiveMode}`) })}</p>
                    )}
                    {p.modeError[pr.id] && <p className="text-[11px] text-red-400 mt-1">{p.modeError[pr.id]}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1.5">{pr.platforms.map(pl => <Glyph key={pl} id={pl} />)}</span>
                    <span>{t('app_soma_dashboard.posts_next_week', { n: pr.upcoming_posts })}</span>
                    <span>{t('app_soma_dashboard.runs_used', { used, cap })}</span>
                  </div>
                  <Link href={`/soma/projects/${pr.id}`} className={`${btnQuiet} justify-self-start sm:justify-self-end`}>{t('app_soma_dashboard.open_project')}</Link>
                </div>
              )
            })}
          </div>
        )}
        {projects.length > 0 && projects.length >= p.projectLimit && (
          <p className="text-xs text-gray-500 mt-2">
            {p.projectLimit} {t('app_soma_dashboard.project_limit')}{' '}
            <Link href="/pricing" className="text-amber-400 hover:text-amber-300">{t('app_soma_dashboard.upgrade_more')}</Link>
          </p>
        )}
      </section>

      {p.drafts.length > 0 && (
        <section id="review" className="scroll-mt-6">
          <div className="flex items-center justify-between mb-2 gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-300">{t('app_soma_dashboard.review_heading')}</h2>
              <p className="text-xs text-gray-500">{t('app_soma_dashboard.review_sub')}</p>
            </div>
            <button onClick={p.onApproveAll} disabled={p.approvingAll} className={btnQuiet}>
              {p.approvingAll ? t('app_soma_dashboard.approving') : `${t('app_soma_dashboard.approve_all')} (${p.drafts.length})`}
            </button>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-900 divide-y divide-gray-800">
            {p.drafts.map(d => (
              <div key={d.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1">
                    <span>{d.scheduled_at ? new Date(d.scheduled_at).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : t('app_soma_dashboard.unscheduled')}</span>
                    <span className="inline-flex items-center gap-1">{(d.platforms ?? []).map(pl => <Glyph key={pl} id={pl} />)}</span>
                    {projectName(d.metadata?.soma_project_id) && <span className="text-gray-400">{projectName(d.metadata?.soma_project_id)}</span>}
                  </p>
                  <p className="text-sm text-gray-200 leading-relaxed line-clamp-3">{d.content}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => p.onApprove(d.id)} disabled={!!p.busy[d.id]} className={btnPrimary}>{t('app_soma_dashboard.approve')}</button>
                  <Link href={`/compose?edit=${d.id}`} className={btnQuiet}>{t('app_soma_dashboard.edit')}</Link>
                  <button onClick={() => p.onDiscard(d.id)} disabled={!!p.busy[d.id]} className={`${btn} text-gray-400 hover:text-red-300 hover:bg-gray-800`}>{t('app_soma_dashboard.discard')}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-xs text-gray-500 mb-1">{t('app_soma_dashboard.voice_heading')}</p>
          <p className="text-sm font-semibold text-white">
            {p.voiceTier !== 'none'
              ? t('app_soma_dashboard.voice_dna_active', { tier: p.voiceTier.charAt(0).toUpperCase() + p.voiceTier.slice(1).replace('_', ' ') })
              : p.interviewDone ? t('app_soma_dashboard.voice_profile_set') : t('app_soma_dashboard.voice_none')}
          </p>
          <p className="text-xs text-gray-500 mt-1">{t('app_soma_dashboard.voice_shared')}</p>
          <Link href="/soma/voice" className={`${textLink} mt-2 text-xs font-semibold`}>
            {hasVoice ? t('app_soma_dashboard.voice_edit') : t('app_soma_dashboard.voice_start')}
          </Link>
        </section>
        <section className="rounded-2xl bg-gray-900 border border-gray-800 p-5">
          <p className="text-xs text-gray-500 mb-1">{t('app_soma_dashboard.perf_heading')}</p>
          {p.performance ? (
            <>
              <p className="text-sm font-semibold text-white">{t('app_soma_dashboard.perf_summary', { posts: p.performance.publishedCount.toLocaleString(), engagement: p.performance.engagement.toLocaleString() })}</p>
              {p.performance.topPost && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-2"><span className="text-gray-500">{t('app_soma_dashboard.perf_top')}: </span>{p.performance.topPost.content}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">{t('app_soma_dashboard.perf_none')}</p>
          )}
        </section>
      </div>

      <footer className="border-t border-gray-800 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-400">
          <p>
            {t('app_soma_dashboard.credits_left', { left: monthlyLeft.toLocaleString(), monthly: (p.credits?.monthly ?? 0).toLocaleString() })}
            {' · '}{t('app_soma_dashboard.credits_resets', { date: resets })}
            {(p.credits?.purchased ?? 0) > 0 && <> {' · '}{t('app_soma_dashboard.credits_purchased', { n: p.credits!.purchased.toLocaleString() })}</>}
          </p>
          <div className="flex gap-4">
            <button onClick={p.onToggleLedger} className={textLink}>{p.showLedger ? t('app_soma_dashboard.credits_hide') : t('app_soma_dashboard.credits_history')}</button>
            <button onClick={p.onTogglePacks} className={textLink}>{p.showPacks ? t('app_soma_dashboard.credits_hide') : t('app_soma_dashboard.credits_buy')}</button>
          </div>
        </div>
        {p.showLedger && (
          <div className="mt-3 rounded-xl border border-gray-800 bg-gray-900 divide-y divide-gray-800 text-xs">
            {p.ledger === null ? (
              <p className="p-3 text-gray-500">…</p>
            ) : p.ledger.length === 0 ? (
              <p className="p-3 text-gray-500">{t('app_soma_dashboard.no_credit_activity')}</p>
            ) : p.ledger.map(e => (
              <div key={e.id} className="p-3 flex items-center justify-between gap-3">
                <span className="text-gray-300">{ledgerLabel(e.action_type)} <span className="text-gray-600">{new Date(e.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></span>
                <span className="text-gray-500"><span className="text-gray-300">−{e.credits_used}</span> · {e.balance_after}</span>
              </div>
            ))}
          </div>
        )}
        {p.showPacks && <div className="mt-3 rounded-xl border border-gray-800 bg-gray-900 p-4">{p.packs}</div>}
      </footer>
    </div>
  )
}
