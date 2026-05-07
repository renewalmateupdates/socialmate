export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

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
  return { user, supabase }
}

// GET /api/soma/voice — fetch personality profile
export async function GET() {
  try {
    const { user, supabase } = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .single()

    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    const { data: profile } = await supabase
      .from('soma_identity_profiles')
      .select('personality_tier, personality_answers, personality_summary')
      .eq('workspace_id', workspace.id)
      .maybeSingle()

    return NextResponse.json({
      personality_tier: profile?.personality_tier ?? 'none',
      personality_answers: profile?.personality_answers ?? {},
      personality_summary: profile?.personality_summary ?? null,
    })
  } catch (err) {
    console.error('[SOMA Voice GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/soma/voice — save personality answers + generate Gemini summary
// Body: { answers: Record<string, any>, tier: 'foundation' | 'deep_dive' | 'advanced' }
export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { answers, tier } = body as {
      answers: Record<string, any>
      tier: 'foundation' | 'deep_dive' | 'advanced'
    }

    if (!answers || !tier) return NextResponse.json({ error: 'answers and tier are required' }, { status: 400 })

    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .single()

    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    // Generate a personality summary via Gemini for injection into content prompts
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
    let personality_summary: string | null = null

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `You are building a voice profile for an AI content agent. Based on these personality interview answers, write a concise 150-200 word Voice DNA summary that can be injected into any content generation prompt. The summary should describe HOW this person sounds, WHAT they talk about, WHO they talk to, and WHAT to absolutely avoid. Write it as a clear instruction set for an AI writing in their voice.

PERSONALITY ANSWERS:
${Object.entries(answers)
  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
  .join('\n')}

Write the Voice DNA summary now:`

        const result = await model.generateContent(prompt)
        personality_summary = result.response.text().trim()
      } catch (aiErr: any) {
        console.error('[SOMA Voice] Gemini summary error:', aiErr?.message)
        // Non-fatal — save answers without summary
      }
    }

    const admin = getSupabaseAdmin()

    await admin
      .from('soma_identity_profiles')
      .upsert(
        {
          workspace_id:         workspace.id,
          user_id:              user.id,
          personality_tier:     tier,
          personality_answers:  answers,
          personality_summary,
          last_updated:         new Date().toISOString(),
        },
        { onConflict: 'workspace_id' }
      )

    return NextResponse.json({ success: true, personality_summary })
  } catch (err) {
    console.error('[SOMA Voice POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
