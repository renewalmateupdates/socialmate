export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SOMA_COSTS } from '@/lib/soma-costs'
import { Resend } from 'resend'

const GENERATE_COST = SOMA_COSTS.generate_week // 75

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  twitter:   'Twitter/X: ≤280 chars. Punchy, direct, hook in first line. No hashtag overload — max 2.',
  bluesky:   'Bluesky: ≤300 chars. Conversational, authentic tone. Community-friendly.',
  linkedin:  'LinkedIn: 3-6 sentences. Professional but human. Start with a hook, end with a question or takeaway. Can use line breaks.',
  mastodon:  'Mastodon: ≤500 chars. Community-native, no corporate tone. Open-source/indie friendly.',
  instagram: 'Instagram: Caption style. 3-5 sentences + 5-8 relevant hashtags on a new line.',
  discord:   'Discord: Casual announcement style. Can use **bold** for emphasis. Keep it concise.',
  telegram:  'Telegram: Conversational, can be slightly longer. Friendly, direct tone. No hashtag spam.',
}

const CONTENT_TYPES = ['mindset', 'progress', 'insight', 'story', 'value', 'question', 'win', 'lesson']

function parseGeminiJson(text: string): any {
  return JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim())
}

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Evenly space N posts across an 8am–10pm UTC window.
// slotIndex is 0-based (0 = first post of the day, N-1 = last).
// startDate (YYYY-MM-DD) overrides today as the base date.
function scheduledAt(dayOffset: number, slotIndex: number, postsPerDay: number, startDate?: string): string {
  const base = startDate ? new Date(`${startDate}T12:00:00Z`) : new Date()
  base.setUTCDate(base.getUTCDate() + dayOffset)
  const startHour = 8   // 8am UTC
  const endHour   = 22  // 10pm UTC
  const range     = endHour - startHour // 14 hours
  const gapMins   = postsPerDay > 1
    ? Math.round((range * 60) / (postsPerDay - 1))
    : range * 30 // single post → 3pm UTC
  const totalMins = postsPerDay > 1
    ? slotIndex * gapMins
    : range * 30
  base.setUTCHours(startHour, 0, 0, 0)
  base.setUTCMinutes(base.getUTCMinutes() + totalMins)
  return base.toISOString()
}

// Returns day offsets (0..windowDays-1) that fall on active days of week for this platform.
// startDate (YYYY-MM-DD) overrides today as the base date.
function getActiveDayOffsets(windowDays: number, activeDows: number[], startDate?: string): number[] {
  const offsets: number[] = []
  const base = startDate ? new Date(`${startDate}T12:00:00Z`) : new Date()
  for (let d = 0; d < windowDays; d++) {
    const date = new Date(base)
    date.setUTCDate(base.getUTCDate() + d)
    if (activeDows.includes(date.getUTCDay())) offsets.push(d)
  }
  return offsets
}

