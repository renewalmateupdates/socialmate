export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { MAX_RULES_CHARS, cleanExamples, houseRules } from '@/lib/soma-voice'

// Voice DNA: SOMA's one voice interview. The separate identity interview
// (/soma/onboarding, 15 credits) merged into it; its one input Voice DNA did
// not already ask for, example posts, is the optional last screen here, along
// with free-text house rules. Both land in the same columns the old interview
// used (voice_examples, tone_profile), so generation reads one profile.

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

// GET /api/soma/voice — the profile, for prefilling the interview and for the dashboard
export async function GET() {
  try {
    const { user, supabase } = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .maybeSingle()
    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    const { data: profile, error } = await supabase
      .from('soma_identity_profiles')
      .select('personality_tier, personality_answers, personality_summary, voice_examples, tone_profile, interview_completed')
      .eq('workspace_id', workspace.id)
      .maybeSingle()
    if (error) console.warn('[SOMA Voice GET] profile lookup failed:', error.message)

    return NextResponse.json({
      personality_tier:    profile?.personality_tier ?? 'none',
      personality_answers: profile?.personality_answers ?? {},
      personality_summary: profile?.personality_summary ?? null,
      voice_examples:      cleanExamples(profile?.voice_examples),
      house_rules:         houseRules(profile?.tone_profile),
      // Finished the old identity interview but never Voice DNA.
      legacy_interview:    !!profile?.interview_completed && !profile?.personality_tier,
    })
  } catch (err) {
    console.error('[SOMA Voice GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/soma/voice — save the interview and write the Voice DNA summary
// Body: { answers, tier, examples?: string[], rules?: string }
export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { answers, tier } = body as { answers: Record<string, unknown>; tier: 'foundation' | 'deep_dive' | 'advanced' }
    if (!answers || !tier) return NextResponse.json({ error: 'answers and tier are required' }, { status: 400 })
    // Absent means "leave as is"; an empty list or string clears them.
    const examples = 'examples' in body ? cleanExamples(body.examples) : null
    const rules = 'rules' in body && typeof body.rules === 'string' ? body.rules.trim().slice(0, MAX_RULES_CHARS) : null

    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .maybeSingle()
    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    const admin = getSupabaseAdmin()
    const { data: existing, error: existingErr } = await admin
      .from('soma_identity_profiles')
      .select('personality_summary, voice_examples, tone_profile')
      .eq('workspace_id', workspace.id)
      .maybeSingle()
    if (existingErr) console.warn('[SOMA Voice] existing profile lookup failed:', existingErr.message)

    const finalExamples = examples ?? cleanExamples(existing?.voice_examples)
    const finalRules = rules ?? houseRules(existing?.tone_profile)

    // The summary is injected into every SOMA prompt (lib/soma-generate.ts).
    let personality_summary: string | null = null
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (apiKey) {
      try {
        const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: 'gemini-3.6-flash' }, { timeout: 20_000 })
        const prompt = `You are building a voice profile for an AI content agent. Based on these interview answers, write a concise 150-200 word Voice DNA summary that can be injected into any content generation prompt. Describe HOW this person sounds, WHAT they talk about, WHO they talk to, and WHAT to absolutely avoid. Write it as a clear instruction set for an AI writing in their voice.

INTERVIEW ANSWERS:
${Object.entries(answers).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`).join('\n')}${
  finalExamples.length ? `\n\nPOSTS THEY WROTE (match the voice; do not copy facts or numbers):\n${finalExamples.map(e => `- ${e}`).join('\n')}` : ''}${
  finalRules ? `\n\nHOUSE RULES (the summary must tell the AI to always follow these): ${finalRules}` : ''}

Write the Voice DNA summary now:`
        personality_summary = (await model.generateContent(prompt)).response.text().trim() || null
      } catch (aiErr) {
        console.error('[SOMA Voice] Gemini summary error:', aiErr instanceof Error ? aiErr.message : aiErr)
      }
    }

    const { error: saveErr } = await admin
      .from('soma_identity_profiles')
      .upsert({
        workspace_id:        workspace.id,
        user_id:             user.id,
        personality_tier:    tier,
        personality_answers: answers,
        // A failed summary keeps the last good one rather than wiping it.
        personality_summary: personality_summary ?? existing?.personality_summary ?? null,
        voice_examples:      finalExamples,
        tone_profile:        { ...((existing?.tone_profile as Record<string, unknown> | null) ?? {}), house_rules: finalRules },
        interview_completed: true,
        last_updated:        new Date().toISOString(),
      }, { onConflict: 'workspace_id' })
    if (saveErr) {
      console.error('[SOMA Voice] save failed:', saveErr.message)
      return NextResponse.json({ error: 'save_failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, personality_summary, summary_written: !!personality_summary })
  } catch (err) {
    console.error('[SOMA Voice POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
