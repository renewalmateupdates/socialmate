export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import { resolveWorkspacePlan } from '@/lib/plan'

/**
 * Everything known about one user, in one response.
 *
 * This exists because diagnosing a single account previously meant running
 * Python against the production database by hand. That is how the three Aug 29
 * signups were found to have all reached the connect step and none of them
 * connected anything, and how the first paying customer was found to have been
 * enforced as free for their entire session. Both of those were invisible from
 * /admin/users, which shows a row per user and nothing about what they did.
 *
 * The funnel timeline is the point. A list of counts tells you someone did not
 * connect; the timeline tells you they tried three times over 25 minutes.
 *
 * Every query destructures `error` and reports it rather than rendering a zero.
 * A silent empty result on an admin diagnostic page is worse than no page, in
 * that it actively argues the user did nothing.
 */

type Warned = { table: string; message: string }

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const db = getSupabaseAdmin()
  const warnings: Warned[] = []
  const note = (table: string, error: { message: string } | null) => {
    if (error) {
      console.warn(`[admin/users/${id}] ${table}:`, error.message)
      warnings.push({ table, message: error.message })
    }
  }

  // Identity comes from auth, which is the only place every account definitely
  // exists. A user with no user_settings row is a real state and must render.
  const { data: authUser, error: authErr } = await db.auth.admin.getUserById(id)
  if (authErr || !authUser?.user) {
    return NextResponse.json({ error: authErr?.message ?? 'User not found' }, { status: 404 })
  }
  const u = authUser.user

  const [settingsRes, profileRes, accountsRes, postsRes, eventsRes, workspacesRes, surveyRes] =
    await Promise.all([
      // One string literal, deliberately. Supabase parses the select list at
      // the type level, and a `+`-concatenated expression is not a literal
      // type, so every field silently degrades to GenericStringError.
      db.from('user_settings').select('plan, display_name, username, last_active, login_count, onboarding_completed, onboarding_goal, onboarding_step, monthly_credits_remaining, earned_credits, paid_credits, current_streak, longest_streak, last_post_date, signup_source, signup_medium, signup_campaign, signup_referrer, iris_opt_in, is_admin, locale, timezone, stripe_customer_id, stripe_subscription_id, created_at').eq('user_id', id).maybeSingle(),
      db.from('profiles').select('username, display_name, referred_by, created_at').eq('id', id).maybeSingle(),
      db.from('connected_accounts')
        .select('id, platform, account_name, workspace_id, is_active, created_at')
        .eq('user_id', id).order('created_at', { ascending: false }),
      db.from('posts')
        .select('id, status, platforms, content, scheduled_at, published_at, created_at, platform_errors')
        .eq('user_id', id).order('created_at', { ascending: false }).limit(2000),
      db.from('usage_events')
        .select('event_type, metadata, created_at')
        .eq('user_id', id).order('created_at', { ascending: true }).limit(2000),
      db.from('workspaces')
        .select('id, name, plan, is_personal, created_at').eq('owner_id', id),
      db.from('user_survey_responses')
        .select('question_key, answer, created_at').eq('user_id', id).order('created_at', { ascending: false }),
    ])

  note('user_settings', settingsRes.error)
  note('profiles', profileRes.error)
  note('connected_accounts', accountsRes.error)
  note('posts', postsRes.error)
  note('usage_events', eventsRes.error)
  note('workspaces', workspacesRes.error)
  note('user_survey_responses', surveyRes.error)

  const settings   = settingsRes.data
  const profile    = profileRes.data
  const accounts   = accountsRes.data ?? []
  const posts      = postsRes.data ?? []
  const events     = eventsRes.data ?? []
  const workspaces = workspacesRes.data ?? []

  // The plan as the app itself enforces it. Reading either table directly is
  // what cost the first paying customer their whole first session, so this
  // page shows the resolved value AND both raw ones — if they ever disagree
  // again, that is visible here before a customer feels it.
  const resolvedPlan = await resolveWorkspacePlan(db, id)
  const personal = workspaces.find(w => w.is_personal)

  const byStatus: Record<string, number> = {}
  const byPlatform: Record<string, { published: number; failed: number; scheduled: number }> = {}
  for (const p of posts) {
    const s = String(p.status ?? 'unknown')
    byStatus[s] = (byStatus[s] ?? 0) + 1
    const platforms = Array.isArray(p.platforms) ? (p.platforms as string[]) : []
    for (const plat of platforms) {
      byPlatform[plat] ??= { published: 0, failed: 0, scheduled: 0 }
      if (s === 'published') byPlatform[plat].published++
      else if (s === 'failed' || s === 'partial') byPlatform[plat].failed++
      else if (s === 'scheduled') byPlatform[plat].scheduled++
    }
  }

  // Failures with their real reason attached, so "they never published" can be
  // told apart from "publishing failed for them every time".
  const failures = posts
    .filter(p => (p.status === 'failed' || p.status === 'partial') && p.platform_errors)
    .slice(0, 25)
    .map(p => ({
      id: p.id,
      status: p.status,
      at: p.published_at ?? p.scheduled_at ?? p.created_at,
      errors: p.platform_errors,
    }))

  return NextResponse.json({
    user: {
      id: u.id,
      email: u.email ?? '',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      email_confirmed_at: u.email_confirmed_at ?? null,
      provider: u.app_metadata?.provider ?? null,
      display_name: settings?.display_name ?? profile?.display_name ?? null,
      username: settings?.username ?? profile?.username ?? null,
    },
    plan: {
      resolved: resolvedPlan,
      user_settings_plan: settings?.plan ?? null,
      personal_workspace_plan: personal?.plan ?? null,
      // Two tables holding the same fact is the bug class that has cost this
      // project three separate outages. Say so loudly rather than picking one.
      disagrees: !!settings?.plan && !!personal?.plan && settings.plan !== personal.plan,
      stripe_customer_id: settings?.stripe_customer_id ?? null,
      stripe_subscription_id: settings?.stripe_subscription_id ?? null,
    },
    activity: {
      login_count: settings?.login_count ?? 0,
      last_active: settings?.last_active ?? null,
      onboarding_completed: settings?.onboarding_completed ?? false,
      onboarding_goal: settings?.onboarding_goal ?? null,
      onboarding_step: settings?.onboarding_step ?? null,
      current_streak: settings?.current_streak ?? 0,
      longest_streak: settings?.longest_streak ?? 0,
      last_post_date: settings?.last_post_date ?? null,
      iris_opt_in: settings?.iris_opt_in ?? null,
      is_admin: settings?.is_admin ?? false,
      locale: settings?.locale ?? null,
      timezone: settings?.timezone ?? null,
    },
    attribution: {
      source: settings?.signup_source ?? null,
      medium: settings?.signup_medium ?? null,
      campaign: settings?.signup_campaign ?? null,
      referrer: settings?.signup_referrer ?? null,
      referred_by: profile?.referred_by ?? null,
    },
    credits: {
      monthly: settings?.monthly_credits_remaining ?? 0,
      earned: settings?.earned_credits ?? 0,
      paid: settings?.paid_credits ?? 0,
    },
    accounts,
    workspaces,
    posts: {
      total: posts.length,
      // The select caps at 2000. Say so rather than letting a prolific account
      // silently report a smaller number than it has.
      truncated: posts.length >= 2000,
      byStatus,
      byPlatform,
      recent: posts.slice(0, 15).map(p => ({
        id: p.id,
        status: p.status,
        platforms: p.platforms,
        excerpt: String(p.content ?? '').slice(0, 120),
        scheduled_at: p.scheduled_at,
        published_at: p.published_at,
        created_at: p.created_at,
      })),
      failures,
    },
    funnel: {
      total: events.length,
      truncated: events.length >= 2000,
      // Chronological, with the funnel_ prefix stripped. This is the view that
      // makes a stuck session legible: 1 -> 2 -> 3 -> back to 2 -> gone.
      timeline: events.map(e => ({
        event: String(e.event_type).replace(/^funnel_/, ''),
        metadata: e.metadata ?? {},
        at: e.created_at,
      })),
    },
    survey: surveyRes.data ?? [],
    warnings,
  })
}
