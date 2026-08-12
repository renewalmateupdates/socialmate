export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { notifyLowCredits } from '@/lib/notify-low-credits'
import { deductAiCredits, refundAiCredits } from '@/lib/ai-credits'
import { normalizePlan } from '@/lib/plan'
import { isFeatureEnabled, featurePausedMessage } from '@/lib/feature-flag-check'

// Per-user rate limit: 10 requests/minute per serverless instance
const rlMap = new Map<string, number[]>()
function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const window = 60_000
  const prev = (rlMap.get(userId) || []).filter(t => now - t < window)
  if (prev.length >= 10) return false
  prev.push(now)
  rlMap.set(userId, prev)
  return true
}

const CREDIT_COSTS: Record<string, number> = {
  caption:     5,
  hashtags:    5,
  rewrite:     5,
  hook:        5,
  thread:      10,
  repurpose:   10,
  pulse:       20,
  radar:       20,
  content_gap: 10,
  // NOT REACHABLE from any caller, and both were quoted as gospel on /pricing
  // while being wrong. Kept only so a future wiring has a number to start from.
  //   calendar — the live feature is app/api/ai/content-calendar/route.ts, which
  //              charges 5. Nothing sends tool:'calendar'.
  //   image    — there is no image generation yet: no route, no handler case
  //              below, nothing in compose. /pricing said "25 credits" for a
  //              feature that does not exist.
  // Wire the handler and a caller before advertising either number again.
  calendar:    25,
  image:       25,
  score:       5,
}

async function fetchTrendingData(niche: string) {
  const results: string[] = []

  try {
    const redditRes = await fetch(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(niche)}&sort=hot&limit=5&t=day`,
      { headers: { 'User-Agent': 'SocialMate/1.0' } }
    )
    if (redditRes.ok) {
      const redditData = await redditRes.json()
      const posts = redditData.data?.children?.slice(0, 5) || []
      posts.forEach((p: any) => {
        results.push(`Reddit hot: "${p.data.title}" — ${p.data.score} upvotes, ${p.data.num_comments} comments`)
      })
    }
  } catch { /* ignore */ }

  try {
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(niche)}&order=viewCount&type=video&maxResults=5&key=${process.env.YOUTUBE_API_KEY || ''}`,
    )
    if (ytRes.ok) {
      const ytData = await ytRes.json()
      const videos = ytData.items || []
      videos.forEach((v: any) => {
        results.push(`YouTube trending: "${v.snippet.title}" by ${v.snippet.channelTitle}`)
      })
    }
  } catch { /* ignore */ }

  return results.join('\n')
}

