export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getHermesAccess, HERMES_LIMITS, discoverRunsThisMonth, prospectsAddedThisMonth } from '@/lib/hermes-access'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { dispatchHermesMessage } from '@/lib/hermes-send'
import { discoverProspects, parseDiscoverConfig } from '@/lib/hermes-discover'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  return supabase.auth.getUser()
}

async function generateIntro(params: {
  campaignName: string
  goal: string | null
  personaDescription: string | null
  prospectName: string
  prospectCompany: string | null
  prospectSource: string
}): Promise<{ subject: string; body: string }> {
  const sourceLabel = params.prospectSource === 'github' ? 'developer'
    : params.prospectSource === 'devto' ? 'developer blogger'
    : params.prospectSource === 'hashnode' ? 'developer blogger'
    : 'newsletter writer'

  const prompt = `You are HERMES, a cold outreach assistant. Write an Intro cold email.

Campaign: ${params.campaignName}
Goal: ${params.goal ?? 'not specified'}
Target persona: ${params.personaDescription ?? 'not specified'}

Prospect:
- Name: ${params.prospectName}
${params.prospectCompany ? `- Newsletter/Publication: ${params.prospectCompany}` : ''}
- Type: ${sourceLabel}

Instructions:
- Sender is Joshua Bostic, solo founder of SocialMate (socialmate.studio) — a social media scheduler and AI creator toolkit. What competitors charge $99/month for, we give for $8 or free.
- Joshua builds this solo, nights and weekends. Built it 100% solo, bootstrapped.
- Goal is to get featured/mentioned in their newsletter, blog, or content — no appearance or call needed.
- Keep it SHORT. 3-4 sentences max. Lead with something specific about them, then the ask.
- No "I hope this finds you well". No buzzwords. Write like a real human.
- Output JSON only: { "subject": "...", "body": "..." }
`

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY
      || process.env.GEMINI_API_KEY
      || process.env.GOOGLE_AI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()
    const json = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    return JSON.parse(json)
  } catch {
    return {
      subject: `Quick note — SocialMate`,
      body: `Hi ${params.prospectName},\n\nI'm Joshua — I built SocialMate (socialmate.studio) solo, nights and weekends. It's a social media scheduler + AI toolkit that does what competitors charge $99/month for at $8 or free.\n\nWould you be open to a quick mention or feature in your content? Happy to share more details.\n\n— Joshua`,
    }
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: campaign_id } = await params
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const access = await getHermesAccess(getSupabaseAdmin(), user.id, user.email)
  if (!access.allowed) return NextResponse.json({ error: 'HERMES is not active on your account' }, { status: 403 })

  const supabase = getSupabaseAdmin()

  const { data: campaign } = await supabase
    .from('hermes_campaigns')
    .select('*')
    .eq('id', campaign_id)
    .eq('user_id', user.id)
    .single()
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

  // ── Monthly caps — advertised on /hermes ("1 auto-discover run/month" on
  // Starter, "75/400 prospects/month") but never enforced until now. Check
  // the run cap before touching Gemini or the discovery sources at all.
  const limits = HERMES_LIMITS[access.tier!]
  const runsSoFar = await discoverRunsThisMonth(supabase, user.id)
  if (runsSoFar >= limits.discoverRunsPerMonth) {
    return NextResponse.json({
      error: `You've used your ${limits.discoverRunsPerMonth} Discover run${limits.discoverRunsPerMonth === 1 ? '' : 's'} for this month. Resets next month, or upgrade for more.`,
    }, { status: 429 })
  }
  const prospectsSoFar = await prospectsAddedThisMonth(supabase, user.id)
  const remainingBudget = limits.prospectsPerMonth === Infinity ? Infinity : Math.max(0, limits.prospectsPerMonth - prospectsSoFar)
  if (remainingBudget <= 0) {
    return NextResponse.json({
      error: `You've hit your ${limits.prospectsPerMonth} prospects/month cap. Resets next month, or upgrade for more.`,
    }, { status: 429 })
  }

  const body = await req.json()

  const keyword = body.keyword ?? parseDiscoverConfig(campaign.apollo_query).keyword
  const sources: string[] = body.sources ?? parseDiscoverConfig(campaign.apollo_query).sources
  const limitPerSource = Math.min(body.limit_per_source ?? Math.ceil((campaign.prospects_per_run ?? 10) / sources.length), 10)

  // ── Discover from all sources in parallel ────────────────────────────────
  const found = await discoverProspects({ sources, keyword, limitPerSource })

  // This run counts against the monthly Discover-run cap whether or not it
  // turns up anything new — it still hit the scraping sources and, below,
  // may still call Gemini.
  await supabase.from('hermes_discover_runs').insert({ user_id: user.id, campaign_id, source: 'manual' })

  if (found.length === 0) {
    return NextResponse.json({ discovered: 0, withEmail: found.length, imported: 0, sent: 0, skipped: 0 })
  }

  // ── Dedup against existing prospects ────────────────────────────────────
  const { data: existingProspects } = await supabase
    .from('hermes_prospects')
    .select('email, notes')
    .eq('campaign_id', campaign_id)

  const existingEmails = new Set(
    (existingProspects ?? []).map(r => r.email?.toLowerCase()).filter(Boolean)
  )

  const dedupedProspects = found.filter(p => !existingEmails.has(p.email))
  // Cap import quantity to what's left of this month's prospect budget —
  // don't let one big discover run blow straight through the monthly cap.
  const cappedByMonthlyLimit = Math.max(0, dedupedProspects.length - remainingBudget)
  const newProspects = remainingBudget === Infinity ? dedupedProspects : dedupedProspects.slice(0, remainingBudget)

  // ── Import + generate + send ─────────────────────────────────────────────
  let imported = 0
  let sent = 0

  for (const person of newProspects) {
    const { data: prospect } = await supabase
      .from('hermes_prospects')
      .insert({
        campaign_id,
        user_id: user.id,
        name: person.name,
        email: person.email,
        company: person.company,
        notes: person.notes,
      })
      .select()
      .single()
    if (!prospect) continue
    imported++
    existingEmails.add(person.email)

    const { subject, body: msgBody } = await generateIntro({
      campaignName: campaign.name,
      goal: campaign.goal,
      personaDescription: campaign.persona_description,
      prospectName: person.name,
      prospectCompany: person.company,
      prospectSource: person.source,
    })

    const { data: message } = await supabase
      .from('hermes_messages')
      .insert({ campaign_id, prospect_id: prospect.id, user_id: user.id, channel: 'email', subject, body: msgBody, step: 0, status: 'draft' })
      .select()
      .single()
    if (!message) continue

    if (campaign.mode === 'auto') {
      const result = await dispatchHermesMessage({ messageId: message.id, channel: 'email', userId: user.id, prospectEmail: person.email, subject, body: msgBody })
      if (result.ok) {
        sent++
        const nextDays = (campaign.sequence_days ?? [0, 3, 7])[1]
        const nextContactAt = nextDays != null ? new Date(Date.now() + nextDays * 24 * 60 * 60 * 1000).toISOString() : null
        await supabase.from('hermes_prospects')
          .update({ status: 'contacted', sequence_step: 1, last_contacted_at: new Date().toISOString(), next_contact_at: nextContactAt })
          .eq('id', prospect.id)
      }
    }
  }

  // Save config for future auto-runs
  await supabase.from('hermes_campaigns')
    .update({ apollo_query: JSON.stringify({ keyword, sources }) })
    .eq('id', campaign_id)

  return NextResponse.json({
    discovered: found.length,
    withEmail: found.length,
    imported,
    sent,
    skipped: found.length - dedupedProspects.length,
    cappedByMonthlyLimit,
    sources: sources.reduce((acc, s) => ({ ...acc, [s]: found.filter(p => p.source === s).length }), {} as Record<string, number>),
  })
}
