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

const BOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const EMAIL_BLOCK_DOMAINS = ['substack.com', 'example.com', 'sentry.io', 'amazonaws.com', 'cloudflare.com', 'google.com', 'wix.com', 'squarespace.com']

function isValidContactEmail(email: string): boolean {
  const lower = email.toLowerCase()
  const domain = lower.split('@')[1] ?? ''
  if (EMAIL_BLOCK_DOMAINS.some(d => domain.includes(d))) return false
  if (lower.startsWith('noreply') || lower.startsWith('no-reply') || lower.startsWith('donotreply')) return false
  if (lower.split('@')[0].length < 2) return false
  return true
}

function extractEmailsFromHtml(html: string): string[] {
  // mailto: links are the most reliable signal
  const mailtoHits = Array.from(html.matchAll(/href="mailto:([^"?&\s]+)/gi))
    .map(m => m[1].toLowerCase().trim())
    .filter(isValidContactEmail)
  if (mailtoHits.length > 0) return Array.from(new Set(mailtoHits))

  // Fall back to plain text email pattern
  const found = new Set(
    (html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ?? [])
      .map(e => e.toLowerCase())
      .filter(isValidContactEmail)
  )
  return Array.from(found)
}

async function findEmailForNewsletter(subdomain: string, customDomain?: string | null): Promise<string | null> {
  const headers = { 'User-Agent': BOT_UA }

  // 1. Substack pub API — sometimes exposes contact_email
  try {
    const res = await fetch(`https://${subdomain}.substack.com/api/v1/pub`, {
      headers,
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.contact_email && isValidContactEmail(data.contact_email)) return data.contact_email.toLowerCase()
      if (data?.author?.email && isValidContactEmail(data.author.email)) return data.author.email.toLowerCase()
    }
  } catch { /* continue */ }

  // 2. Scrape about/contact pages
  const pagesToTry = [
    `https://${subdomain}.substack.com/about`,
    customDomain ? `https://${customDomain}/about` : null,
    customDomain ? `https://${customDomain}/contact` : null,
    customDomain ? `https://${customDomain}` : null,
  ].filter(Boolean) as string[]

  for (const url of pagesToTry) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(5000) })
      if (!res.ok) continue
      const html = await res.text()
      const emails = extractEmailsFromHtml(html)
      if (emails.length > 0) return emails[0]
    } catch { /* try next */ }
  }

  return null
}

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
${params.prospectCompany ? `- Newsletter/Publication: ${params.prospectCompany}` : ''}
${params.prospectTitle ? `- Notes: ${params.prospectTitle}` : ''}

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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()
    const json = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
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

  const body = await req.json()
  const category = (body.category ?? campaign.apollo_query ?? 'technology').toLowerCase()
  const perPage = Math.min(body.per_page ?? campaign.prospects_per_run ?? 10, 25)

  // ── Substack leaderboard discovery ───────────────────────────────────────
  const substackRes = await fetch(
    `https://substack.com/api/v1/leaderboard?category=${encodeURIComponent(category)}&limit=${perPage * 2}&page=0`,
    { headers: { 'User-Agent': BOT_UA } }
  )

  if (!substackRes.ok) {
    return NextResponse.json({ error: `Substack discovery failed (HTTP ${substackRes.status})` }, { status: 500 })
  }

  const substackData = await substackRes.json()
  const publications: Array<{
    name: string
    subdomain: string
    custom_domain?: string | null
    author_name?: string | null
  }> = substackData.publications ?? []

  if (publications.length === 0) {
    return NextResponse.json({ found: 0, withEmail: 0, imported: 0, sent: 0, skipped: 0 })
  }

  // ── Dedup against existing prospects ────────────────────────────────────
  const { data: existingProspects } = await supabase
    .from('hermes_prospects')
    .select('email, notes')
    .eq('campaign_id', campaign_id)

  const existingEmails = new Set(
    (existingProspects ?? []).map(r => r.email?.toLowerCase()).filter(Boolean)
  )
  const existingSubdomains = new Set(
    (existingProspects ?? [])
      .map(r => r.notes?.match(/substack\.com\/([^/\s,]+)/)?.[1])
      .filter(Boolean)
  )

  const newPublications = publications.filter(p => !existingSubdomains.has(p.subdomain))

  // ── Find emails + import + generate + send ──────────────────────────────
  let withEmail = 0
  let imported = 0
  let sent = 0

  for (const pub of newPublications.slice(0, perPage)) {
    const email = await findEmailForNewsletter(pub.subdomain, pub.custom_domain)
    if (!email || existingEmails.has(email)) continue
    withEmail++

    const { data: prospect } = await supabase
      .from('hermes_prospects')
      .insert({
        campaign_id,
        user_id: user.id,
        name: pub.author_name || pub.name,
        email,
        company: pub.name,
        notes: `substack.com/${pub.subdomain}`,
      })
      .select()
      .single()
    if (!prospect) continue
    imported++
    existingEmails.add(email)

    const { subject, body: msgBody } = await generateIntro({
      campaignName: campaign.name,
      goal: campaign.goal,
      personaDescription: campaign.persona_description,
      prospectName: pub.author_name || pub.name,
      prospectCompany: pub.name,
      prospectTitle: `${category} newsletter on Substack`,
    })

    const { data: message } = await supabase
      .from('hermes_messages')
      .insert({ campaign_id, prospect_id: prospect.id, user_id: user.id, channel: 'email', subject, body: msgBody, step: 0, status: 'draft' })
      .select()
      .single()
    if (!message) continue

    if (campaign.mode === 'auto') {
      const result = await dispatchHermesMessage({ messageId: message.id, channel: 'email', userId: user.id, prospectEmail: email, subject, body: msgBody })
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

  // Save category for future auto-runs
  await supabase.from('hermes_campaigns').update({ apollo_query: category }).eq('id', campaign_id)

  return NextResponse.json({
    found: publications.length,
    withEmail,
    imported,
    sent,
    skipped: publications.length - newPublications.length,
  })
}
