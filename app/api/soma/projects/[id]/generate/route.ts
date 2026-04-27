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
}

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

function scheduledAt(dayOffset: number, slot: string): string {
  const base = new Date()
  base.setDate(base.getDate() + dayOffset)
  const hours = slot === 'morning' ? 9 : slot === 'afternoon' ? 14 : 19
  base.setHours(hours, 0, 0, 0)
  return base.toISOString()
}

// POST /api/soma/projects/[id]/generate
// Body: { ingestion_id: string }
// Generates platform-native posts for each platform in the project
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params

    const { ingestion_id } = await req.json() as { ingestion_id: string }
    if (!ingestion_id) return NextResponse.json({ error: 'ingestion_id is required' }, { status: 400 })

    const admin = getSupabaseAdmin()
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })

    // Verify project + get settings
    const { data: project } = await admin
      .from('soma_projects')
      .select('id, workspace_id, platforms, posts_per_day, content_window_days, mode')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Check credits
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

    // Check run cap
    const { data: proj } = await admin
      .from('soma_projects')
      .select('runs_this_month')
      .eq('id', projectId)
      .single()

    const runCap = project.mode === 'full_send' ? 12 : project.mode === 'autopilot' ? 8 : 4
    if ((proj?.runs_this_month ?? 0) >= runCap) {
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

    const insights = ingestion.extracted_insights as any
    const platforms = project.platforms as string[]
    const windowDays = project.content_window_days ?? 7
    const postsPerDay = project.posts_per_day ?? 2

    // Build platform instructions string
    const platformInstructions = platforms
      .map(p => PLATFORM_INSTRUCTIONS[p] ?? `${p}: Keep it natural and platform-appropriate.`)
      .join('\n')

    // Generate posts for all platforms in one Gemini call
    // Total posts = postsPerDay * windowDays, distributed across platforms
    const totalPosts = postsPerDay * windowDays
    const slots = ['morning', 'afternoon', 'evening']

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const generatePrompt = `${identityContext}

THIS WEEK'S INSIGHTS (from master doc diff):
Key themes: ${insights.key_themes?.join(', ')}
Wins: ${insights.wins?.join(', ')}
Challenges: ${insights.challenges?.join(', ')}
What changed: ${insights.diff_summary ?? 'New content week'}
Content angles: ${insights.content_angles?.join(' | ')}
Emotional tone: ${insights.emotional_tone}

PLATFORM-SPECIFIC FORMATTING RULES:
${platformInstructions}

Generate ${totalPosts} posts spread across ${windowDays} days, ${postsPerDay} per day.
Assign each post to exactly one platform from this list: ${platforms.join(', ')}
Distribute platforms roughly evenly across all posts.

Return ONLY valid JSON:
{
  "posts": [
    {
      "day": 1,
      "slot": "morning",
      "platform": "bluesky",
      "content": "the post content formatted for that platform",
      "content_type": "mindset"
    }
  ]
}

Rules:
- day 1 to ${windowDays}, slot: morning/afternoon/evening
- morning: mindset/vision, afternoon: progress/updates, evening: reflection/lesson
- NEVER use: "In today's world", "Let's dive in", "game-changer", "synergy", "leverage"
- Format each post correctly for its platform (see rules above)
- Make content specific to THIS week's actual themes, not generic
- Sound human, not AI-generated`

    let generatedPosts: any[]
    try {
      const result = await model.generateContent(generatePrompt)
      const parsed = parseGeminiJson(result.response.text())
      generatedPosts = parsed.posts ?? []
      if (!generatedPosts.length) throw new Error('Empty posts array')
    } catch (aiErr: any) {
      console.error('[SOMA Generate] Gemini error:', aiErr?.message)
      return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 })
    }

    // Insert posts as drafts
    const postIds: string[] = []
    for (const post of generatedPosts) {
      const platform = post.platform ?? platforms[0]
      const { data: inserted, error: postErr } = await admin
        .from('posts')
        .insert({
          user_id:      user.id,
          workspace_id: project.workspace_id,
          content:      post.content,
          platforms:    [platform],
          status:       project.mode === 'safe' ? 'draft' : 'scheduled',
          scheduled_at: scheduledAt(post.day - 1, post.slot),
          destinations: {},
        })
        .select('id')
        .single()

      if (postErr) console.error('[SOMA Generate] post insert error:', postErr.message)

      if (!postErr && inserted) postIds.push(inserted.id)
    }

    const postsCreated = postIds.length

    // Update ingestion generated count
    await admin.from('soma_weekly_ingestion').update({ generated_posts_count: postsCreated }).eq('id', ingestion_id)

    // Increment runs_this_month + update last_generated_at
    await admin
      .from('soma_projects')
      .update({ runs_this_month: (proj?.runs_this_month ?? 0) + 1, last_generated_at: new Date().toISOString() })
      .eq('id', projectId)

    // Deduct credits
    const monthlyAvailable = Math.max(0, monthly - used)
    const newUsed      = monthlyAvailable >= GENERATE_COST ? used + GENERATE_COST : monthly
    const newPurchased = monthlyAvailable >= GENERATE_COST ? purchased : purchased - (GENERATE_COST - monthlyAvailable)
    const balanceAfter = Math.max(0, monthly - newUsed) + newPurchased

    await admin.from('workspaces').update({ soma_credits_used: newUsed, soma_credits_purchased: newPurchased }).eq('id', workspace.id)
    await admin.from('soma_credit_ledger').insert({ workspace_id: workspace.id, user_id: user.id, action_type: 'generate_week', credits_used: GENERATE_COST, balance_after: balanceAfter })

    // Send email notification — non-fatal
    if (user.email && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const isAutomated = project.mode === 'autopilot' || project.mode === 'full_send'
        const subjectLine = isAutomated
          ? `SOMA has scheduled ${postsCreated} posts for you`
          : `Your SOMA content queue is ready to review`
        const subhead = isAutomated
          ? `SOMA has auto-scheduled ${postsCreated} posts for <strong>${ingestion.title ?? 'your project'}</strong>.`
          : `SOMA generated ${postsCreated} posts for <strong>${ingestion.title ?? 'your project'}</strong> and added them to your draft queue.`
        const ctaLabel = isAutomated ? 'View Schedule →' : 'Review Queue →'
        const ctaNote = isAutomated
          ? 'Posts are scheduled and will publish automatically.'
          : 'Posts are saved as drafts — review and approve before they go live.'

        // Build preview cards for first 2 posts
        const previewPosts = generatedPosts.slice(0, 2)
        const previewCardsHtml = previewPosts.map((p: any) => {
          const preview = (p.content ?? '').slice(0, 120) + ((p.content ?? '').length > 120 ? '…' : '')
          const platformLabel = (p.platform ?? '').charAt(0).toUpperCase() + (p.platform ?? '').slice(1)
          return `
            <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:16px;margin-bottom:12px;">
              <div style="margin-bottom:8px;">
                <span style="background:#333;color:#d1d5db;font-size:11px;padding:2px 8px;border-radius:4px;font-family:monospace;">${platformLabel}</span>
              </div>
              <p style="margin:0;color:#e5e7eb;font-size:14px;line-height:1.5;">${preview}</p>
            </div>`
        }).join('')

        const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${subjectLine}</title></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding-bottom:32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#f59e0b;letter-spacing:-0.5px;">⚡ SOMA</p>
          </td>
        </tr>

        <!-- Subhead -->
        <tr>
          <td style="padding-bottom:24px;">
            <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">${isAutomated ? 'Posts scheduled.' : 'Your queue is ready.'}</h1>
            <p style="margin:0;font-size:15px;color:#9ca3af;line-height:1.6;">${subhead}</p>
          </td>
        </tr>

        <!-- Preview cards -->
        <tr>
          <td style="padding-bottom:8px;">
            <p style="margin:0 0 12px 0;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;">Post Preview</p>
            ${previewCardsHtml}
            ${postsCreated > 2 ? `<p style="margin:8px 0 0 0;font-size:13px;color:#6b7280;">+ ${postsCreated - 2} more post${postsCreated - 2 === 1 ? '' : 's'} in your queue</p>` : ''}
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:32px 0 24px 0;">
            <p style="margin:0 0 16px 0;font-size:13px;color:#6b7280;">${ctaNote}</p>
            <a href="https://socialmate.studio/soma/dashboard"
               style="display:inline-block;background:#f59e0b;color:#000000;font-weight:700;font-size:15px;padding:14px 28px;border-radius:8px;text-decoration:none;">
              ${ctaLabel}
            </a>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="border-top:1px solid #1f1f1f;padding-top:24px;">
            <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.6;">
              SocialMate by Gilgamesh Enterprise LLC<br>
              You're receiving this because SOMA generated content for your workspace.<br>
              To stop these emails, turn off SOMA notifications in your
              <a href="https://socialmate.studio/settings" style="color:#6b7280;text-decoration:underline;">Settings</a>.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

        await resend.emails.send({
          from: 'SOMA <soma@socialmate.studio>',
          to: user.email,
          subject: subjectLine,
          html,
        })
      } catch (emailErr) {
        console.error('[SOMA Generate] Email notification failed (non-fatal):', emailErr)
      }
    }

    return NextResponse.json({ success: true, posts_created: postsCreated, post_ids: postIds, mode: project.mode })
  } catch (err) {
    console.error('[SOMA Project Generate POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
