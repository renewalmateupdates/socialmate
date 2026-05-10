export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { dispatchHermesMessage } from '@/lib/hermes-send'

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

const STEP_LABELS = ['Intro', 'Follow-up 1', 'Follow-up 2', 'Break-up']

async function generateIntro(params: {
  campaignName: string
  goal: string | null
  personaDescription: string | null
  prospectName: string
  prospectCompany: string | null
  prospectTitle: string | null
}): Promise<{ subject: string; body: string }> {
  const prompt = `You are HERMES, a cold outreach assistant. Write an Intro cold email.

Campaign: ${params.campaignName}
Goal: ${params.goal ?? 'not specified'}
Target persona: ${params.personaDescription ?? 'not specified'}

Prospect:
- Name: ${params.prospectName}
${params.prospectCompany ? `- Company/Publication: ${params.prospectCompany}` : ''}
${params.prospectTitle ? `- Title: ${params.prospectTitle}` : ''}

Instructions:
- Sender is Joshua Bostic, solo founder of SocialMate (socialmate.studio) — a social media scheduler and AI creator toolkit. What competitors charge $99/month for, we give for $5 or free.
- Joshua works a deli job nights and weekends to build this. Built it 100% solo, bootstrapped.
- Goal is to get featured/mentioned in their newsletter or blog — no appearance or call needed.
- Keep it SHORT. 3-4 sentences max. Lead with something specific about them, then the ask.
- No "I hope this finds you well". No buzzwords. Write like a real human.
- Make the ask clear: a mention, feature, or tool spotlight in their newsletter/content.
- Output JSON only: { "subject": "...", "body": "..." }
`

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
    const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const raw    = result.response.text().trim()
    const json   = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    return JSON.parse(json)
  } catch {
    return {
      subject: `Quick note — SocialMate`,
      body: `Hi ${params.prospectName},\n\nI'm Joshua — I built SocialMate (socialmate.studio) solo while working a deli job. It's a social media scheduler + AI toolkit that does what competitors charge $99/month for at $5 or free.\n\nWould you be open to a quick mention or feature in your newsletter? Happy to share more details.\n\n— Joshua`,
    }
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: campaign_id } = await params
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabaseAdmin()

  const { data: campaign } = await supabase
    .from('hermes_campaigns')
    .select('*')
    .eq('id', campaign_id)
    .eq('user_id', user.id)
    .single()
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

  const body       = await req.json()
  const query      = body.query ?? campaign.apollo_query ?? ''
  const titles     = body.titles as string[] | undefined
  const perPage    = Math.min(body.per_page ?? campaign.prospects_per_run ?? 10, 25)
  const autoImport = body.auto_import !== false  // default true

  if (!query.trim()) return NextResponse.json({ error: 'Search query required' }, { status: 400 })

  const apolloKey = process.env.APOLLO_API_KEY
  if (!apolloKey) return NextResponse.json({ error: 'Apollo API not configured' }, { status: 500 })

  // ── Apollo people search ──────────────────────────────────────────────────
  const apolloRes = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'X-Api-Key': apolloKey },
    body: JSON.stringify({
      q_keywords: query,
      ...(titles && titles.length > 0 ? { person_titles: titles } : {}),
      contact_email_status: ['verified', 'likely to engage'],
      per_page: perPage,
      page: 1,
    }),
  })

  if (!apolloRes.ok) {
    const err = await apolloRes.json().catch(() => ({}))
    return NextResponse.json({ error: err.error || `Apollo error: HTTP ${apolloRes.status}` }, { status: 500 })
  }

  const apolloData = await apolloRes.json()
  const people: {
    name: string
    first_name: string
    last_name: string
    email: string | null
    organization_name: string | null
    title: string | null
  }[] = apolloData.people ?? []

  const withEmail = people.filter(p => p.email)
  if (withEmail.length === 0) {
    return NextResponse.json({ found: 0, imported: 0, skipped: 0, prospects: [] })
  }

  // ── Dedup: skip emails already in this campaign ───────────────────────────
  const emails = withEmail.map(p => p.email!)
  const { data: existing } = await supabase
    .from('hermes_prospects')
    .select('email')
    .eq('campaign_id', campaign_id)
    .in('email', emails)

  const existingEmails = new Set((existing ?? []).map(r => r.email))
  const newPeople = withEmail.filter(p => !existingEmails.has(p.email!))

  if (!autoImport) {
    return NextResponse.json({
      found: withEmail.length,
      new: newPeople.length,
      skipped: withEmail.length - newPeople.length,
      prospects: newPeople.map(p => ({
        name: p.name,
        email: p.email,
        company: p.organization_name,
        title: p.title,
      })),
    })
  }

  // ── Import + generate + send ──────────────────────────────────────────────
  let imported = 0
  let sent     = 0

  for (const person of newPeople) {
    // Insert prospect
    const { data: prospect } = await supabase
      .from('hermes_prospects')
      .insert({
        campaign_id,
        user_id: user.id,
        name: person.name,
        email: person.email,
        company: person.organization_name,
        notes: person.title ?? null,
      })
      .select()
      .single()

    if (!prospect) continue
    imported++

    // Generate intro
    const { subject, body: msgBody } = await generateIntro({
      campaignName: campaign.name,
      goal: campaign.goal,
      personaDescription: campaign.persona_description,
      prospectName: person.name,
      prospectCompany: person.organization_name,
      prospectTitle: person.title,
    })

    // Save message
    const { data: message } = await supabase
      .from('hermes_messages')
      .insert({
        campaign_id,
        prospect_id: prospect.id,
        user_id: user.id,
        channel: 'email',
        subject,
        body: msgBody,
        step: 0,
        status: 'draft',
      })
      .select()
      .single()

    if (!message) continue

    // Auto mode: send immediately
    if (campaign.mode === 'auto') {
      const result = await dispatchHermesMessage({
        messageId: message.id,
        channel: 'email',
        userId: user.id,
        prospectEmail: person.email,
        subject,
        body: msgBody,
      })

      if (result.ok) {
        sent++
        const sequenceDays: number[] = campaign.sequence_days ?? [0, 3, 7]
        const nextContactAt = sequenceDays[1] != null
          ? new Date(Date.now() + sequenceDays[1] * 24 * 60 * 60 * 1000).toISOString()
          : null
        await supabase
          .from('hermes_prospects')
          .update({ status: 'contacted', sequence_step: 1, last_contacted_at: new Date().toISOString(), next_contact_at: nextContactAt })
          .eq('id', prospect.id)
      }
    }
  }

  // Save query to campaign for future auto-runs
  await supabase
    .from('hermes_campaigns')
    .update({ apollo_query: query })
    .eq('id', campaign_id)

  return NextResponse.json({
    found: withEmail.length,
    imported,
    sent,
    skipped: withEmail.length - newPeople.length,
  })
}
