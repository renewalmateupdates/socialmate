export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { GEMINI_MODEL, redactKeys } from '@/lib/gemini'

// Which features are actually switched on in this environment.
//
// The most expensive bug in this project is a feature that has never run once.
// Two guards already cover most of it: audit-schema-drift.py catches columns and
// tables the code names that do not exist, and audit-dead-features.py catches
// upserts whose ON CONFLICT target has no matching index. Neither can see the
// third cause, because it lives in Vercel rather than the repo — an integration
// whose API key was never set.
//
// That failure is completely silent. hooks/usePushNotifications.ts does
// `if (!vapidKey) { console.warn(...); return false }` and the subscribe button
// simply does nothing, forever, for everyone. Nothing surfaces it. The HERMES
// Gemini calls read GOOGLE_GENERATIVE_AI_API_KEY with no fallback, and its three
// tables have been empty since May.
//
// So: one endpoint that says which integrations are configured HERE, in the
// environment actually serving traffic. Run it against production and the answer
// is about production, which is the whole point — a local .env.local proves
// nothing about what Vercel has.
//
// Presence only. This never returns a value, a length, or a prefix. An admin
// wanting to know WHICH key is set can look in Vercel; an endpoint that leaks
// key material because someone wanted a nicer debug view is not worth it.
//
// One live check on top (Nov 19, 2026): presence is not working. That day every
// AI request hung or failed while this endpoint said AI was configured, and the
// cause could not be seen without the production key or Vercel's logs. So it
// asks Gemini for one word with the key this deployment has, and reports what
// Google answered: the HTTP status, Google's own error text with anything
// key-shaped removed, how long it took, and which flash models the key can
// use. Still never the key.

type GeminiProbe = {
  model: string
  ok: boolean
  status?: number
  ms?: number
  error?: string
  /** whether GEMINI_MODEL is in the key's model list */
  modelListed?: boolean
  flashModels?: string[]
}

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta'

async function probeGemini(): Promise<GeminiProbe> {
  const key = process.env.GEMINI_API_KEY?.trim()
  const probe: GeminiProbe = { model: GEMINI_MODEL, ok: false }
  if (!key) return { ...probe, error: 'GEMINI_API_KEY is not set' }
  const headers = { 'x-goog-api-key': key, 'Content-Type': 'application/json' }

  const started = Date.now()
  try {
    const res = await fetch(`${GEMINI_API}/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply with the single word OK.' }] }] }),
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    })
    probe.status = res.status
    probe.ok = res.ok
    const body = (await res.json().catch(() => null)) as { error?: { status?: string; message?: string } } | null
    if (!res.ok) {
      probe.error = redactKeys([body?.error?.status, body?.error?.message].filter(Boolean).join(': ') || `HTTP ${res.status}`)
    }
  } catch (err) {
    probe.error = err instanceof Error && err.name === 'TimeoutError'
      ? 'No answer within 20 seconds'
      : redactKeys(err instanceof Error ? err.message : String(err))
  }
  probe.ms = Date.now() - started

  // Which models this key can call, so a retired model shows up as one.
  try {
    const res = await fetch(`${GEMINI_API}/models?pageSize=200`, { headers, signal: AbortSignal.timeout(10_000), cache: 'no-store' })
    if (res.ok) {
      const body = (await res.json()) as { models?: { name?: string }[] }
      const names = (body.models ?? []).map(m => (m.name ?? '').replace(/^models\//, '')).filter(Boolean)
      probe.modelListed = names.includes(GEMINI_MODEL)
      probe.flashModels = names.filter(n => n.includes('flash')).sort()
    }
  } catch { /* the answer to the one-word request above is what matters */ }

  return probe
}

type Check = {
  feature: string
  vars: string[]
  /** true when any ONE of `vars` is enough (a fallback chain) */
  anyOf?: boolean
  /** what silently stops working when it is missing */
  breaks: string
}

const CHECKS: Check[] = [
  // ── core: the app does not run at all without these ──────────────────────
  { feature: 'Supabase',        vars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'], breaks: 'everything' },
  { feature: 'App URL',         vars: ['NEXT_PUBLIC_APP_URL'], breaks: 'every OAuth callback and email link' },
  { feature: 'Stripe',          vars: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'], breaks: 'checkout and every plan change' },
  { feature: 'Resend',          vars: ['RESEND_API_KEY'], breaks: 'all outbound email' },
  { feature: 'Cron auth',       vars: ['CRON_SECRET'], breaks: 'internal routes reject Inngest' },

  // ── the ones that fail silently, which is why this endpoint exists ───────
  { feature: 'AI (Gemini)',     vars: ['GEMINI_API_KEY', 'GOOGLE_AI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY'], anyOf: true, breaks: 'all 15+ AI tools, SOMA, and the agents' },
  { feature: 'Push notifications', vars: ['NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'], breaks: 'the subscribe button silently does nothing' },
  { feature: 'Unsplash',        vars: ['UNSPLASH_ACCESS_KEY'], breaks: 'SOMA posts generate without images' },
  { feature: 'HERMES prospects', vars: ['HUNTER_API_KEY'], breaks: 'the email finder returns nothing' },
  { feature: 'Merch (Printify)', vars: ['PRINTIFY_API_KEY', 'PRINTIFY_SHOP_ID'], breaks: 'orders are never fulfilled' },

  // ── per-platform publishing: each one dies alone and quietly ─────────────
  { feature: 'X / Twitter',     vars: ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET'], breaks: 'X connect and posting' },
  { feature: 'TikTok',          vars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'], breaks: 'TikTok connect and posting' },
  { feature: 'LinkedIn',        vars: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'], breaks: 'LinkedIn connect and posting' },
  { feature: 'Discord',         vars: ['DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET', 'DISCORD_BOT_TOKEN'], breaks: 'Discord connect and posting' },
  { feature: 'Twitch clips',    vars: ['TWITCH_CLIENT_ID', 'TWITCH_CLIENT_SECRET'], breaks: 'Clips Studio Twitch tab' },
  { feature: 'YouTube',         vars: ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET'], breaks: 'YouTube connect' },
  { feature: 'Pinterest',       vars: ['PINTEREST_CLIENT_ID', 'PINTEREST_CLIENT_SECRET'], breaks: 'Pinterest connect' },

  { feature: 'Inngest',         vars: ['INNGEST_EVENT_KEY', 'INNGEST_SIGNING_KEY'], breaks: 'every scheduled post and cron' },
]

function present(name: string): boolean {
  const v = process.env[name]
  return typeof v === 'string' && v.trim().length > 0
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const results = CHECKS.map(c => {
    const missing = c.vars.filter(v => !present(v))
    const ok = c.anyOf ? missing.length < c.vars.length : missing.length === 0
    return {
      feature: c.feature,
      ok,
      // On an anyOf chain a partially-missing set is fine, so do not alarm about it.
      missing: ok && c.anyOf ? [] : missing,
      breaks: ok ? undefined : c.breaks,
    }
  })

  const broken = results.filter(r => !r.ok)
  const gemini = await probeGemini()

  return NextResponse.json({
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
    checkedAt: new Date().toISOString(),
    ok: broken.length === 0 && gemini.ok,
    brokenCount: broken.length,
    // A real request with this deployment's key, not just "the variable is set".
    gemini,
    // Unconfigured first: this is a list of things that are quietly not working.
    features: [...broken, ...results.filter(r => r.ok)],
  })
}
