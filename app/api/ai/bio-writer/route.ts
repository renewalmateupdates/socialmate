export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { deductAiCredits, refundAiCredits } from '@/lib/ai-credits'

const CREDIT_COST = 5

const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 160,
  linkedin: 2600,
  instagram: 150,
  tiktok: 80,
  bluesky: 256,
  general: 500,
}

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  twitter: 'Write a Twitter/X bio. Max 160 characters. Punchy, personality-forward. Can include what you do, a fun fact, and optionally emojis. NO link (user adds it separately). Must be under 160 characters.',
  linkedin: 'Write a LinkedIn About summary. 3-5 professional sentences. Human but authoritative. Keyword-rich for the stated niche. Include what you do, who you help, and your differentiator. Can be multi-sentence.',
  instagram: 'Write an Instagram bio. Max 150 characters. Can include emojis to break up sections. Should convey niche + personality. End with a CTA like "Link below" or "↓". Must be under 150 characters.',
  tiktok: 'Write a TikTok bio. Max 80 characters. Hook viewers immediately. Personality-first. Short, punchy, fun. Optionally one emoji. Must be under 80 characters.',
  bluesky: 'Write a Bluesky bio. Max 256 characters. Authentic and community-focused. Convey what you post about and why people should follow. No corporate speak. Can include interests/niche/values.',
  general: 'Write a versatile 2-3 sentence professional bio that works across any platform. Clear, human, and memorable. State name, what you do, who you help, and a unique angle.',
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

    const { platform, name, niche, tone, keywords } = await req.json()

    if (!platform || !name?.trim() || !niche?.trim() || !tone?.trim()) {
      return NextResponse.json({ error: 'Missing required fields: platform, name, niche, tone' }, { status: 400 })
    }

    const validPlatforms = ['twitter', 'linkedin', 'instagram', 'tiktok', 'bluesky', 'general']
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    // Three-pool credit deduction — copied exactly from hashtags route
    // Atomic three-pool deduction — row-locked RPC, no double-spend under concurrency.
    const deduct = await deductAiCredits(supabase, user.id, CREDIT_COST, 'bio-writer')
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

    const platformInstruction = PLATFORM_INSTRUCTIONS[platform]
    const charLimit = PLATFORM_LIMITS[platform]
    const keywordsLine = keywords?.trim() ? `Keywords to naturally include: ${keywords.trim()}` : ''

    const prompt = `You are a professional social media bio copywriter.

${platformInstruction}

Creator details:
- Name: ${name.trim()}
- Niche / What they do: ${niche.trim()}
- Tone: ${tone.trim()}
${keywordsLine}

Return ONLY the bio text. No quotes around it. No explanations. No prefix like "Bio:" — just the raw bio text. Keep it within ${charLimit} characters.`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

    let bio: string
    try {
      const result = await model.generateContent(prompt)
      bio = result.response.text().trim()
      // Strip surrounding quotes if Gemini added them
      if ((bio.startsWith('"') && bio.endsWith('"')) || (bio.startsWith("'") && bio.endsWith("'"))) {
        bio = bio.slice(1, -1).trim()
      }
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

      console.error('Gemini bio-writer error:', aiErr)
      return NextResponse.json({ error: 'AI generation failed — credits refunded' }, { status: 500 })
    }

    return NextResponse.json({
      bio,
      charCount: bio.length,
      platform,
      creditsUsed: CREDIT_COST,
      creditsRemaining: newMonthly + newEarned + newPaid,
      monthlyRemaining: newMonthly,
      earnedRemaining:  newEarned,
      paidRemaining:    newPaid,
    })

  } catch (err) {
    console.error('Bio writer route error:', err)
    return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 })
  }
}
