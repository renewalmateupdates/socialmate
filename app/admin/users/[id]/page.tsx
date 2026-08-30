'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Timeline = { event: string; metadata: Record<string, unknown>; at: string }
type Detail = {
  user: {
    id: string; email: string; created_at: string; last_sign_in_at: string | null
    email_confirmed_at: string | null; provider: string | null
    display_name: string | null; username: string | null
  }
  plan: {
    resolved: string; user_settings_plan: string | null; personal_workspace_plan: string | null
    disagrees: boolean; stripe_customer_id: string | null; stripe_subscription_id: string | null
  }
  activity: Record<string, unknown>
  attribution: Record<string, string | null>
  credits: { monthly: number; earned: number; paid: number }
  accounts: { id: string; platform: string; account_name: string; is_active: boolean; created_at: string }[]
  workspaces: { id: string; name: string; plan: string | null; is_personal: boolean }[]
  posts: {
    total: number; truncated: boolean
    byStatus: Record<string, number>
    byPlatform: Record<string, { published: number; failed: number; scheduled: number }>
    recent: { id: string; status: string; platforms: string[] | null; excerpt: string; scheduled_at: string | null; published_at: string | null; created_at: string }[]
    failures: { id: string; status: string; at: string; errors: unknown }[]
  }
  funnel: { total: number; truncated: boolean; timeline: Timeline[] }
  survey: { question_key: string; answer: string; created_at: string }[]
  warnings: { table: string; message: string }[]
}

const fmt = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'

const PLAN_STYLE: Record<string, string> = {
  free:   'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  pro:    'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  agency: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
}

// The step where everyone stops, so it earns a colour in the timeline.
const EVENT_STYLE = (e: string) =>
  e.startsWith('connect_failed')     ? 'text-red-500'
  : e.startsWith('connect_succeeded') ? 'text-green-600 dark:text-green-400'
  : e.startsWith('connect')           ? 'text-amber-600 dark:text-amber-500'
  : e.startsWith('post_published')    ? 'text-green-600 dark:text-green-400'
  : e.startsWith('checkout') || e.startsWith('upgrade') ? 'text-purple-600 dark:text-purple-400'
  : 'text-gray-500 dark:text-gray-400'

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-theme rounded-2xl p-5">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-theme/50 last:border-0">
      <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-700 dark:text-gray-200 text-right break-all">{value ?? '—'}</span>
    </div>
  )
}

