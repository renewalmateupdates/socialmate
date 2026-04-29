export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { GoogleGenerativeAI } from '@google/generative-ai'

const CREDIT_COST = 5

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { target_name, goal, your_pitch, tone, context_notes, workspace_id } = await req.json()
    if (!target_name || !goal || !your_pitch) {
      return NextResponse.json({ error: 'target_name, goal, and your_pitch are required' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    // Credits check
    const { data: workspace } = await admin
      .from('workspaces')
      .select('id, credits_monthly, credits_used, credits_earned, credits_purchased')
      .eq('id', workspace_id)
      .single()

    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    const monthly   = workspace.credits_monthly ?? 0
    const used      = workspace.credits_used ?? 0
    const earned    = workspace.credits_earned ?? 0
    const purchased = workspace.credits_purchased ?? 0
    const remaining = Math.max(0, monthly - used) + earned + purchased

    if (remaining < CREDIT_COST) {
      return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 })
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })

    const GOAL_LABELS: Record<string, string> = {
      brand_deal:    'a brand deal / sponsorship',
      collaboration: 'a creative collaboration',
      partnership:   'a business partnership',
      client_pitch:  'a client pitch / new business',
      press:         'press / media coverage',
      other:         'an outreach opportunity',
    }

    const TONE_LABELS: Record<string, string> = {
      professional: 'professional and polished',
      casual:       'casual and conversational',
      bold:         'bold and direct',
      friendly:     'warm and friendly',
    }

    const prompt = `You are an expert outreach copywriter who helps creators, founders, and agencies land brand deals, collabs, and clients.

Write a personalized cold outreach email. Keep it SHORT — 4-6 sentences max for the body. No fluff, no corporate speak.

DETAILS:
- Target: ${target_name}
- Goal: ${GOAL_LABELS[goal] ?? goal}
- What the sender offers / their pitch: ${your_pitch}
- Tone: ${TONE_LABELS[tone ?? 'professional'] ?? tone}
${context_notes ? `- Additional context: ${context_notes}` : ''}

RULES:
- Subject line: punchy, max 8 words, no clickbait
- Opening: reference something specific about them (invent a plausible specific detail if needed — e.g. "saw your recent campaign on..." or "love what you're building with...")
- Body: 4-6 sentences. What you do → why it's a fit → clear ask
- CTA: one clear ask. Not "let me know if you're interested" — be specific (e.g. "open to a 15-min call this week?")
- Closing: first-name sign-off only
- NO: "I hope this email finds you well", "I wanted to reach out", "synergy", "leverage", "game-changer"

Return ONLY valid JSON:
{
  "subject": "the subject line",
  "body": "the full email body (use \\n for line breaks)"
}`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const text   = result.response.text().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    const parsed = JSON.parse(text)

    if (!parsed.subject || !parsed.body) {
      return NextResponse.json({ error: 'AI returned invalid response' }, { status: 500 })
    }

    // Deduct credits (monthly first, then earned, then purchased)
    const monthlyAvail = Math.max(0, monthly - used)
    const newUsed      = monthlyAvail >= CREDIT_COST ? used + CREDIT_COST : monthly
    const afterMonthly = monthlyAvail >= CREDIT_COST ? 0 : CREDIT_COST - monthlyAvail
    const earnedAfter  = afterMonthly > 0 ? Math.max(0, earned - afterMonthly) : earned
    const purchAfter   = afterMonthly > 0 && afterMonthly > earned
      ? Math.max(0, purchased - (afterMonthly - earned))
      : purchased

    await admin.from('workspaces').update({
      credits_used:      newUsed,
      credits_earned:    earnedAfter,
      credits_purchased: purchAfter,
    }).eq('id', workspace.id)

    // Save draft
    await admin.from('agent_email_drafts').insert({
      workspace_id: workspace.id,
      user_id:      user.id,
      target_name,
      goal,
      subject:      parsed.subject,
      body:         parsed.body,
      credits_used: CREDIT_COST,
    })

    return NextResponse.json({ subject: parsed.subject, body: parsed.body })
  } catch (err) {
    console.error('[agents/email-outreach]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspace_id')

    const { data } = await getSupabaseAdmin()
      .from('agent_email_drafts')
      .select('id, target_name, goal, subject, body, credits_used, created_at')
      .eq('user_id', user.id)
      .eq('workspace_id', workspaceId ?? '')
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({ drafts: data ?? [] })
  } catch (err) {
    console.error('[agents/email-outreach GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
