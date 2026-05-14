export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { GoogleGenerativeAI } from '@google/generative-ai'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  return supabase.auth.getUser()
}

const STEP_LABELS = ['Intro', 'Follow-up 1', 'Follow-up 2', 'Break-up']

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: campaign_id } = await params
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.email !== 'socialmatehq@gmail.com') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = getSupabaseAdmin()

  // Load campaign
  const { data: campaign } = await supabase
    .from('hermes_campaigns')
    .select('*')
    .eq('id', campaign_id)
    .eq('user_id', user.id)
    .single()
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

  const { prospect_id, channel, step = 0 } = await req.json()
  if (!prospect_id) return NextResponse.json({ error: 'prospect_id required' }, { status: 400 })
  if (!channel || !['email', 'bluesky', 'mastodon'].includes(channel)) {
    return NextResponse.json({ error: 'channel must be email, bluesky, or mastodon' }, { status: 400 })
  }

  const { data: prospect } = await supabase
    .from('hermes_prospects')
    .select('*')
    .eq('id', prospect_id)
    .eq('campaign_id', campaign_id)
    .single()
  if (!prospect) return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })

  const stepLabel = STEP_LABELS[step] ?? `Step ${step + 1}`
  const isEmail = channel === 'email'
  const charLimit = channel === 'bluesky' ? 300 : channel === 'mastodon' ? 500 : 9999

  const prompt = `You are HERMES, a cold outreach assistant. Write a ${stepLabel} outreach message.

Campaign: ${campaign.name}
Goal: ${campaign.goal ?? 'not specified'}
Target persona: ${campaign.persona_description ?? 'not specified'}
Channel: ${channel}${isEmail ? '' : ` (max ${charLimit} characters, no subject needed, plain conversational text only)`}

Prospect details:
- Name: ${prospect.name}
${prospect.company ? `- Company: ${prospect.company}` : ''}
${prospect.notes ? `- Notes: ${prospect.notes}` : ''}

Instructions:
- Sender is Joshua Bostic, solo founder of SocialMate (socialmate.studio) — a social media scheduler and AI creator toolkit at $5/mo vs competitors at $99/mo.
- ${step === 0 ? 'This is the first message. Introduce yourself briefly, lead with value, keep it tight. No generic openers.' : ''}
- ${step === 1 ? 'This is a follow-up. Reference the previous message briefly, add a new angle or value point. Stay warm.' : ''}
- ${step === 2 ? 'This is a final follow-up. Last check-in before closing. Keep it short, no hard feelings, leave the door open.' : ''}
- ${step === 3 ? 'This is a break-up message. Short, gracious, close the loop.' : ''}
- Write like a real human, not a bot. No buzzwords. No "I hope this email finds you well."
- Be direct and specific to the prospect's context.
- Output JSON only: { "subject": "...", "body": "..." }
- If channel is not email, set subject to null.
${!isEmail ? `- body must be under ${charLimit} characters.` : ''}
`

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(jsonStr)

    const subject = isEmail ? (parsed.subject ?? `${stepLabel} — ${campaign.name}`) : null
    const body = parsed.body ?? ''

    // Save as draft message
    const { data: message, error: msgError } = await supabase
      .from('hermes_messages')
      .insert({
        campaign_id,
        prospect_id,
        user_id: user.id,
        channel,
        subject,
        body,
        step,
        status: 'draft',
      })
      .select()
      .single()

    if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 })
    return NextResponse.json({ message })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Generation failed' }, { status: 500 })
  }
}