function buildPrompt(tool: string, content: string, platform: string, trendingContext?: string): string {
  switch (tool) {
    case 'caption':
      return `You are a social media expert. Write an engaging ${platform} caption for the following topic or idea. Match the platform's style. Return only the caption, nothing else.\n\nTopic: ${content}`
    case 'hashtags':
      return `You are a social media expert. Generate 10-15 relevant hashtags for the following ${platform} post. Mix popular and niche hashtags. Return only the hashtags separated by spaces, nothing else.\n\nPost: ${content}`
    case 'rewrite':
      return `You are a social media copywriter. Rewrite the following ${platform} post to be more engaging and punchy. Return only the rewritten post, nothing else.\n\nOriginal: ${content}`
    case 'hook':
      return `You are a viral content expert. Generate 3 scroll-stopping opening lines for a ${platform} post about the following topic. Number them 1, 2, 3. Return only the hooks, nothing else.\n\nTopic: ${content}`
    case 'thread':
      return `You are a social media expert specializing in threads. Turn the following topic or idea into a structured ${platform} thread of 5-7 parts. Start with a strong hook, build with supporting points, end with a CTA. Format each part as a numbered tweet starting with the number and a period. Return only the thread parts, nothing else.\n\nTopic: ${content}`
    case 'repurpose':
      return `You are a social media content strategist. Take the following long-form content and repurpose it into 3 short-form posts optimized for ${platform}. Each post should stand alone and be ready to publish. Separate each post with "---". Return only the posts, nothing else.\n\nContent: ${content}`
    case 'pulse':
      return `You are a viral content strategist. The user creates content in this niche: "${content}".

Here is what is currently trending right now based on real data:
${trendingContext || 'No trending data available — provide general niche insights.'}

Based on this trending data, provide:
1. TOP 3 TRENDING TOPICS in this niche right now (with brief explanation of why each is hot)
2. CONTENT ANGLES that would perform well (3 specific post ideas)
3. HASHTAGS to use right now (10 relevant hashtags)
4. BEST PLATFORM for this niche right now and why

Format clearly with headers. Be specific and actionable.`
    case 'radar':
      return `You are a social media growth analyst. The user creates content in this niche: "${content}".

Here is real trending data from Reddit and YouTube right now:
${trendingContext || 'No trending data available — provide general analysis.'}

Analyze this data and provide:
1. CONTENT GAP ANALYSIS — what topics are people asking about that aren't being covered well?
2. ENGAGEMENT PATTERNS — what type of content (questions, lists, stories, tutorials) is getting the most engagement?
3. COMPETITOR WEAKNESSES — based on trending posts, where are creators falling short?
4. YOUR OPPORTUNITY — one specific content strategy this creator should execute this week

Be data-driven, specific, and actionable. Reference actual trends from the data.`
    case 'content_gap':
      return `You are a content strategy expert. The user creates content in this niche: "${content}".

Analyze this niche and identify:
1. CONTENT GAPS — topics that are underserved or missing entirely in this niche
2. AUDIENCE QUESTIONS — what questions are people asking that aren't being answered well
3. FORMAT GAPS — what content formats (video, carousel, thread, etc.) are underused in this niche
4. OPPORTUNITY SCORE — rate each gap 1-10 for ease of execution and potential reach

Be specific, actionable, and prioritized. Return only the analysis, nothing else.`
    case 'calendar':
      return `You are a social media strategist. Create a 30-day content calendar for a creator in this niche: "${content}" posting on ${platform}.

For each day provide:
- Day number
- Post topic
- Content type (educational, entertaining, promotional, personal)
- Hook/opening line
- Key message

Format as a structured list. Make it varied, engaging, and realistic to execute. Return only the calendar, nothing else.`
    case 'score':
      return `You are a social media performance expert. Score the following post out of 100 and provide structured feedback.

Post: "${content}"
Platform: ${platform}

Respond in EXACTLY this format:
SCORE: [number 0-100]
STRENGTHS:
- [strength 1]
- [strength 2]
- [strength 3]
IMPROVEMENTS:
- [improvement 1]
- [improvement 2]
- [improvement 3]
VERDICT: [one sentence summary of the post's potential]`
    default:
      return content
  }
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
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

    if (!checkRateLimit(user.id)) {
      return NextResponse.json({ error: 'rate_limited', message: "You're going too fast — wait a moment and try again." }, { status: 429 })
    }

    const { tool, content, platform } = await req.json()

    if (!tool || !content) {
      return NextResponse.json({ error: 'Missing tool or content' }, { status: 400 })
    }

    const creditCost = CREDIT_COSTS[tool]
    if (creditCost === undefined) {
      return NextResponse.json({ error: 'Unknown tool' }, { status: 400 })
    }

    // Kill switches, checked before any credit is deducted so a paused tool can
    // never charge for work it will not do. These are the levers for a Gemini
    // cost spike; each maps to a row in feature_flags.
    const TOOL_FLAGS: Record<string, { flag: string; label: string }> = {
      caption: { flag: 'ai_caption_generation', label: 'AI caption generation' },
      pulse:   { flag: 'ai_pulse',              label: 'SM-Pulse' },
      radar:   { flag: 'ai_radar',              label: 'SM-Radar' },
    }
    const gate = TOOL_FLAGS[tool]
    if (gate && !(await isFeatureEnabled(gate.flag))) {
      return NextResponse.json({ error: featurePausedMessage(gate.label) }, { status: 503 })
    }

    // Pro+ gate for the score tool — needs the plan only.
    const { data: settings } = await supabase
      .from('user_settings')
      .select('plan')
      .eq('user_id', user.id)
      .maybeSingle()

    const PRO_ONLY_TOOLS = new Set(['score'])
    const normalizedPlan = normalizePlan(settings?.plan as string | null)
    if (PRO_ONLY_TOOLS.has(tool) && normalizedPlan === 'free') {
      return NextResponse.json({ error: 'pro_required', message: 'Post Score is a Pro+ feature. Upgrade to unlock it.' }, { status: 403 })
    }

    // Atomic three-pool deduction — row-locked RPC, no double-spend under concurrency.
    const deduct = await deductAiCredits(supabase, user.id, creditCost, tool)
    if (!deduct.ok) {
      if (deduct.reason === 'insufficient') {
        return NextResponse.json({
          error: `Not enough credits. This tool costs ${creditCost} and you have ${deduct.total} remaining.`,
          creditsRequired: creditCost,
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
      await refundAiCredits(supabase, user.id, deduct) // AI not configured — give it back
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
    }

    let trendingContext: string | undefined
    if (tool === 'pulse' || tool === 'radar') {
      trendingContext = await fetchTrendingData(content)
    }

    // Fetch brand voice for prompt injection
    let brandVoicePrefix = ''
    try {
      const adminDb = getSupabaseAdmin()
      const { data: bvData } = await adminDb
        .from('user_settings')
        .select('brand_voice')
        .eq('user_id', user.id)
        .maybeSingle()
      const bv = bvData?.brand_voice
      if (bv && bv.voiceName) {
        brandVoicePrefix = `=== BRAND VOICE INSTRUCTIONS ===
Voice name: ${bv.voiceName}
Tone: ${bv.tone || ''}
Writing style: ${bv.writingStyle || ''}
Vocabulary rules: ${bv.vocabulary || ''}
Always include: ${bv.alwaysInclude || ''}
Never include: ${bv.neverInclude || ''}
Example of this voice: ${bv.examplePost || ''}
Apply these guidelines to all content you generate.
=================================

`
      }
    } catch { /* non-fatal — proceed without brand voice */ }

    const genAI  = new GoogleGenerativeAI(apiKey)
    const model  = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })
    const basePrompt = buildPrompt(tool, content, platform || 'general', trendingContext)
    const prompt = brandVoicePrefix ? `${brandVoicePrefix}${basePrompt}` : basePrompt

    let text: string
    try {
      const result = await model.generateContent(prompt)
      text = result.response.text()
    } catch (aiErr: any) {
      await refundAiCredits(supabase, user.id, deduct) // Gemini failed — give credits back

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
        console.warn('[AI] Rate limited by Gemini — credits refunded:', aiErr?.message)
        return NextResponse.json(
          { error: 'rate_limited', message: "You're generating too fast — wait 30 seconds and try again." },
          { status: 429 }
        )
      }

      console.error('Gemini error:', aiErr)
      return NextResponse.json({ error: 'AI generation failed — credits refunded' }, { status: 500 })
    }

    // Non-fatal low-credits in-app notification
    const totalRemaining = newMonthly + newEarned + newPaid
    await notifyLowCredits(user.id, totalRemaining)

    return NextResponse.json({
      result: text,
      creditCost,
      creditsRemaining: totalRemaining,
      monthlyRemaining: newMonthly,
      earnedRemaining:  newEarned,
      paidRemaining:    newPaid,
    })

  } catch (err) {
    console.error('AI route error:', err)
    return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 })
  }
}