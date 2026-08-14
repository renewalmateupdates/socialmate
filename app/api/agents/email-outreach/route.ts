export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { recordAgentRun } from '@/lib/usage'
import { deductAiCredits, refundAiCredits } from '@/lib/ai-credits'

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

    // Credits.
    //
    // This read four columns off `workspaces` — credits_monthly, credits_used,
    // credits_earned, credits_purchased. None of them exist. Workspaces carries
    // soma_credits_*; the three-pool AI balance lives on user_settings. So the
    // select 400'd, `workspace` was null, and the next line returned 404. This
    // agent has never generated a single email.
    //
    // It was also a hand-rolled fourth copy of the pool arithmetic that PR #535
    // centralised into lib/ai-credits.ts precisely because copies drift. Now it
    // uses the same atomic RPC as the other seven AI routes, which also means
    // the spend shows up in /admin/usage instead of being invisible.
    //
    // Deducted before the Gemini call so an empty balance cannot burn a
    // generation, and refunded below if the model fails.
    const deducted = await deductAiCredits(supabase, user.id, CREDIT_COST, 'email_outreach')
    if (!deducted.ok) {
      const status = deducted.reason === 'insufficient' ? 402 : 500
      return NextResponse.json({ error: deducted.reason === 'insufficient' ? 'insufficient_credits' : 'credit_error' }, { status })
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
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

    // Credits are already spent, so any failure past this point refunds them
    // rather than charging for nothing.
    let parsed: { subject?: string; body?: string }
    try {
      const result = await model.generateContent(prompt)
      const text   = result.response.text().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
      parsed = JSON.parse(text)
    } catch (genErr) {
      await refundAiCredits(supabase, user.id, { monthly: deducted.monthly, earned: deducted.earned, paid: deducted.paid })
      console.error('[EmailOutreach] generation failed, credits refunded:', genErr)
      return NextResponse.json({ error: 'AI generation failed' }, { status: 502 })
    }

    if (!parsed.subject || !parsed.body) {
      await refundAiCredits(supabase, user.id, { monthly: deducted.monthly, earned: deducted.earned, paid: deducted.paid })
      return NextResponse.json({ error: 'AI returned invalid response' }, { status: 500 })
    }

    // Save draft
    await admin.from('agent_email_drafts').insert({
      workspace_id: workspace_id ?? null,
      user_id:      user.id,
      target_name,
      goal,
      subject:      parsed.subject,
      body:         parsed.body,
      credits_used: CREDIT_COST,
    })

    recordAgentRun(supabase, user.id, 'email-outreach', { credits: CREDIT_COST })
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
