export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const CREDIT_COST = 5

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

    const formatInstruction = FORMAT_PROMPTS[format]
    const prompt = `You are a content repurposing expert. ${formatInstruction} Return only the repurposed content, nothing else.\n\nContent:\n${content}`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    let text: string
    try {
      const result = await model.generateContent(prompt)
      text = result.response.text()
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
