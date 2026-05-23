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

    const { platform, currentBio, goal } = await req.json()

    if (!platform || !currentBio?.trim() || !goal?.trim()) {
      return NextResponse.json({ error: 'Missing required fields: platform, currentBio, goal' }, { status: 400 })
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

    const prompt = `You are a professional social media profile optimization expert.

Analyze this ${platform} bio and score it based on the user's stated goal.

Platform: ${platform}
Current bio: "${currentBio.trim()}"
User's goal: ${goal.trim()}

Evaluate on: clarity, hook strength, keyword presence, call-to-action, personality, platform-fit, and alignment with the stated goal.

Return a JSON object with this exact shape:
{
  "score": <integer 0-100>,
  "scoreLabel": <"Needs Work" | "Getting There" | "Strong" | "Excellent">,
  "improvements": [
    { "issue": "<specific problem in 1 sentence>", "fix": "<specific fix in 1 sentence>" },
    { "issue": "<specific problem in 1 sentence>", "fix": "<specific fix in 1 sentence>" },
    { "issue": "<specific problem in 1 sentence>", "fix": "<specific fix in 1 sentence>" }
  ],
  "rewrite": "<complete rewritten bio text>"
}

Score labels: 0-49 = "Needs Work", 50-69 = "Getting There", 70-84 = "Strong", 85-100 = "Excellent".
Return ONLY the JSON. No markdown fences, no explanations.`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    let score: number
    let scoreLabel: string
    let improvements: Array<{ issue: string; fix: string }>
    let rewrite: string

    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text().trim()
      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
      const parsed = JSON.parse(cleaned) as {
        score: number
        scoreLabel: string
        improvements: Array<{ issue: string; fix: string }>
        rewrite: string
      }
      score = Math.min(100, Math.max(0, Number(parsed.score)))
      scoreLabel = parsed.scoreLabel || 'Getting There'
      improvements = Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : []
      rewrite = parsed.rewrite || ''
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

      console.error('Gemini profile-optimizer error:', aiErr)
      return NextResponse.json({ error: 'AI generation failed — credits refunded' }, { status: 500 })
    }

    return NextResponse.json({
      score,
      scoreLabel,
      improvements,
      rewrite,
      creditsUsed: CREDIT_COST,
      creditsRemaining: newMonthly + newEarned + newPaid,
      monthlyRemaining: newMonthly,
      earnedRemaining:  newEarned,
      paidRemaining:    newPaid,
    })

  } catch (err) {
    console.error('Profile optimizer route error:', err)
    return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 })
  }
}
