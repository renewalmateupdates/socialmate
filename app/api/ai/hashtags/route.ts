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

    const { content, platforms } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }

    // Server-side credit check and atomic deduction — three-pool system
    // Atomic three-pool deduction — row-locked RPC, no double-spend under concurrency.
    const deduct = await deductAiCredits(supabase, user.id, CREDIT_COST, 'hashtags')
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
      // Refund credits if AI isn't configured
      await refundAiCredits(supabase, user.id, deduct)
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
    }

    const platformList = Array.isArray(platforms) && platforms.length > 0
      ? platforms.join(', ')
      : 'general'

    const prompt = `Given this social media post content, suggest 10-15 relevant hashtags optimized for the specified platforms. Return ONLY a JSON array of hashtag strings (with # prefix). No explanations.

Platforms: ${platformList}
Content: ${content}`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

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
      await refundAiCredits(supabase, user.id, deduct)

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
