export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
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

// POST /api/soma/voice/feedback
// Body: { responses: Array<{question_key, question_text, answer}>, project_id? }
export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { responses, project_id } = body as {
      responses: Array<{ question_key: string; question_text: string; answer: string }>
      project_id?: string
    }

    if (!responses?.length) return NextResponse.json({ error: 'responses is required' }, { status: 400 })

    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .single()

    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    const admin = getSupabaseAdmin()

    const rows = responses.map(r => ({
      workspace_id:  workspace.id,
      user_id:       user.id,
      project_id:    project_id ?? null,
      question_key:  r.question_key,
      question_text: r.question_text,
      answer:        r.answer,
    }))

    await admin.from('soma_voice_feedback').insert(rows)

    // Rebuild personality summary incorporating latest feedback
    // Fetch all recent feedback (last 20) to keep the voice model fresh
    const { data: allFeedback } = await admin
      .from('soma_voice_feedback')
      .select('question_text, answer, created_at')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (allFeedback?.length && (process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY)) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY!)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const { data: existingProfile } = await admin
          .from('soma_identity_profiles')
          .select('personality_summary, personality_answers')
          .eq('workspace_id', workspace.id)
          .maybeSingle()

        const prompt = `You are updating an AI content agent's voice model based on post-publish feedback.

EXISTING VOICE DNA:
${existingProfile?.personality_summary ?? 'None yet.'}

NEW FEEDBACK FROM USER (most recent first):
${allFeedback.map(f => `- ${f.question_text}: ${f.answer}`).join('\n')}

Update the Voice DNA summary to incorporate what you learned. Keep it 150-200 words. Focus on HOW they sound, WHAT they talk about, WHO they talk to, and what to avoid. Write it as a clear instruction for an AI writing in their voice:`

        const result = await model.generateContent(prompt)
        const updated_summary = result.response.text().trim()

        await admin
          .from('soma_identity_profiles')
          .update({ personality_summary: updated_summary, last_updated: new Date().toISOString() })
          .eq('workspace_id', workspace.id)
      } catch (aiErr: any) {
        console.error('[SOMA Voice Feedback] Gemini update error:', aiErr?.message)
        // Non-fatal
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[SOMA Voice Feedback POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
