export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
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

    // Server-side credit check and atomic deduction — two-bucket system
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('ai_credits_remaining, monthly_credits_remaining, permanent_credits')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json({ error: 'Could not load account settings' }, { status: 500 })
    }

    // Two-bucket: monthly first, then permanent. Fall back to legacy ai_credits_remaining.
    const monthlyCredits   = settings.monthly_credits_remaining ?? settings.ai_credits_remaining ?? 0
    const permanentCredits = settings.permanent_credits ?? 0
    const totalCredits     = monthlyCredits + permanentCredits
    // Legacy fallback for installs without new columns
    const legacyCredits    = settings.ai_credits_remaining ?? 0

    const effectiveTotal = (settings.monthly_credits_remaining !== null && settings.monthly_credits_remaining !== undefined)
      ? totalCredits
      : legacyCredits

    if (effectiveTotal < creditCost) {
      return NextResponse.json({
        error: `Not enough credits. This tool costs ${creditCost} and you have ${effectiveTotal} remaining.`,
        creditsRequired: creditCost,
        creditsRemaining: effectiveTotal,
      }, { status: 402 })
    }

    // Deduct from monthly first, then permanent
    let newMonthly   = monthlyCredits
    let newPermanent = permanentCredits
    let remaining    = creditCost

    if (newMonthly >= remaining) {
      newMonthly -= remaining
      remaining = 0
    } else {
      remaining -= newMonthly
      newMonthly = 0
      newPermanent -= remaining
      remaining = 0
    }

    const newLegacyCredits = Math.max(0, legacyCredits - creditCost)

    // Build update payload — update both legacy and new columns
    const updatePayload: Record<string, number> = {
      ai_credits_remaining: newLegacyCredits,
    }
    if (settings.monthly_credits_remaining !== null && settings.monthly_credits_remaining !== undefined) {
      updatePayload.monthly_credits_remaining = newMonthly
      updatePayload.permanent_credits = newPermanent
    }

    const { error: deductError } = await supabase
      .from('user_settings')
      .update(updatePayload)
      .eq('user_id', user.id)

    if (deductError) {
      return NextResponse.json({ error: 'Failed to deduct credits — please try again' }, { status: 500 })
    }

    const newCredits = newLegacyCredits

    // Low credits email — send at most once per calendar month
    if (newCredits < 10) {
      try {
        const { data: creditSettings } = await getSupabaseAdmin()
          .from('user_settings')
          .select('notification_prefs, credits_low_email_sent_at')
          .eq('user_id', user.id)
          .single()

        const prefs = (creditSettings?.notification_prefs ?? {}) as Record<string, boolean>
        const lastSent = creditSettings?.credits_low_email_sent_at as string | null
        const thisMonth = new Date().toISOString().slice(0, 7)
        const alreadySentThisMonth = lastSent && lastSent.startsWith(thisMonth)

        if (prefs.credits_low !== false && !alreadySentThisMonth) {
          await getSupabaseAdmin()
            .from('user_settings')
            .update({ credits_low_email_sent_at: new Date().toISOString() })
            .eq('user_id', user.id)

          const { data: authUser } = await getSupabaseAdmin().auth.admin.getUserById(user.id)
          const email = authUser?.user?.email

          if (email) {
            await getResend().emails.send({
              from: 'SocialMate <notifications@socialmate.studio>',
              to: email,
              subject: `You're running low on AI credits — ${newCredits} remaining`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #111;">
                  <div style="font-size: 20px; font-weight: 800; margin-bottom: 16px;">SocialMate</div>
                  <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Running low on AI credits</h2>
                  <p style="color: #555; font-size: 14px; line-height: 1.6;">
                    You have <strong>${newCredits} credits</strong> remaining this month.
                    Credits reset on your monthly billing date.
                  </p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'}/settings?tab=Plan"
                    style="display: inline-block; background: #EC4899; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 8px;">
                    Get more credits →
                  </a>
                  <p style="color: #aaa; font-size: 12px; margin-top: 24px;">To disable these emails, go to Settings → Notifications.</p>
                </div>
              `,
            })
          }
        }
      } catch (emailErr) {
        console.error('Credits low email failed (non-fatal):', emailErr)
      }
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      // Refund credits if AI isn't configured
      const refundPayload: Record<string, number> = { ai_credits_remaining: legacyCredits }
      if (settings.monthly_credits_remaining !== null && settings.monthly_credits_remaining !== undefined) {
        refundPayload.monthly_credits_remaining = monthlyCredits
        refundPayload.permanent_credits = permanentCredits
      }
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
    } catch (aiErr) {
      // Refund credits if Gemini fails
      const refundPayload: Record<string, number> = { ai_credits_remaining: legacyCredits }
      if (settings.monthly_credits_remaining !== null && settings.monthly_credits_remaining !== undefined) {
        refundPayload.monthly_credits_remaining = monthlyCredits
        refundPayload.permanent_credits = permanentCredits
      }
      await supabase.from('user_settings').update(refundPayload).eq('user_id', user.id)
      console.error('Gemini error:', aiErr)
      return NextResponse.json({ error: 'AI generation failed — credits refunded' }, { status: 500 })
    }

    return NextResponse.json({
      result: text,
      creditCost,
      creditsRemaining: newCredits,
      creditsMonthly: newMonthly,
      creditsPermanent: newPermanent,
    })

  } catch (err) {
    console.error('AI route error:', err)
    return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 })
  }
}