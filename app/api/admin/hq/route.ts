export const dynamic = 'force-dynamic'
export const maxDuration = 30
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getStripe } from '@/lib/stripe'
import { stripeSummary } from '@/lib/hq/stripe'
import { shopifyConfigured, shopifySummary } from '@/lib/hq/shopify'
import { renewalmateConfigured, renewalmateSummary } from '@/lib/hq/renewalmate'
import { socialmateDbSummary } from '@/lib/hq/socialmate'

// GET /api/admin/hq?days=30
// Joshua's one-page view across the ventures he runs solo: SocialMate (and the
// Gilgamesh Enterprise Stripe account it bills through), the Gilgamesh shop on
// Shopify, and RenewalMate. HereNow, RJ's Tree Care and Raid Ready Labs are
// left out on purpose: they're run with partners or for a client.
//
// Each source loads independently. One that isn't connected or fails shows as
// such on the page instead of taking the others down.

type SourceStatus = { name: string; status: 'ok' | 'not_connected' | 'error'; detail?: string }

function settle<T>(name: string, r: PromiseSettledResult<T> | null, sources: SourceStatus[], setup?: string): T | null {
  if (r === null) {
    sources.push({ name, status: 'not_connected', detail: setup })
    return null
  }
  if (r.status === 'rejected') {
    const detail = r.reason instanceof Error ? r.reason.message : String(r.reason)
    console.warn(`[admin/hq] ${name} failed:`, detail)
    sources.push({ name, status: 'error', detail: detail.slice(0, 240) })
    return null
  }
  sources.push({ name, status: 'ok' })
  return r.value
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const days     = Math.min(365, Math.max(1, Number(new URL(req.url).searchParams.get('days') ?? 30)))
  const sinceMs  = Date.now() - days * 86_400_000
  const sinceIso = new Date(sinceMs).toISOString()
  const sinceSec = Math.floor(sinceMs / 1000)

  const [stripeR, dbR, shopifyR, renewalR] = await Promise.all([
    Promise.allSettled([stripeSummary(getStripe(), sinceSec)]).then(r => r[0]),
    Promise.allSettled([socialmateDbSummary(getSupabaseAdmin(), sinceIso)]).then(r => r[0]),
    shopifyConfigured()     ? Promise.allSettled([shopifySummary(getSupabaseAdmin(), sinceIso)]).then(r => r[0]) : Promise.resolve(null),
    renewalmateConfigured() ? Promise.allSettled([renewalmateSummary(sinceIso)]).then(r => r[0]) : Promise.resolve(null),
  ])

  const sources: SourceStatus[] = []
  const stripe      = settle('Stripe (Gilgamesh Enterprise)', stripeR, sources)
  const socialmate  = settle('SocialMate database', dbR, sources)
  const shopify     = settle('Gilgamesh shop (Shopify)', shopifyR, sources, 'Add SHOPIFY_WEBHOOK_SECRET in Vercel and create the order webhooks in Shopify.')
  const renewalmate = settle('RenewalMate', renewalR, sources, 'Add RENEWALMATE_SUPABASE_URL and RENEWALMATE_SUPABASE_SERVICE_ROLE_KEY in Vercel.')

  // RenewalMate bills through the same Stripe account, so its money is already
  // inside stripe.netCents; it is broken out here, never added twice.
  const totalCents = (stripe?.netCents ?? 0) + (shopify?.grossCents ?? 0)
  const renewalmateRevenue = stripe ? {
    cents:    stripe.byGroup.find(g => g.group === 'RenewalMate')?.cents ?? 0,
    mrrCents: stripe.mrrByGroup.find(g => g.group === 'RenewalMate')?.cents ?? 0,
  } : null

  return NextResponse.json({
    days,
    generatedAt: new Date().toISOString(),
    sources,
    totalCents,
    stripe,
    shopify,
    renewalmate,
    renewalmateRevenue,
    socialmate,
    smGive: {
      recordedCents:   socialmate?.smGiveCents ?? 0,
      shopifyOwedCents: shopify?.smGiveOwedCents ?? 0,
    },
  })
}
