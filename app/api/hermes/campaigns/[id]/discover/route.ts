export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
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
- Sender is Joshua Bostic, solo founder of SocialMate (socialmate.studio) — a social media scheduler and AI creator toolkit. What competitors charge $99/month for, we give for $5 or free.
- Joshua works a deli job nights and weekends to build this. Built it 100% solo, bootstrapped.
- Goal is to get featured/mentioned in their newsletter, blog, or content — no appearance or call needed.
- Keep it SHORT. 3-4 sentences max. Lead with something specific about them, then the ask.
- No "I hope this finds you well". No buzzwords. Write like a real human.
- Output JSON only: { "subject": "...", "body": "..." }
`

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()
    const json = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    return JSON.parse(json)
  } catch {
    return {
      subject: `Quick note — SocialMate`,
      body: `Hi ${params.prospectName},\n\nI'm Joshua — I built SocialMate (socialmate.studio) solo while working a deli job. It's a social media scheduler + AI toolkit that does what competitors charge $99/month for at $5 or free.\n\nWould you be open to a quick mention or feature in your content? Happy to share more details.\n\n— Joshua`,
    }
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: campaign_id } = await params
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.email !== 'socialmatehq@gmail.com') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = getSupabaseAdmin()

  const { data: campaign } = await supabase
    .from('hermes_campaigns')
    .select('*')
    .eq('id', campaign_id)
    .eq('user_id', user.id)
    .single()
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

  const body = await req.json()

  const keyword = body.keyword ?? parseDiscoverConfig(campaign.apollo_query).keyword
  const sources: string[] = body.sources ?? parseDiscoverConfig(campaign.apollo_query).sources
  const limitPerSource = Math.min(body.limit_per_source ?? Math.ceil((campaign.prospects_per_run ?? 10) / sources.length), 10)

  // ── Discover from all sources in parallel ────────────────────────────────
  const found = await discoverProspects({ sources, keyword, limitPerSource })

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

  const newProspects = found.filter(p => !existingEmails.has(p.email))

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
    skipped: found.length - newProspects.length,
    sources: sources.reduce((acc, s) => ({ ...acc, [s]: found.filter(p => p.source === s).length }), {} as Record<string, number>),
  })
}
