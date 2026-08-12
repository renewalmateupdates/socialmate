export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { deductAiCredits, refundAiCredits } from '@/lib/ai-credits'

const CREDIT_COST = 10

const FORMAT_PROMPTS: Record<string, string> = {
  thread:        'Turn this into an engaging 5-7 tweet thread. Start with a hook. Number each tweet (1/, 2/, etc.).',
  email:         "Turn this into a newsletter email section. Add a suggested subject line at the top prefixed with 'Subject:'",
  caption:       'Rewrite as a punchy Instagram/TikTok caption under 150 chars with 3-5 relevant hashtags.',
  long_form:     'Expand into a 300-500 word blog post with 2-3 headers (##).',
  short_hook:    'Distill into a single attention-grabbing hook under 140 characters.',
  linkedin_post: 'Rewrite as a professional LinkedIn post. Conversational but polished. 150-250 words.',
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

    const { content, format } = await req.json()

    if (!content || !format) {
      return NextResponse.json({ error: 'Missing content or format' }, { status: 400 })
    }

    if (!FORMAT_PROMPTS[format]) {
      return NextResponse.json({ error: 'Unknown format' }, { status: 400 })
    }

    // Server-side credit check and atomic deduction — three-pool system
    // Atomic three-pool deduction — row-locked RPC, no double-spend under concurrency.
    const deduct = await deductAiCredits(supabase, user.id, CREDIT_COST, 'repurpose')
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

    const formatInstruction = FORMAT_PROMPTS[format]
    const prompt = `You are a content repurposing expert. ${formatInstruction} Return only the repurposed content, nothing else.\n\nContent:\n${content}`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

    let text: string
    try {
      const result = await model.generateContent(prompt)
      text = result.response.text()
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
        console.warn('[AI Repurpose] Rate limited by Gemini — credits refunded:', aiErr?.message)
        return NextResponse.json(
          { error: 'rate_limited', message: "You're generating too fast — wait 30 seconds and try again." },
          { status: 429 }
        )
      }

      console.error('Gemini repurpose error:', aiErr)
      return NextResponse.json({ error: 'AI generation failed — credits refunded' }, { status: 500 })
    }

    return NextResponse.json({
      result: text,
      creditsUsed: CREDIT_COST,
      creditsRemaining: newMonthly + newEarned + newPaid,
      monthlyRemaining: newMonthly,
      earnedRemaining:  newEarned,
      paidRemaining:    newPaid,
    })

  } catch (err) {
    console.error('Repurpose route error:', err)
    return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 })
  }
}
