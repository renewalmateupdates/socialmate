export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { deductAiCredits, refundAiCredits } from '@/lib/ai-credits'

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
    // Atomic three-pool deduction — row-locked RPC, no double-spend under concurrency.
    const deduct = await deductAiCredits(supabase, user.id, CREDIT_COST, 'profile-optimizer')
    if (!deduct.ok) {
      if (deduct.reason === 'insufficient') {
        return NextResponse.json({
          error: `Not enough credits. This tool costs ${CREDIT_COST} and you have ${deduct.total} remaining.`,
          creditsRequired: CREDIT_COST,
          creditsRemaining: deduct.total,
        }, { status: 402 })
      }
      return NextResponse.json({ error: 'Could not load account settings' }, { status: 500 })
    }
    const newMonthly = deduct.newMonthly
    const newEarned  = deduct.newEarned
    const newPaid    = deduct.newPaid

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      await refundAiCredits(supabase, user.id, deduct)
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
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

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
      await refundAiCredits(supabase, user.id, deduct)

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