// POST /api/soma/projects/[id]/generate
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params

    const { ingestion_id, start_date } = await req.json() as { ingestion_id: string; start_date?: string }
    if (!ingestion_id) return NextResponse.json({ error: 'ingestion_id is required' }, { status: 400 })

    const admin = getSupabaseAdmin()
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })

    // Fetch project including per-platform schedule
    const { data: project } = await admin
      .from('soma_projects')
      .select('id, workspace_id, platforms, posts_per_day, content_window_days, mode, platform_schedule, runs_this_month')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Credits check
    const { data: workspace } = await admin
      .from('workspaces')
      .select('id, soma_credits_monthly, soma_credits_used, soma_credits_purchased')
      .eq('id', project.workspace_id)
      .single()

    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    const monthly   = workspace.soma_credits_monthly ?? 0
    const used      = workspace.soma_credits_used ?? 0
    const purchased = workspace.soma_credits_purchased ?? 0
    const remaining = Math.max(0, monthly - used) + purchased

    if (remaining < GENERATE_COST) return NextResponse.json({ error: 'insufficient_soma_credits' }, { status: 402 })

    // Run cap check
    const runCap = project.mode === 'full_send' ? 12 : project.mode === 'autopilot' ? 8 : 4
    if ((project.runs_this_month ?? 0) >= runCap) {
      return NextResponse.json({ error: 'monthly_run_cap_reached', cap: runCap }, { status: 429 })
    }

    // Fetch ingestion
    const { data: ingestion } = await admin
      .from('soma_weekly_ingestion')
      .select('*')
      .eq('id', ingestion_id)
      .eq('user_id', user.id)
      .single()

    if (!ingestion) return NextResponse.json({ error: 'Ingestion not found' }, { status: 404 })

    // Fetch voice profile
    const { data: profile } = await admin
      .from('soma_identity_profiles')
      .select('tone_profile, writing_style_rules, behavioral_traits, voice_examples')
      .eq('workspace_id', project.workspace_id)
      .maybeSingle()

    const identityContext = profile
      ? `CREATOR VOICE PROFILE:
Tone: ${JSON.stringify(profile.tone_profile)}
Style: ${JSON.stringify(profile.writing_style_rules)}
Personality: ${JSON.stringify(profile.behavioral_traits)}
Example posts: ${Array.isArray(profile.voice_examples) ? (profile.voice_examples as string[]).join(' | ') : 'none'}`
      : 'No voice profile — use authentic, direct, human tone.'

    const insights    = ingestion.extracted_insights as any
    const platforms   = project.platforms as string[]
    const windowDays  = project.content_window_days ?? 7
    const globalPpd   = project.posts_per_day ?? 2
    const schedule    = (project.platform_schedule ?? {}) as Record<string, { posts_per_day: number; days: number[] }>
    const maxPpd      = project.mode === 'full_send' ? 10 : project.mode === 'autopilot' ? 5 : 2

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const insightBlock = `THIS WEEK'S INSIGHTS (from master doc diff):
Key themes: ${insights.key_themes?.join(', ') ?? 'none'}
Wins: ${insights.wins?.join(', ') ?? 'none'}
Challenges: ${insights.challenges?.join(', ') ?? 'none'}
What changed: ${insights.diff_summary ?? 'New content week'}
Content angles: ${insights.content_angles?.join(' | ') ?? 'none'}
Emotional tone: ${insights.emotional_tone ?? 'motivated'}`

    // Generate posts platform by platform so each gets its own post count + scheduling.
    // Gemini reliably handles ~14 posts per call — chunk larger batches to avoid truncated JSON.
    const CHUNK_SIZE = 14
    const allPostIds: string[] = []

    for (const platform of platforms) {
      const cfg        = schedule[platform] ?? { posts_per_day: globalPpd, days: [0,1,2,3,4,5,6] }
      const ppd        = Math.min(Math.max(cfg.posts_per_day ?? 1, 1), maxPpd)
      const activeDows = Array.isArray(cfg.days) && cfg.days.length > 0 ? cfg.days : [0,1,2,3,4,5,6]
      const dayOffsets = getActiveDayOffsets(windowDays, activeDows, start_date)

      if (dayOffsets.length === 0 || ppd === 0) continue

      const instruction = PLATFORM_INSTRUCTIONS[platform] ?? `${platform}: Keep it natural and platform-appropriate.`

      // Build the full list of (dayOffset, slotIndex) slots we need to fill
      type Slot = { dayOffset: number; dayIdx: number; slotIdx: number }
      const allSlots: Slot[] = []
      dayOffsets.forEach((dayOffset, dayIdx) => {
        for (let slotIdx = 0; slotIdx < ppd; slotIdx++) {
          allSlots.push({ dayOffset, dayIdx, slotIdx })
        }
      })

      // Split into chunks so each Gemini call is manageable
      const chunks: Slot[][] = []
      for (let i = 0; i < allSlots.length; i += CHUNK_SIZE) {
        chunks.push(allSlots.slice(i, i + CHUNK_SIZE))
      }

      for (const chunk of chunks) {
        const chunkDays  = chunk.length
        const prompt = `${identityContext}

${insightBlock}

PLATFORM: ${platform.toUpperCase()}
FORMAT RULES: ${instruction}

Generate exactly ${chunkDays} posts for ${platform}.

Return ONLY valid JSON:
{
  "posts": [
    {
      "day_index": 0,
      "slot_index": 0,
      "content": "the post content",
      "content_type": "mindset"
    }
  ]
}

Required slots (day_index, slot_index) — generate one post for EACH:
${chunk.map((s, i) => `${i}: day_index=${s.dayIdx} slot_index=${s.slotIdx}`).join('\n')}

Rules:
- content_type: vary across ${CONTENT_TYPES.join(', ')}
- NEVER use: "In today's world", "Let's dive in", "game-changer", "synergy", "leverage"
- Make content specific to THIS week's actual themes — not generic
- Sound human, not AI-generated
- Respect the character limit for ${platform}`

        let chunkPosts: any[]
        try {
          const result  = await model.generateContent(prompt)
          const parsed  = parseGeminiJson(result.response.text())
          chunkPosts    = parsed.posts ?? []
          if (!chunkPosts.length) {
            console.error(`[SOMA Generate] Empty chunk for ${platform} (${chunkDays} slots)`)
            continue
          }
        } catch (aiErr: any) {
          console.error(`[SOMA Generate] Gemini error for ${platform} chunk:`, aiErr?.message)
          continue
        }

        // Map each returned post back to its slot for accurate scheduling
        for (let i = 0; i < chunkPosts.length; i++) {
          const post = chunkPosts[i]
          const slot = chunk[i] ?? chunk[chunk.length - 1]

          const { data: inserted, error: postErr } = await admin
            .from('posts')
            .insert({
              user_id:      user.id,
              workspace_id: project.workspace_id,
              content:      post.content,
              platforms:    [platform],
              status:       project.mode === 'safe' ? 'draft' : 'scheduled',
              scheduled_at: scheduledAt(slot.dayOffset, slot.slotIdx, ppd, start_date),
              destinations: {},
            })
            .select('id')
            .single()

          if (postErr) console.error(`[SOMA Generate] insert error (${platform}):`, postErr.message)
          else if (inserted) allPostIds.push(inserted.id)
        }
      }
    }

    const postsCreated = allPostIds.length

    // Update ingestion + project
    await admin.from('soma_weekly_ingestion').update({ generated_posts_count: postsCreated }).eq('id', ingestion_id)
    await admin.from('soma_projects').update({
      runs_this_month: (project.runs_this_month ?? 0) + 1,
      last_generated_at: new Date().toISOString(),
    }).eq('id', projectId)

    // Deduct credits
    const monthlyAvailable = Math.max(0, monthly - used)
    const newUsed      = monthlyAvailable >= GENERATE_COST ? used + GENERATE_COST : monthly
    const newPurchased = monthlyAvailable >= GENERATE_COST ? purchased : purchased - (GENERATE_COST - monthlyAvailable)
    const balanceAfter = Math.max(0, monthly - newUsed) + newPurchased

    await admin.from('workspaces').update({ soma_credits_used: newUsed, soma_credits_purchased: newPurchased }).eq('id', workspace.id)
    await admin.from('soma_credit_ledger').insert({
      workspace_id: workspace.id,
      user_id:      user.id,
      action_type:  'generate_week',
      credits_used: GENERATE_COST,
      balance_after: balanceAfter,
    })

    // Email notification — non-fatal
    if (user.email && process.env.RESEND_API_KEY) {
      try {
        const resend      = new Resend(process.env.RESEND_API_KEY)
        const isAutomated = project.mode === 'autopilot' || project.mode === 'full_send'
        const subject     = isAutomated
          ? `SOMA scheduled ${postsCreated} posts across ${platforms.join(', ')}`
          : `Your SOMA content queue is ready to review`

        await resend.emails.send({
          from:    'SOMA <soma@socialmate.studio>',
          to:      user.email,
          subject,
          html: `<p style="font-family:sans-serif;color:#e5e7eb;background:#0f0f0f;padding:32px;border-radius:8px;">
            <strong style="color:#f59e0b;font-size:18px;">⚡ SOMA</strong><br/><br/>
            ${isAutomated
              ? `<strong>${postsCreated} posts scheduled</strong> across <strong>${platforms.join(', ')}</strong> for the next ${windowDays} days.`
              : `<strong>${postsCreated} drafts</strong> are ready for your review.`}
            <br/><br/>
            <a href="https://socialmate.studio/${project.mode === 'safe' ? 'soma/dashboard' : 'queue'}"
               style="background:#f59e0b;color:#000;font-weight:700;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">
              ${project.mode === 'safe' ? 'Review Queue →' : 'View Schedule →'}
            </a>
          </p>`,
        })
      } catch (emailErr) {
        console.error('[SOMA Generate] Email failed (non-fatal):', emailErr)
      }
    }

    return NextResponse.json({ success: true, posts_created: postsCreated, post_ids: allPostIds, mode: project.mode })
  } catch (err) {
    console.error('[SOMA Project Generate POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
