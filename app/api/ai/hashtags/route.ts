export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const CREDIT_COST = 5

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

    const { content, platforms } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }

    // Server-side credit check and atomic deduction — three-pool system
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
      // monthly_first (default)
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
      // Refund credits if AI isn't configured
      const refundPayload: Record<string, number> = { ai_credits_remaining: settings.ai_credits_remaining ?? 0 }
      if (settings.monthly_credits_remaining !== null && settings.monthly_credits_remaining !== undefined) {
        refundPayload.monthly_credits_remaining = monthlyCredits
      }
      if (earnedDeduct > 0) refundPayload.earned_credits = earnedCredits
      if (paidDeduct   > 0) refundPayload.paid_credits   = paidCredits
      await supabase.from('user_settings').update(refundPayload).eq('user_id', user.id)
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
    }

    const platformList = Array.isArray(platforms) && platforms.length > 0
      ? platforms.join(', ')
      : 'general'

    const prompt = `Given this social media post content, suggest 10-15 relevant hashtags optimized for the specified platforms. Return ONLY a JSON array of hashtag strings (with # prefix). No explanations.

Platforms: ${platformList}
Content: ${content}`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    let hashtags: string[]
    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text().trim()

      // Strip markdown code fences if present
      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

      try {
        const parsed = JSON.parse(cleaned)
        if (!Array.isArray(parsed)) throw new Error('Not an array')
        hashtags = parsed
          .filter((h: unknown) => typeof h === 'string')
          .map((h: string) => h.startsWith('#') ? h : `#${h}`)
      } catch {
        // Fallback: extract #word tokens from raw text
        const matches = cleaned.match(/#\w+/g)
        hashtags = matches ? Array.from(new Set(matches)) : []
      }
    } catch (aiErr: any) {
      // Refund credits on any Gemini failure
      const refundPayload: Record<string, number> = { ai_credits_remaining: settings.ai_credits_remaining ?? 0 }
      if (settings.monthly_credits_remaining !== null && settings.monthly_credits_remaining !== undefined) {
        refundPayload.monthly_credits_remaining = monthlyCredits
      }
      if (earnedDeduct > 0) refundPayload.earned_credits = earnedCredits
      if (paidDeduct   > 0) refundPayload.paid_credits   = paidCredits
      await supabase.from('user_settings').update(refundPayload).eq('user_id', user.id)

      const isRateLimit =
        aiErr?.status === 429 ||
        aiErr?.statusCode === 429 ||
        (aiErr?.message && (
          aiErr.message.includes('429') ||
          aiErr.message.includes('RESOURCE_EXHAUSTED') ||
          aiErr.message.includes('Resource has been exhausted') ||
          aiErr.message.toLowerCase().includes('rate limit') ||
          aiErr.message.toLowerCase().includes('quota')
        ))

      if (isRateLimit) {
        console.warn('[AI Hashtags] Rate limited by Gemini — credits refunded:', aiErr?.message)
        return NextResponse.json(
          { error: 'rate_limited', message: "You're generating too fast — wait 30 seconds and try again." },
          { status: 429 }
        )
      }

      console.error('Gemini hashtags error:', aiErr)
      return NextResponse.json({ error: 'AI generation failed — credits refunded' }, { status: 500 })
    }

    return NextResponse.json({
      hashtags,
      creditsUsed: CREDIT_COST,
      creditsRemaining: newMonthly + newEarned + newPaid,
      monthlyRemaining: newMonthly,
      earnedRemaining:  newEarned,
      paidRemaining:    newPaid,
    })

  } catch (err) {
    console.error('Hashtags route error:', err)
    return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 })
  }
}
