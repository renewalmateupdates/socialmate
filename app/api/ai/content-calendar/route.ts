export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const CREDIT_COST = 5

export interface CalendarDay {
  day: number
  date_label: string
  theme: string
  post_idea: string
  caption_hook: string
  platforms: string[]
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { niche, platforms, postsPerDay, tone, goals } = await req.json()

    if (!niche?.trim() || !Array.isArray(platforms) || platforms.length === 0 || !tone?.trim()) {
      return NextResponse.json({ error: 'Missing required fields: niche, platforms, tone' }, { status: 400 })
    }

    // Three-pool credit deduction — copied exactly from hashtags route
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('ai_credits_remaining, monthly_credits_remaining, earned_credits, paid_credits, credit_source_preference')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json({ error: 'Could not load account settings' }, { status: 500 })
    }

    const creditPref = settings.credit_source_preference || 'monthly_first'

    const monthlyCredits = settings.monthly_credits_remaining ?? settings.ai_credits_remaining ?? 0
    const earnedCredits  = settings.earned_credits ?? 0
    const paidCredits    = settings.paid_credits ?? 0
    const totalCredits   = monthlyCredits + earnedCredits + paidCredits

    if (totalCredits < CREDIT_COST) {
      return NextResponse.json({
        error: `Not enough credits. This tool costs ${CREDIT_COST} and you have ${totalCredits} remaining.`,
        creditsRequired: CREDIT_COST,
        creditsRemaining: totalCredits,
      }, { status: 402 })
    }

    let remaining = CREDIT_COST
    let monthlyDeduct = 0
    let earnedDeduct  = 0
    let paidDeduct    = 0

    const takeFrom = (available: number): number => {
      const take = Math.min(remaining, available)
      remaining -= take
      return take
    }

    if (creditPref === 'earned_first') {
      earnedDeduct  = takeFrom(earnedCredits)
      monthlyDeduct = takeFrom(monthlyCredits)
      paidDeduct    = takeFrom(paidCredits)
    } else if (creditPref === 'paid_first') {
      paidDeduct    = takeFrom(paidCredits)
      monthlyDeduct = takeFrom(monthlyCredits)
      earnedDeduct  = takeFrom(earnedCredits)
    } else {
      monthlyDeduct = takeFrom(monthlyCredits)
      earnedDeduct  = takeFrom(earnedCredits)
      paidDeduct    = takeFrom(paidCredits)
    }

    const newMonthly = monthlyCredits - monthlyDeduct
    const newEarned  = earnedCredits  - earnedDeduct
    const newPaid    = paidCredits    - paidDeduct
    const newLegacy  = Math.max(0, (settings.ai_credits_remaining ?? 0) - CREDIT_COST)

    const updatePayload: Record<string, number> = {
      ai_credits_remaining: newLegacy,
    }
    if (settings.monthly_credits_remaining !== null && settings.monthly_credits_remaining !== undefined) {
      updatePayload.monthly_credits_remaining = newMonthly
    }
    if (earnedDeduct > 0) updatePayload.earned_credits = newEarned
    if (paidDeduct   > 0) updatePayload.paid_credits   = newPaid

    const { error: deductError } = await supabase
      .from('user_settings')
      .update(updatePayload)
      .eq('user_id', user.id)

    if (deductError) {
      return NextResponse.json({ error: 'Failed to deduct credits — please try again' }, { status: 500 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      const refundPayload: Record<string, number> = { ai_credits_remaining: settings.ai_credits_remaining ?? 0 }
      if (settings.monthly_credits_remaining !== null && settings.monthly_credits_remaining !== undefined) {
        refundPayload.monthly_credits_remaining = monthlyCredits
      }
      if (earnedDeduct > 0) refundPayload.earned_credits = earnedCredits
      if (paidDeduct   > 0) refundPayload.paid_credits   = paidCredits
      await supabase.from('user_settings').update(refundPayload).eq('user_id', user.id)
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
    }

    const platformsList = Array.isArray(platforms) ? platforms.join(', ') : 'general'
    const goalsList = Array.isArray(goals) && goals.length > 0 ? goals.join(', ') : 'Grow followers'
    const ppdNum = Math.min(3, Math.max(1, Number(postsPerDay) || 1))

    const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    const prompt = `You are a professional social media content strategist. Generate a 30-day content calendar.

Creator details:
- Niche: ${niche.trim()}
- Platforms: ${platformsList}
- Posts per day: ${ppdNum}
- Tone: ${tone.trim()}
- Goals: ${goalsList}

Use a variety of content themes across the 30 days. Themes to rotate: Educational, Inspirational, Behind the Scenes, Entertaining, Promotional, Story, How-To, Question/Poll, Community, Milestone, Hot Take, Tutorial, Case Study, Personal.

Return a JSON array of exactly 30 objects. Each object must have these exact fields:
- "day": integer (1–30)
- "date_label": string like "Day 1 — Mon" (cycle Mon–Sun starting from Mon)
- "theme": string (one word or short phrase, e.g. "Educational")
- "post_idea": string (1 clear sentence describing the content idea)
- "caption_hook": string (the exact opening line that hooks the reader — make it punchy and platform-native)
- "platforms": array of strings — pick 1-3 platforms from [${platformsList}] that best suit this content type

Return ONLY the JSON array. No markdown fences, no explanations, no extra text.`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

    let calendar: CalendarDay[]

    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text().trim()
      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
      const parsed = JSON.parse(cleaned) as unknown[]

      if (!Array.isArray(parsed)) throw new Error('Not an array')

      calendar = parsed
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map((item, idx) => ({
          day: typeof item.day === 'number' ? item.day : idx + 1,
          date_label: typeof item.date_label === 'string' ? item.date_label : `Day ${idx + 1} — ${DAYS_OF_WEEK[idx % 7]}`,
          theme: typeof item.theme === 'string' ? item.theme : 'Educational',
          post_idea: typeof item.post_idea === 'string' ? item.post_idea : '',
          caption_hook: typeof item.caption_hook === 'string' ? item.caption_hook : '',
          platforms: Array.isArray(item.platforms)
            ? (item.platforms as unknown[]).filter((p): p is string => typeof p === 'string')
            : [],
        }))
        .slice(0, 30)

    } catch (aiErr: unknown) {
      const refundPayload: Record<string, number> = { ai_credits_remaining: settings.ai_credits_remaining ?? 0 }
      if (settings.monthly_credits_remaining !== null && settings.monthly_credits_remaining !== undefined) {
        refundPayload.monthly_credits_remaining = monthlyCredits
      }
      if (earnedDeduct > 0) refundPayload.earned_credits = earnedCredits
      if (paidDeduct   > 0) refundPayload.paid_credits   = paidCredits
      await supabase.from('user_settings').update(refundPayload).eq('user_id', user.id)

      const errObj = aiErr as { status?: number; statusCode?: number; message?: string }
      const isRateLimit =
        errObj?.status === 429 ||
        errObj?.statusCode === 429 ||
        (errObj?.message && (
          errObj.message.includes('429') ||
          errObj.message.includes('RESOURCE_EXHAUSTED') ||
          errObj.message.includes('Resource has been exhausted') ||
          errObj.message.toLowerCase().includes('rate limit') ||
          errObj.message.toLowerCase().includes('quota')
        ))

      if (isRateLimit) {
        return NextResponse.json(
          { error: 'rate_limited', message: "You're generating too fast — wait 30 seconds and try again." },
          { status: 429 }
        )
      }

      console.error('Gemini content-calendar error:', aiErr)
      return NextResponse.json({ error: 'AI generation failed — credits refunded' }, { status: 500 })
    }

    return NextResponse.json({
      calendar,
      creditsUsed: CREDIT_COST,
      creditsRemaining: newMonthly + newEarned + newPaid,
      monthlyRemaining: newMonthly,
      earnedRemaining:  newEarned,
      paidRemaining:    newPaid,
    })

  } catch (err) {
    console.error('Content calendar route error:', err)
    return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 })
  }
}
