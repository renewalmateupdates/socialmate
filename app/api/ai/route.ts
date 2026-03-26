export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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

    const { tool, content, platform } = await req.json()

    if (!tool || !content) {
      return NextResponse.json({ error: 'Missing tool or content' }, { status: 400 })
    }

    const creditCost = CREDIT_COSTS[tool]
    if (creditCost === undefined) {
      return NextResponse.json({ error: 'Unknown tool' }, { status: 400 })
    }

    // Server-side credit check and atomic deduction
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('ai_credits_remaining, monthly_credits_remaining, earned_credits, paid_credits, credit_source_preference')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json({ error: 'Could not load account settings' }, { status: 500 })
    }

    const creditPref = settings.credit_source_preference || 'monthly_first'

    // Three-bucket credit system: monthly + earned + paid
    const monthlyCredits = settings.monthly_credits_remaining ?? settings.ai_credits_remaining ?? 0
    const earnedCredits  = settings.earned_credits ?? 0
    const paidCredits    = settings.paid_credits ?? 0
    const totalCredits   = monthlyCredits + earnedCredits + paidCredits

    if (totalCredits < creditCost) {
      return NextResponse.json({
        error: `Not enough credits. This tool costs ${creditCost} and you have ${totalCredits} remaining.`,
        creditsRequired: creditCost,
        creditsRemaining: totalCredits,
      }, { status: 402 })
    }

    // Deduct based on preference order — three-pool system
    let remaining = creditCost
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
    const newLegacy  = Math.max(0, (settings.ai_credits_remaining ?? 0) - creditCost)

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

    let trendingContext: string | undefined
    if (tool === 'pulse' || tool === 'radar') {
      trendingContext = await fetchTrendingData(content)
    }

    const genAI  = new GoogleGenerativeAI(apiKey)
    const model  = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = buildPrompt(tool, content, platform || 'general', trendingContext)

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
        console.warn('[AI] Rate limited by Gemini — credits refunded:', aiErr?.message)
        return NextResponse.json(
          { error: 'rate_limited', message: "You're generating too fast — wait 30 seconds and try again." },
          { status: 429 }
        )
      }

      console.error('Gemini error:', aiErr)
      return NextResponse.json({ error: 'AI generation failed — credits refunded' }, { status: 500 })
    }

    return NextResponse.json({
      result: text,
      creditCost,
      creditsRemaining: newMonthly + newEarned + newPaid,
      monthlyRemaining: newMonthly,
      earnedRemaining:  newEarned,
      paidRemaining:    newPaid,
    })

  } catch (err) {
    console.error('AI route error:', err)
    return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 })
  }
}