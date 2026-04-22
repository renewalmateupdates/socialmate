export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SOMA_COSTS } from '@/lib/soma-costs'

const INGEST_COST = SOMA_COSTS.ingest_weekly // 25

function buildIngestPrompt(raw_input: string): string {
  return `Analyze this weekly update from a social media creator and return ONLY valid JSON (no markdown, no code blocks):
{
  "key_themes": ["theme1", "theme2"],
  "wins": ["win1"],
  "challenges": ["challenge1"],
  "directional_shifts": ["shift1"],
  "content_angles": ["angle1", "angle2", "angle3", "angle4", "angle5"],
  "emotional_tone": "grinding"
}

WEEKLY UPDATE:
${raw_input}

Rules: Be specific and concrete. No generic statements. emotional_tone must be one of: high, reflective, grinding, celebratory`
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

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      return NextResponse.json({ error: 'Only .txt and .md files are supported' }, { status: 400 })
    }

    const raw_input = await file.text()
    const week_label = (formData.get('week_label') as string | null) || 'This week'

    if (!raw_input?.trim()) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 })
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

    if (remaining < INGEST_COST) {
      return NextResponse.json({ error: 'insufficient_soma_credits' }, { status: 402 })
    }

    // Call Gemini
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = buildIngestPrompt(raw_input)

    let extracted_insights: any
    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      extracted_insights = parseGeminiJson(text)
    } catch (aiErr: any) {
      console.error('[SOMA Upload] Gemini error:', aiErr?.message)
      return NextResponse.json({ error: 'AI analysis failed. Please try again.' }, { status: 500 })
    }

    const admin = getSupabaseAdmin()

    // Insert ingestion record
    const { data: ingestion, error: insertError } = await admin
      .from('soma_weekly_ingestion')
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        week_label,
        raw_input,
        extracted_insights,
        generated_posts_count: 0,
      })
      .select('id')
      .single()

    if (insertError || !ingestion) {
      console.error('[SOMA Upload] DB insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save ingestion' }, { status: 500 })
    }

    // Deduct credits
    const monthlyAvailable = Math.max(0, monthly - used)
    let newUsed = used
    let newPurchased = purchased

    if (monthlyAvailable >= INGEST_COST) {
      newUsed = used + INGEST_COST
    } else {
      newUsed = monthly
      newPurchased = purchased - (INGEST_COST - monthlyAvailable)
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
      action_type: 'ingest_weekly',
      credits_used: INGEST_COST,
      balance_after: balanceAfter,
    })

    return NextResponse.json({
      success: true,
      ingestion_id: ingestion.id,
      extracted_insights,
    })
  } catch (err) {
    console.error('[SOMA Upload POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
