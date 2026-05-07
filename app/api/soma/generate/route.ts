export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SOMA_COSTS } from '@/lib/soma-costs'

const GENERATE_COST = SOMA_COSTS.generate_week // 75

function calculateScheduledAt(day: number, slot: string): string {
  const base = new Date()
  base.setDate(base.getDate() + day - 1)
  const hours = slot === 'morning' ? 9 : slot === 'afternoon' ? 14 : 19
  base.setHours(hours, 0, 0, 0)
  return base.toISOString()
}

function parseGeminiJson(text: string): any {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()
  return JSON.parse(cleaned)
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

    const body = await req.json()
    const { ingestion_id, platforms } = body as { ingestion_id: string; platforms: string[] }

    if (!ingestion_id) {
      return NextResponse.json({ error: 'ingestion_id is required' }, { status: 400 })
    }
    if (!Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ error: 'platforms must be a non-empty array' }, { status: 400 })
    }

    // Get workspace
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('id, soma_credits_monthly, soma_credits_used, soma_credits_purchased')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .single()

    if (wsError || !workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    const monthly = workspace.soma_credits_monthly ?? 0
    const used = workspace.soma_credits_used ?? 0
    const purchased = workspace.soma_credits_purchased ?? 0
    const remaining = Math.max(0, monthly - used) + purchased

    if (remaining < GENERATE_COST) {
      return NextResponse.json({ error: 'insufficient_soma_credits' }, { status: 402 })
    }

    // Fetch ingestion
    const { data: ingestion, error: ingestionError } = await supabase
      .from('soma_weekly_ingestion')
      .select('*')
      .eq('id', ingestion_id)
      .eq('user_id', user.id)
      .single()

    if (ingestionError || !ingestion) {
      return NextResponse.json({ error: 'Ingestion not found' }, { status: 404 })
    }

    // Fetch identity profile (may be null)
    const { data: profile } = await supabase
      .from('soma_identity_profiles')
      .select('*')
      .eq('workspace_id', workspace.id)
      .maybeSingle()

    const identityContext = (profile as any)?.personality_summary
      ? `CREATOR VOICE DNA (${((profile as any).personality_tier ?? 'foundation').replace('_', ' ')} tier):
${(profile as any).personality_summary}

ONBOARDING VOICE PROFILE:
Tone: ${JSON.stringify(profile!.tone_profile)}
Style: ${JSON.stringify(profile!.writing_style_rules)}
Avoid: ${(profile!.tone_profile as any)?.avoid ?? 'generic AI phrases'}
Example posts: ${Array.isArray(profile!.voice_examples) ? profile!.voice_examples.join(' | ') : 'none provided'}`
      : profile
      ? `CREATOR VOICE PROFILE:
Tone: ${JSON.stringify(profile.tone_profile)}
Style: ${JSON.stringify(profile.writing_style_rules)}
Avoid: ${(profile.tone_profile as any)?.avoid || 'generic AI phrases'}
Personality: ${JSON.stringify(profile.behavioral_traits)}
Example posts they like: ${Array.isArray(profile.voice_examples) ? profile.voice_examples.join(' | ') : 'none provided'}`
      : 'No voice profile set — use authentic, direct tone.'

    const insights = ingestion.extracted_insights as any

    const generatePrompt = `${identityContext}

THIS WEEK'S INSIGHTS:
Key themes: ${insights.key_themes?.join(', ')}
Wins: ${insights.wins?.join(', ')}
Challenges: ${insights.challenges?.join(', ')}
Content angles to use: ${insights.content_angles?.join(' | ')}
Emotional tone of week: ${insights.emotional_tone}

Generate 21 social media posts for a 7-day content calendar (3 posts per day).

Return ONLY valid JSON (no markdown):
{
  "posts": [
    {
      "day": 1,
      "slot": "morning",
      "content": "post text here",
      "platform_hint": "any",
      "content_type": "mindset"
    }
  ]
}

Rules:
- day 1-7, slot must be morning/afternoon/evening (7 of each)
- morning posts: mindset, direction, vision
- afternoon posts: product/build updates, what shipped, progress
- evening posts: reflection, insight, lesson learned
- NEVER use: "In today's world", "Let's dive in", "game-changer", "synergy", "leverage"
- Be specific to THIS week's actual themes — not generic
- Vary formats: some lists, some single thoughts, some stories
- Keep all posts under 280 characters
- Make them sound human, not AI-generated`

    // Call Gemini
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    let generatedPosts: any[]
    try {
      const result = await model.generateContent(generatePrompt)
      const text = result.response.text()
      const parsed = parseGeminiJson(text)
      generatedPosts = parsed.posts
      if (!Array.isArray(generatedPosts) || generatedPosts.length === 0) {
        throw new Error('No posts in response')
      }
    } catch (aiErr: any) {
      console.error('[SOMA Generate] Gemini error:', aiErr?.message)
      return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 })
    }

    const admin = getSupabaseAdmin()

    // Insert posts as drafts
    const postIds: string[] = []
    for (const post of generatedPosts) {
      const { data: inserted, error: postError } = await admin
        .from('posts')
        .insert({
          user_id: user.id,
          workspace_id: workspace.id,
          content: post.content,
          platforms,
          status: 'draft',
          scheduled_at: calculateScheduledAt(post.day, post.slot),
          metadata: {
            source: 'soma',
            ingestion_id,
            day: post.day,
            slot: post.slot,
            content_type: post.content_type,
          },
        })
        .select('id')
        .single()

      if (!postError && inserted) {
        postIds.push(inserted.id)
      }
    }

    const postsCreated = postIds.length

    // Update generated_posts_count on ingestion
    await admin
      .from('soma_weekly_ingestion')
      .update({ generated_posts_count: postsCreated })
      .eq('id', ingestion_id)

    // Deduct credits
    const monthlyAvailable = Math.max(0, monthly - used)
    let newUsed = used
    let newPurchased = purchased

    if (monthlyAvailable >= GENERATE_COST) {
      newUsed = used + GENERATE_COST
    } else {
      newUsed = monthly
      newPurchased = purchased - (GENERATE_COST - monthlyAvailable)
    }

    const balanceAfter = Math.max(0, monthly - newUsed) + newPurchased

    await admin
      .from('workspaces')
      .update({ soma_credits_used: newUsed, soma_credits_purchased: newPurchased })
      .eq('owner_id', user.id)
      .eq('is_personal', true)

    await admin.from('soma_credit_ledger').insert({
      workspace_id: workspace.id,
      user_id: user.id,
      action_type: 'generate_week',
      credits_used: GENERATE_COST,
      balance_after: balanceAfter,
    })

    return NextResponse.json({
      success: true,
      posts_created: postsCreated,
      post_ids: postIds,
    })
  } catch (err) {
    console.error('[SOMA Generate POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
