export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'socialmatehq@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const prevSubjects: string[] = Array.isArray(body.prevSubjects) ? body.prevSubjects : []

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
    }

    const avoidBlock = prevSubjects.length > 0
      ? `\n\nPREVIOUS SUBJECT LINES TO AVOID REPEATING:\n${prevSubjects.map(s => `- ${s}`).join('\n')}`
      : ''

    const prompt = `You are writing the IRIS Dispatch, a biweekly build-in-public newsletter from SocialMate written by Joshua Bostic — a solo bootstrapped founder who builds nights and weekends while working a deli job at Walmart. Joshua is 30 (turning 31 soon), self-taught, based in the US, and deeply authentic. He is not corporate. He writes like a real person.

TONE RULES:
- No em dashes (—). Use commas, periods, or line breaks instead.
- No corporate speak. No "exciting journey" or "leverage" or "synergy".
- Real and direct. Build-in-public means sharing the messy truth, not a highlight reel.
- Short sentences. Conversational. First person.
- Authentic hustle energy without bragging.

WHAT HAS SHIPPED RECENTLY (use for whatShipped and context):
- LinkedIn scheduling went live May 21. SocialMate now supports 7 platforms: Bluesky, Mastodon, Discord, Telegram, X/Twitter, TikTok, LinkedIn.
- 8 AI agents live: Email Outreach, Growth Scout, Newsletter, Client Report, Repurpose, Caption, Trend Scout, Inbox Agent.
- SOMA (our AI content OS) now has Voice DNA Builder: a 40-question interview that teaches SOMA your tone, vocabulary, and personality. Joshua completed it at the Advanced tier.
- SOMA Project Memory: upload docs up to 500k characters. SOMA reads your running notes and avoids repeating angles it already covered.
- Creator Monetization Hub: tip jar and fan subscriptions with Stripe Connect. Zero platform cut.
- 300+ blog posts live on socialmate.studio/blog.
- 28+ vs/ comparison pages (vs Hootsuite, Buffer, Later, Taplio, Shield App, etc.).
- Android app is in closed testing on Google Play. Need 12 opted-in testers to unlock production.
- SM-Give: 2% of every subscription payment and 75% of merch revenue goes to charity.
- Gilgamesh's Guides Vol 1-5 are live at socialmate.studio/guides. Free long-form guides on starting a business, marketing, legal/credit, vibe coding, and creator monetization.
- IRIS Dispatch Edition 1 was sent. 29 recipients.
- SocialMate Discord community is live at discord.gg/2se6FGrbRU.

WHAT TO GENERATE:
Write all 6 fields below. Return ONLY a valid JSON object with exactly these keys: subject, intro, whatShipped, realNumbers, whatsNext, closing.

subject: A punchy, curiosity-driven subject line in the format "IRIS #N — [hook]". Keep it under 60 characters. Make it feel human, not clickbaity.${avoidBlock}

intro: 2-3 sentences. A personal opener from Joshua. Should feel like the opening of a handwritten letter. Reference something real about the build. No "I'm excited to share" type openers. Just talk.

whatShipped: 4-6 bullet points. Each starts with a bullet char and a space (example: "• LinkedIn scheduling is live. 7 platforms now."). Plain text, no markdown bold or asterisks. Be specific about the features. Keep each bullet to 1-2 short sentences.

realNumbers: 3-4 bullet points. Honest metrics. MRR is currently $0 (building in public, pre-revenue). Be real about it. Include things like: subscriber count (29+), blog posts count (300+), platforms live (7), Android closed testing status. Do not inflate or spin.

whatsNext: 3-4 bullet points. Upcoming items. Include: getting 12 Google Play testers, LinkedIn Company Pages access, Instagram/Facebook (longer timeline), growing the Discord community, more SOMA content runs.

closing: Keep it simple. "Until next time,\n- Joshua" is the default and is fine. You can vary it slightly but keep the same feel.

Return valid JSON only. No markdown fences. No extra keys. No explanations outside the JSON.`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    // Strip markdown code fences if Gemini wraps it
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    let parsed: {
      subject: string
      intro: string
      whatShipped: string
      realNumbers: string
      whatsNext: string
      closing: string
    }

    try {
      parsed = JSON.parse(cleaned)
    } catch {
      console.error('[IRIS Generate] Gemini returned non-JSON:', cleaned.slice(0, 500))
      return NextResponse.json({ error: 'AI returned invalid JSON. Try again.' }, { status: 500 })
    }

    const required = ['subject', 'intro', 'whatShipped', 'realNumbers', 'whatsNext', 'closing']
    for (const key of required) {
      if (typeof parsed[key as keyof typeof parsed] !== 'string') {
        return NextResponse.json({ error: `AI response missing field: ${key}` }, { status: 500 })
      }
    }

    return NextResponse.json({
      subject: parsed.subject,
      intro: parsed.intro,
      whatShipped: parsed.whatShipped,
      realNumbers: parsed.realNumbers,
      whatsNext: parsed.whatsNext,
      closing: parsed.closing,
    })

  } catch (err) {
    console.error('[IRIS Generate] Error:', err)
    return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 })
  }
}