export default function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [data, setData] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`)
        const json = await res.json()
        if (!res.ok) { setError(json.error || 'Failed to load'); return }
        setData(json)
      } catch { setError('Failed to load') }
      finally { setLoading(false) }
    })()
  }, [id])

  if (loading) return <div className="min-h-dvh bg-theme p-8 text-sm text-gray-400">Loading user…</div>
  if (error || !data) return (
    <div className="min-h-dvh bg-theme p-8">
      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{error ?? 'Not found'}</p>
      <Link href="/admin/users" className="text-sm text-gray-400 hover:text-black dark:hover:text-white">← Users</Link>
    </div>
  )

  const { user, plan, activity, attribution, credits, accounts, workspaces, posts, funnel, survey, warnings } = data
  const published = posts.byStatus.published ?? 0

  return (
    <div className="min-h-dvh bg-theme p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 break-all">{user.email}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {user.display_name || user.username || 'No name set'} · joined {fmt(user.created_at)}
            </p>
          </div>
          <button onClick={() => router.push('/admin/users')}
            className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            ← Users
          </button>
        </div>

        {/* A failed query here must never render as a zero. */}
        {warnings.length > 0 && (
          <div className="mb-5 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">
              Some data could not be read. Numbers below are incomplete.
            </p>
            {warnings.map(w => (
              <p key={w.table} className="text-xs text-red-600 dark:text-red-400">{w.table}: {w.message}</p>
            ))}
          </div>
        )}

        {plan.disagrees && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
              Plan disagreement: user_settings says <b>{plan.user_settings_plan}</b>, personal workspace says <b>{plan.personal_workspace_plan}</b>.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              This is the split that left the first paying customer on free limits. Enforcement uses <b>{plan.resolved}</b>.
            </p>
          </div>
        )}

        {/* Headline numbers */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          {[
            { label: 'Plan',      value: plan.resolved, style: PLAN_STYLE[plan.resolved] ?? PLAN_STYLE.free },
            { label: 'Logins',    value: String(activity.login_count ?? 0) },
            { label: 'Platforms', value: String(accounts.length) },
            { label: 'Published', value: String(published) },
            { label: 'Credits',   value: String(credits.monthly + credits.earned + credits.paid) },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-theme rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-lg font-bold ${s.style ? `inline-block px-2 py-0.5 rounded-lg text-sm ${s.style}` : 'text-gray-900 dark:text-gray-100'}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Card title="Account">
            <Row label="User ID"   value={<code className="text-[10px]">{user.id}</code>} />
            <Row label="Provider"  value={user.provider} />
            <Row label="Confirmed" value={fmt(user.email_confirmed_at)} />
            <Row label="Last sign in" value={fmt(user.last_sign_in_at)} />
            <Row label="Last active"  value={fmt(activity.last_active as string)} />
            <Row label="Locale / TZ"  value={`${activity.locale ?? '—'} / ${activity.timezone ?? '—'}`} />
          </Card>

          <Card title="Onboarding">
            <Row label="Completed" value={activity.onboarding_completed ? 'Yes' : 'No'} />
            <Row label="Reached step" value={String(activity.onboarding_step ?? '—')} />
            <Row label="Goal"      value={String(activity.onboarding_goal ?? '—')} />
            <Row label="Streak"    value={`${activity.current_streak ?? 0} (best ${activity.longest_streak ?? 0})`} />
            <Row label="Last post" value={fmt(activity.last_post_date as string)} />
            <Row label="IRIS opt-in" value={activity.iris_opt_in ? 'Yes' : 'No'} />
          </Card>

          <Card title="Attribution">
            <Row label="Source"   value={attribution.source} />
            <Row label="Medium"   value={attribution.medium} />
            <Row label="Campaign" value={attribution.campaign} />
            <Row label="Referrer" value={attribution.referrer} />
            <Row label="Referred by" value={attribution.referred_by} />
          </Card>

          <Card title="Billing & credits">
            <Row label="Resolved plan" value={plan.resolved} />
            <Row label="user_settings.plan" value={plan.user_settings_plan} />
            <Row label="workspace.plan"     value={plan.personal_workspace_plan} />
            <Row label="Stripe customer"     value={plan.stripe_customer_id ? <code className="text-[10px]">{plan.stripe_customer_id}</code> : '—'} />
            <Row label="Subscription"        value={plan.stripe_subscription_id ? <code className="text-[10px]">{plan.stripe_subscription_id}</code> : '—'} />
            <Row label="Credits (m/e/p)"     value={`${credits.monthly} / ${credits.earned} / ${credits.paid}`} />
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Card title={`Connected accounts (${accounts.length})`}>
            {accounts.length === 0 ? (
              <p className="text-xs text-gray-400">Never connected anything.</p>
            ) : accounts.map(a => (
              <div key={a.id} className="flex justify-between gap-3 py-1.5 border-b border-theme/50 last:border-0">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{a.platform}</span>
                <span className="text-xs text-gray-400 text-right truncate">{a.account_name} · {fmt(a.created_at)}</span>
              </div>
            ))}
          </Card>

          <Card title={`Posts (${posts.total}${posts.truncated ? '+, truncated' : ''})`}>
            {posts.total === 0 ? (
              <p className="text-xs text-gray-400">Never created a post.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Object.entries(posts.byStatus).map(([s, n]) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {s}: {n}
                    </span>
                  ))}
                </div>
                {Object.entries(posts.byPlatform).map(([p, st]) => (
                  <Row key={p} label={p} value={`${st.published} pub · ${st.failed} fail · ${st.scheduled} sched`} />
                ))}
              </>
            )}
          </Card>
        </div>

        {posts.failures.length > 0 && (
          <div className="mb-4">
            <Card title={`Publish failures (${posts.failures.length})`}>
              {posts.failures.map(f => (
                <div key={f.id} className="py-2 border-b border-theme/50 last:border-0">
                  <p className="text-xs text-gray-400">{fmt(f.at)} · {f.status}</p>
                  <pre className="text-[10px] text-red-500 whitespace-pre-wrap break-all mt-0.5">
                    {JSON.stringify(f.errors)}
                  </pre>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* The reason this page exists. */}
        <div className="mb-4">
          <Card title={`Funnel timeline (${funnel.total} events${funnel.truncated ? ', truncated' : ''})`}>
            {funnel.total === 0 ? (
              <p className="text-xs text-gray-400">
                No recorded events. Funnel instrumentation only started on Aug 28, 2026, so accounts
                older than that have nothing here even if they were active.
              </p>
            ) : (
              <div className="max-h-[28rem] overflow-y-auto -mx-1 px-1">
                {funnel.timeline.map((e, i) => {
                  const meta = Object.entries(e.metadata).filter(([, v]) => v !== null && v !== '')
                  return (
                    <div key={i} className="flex gap-3 py-1 border-b border-theme/30 last:border-0">
                      <span className="text-[10px] text-gray-400 font-mono flex-shrink-0 w-32">
                        {new Date(e.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className={`text-xs font-semibold ${EVENT_STYLE(e.event)}`}>{e.event}</span>
                      {meta.length > 0 && (
                        <span className="text-[10px] text-gray-400 font-mono truncate">
                          {meta.map(([k, v]) => `${k}=${String(v)}`).join(' ')}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {posts.recent.length > 0 && (
          <div className="mb-4">
            <Card title="Recent posts">
              {posts.recent.map(p => (
                <div key={p.id} className="py-2 border-b border-theme/50 last:border-0">
                  <div className="flex justify-between gap-3">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{p.status}</span>
                    <span className="text-xs text-gray-400">
                      {(p.platforms ?? []).join(', ') || 'no platforms'} · {fmt(p.published_at ?? p.scheduled_at ?? p.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{p.excerpt}</p>
                </div>
              ))}
            </Card>
          </div>
        )}

        {survey.length > 0 && (
          <Card title="Survey responses">
            {survey.map((s, i) => (
              <div key={i} className="py-2 border-b border-theme/50 last:border-0">
                <p className="text-xs text-gray-400">{s.question_key} · {fmt(s.created_at)}</p>
                <p className="text-xs text-gray-700 dark:text-gray-200">{s.answer}</p>
              </div>
            ))}
          </Card>
        )}

        <div className="mt-6">
          <p className="text-xs text-gray-400">
            Workspaces: {workspaces.map(w => `${w.name}${w.is_personal ? ' (personal)' : ''} — ${w.plan ?? 'null'}`).join(' · ') || 'none'}
          </p>
        </div>
      </div>
    </div>
  )
}
